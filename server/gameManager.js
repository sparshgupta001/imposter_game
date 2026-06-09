// gameManager.js — Core game state machine for the Imposter Game
// Manages all game rooms, player state, rounds, voting, scoring, and timers.

const topics = require('./topics');

// Valid game phases in order
const PHASES = ['lobby', 'roleReveal', 'clue', 'discussion', 'voting', 'results', 'finalResults'];

class GameManager {
  constructor() {
    // Map<roomCode, roomObject>
    this.rooms = new Map();
    // Map<socketId, roomCode> — fast reverse lookup for finding a player's room
    this.playerRoomIndex = new Map();
    // Map<socketId, timeoutId> — disconnect grace-period timers
    this.disconnectTimers = new Map();
  }

  // ──────────────────────────────────────────────
  // Room code generation
  // ──────────────────────────────────────────────

  /**
   * Generate a unique 4-uppercase-letter room code.
   * Retries if the code already exists (astronomically unlikely with 26^4 = 456,976 combos).
   */
  _generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code;
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;
      if (attempts > 100) {
        throw new Error('Unable to generate a unique room code after 100 attempts');
      }
    } while (this.rooms.has(code));
    return code;
  }

  // ──────────────────────────────────────────────
  // Room lifecycle
  // ──────────────────────────────────────────────

  /**
   * Create a new room and add the host as the first player.
   * @param {string} hostSocketId - Socket ID of the host
   * @returns {string} The generated room code
   */
  createRoom(hostSocketId) {
    if (!hostSocketId) {
      throw new Error('Host socket ID is required');
    }

    const code = this._generateCode();

    const room = {
      code,
      hostId: hostSocketId,
      players: new Map(),
      category: null,
      currentRound: 0,
      totalRounds: 3,
      phase: 'lobby',
      topic: null,
      imposterId: null,
      timer: null,         // stores the remaining seconds (informational)
      timerInterval: null,  // setInterval ID for cleanup
      votes: new Map(),
    };

    // Add the host as the first player
    room.players.set(hostSocketId, {
      id: hostSocketId,
      name: 'Host',
      score: 0,
      connected: true,
      vote: null,
      clue: null,
    });

    this.rooms.set(code, room);
    this.playerRoomIndex.set(hostSocketId, code);

    console.log(`[GameManager] Room ${code} created by ${hostSocketId}`);
    return code;
  }

  /**
   * Join an existing room.
   * @param {string} code - Room code (uppercase)
   * @param {string} socketId - Socket ID of the joining player
   * @param {string} name - Display name chosen by the player
   * @returns {object} The room object
   */
  joinRoom(code, socketId, name) {
    if (!code || !socketId || !name) {
      throw new Error('Room code, socket ID, and player name are all required');
    }

    const room = this.rooms.get(code);
    if (!room) {
      throw new Error(`Room ${code} does not exist`);
    }
    if (room.phase !== 'lobby') {
      throw new Error('Cannot join a game that is already in progress');
    }
    if (room.players.size >= 8) {
      throw new Error('Room is full (max 8 players)');
    }

    // Check for duplicate names (case-insensitive)
    const nameLower = name.trim().toLowerCase();
    for (const [, player] of room.players) {
      if (player.name.toLowerCase() === nameLower) {
        throw new Error(`The name "${name}" is already taken in this room`);
      }
    }

    room.players.set(socketId, {
      id: socketId,
      name: name.trim(),
      score: 0,
      connected: true,
      vote: null,
      clue: null,
    });

    this.playerRoomIndex.set(socketId, code);

    console.log(`[GameManager] Player "${name}" (${socketId}) joined room ${code}`);
    return room;
  }

  /**
   * Get a room by its code.
   * @param {string} code
   * @returns {object|null}
   */
  getRoom(code) {
    return this.rooms.get(code) || null;
  }

  /**
   * Find the room that contains a given player socket ID.
   * @param {string} socketId
   * @returns {object|null}
   */
  getRoomByPlayer(socketId) {
    const code = this.playerRoomIndex.get(socketId);
    if (!code) return null;
    return this.rooms.get(code) || null;
  }

  /**
   * Remove a player from their room.
   * If the host leaves, the next player becomes host.
   * If the room is empty after removal, it is deleted.
   * @param {string} socketId
   * @returns {{ room: object|null, wasHost: boolean, newHostId: string|null, roomDeleted: boolean, removedPlayer?: object|null }}
   */
  removePlayer(socketId) {
    const code = this.playerRoomIndex.get(socketId);
    if (!code) {
      return { room: null, wasHost: false, newHostId: null, roomDeleted: false };
    }

    const room = this.rooms.get(code);
    if (!room) {
      this.playerRoomIndex.delete(socketId);
      return { room: null, wasHost: false, newHostId: null, roomDeleted: false };
    }

    const wasHost = room.hostId === socketId;
    const removedPlayer = room.players.get(socketId) || null;

    if (this.disconnectTimers.has(socketId)) {
      clearTimeout(this.disconnectTimers.get(socketId));
      this.disconnectTimers.delete(socketId);
    }

    // Remove votes cast by or targeting this player so later tallies do not
    // reference someone who has already left the room.
    room.votes.delete(socketId);
    for (const [voterId, targetId] of room.votes) {
      if (targetId === socketId) {
        room.votes.delete(voterId);
        const voter = room.players.get(voterId);
        if (voter) voter.vote = null;
      }
    }

    room.players.delete(socketId);
    this.playerRoomIndex.delete(socketId);

    let newHostId = null;

    // If the room is now empty, clean up
    if (room.players.size === 0) {
      this.clearTimer(code);
      this.rooms.delete(code);
      console.log(`[GameManager] Room ${code} deleted (empty)`);
      return { room: null, wasHost, newHostId: null, roomDeleted: true };
    }

    // If the host left, assign a new host (first remaining player)
    if (wasHost) {
      const remainingPlayers = Array.from(room.players.values());
      const nextHost = remainingPlayers.find((player) => player.connected) || remainingPlayers[0];
      room.hostId = nextHost.id;
      newHostId = nextHost.id;
      console.log(`[GameManager] New host for room ${code}: ${nextHost.name} (${newHostId})`);
    }

    console.log(`[GameManager] Player ${socketId} removed from room ${code}`);
    return { room, wasHost, newHostId, roomDeleted: false, removedPlayer };
  }

  // ──────────────────────────────────────────────
  // Game flow
  // ──────────────────────────────────────────────

  /**
   * Start the game: pick a topic and an imposter.
   * @param {string} code - Room code
   * @param {string} category - 'general', 'family', or 'adult'
   * @returns {{ topic: string, imposterId: string }}
   */
  startGame(code, category) {
    const room = this.rooms.get(code);
    if (!room) throw new Error(`Room ${code} does not exist`);
    if (room.players.size < 4) throw new Error('Need at least 4 players to start');
    if (!topics[category]) throw new Error(`Invalid category: ${category}`);

    room.category = category;
    room.currentRound = 1;

    // Pick a random topic from the chosen category
    const topicList = topics[category];
    room.topic = topicList[Math.floor(Math.random() * topicList.length)];

    // Pick a random imposter from all connected players
    const playerIds = Array.from(room.players.keys());
    room.imposterId = playerIds[Math.floor(Math.random() * playerIds.length)];

    room.phase = 'roleReveal';

    // Clear any residual votes/clues
    for (const [, player] of room.players) {
      player.vote = null;
      player.clue = null;
    }
    room.votes = new Map();

    console.log(`[GameManager] Game started in room ${code} | Category: ${category} | Topic: "${room.topic}" | Imposter: ${room.imposterId}`);
    return { topic: room.topic, imposterId: room.imposterId };
  }

  /**
   * Store a player's clue.
   * @param {string} socketId
   * @param {string} clue
   * @returns {boolean} True if ALL connected players have submitted clues
   */
  submitClue(socketId, clue) {
    if (!clue || typeof clue !== 'string' || clue.trim().length === 0) {
      throw new Error('Clue cannot be empty');
    }
    if (clue.trim().length > 100) {
      throw new Error('Clue is too long (max 100 characters)');
    }

    const room = this.getRoomByPlayer(socketId);
    if (!room) throw new Error('Player is not in a room');
    if (room.phase !== 'clue') throw new Error('Not in the clue phase');

    const player = room.players.get(socketId);
    if (!player) throw new Error('Player not found');

    player.clue = clue.trim();

    // Check if every connected player has submitted a clue
    let allSubmitted = true;
    for (const [, p] of room.players) {
      if (p.connected && !p.clue) {
        allSubmitted = false;
        break;
      }
    }

    return allSubmitted;
  }

  /**
   * Store a player's vote.
   * @param {string} socketId - The voter
   * @param {string} targetId - The player being voted for
   * @returns {boolean} True if ALL connected players have voted
   */
  submitVote(socketId, targetId) {
    const room = this.getRoomByPlayer(socketId);
    if (!room) throw new Error('Player is not in a room');
    if (room.phase !== 'voting') throw new Error('Not in the voting phase');

    const voter = room.players.get(socketId);
    if (!voter) throw new Error('Voter not found');
    if (!room.players.has(targetId)) throw new Error('Vote target is not a valid player');
    if (socketId === targetId) throw new Error('You cannot vote for yourself');

    voter.vote = targetId;
    room.votes.set(socketId, targetId);

    // Check if every connected player has voted
    let allVoted = true;
    for (const [, p] of room.players) {
      if (p.connected && !p.vote) {
        allVoted = false;
        break;
      }
    }

    return allVoted;
  }

  /**
   * Tally all votes and compute scores for the round.
   * Tie-breaking: the player whose name comes first alphabetically is voted out.
   * Scoring: correct voters get +2, imposter survives gets +3.
   * @param {string} code
   * @returns {{ votedOutId, wasImposter, scores: object, votes: object }}
   */
  tallyVotes(code) {
    const room = this.rooms.get(code);
    if (!room) throw new Error(`Room ${code} does not exist`);

    // Count votes per target
    const voteCounts = new Map(); // targetId -> count
    for (const [, targetId] of room.votes) {
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
    }

    // Find the maximum vote count
    let maxVotes = 0;
    for (const [, count] of voteCounts) {
      if (count > maxVotes) maxVotes = count;
    }

    // Collect all players tied at the max
    const tiedPlayers = [];
    for (const [playerId, count] of voteCounts) {
      if (count === maxVotes) {
        const player = room.players.get(playerId);
        tiedPlayers.push({ id: playerId, name: player ? player.name : '' });
      }
    }

    // Tie-break: first alphabetically by name
    tiedPlayers.sort((a, b) => a.name.localeCompare(b.name));
    const votedOutId = tiedPlayers.length > 0 ? tiedPlayers[0].id : null;
    const wasImposter = votedOutId === room.imposterId;

    // Calculate scores
    const scores = {};
    for (const [playerId, player] of room.players) {
      scores[playerId] = 0;
    }

    if (wasImposter) {
      // Imposter was caught — voters who picked correctly get +2
      for (const [voterId, targetId] of room.votes) {
        if (targetId === room.imposterId) {
          scores[voterId] = 2;
          const voter = room.players.get(voterId);
          if (voter) voter.score += 2;
        }
      }
    } else {
      // Imposter survived — imposter gets +3
      scores[room.imposterId] = 3;
      const imposter = room.players.get(room.imposterId);
      if (imposter) imposter.score += 3;
    }

    // Build a plain-object copy of votes for the client
    const votesObj = {};
    for (const [voterId, targetId] of room.votes) {
      votesObj[voterId] = targetId;
    }

    room.phase = 'results';

    console.log(`[GameManager] Votes tallied in room ${code} | Voted out: ${votedOutId} | Was imposter: ${wasImposter}`);
    return { votedOutId, wasImposter, scores, votes: votesObj };
  }

  /**
   * Check if the imposter's guess of the topic is correct.
   * Awards +1 consolation point if correct.
   * @param {string} code
   * @param {string} guess
   * @returns {boolean}
   */
  imposterGuess(code, guess) {
    const room = this.rooms.get(code);
    if (!room) throw new Error(`Room ${code} does not exist`);
    if (!guess || typeof guess !== 'string') throw new Error('Guess is required');

    const correct = guess.trim().toLowerCase() === room.topic.toLowerCase();

    if (correct) {
      const imposter = room.players.get(room.imposterId);
      if (imposter) {
        imposter.score += 1;
        console.log(`[GameManager] Imposter in room ${code} guessed correctly! +1 consolation`);
      }
    }

    return correct;
  }

  /**
   * Advance to the next round, or end the game if all rounds are played.
   * @param {string} code
   * @returns {object} The updated room
   */
  nextRound(code) {
    const room = this.rooms.get(code);
    if (!room) throw new Error(`Room ${code} does not exist`);

    room.currentRound++;

    if (room.currentRound > room.totalRounds) {
      room.phase = 'finalResults';
      console.log(`[GameManager] Game over in room ${code}`);
      return room;
    }

    // New round setup
    const topicList = topics[room.category];
    room.topic = topicList[Math.floor(Math.random() * topicList.length)];

    // Pick a new imposter (try to avoid the same one if possible)
    const playerIds = Array.from(room.players.keys());
    let newImposterId;
    if (playerIds.length > 1) {
      // Try up to 10 times to pick a different imposter
      let attempts = 0;
      do {
        newImposterId = playerIds[Math.floor(Math.random() * playerIds.length)];
        attempts++;
      } while (newImposterId === room.imposterId && attempts < 10);
    } else {
      newImposterId = playerIds[0];
    }
    room.imposterId = newImposterId;

    // Clear per-round state
    for (const [, player] of room.players) {
      player.vote = null;
      player.clue = null;
    }
    room.votes = new Map();
    room.phase = 'roleReveal';

    this.clearTimer(code);

    console.log(`[GameManager] Round ${room.currentRound} in room ${code} | Topic: "${room.topic}" | Imposter: ${room.imposterId}`);
    return room;
  }

  /**
   * Reset the game back to lobby state (for "play again").
   * Clears all scores, rounds, and game data.
   * @param {string} code
   * @returns {object} The reset room
   */
  resetGame(code) {
    const room = this.rooms.get(code);
    if (!room) throw new Error(`Room ${code} does not exist`);

    this.clearTimer(code);

    room.category = null;
    room.currentRound = 0;
    room.phase = 'lobby';
    room.topic = null;
    room.imposterId = null;
    room.votes = new Map();

    for (const [, player] of room.players) {
      player.score = 0;
      player.vote = null;
      player.clue = null;
    }

    console.log(`[GameManager] Room ${code} reset to lobby`);
    return room;
  }

  // ──────────────────────────────────────────────
  // Timer management
  // ──────────────────────────────────────────────

  /**
   * Start a server-side countdown timer for a room.
   * @param {string} code - Room code
   * @param {number} seconds - Duration in seconds
   * @param {function} onTick - Called each second with (secondsLeft)
   * @param {function} onEnd - Called when timer reaches 0
   */
  startTimer(code, seconds, onTick, onEnd) {
    const room = this.rooms.get(code);
    if (!room) return;

    // Clear any existing timer first
    this.clearTimer(code);

    room.timer = seconds;

    room.timerInterval = setInterval(() => {
      room.timer--;

      if (room.timer <= 0) {
        this.clearTimer(code);
        if (typeof onEnd === 'function') {
          onEnd();
        }
      } else {
        if (typeof onTick === 'function') {
          onTick(room.timer);
        }
      }
    }, 1000);
  }

  /**
   * Clear any running timer for a room.
   * @param {string} code
   */
  clearTimer(code) {
    const room = this.rooms.get(code);
    if (room && room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
      room.timer = null;
    }
  }

  // ──────────────────────────────────────────────
  // Reconnection
  // ──────────────────────────────────────────────

  /**
   * Reconnect a player who temporarily lost connection.
   * @param {string} code - Room code
   * @param {string} name - Player's display name
   * @param {string} newSocketId - The new socket ID
   * @returns {{ player: object, room: object }}
   */
  reconnectPlayer(code, name, newSocketId) {
    if (!code || !name || !newSocketId) {
      throw new Error('Code, name, and new socket ID are all required for reconnection');
    }

    const room = this.rooms.get(code);
    if (!room) throw new Error(`Room ${code} does not exist`);

    // Find the player by name (case-insensitive)
    let oldSocketId = null;
    let foundPlayer = null;
    for (const [sid, player] of room.players) {
      if (player.name.toLowerCase() === name.toLowerCase()) {
        oldSocketId = sid;
        foundPlayer = player;
        break;
      }
    }

    if (!foundPlayer) {
      throw new Error(`Player "${name}" not found in room ${code}`);
    }

    // Remove old entry and re-key with new socket ID
    room.players.delete(oldSocketId);
    this.playerRoomIndex.delete(oldSocketId);

    foundPlayer.id = newSocketId;
    foundPlayer.connected = true;

    room.players.set(newSocketId, foundPlayer);
    this.playerRoomIndex.set(newSocketId, code);

    // If the reconnecting player was the host, update hostId
    if (room.hostId === oldSocketId) {
      room.hostId = newSocketId;
    }

    // If the reconnecting player was the imposter, update imposterId
    if (room.imposterId === oldSocketId) {
      room.imposterId = newSocketId;
    }

    // Update any votes that referenced the old socket ID
    // (as voter)
    if (room.votes.has(oldSocketId)) {
      const target = room.votes.get(oldSocketId);
      room.votes.delete(oldSocketId);
      room.votes.set(newSocketId, target);
    }
    // (as vote target)
    for (const [voterId, targetId] of room.votes) {
      if (targetId === oldSocketId) {
        room.votes.set(voterId, newSocketId);
      }
    }

    // Cancel disconnect timer if one was running
    if (this.disconnectTimers.has(oldSocketId)) {
      clearTimeout(this.disconnectTimers.get(oldSocketId));
      this.disconnectTimers.delete(oldSocketId);
    }

    console.log(`[GameManager] Player "${name}" reconnected in room ${code} (${oldSocketId} -> ${newSocketId})`);
    return { player: foundPlayer, room };
  }

  // ──────────────────────────────────────────────
  // Utility helpers
  // ──────────────────────────────────────────────

  /**
   * Serialize the players Map into a plain array for sending to clients.
   * @param {Map} playersMap
   * @returns {Array}
   */
  serializePlayers(playersMap) {
    const arr = [];
    for (const [, player] of playersMap) {
      arr.push({
        id: player.id,
        name: player.name,
        score: player.score,
        connected: player.connected,
        clue: player.clue,
      });
    }
    return arr;
  }
}

module.exports = GameManager;
