// index.js — Express + Socket.io server entry point for the Imposter Game
// Handles all real-time communication between clients and the GameManager.

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameManager = require('./gameManager');

// ──────────────────────────────────────────────
// Server setup
// ──────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const gm = new GameManager();

// ──────────────────────────────────────────────
// Health check endpoint
// ──────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', rooms: gm.rooms.size });
});

// ──────────────────────────────────────────────
// Helper: serialize players for client consumption
// ──────────────────────────────────────────────

function serializePlayers(room) {
  return gm.serializePlayers(room.players);
}

/**
 * Advance the game to the clue-giving phase.
 * Starts a 60-second timer with per-second ticks broadcast to the room.
 */
function advanceToClue(code) {
  const room = gm.getRoom(code);
  if (!room) return;

  room.phase = 'clue';
  io.to(code).emit('phaseChanged', { phase: 'clue' });

  gm.startTimer(
    code,
    60,
    (secondsLeft) => {
      io.to(code).emit('timerTick', { secondsLeft });
    },
    () => {
      advanceToDiscussion(code);
    }
  );
}

/**
 * Advance to the discussion phase.
 * Players see all clues and discuss for 60 seconds.
 */
function advanceToDiscussion(code) {
  const room = gm.getRoom(code);
  if (!room) return;

  gm.clearTimer(code);
  room.phase = 'discussion';

  // Send all submitted clues to every player
  const clues = [];
  for (const [, player] of room.players) {
    clues.push({ playerId: player.id, playerName: player.name, clue: player.clue || '(no clue)' });
  }

  io.to(code).emit('phaseChanged', { phase: 'discussion', clues });

  gm.startTimer(
    code,
    60,
    (secondsLeft) => {
      io.to(code).emit('timerTick', { secondsLeft });
    },
    () => {
      advanceToVoting(code);
    }
  );
}

/**
 * Advance to the voting phase.
 * Players vote on who they think the imposter is for 45 seconds.
 */
function advanceToVoting(code) {
  const room = gm.getRoom(code);
  if (!room) return;

  gm.clearTimer(code);
  room.phase = 'voting';

  io.to(code).emit('phaseChanged', { phase: 'voting' });

  gm.startTimer(
    code,
    45,
    (secondsLeft) => {
      io.to(code).emit('timerTick', { secondsLeft });
    },
    () => {
      tallyAndReveal(code);
    }
  );
}

/**
 * Tally all votes, reveal results, and broadcast the outcome.
 */
function tallyAndReveal(code) {
  const room = gm.getRoom(code);
  if (!room) return;

  gm.clearTimer(code);

  const result = gm.tallyVotes(code);
  const votedOutPlayer = room.players.get(result.votedOutId);
  const imposterPlayer = room.players.get(room.imposterId);

  // Build a vote reveal array for staggered animation on the client
  // Each entry: { voterId, voterName, targetId, targetName }
  const voteReveal = [];
  for (const [voterId, targetId] of Object.entries(result.votes)) {
    const voter = room.players.get(voterId);
    const target = room.players.get(targetId);
    voteReveal.push({
      voterId,
      voterName: voter ? voter.name : 'Unknown',
      targetId,
      targetName: target ? target.name : 'Unknown',
    });
  }

  const wasImposter = result.wasImposter;

  io.to(code).emit('roundResult', {
    votedOutId: result.votedOutId,
    votedOutName: votedOutPlayer ? votedOutPlayer.name : 'Unknown',
    wasImposter,
    caught: wasImposter,
    imposterId: room.imposterId,
    imposterName: imposterPlayer ? imposterPlayer.name : 'Unknown',
    topic: room.topic,
    scores: result.scores,
    votes: voteReveal,
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    players: serializePlayers(room),
  });
}

// ──────────────────────────────────────────────
// Socket.io event handlers
// ──────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // ── Create Room ──────────────────────────────

  socket.on('createRoom', (data, callback) => {
    try {
      // Accept data as object or callback-only
      if (typeof data === 'function') {
        callback = data;
        data = {};
      }
      const playerName = (data && (data.playerName || data.name)) || 'Host';

      const code = gm.createRoom(socket.id);
      // Update the host's display name
      const room = gm.getRoom(code);
      const hostPlayer = room.players.get(socket.id);
      if (hostPlayer) hostPlayer.name = playerName.trim().slice(0, 20) || 'Host';

      socket.join(code);

      const players = serializePlayers(room);
      const response = { code, roomCode: code, playerId: socket.id, players, isHost: true };
      if (typeof callback === 'function') {
        callback({ success: true, ...response });
      }
      socket.emit('roomCreated', response);

      console.log(`[Socket] Room created: ${code} by ${playerName} (${socket.id})`);
    } catch (err) {
      console.error(`[Socket] createRoom error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Join Room ────────────────────────────────

  socket.on('joinRoom', (data, callback) => {
    try {
      if (!data) throw new Error('Room code and player name are required');
      // Accept both {code, name} and {roomCode, playerName} formats
      const code = (data.code || data.roomCode || '').toUpperCase().trim();
      const name = (data.name || data.playerName || '').trim();

      if (!code) throw new Error('Room code is required');
      if (!name) throw new Error('Player name is required');
      if (name.length > 20) throw new Error('Player name is too long (max 20 characters)');

      const room = gm.joinRoom(code, socket.id, name);
      socket.join(code);

      const players = serializePlayers(room);

      // Notify everyone in the room about the new player (include playerName for toast)
      io.to(code).emit('playerJoined', { players, playerName: name });

      // Send confirmation to the joining player
      const response = { code, roomCode: code, playerId: socket.id, players, isHost: false };
      if (typeof callback === 'function') {
        callback({ success: true, ...response });
      }
      socket.emit('joinedRoom', response);

      console.log(`[Socket] ${name} joined room ${code}`);
    } catch (err) {
      console.error(`[Socket] joinRoom error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Start Game ───────────────────────────────

  socket.on('startGame', (data, callback) => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      if (room.hostId !== socket.id) throw new Error('Only the host can start the game');

      const category = data && data.category ? data.category : 'general';
      const { topic, imposterId } = gm.startGame(room.code, category);

      // Broadcast phase change to the room
      io.to(room.code).emit('phaseChanged', { phase: 'roleReveal' });

      // Send role assignments PRIVATELY to each player
      for (const [playerId, player] of room.players) {
        const isImposter = playerId === imposterId;
        io.to(playerId).emit('roleAssigned', {
          role: isImposter ? 'imposter' : 'player',
          topic: isImposter ? null : topic,
        });
      }

      if (typeof callback === 'function') {
        callback({ success: true });
      }

      // 10-second timer for role reveal, then auto-advance to clue phase
      gm.startTimer(
        room.code,
        10,
        (secondsLeft) => {
          io.to(room.code).emit('timerTick', { secondsLeft });
        },
        () => {
          advanceToClue(room.code);
        }
      );

      console.log(`[Socket] Game started in room ${room.code} with category "${category}"`);
    } catch (err) {
      console.error(`[Socket] startGame error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Advance to Clue (manual trigger) ────────

  socket.on('advanceToClue', () => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      advanceToClue(room.code);
    } catch (err) {
      console.error(`[Socket] advanceToClue error: ${err.message}`);
      socket.emit('error', { message: err.message });
    }
  });

  // ── Submit Clue ──────────────────────────────

  socket.on('submitClue', (data, callback) => {
    try {
      if (!data || !data.clue) throw new Error('Clue is required');

      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');

      const player = room.players.get(socket.id);
      const allIn = gm.submitClue(socket.id, data.clue);

      // Broadcast clue to all players in the room
      io.to(room.code).emit('clueReceived', {
        playerId: socket.id,
        playerName: player ? player.name : 'Unknown',
        clue: data.clue.trim(),
      });

      if (typeof callback === 'function') {
        callback({ success: true });
      }

      // If all clues are submitted, skip the remaining timer and advance
      if (allIn) {
        gm.clearTimer(room.code);
        advanceToDiscussion(room.code);
      }
    } catch (err) {
      console.error(`[Socket] submitClue error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Advance to Discussion (manual trigger) ──

  socket.on('advanceToDiscussion', () => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      advanceToDiscussion(room.code);
    } catch (err) {
      console.error(`[Socket] advanceToDiscussion error: ${err.message}`);
      socket.emit('error', { message: err.message });
    }
  });

  // ── Advance to Voting (manual trigger) ──────

  socket.on('advanceToVoting', () => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      advanceToVoting(room.code);
    } catch (err) {
      console.error(`[Socket] advanceToVoting error: ${err.message}`);
      socket.emit('error', { message: err.message });
    }
  });

  // ── Submit Vote ──────────────────────────────

  socket.on('submitVote', (data, callback) => {
    try {
      if (!data || !data.targetId) throw new Error('Vote target is required');

      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');

      const allIn = gm.submitVote(socket.id, data.targetId);

      // Tell everyone someone voted (emit both voterId and playerId for client compat)
      io.to(room.code).emit('voteSubmitted', { voterId: socket.id, playerId: socket.id });

      if (typeof callback === 'function') {
        callback({ success: true });
      }

      // If all votes are in, tally immediately
      if (allIn) {
        gm.clearTimer(room.code);
        tallyAndReveal(room.code);
      }
    } catch (err) {
      console.error(`[Socket] submitVote error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Imposter Guess ───────────────────────────

  // Accept both 'imposterGuess' and 'submitImposterGuess' event names
  const handleImposterGuess = (data, callback) => {
    try {
      if (!data || !data.guess) throw new Error('Guess is required');

      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      if (socket.id !== room.imposterId) throw new Error('Only the imposter can guess the topic');

      const correct = gm.imposterGuess(room.code, data.guess);

      io.to(room.code).emit('imposterGuessResult', {
        correct,
        guess: data.guess.trim(),
        imposterId: socket.id,
        imposterName: room.players.get(socket.id)?.name || 'Unknown',
        players: serializePlayers(room),
      });

      if (typeof callback === 'function') {
        callback({ success: true, correct });
      }

      console.log(`[Socket] Imposter guess in room ${room.code}: "${data.guess}" — ${correct ? 'CORRECT' : 'WRONG'}`);
    } catch (err) {
      console.error(`[Socket] imposterGuess error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  };
  socket.on('imposterGuess', handleImposterGuess);
  socket.on('submitImposterGuess', handleImposterGuess);

  // ── Next Round ───────────────────────────────

  socket.on('nextRound', (data, callback) => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      if (room.hostId !== socket.id) throw new Error('Only the host can advance to the next round');

      const updatedRoom = gm.nextRound(room.code);

      if (updatedRoom.phase === 'finalResults') {
        // Game is over — compute winner
        let winner = null;
        let highScore = -1;
        for (const [, player] of updatedRoom.players) {
          if (player.score > highScore) {
            highScore = player.score;
            winner = { id: player.id, name: player.name, score: player.score };
          }
        }

        io.to(room.code).emit('gameOver', {
          players: serializePlayers(updatedRoom),
          winner,
        });

        if (typeof callback === 'function') {
          callback({ success: true, gameOver: true });
        }
      } else {
        // New round — send roleReveal phase
        io.to(room.code).emit('phaseChanged', { phase: 'roleReveal' });

        // Send private role assignments
        for (const [playerId] of updatedRoom.players) {
          const isImposter = playerId === updatedRoom.imposterId;
          io.to(playerId).emit('roleAssigned', {
            role: isImposter ? 'imposter' : 'player',
            topic: isImposter ? null : updatedRoom.topic,
          });
        }

        if (typeof callback === 'function') {
          callback({ success: true, gameOver: false });
        }

        // 10-second role reveal timer, then advance to clue
        gm.startTimer(
          room.code,
          10,
          (secondsLeft) => {
            io.to(room.code).emit('timerTick', { secondsLeft });
          },
          () => {
            advanceToClue(room.code);
          }
        );
      }

      console.log(`[Socket] Next round triggered in room ${room.code}`);
    } catch (err) {
      console.error(`[Socket] nextRound error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Play Again ───────────────────────────────

  socket.on('playAgain', (data, callback) => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) throw new Error('You are not in a room');
      if (room.hostId !== socket.id) throw new Error('Only the host can restart the game');

      const resetRoom = gm.resetGame(room.code);

      io.to(room.code).emit('phaseChanged', { phase: 'lobby' });
      io.to(room.code).emit('playerJoined', { players: serializePlayers(resetRoom) });

      if (typeof callback === 'function') {
        callback({ success: true });
      }

      console.log(`[Socket] Room ${room.code} returned to lobby (play again)`);
    } catch (err) {
      console.error(`[Socket] playAgain error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Reconnect ────────────────────────────────

  socket.on('reconnect', (data, callback) => {
    try {
      if (!data) {
        throw new Error('Room code and player name are required for reconnection');
      }
      // Accept both {code, name} and {roomCode, playerName} formats
      const code = (data.code || data.roomCode || '').toUpperCase().trim();
      const name = (data.name || data.playerName || '').trim();

      if (!code || !name) {
        throw new Error('Room code and player name are required for reconnection');
      }

      const { player, room } = gm.reconnectPlayer(code, name, socket.id);

      socket.join(code);

      // Build the current game state snapshot for the reconnecting player
      const gameState = {
        code: room.code,
        roomCode: room.code,
        playerId: socket.id,
        phase: room.phase,
        players: serializePlayers(room),
        hostId: room.hostId,
        isHost: room.hostId === socket.id,
        currentRound: room.currentRound,
        totalRounds: room.totalRounds,
      };

      // If the game is in progress, include role info
      if (room.phase !== 'lobby') {
        const isImposter = socket.id === room.imposterId;
        gameState.role = isImposter ? 'imposter' : 'player';
        gameState.topic = isImposter ? null : room.topic;
      }

      // If we're past the clue phase, include clues
      if (['discussion', 'voting', 'results', 'finalResults'].includes(room.phase)) {
        gameState.clues = [];
        for (const [, p] of room.players) {
          gameState.clues.push({ playerId: p.id, playerName: p.name, clue: p.clue || '(no clue)' });
        }
      }

      socket.emit('reconnected', gameState);

      // Notify others this player is back
      io.to(code).emit('playerReconnected', {
        playerId: socket.id,
        playerName: player.name,
        players: serializePlayers(room),
      });

      if (typeof callback === 'function') {
        callback({ success: true, ...gameState });
      }

      console.log(`[Socket] Player "${player.name}" reconnected to room ${code}`);
    } catch (err) {
      console.error(`[Socket] reconnect error: ${err.message}`);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
      socket.emit('error', { message: err.message });
    }
  });

  // ── Disconnect ───────────────────────────────

  socket.on('disconnect', () => {
    try {
      const room = gm.getRoomByPlayer(socket.id);
      if (!room) {
        console.log(`[Socket] Disconnected: ${socket.id} (not in a room)`);
        return;
      }

      const player = room.players.get(socket.id);
      if (!player) return;

      const playerName = player.name;

      // Mark as disconnected (don't remove yet — allow reconnection)
      player.connected = false;

      io.to(room.code).emit('playerDisconnected', {
        playerId: socket.id,
        playerName,
        players: serializePlayers(room),
      });

      console.log(`[Socket] Player "${playerName}" (${socket.id}) disconnected from room ${room.code} — 30s grace period`);

      // Set a 30-second grace period for reconnection
      const timerId = setTimeout(() => {
        gm.disconnectTimers.delete(socket.id);

        const currentRoom = gm.getRoomByPlayer(socket.id);
        if (!currentRoom) return;

        const currentPlayer = currentRoom.players.get(socket.id);
        if (currentPlayer && !currentPlayer.connected) {
          // Player did not reconnect — remove them
          const { room: updatedRoom, wasHost, newHostId, roomDeleted } = gm.removePlayer(socket.id);

          if (roomDeleted) {
            console.log(`[Socket] Room ${currentRoom.code} deleted after disconnect timeout`);
            return;
          }

          if (updatedRoom) {
            io.to(updatedRoom.code).emit('playerLeft', {
              playerId: socket.id,
              playerName,
              wasHost,
              newHostId,
              players: serializePlayers(updatedRoom),
            });

            if (wasHost && newHostId) {
              io.to(newHostId).emit('youAreHost');
            }
          }

          console.log(`[Socket] Player "${playerName}" removed after 30s disconnect timeout`);
        }
      }, 30000);

      gm.disconnectTimers.set(socket.id, timerId);
    } catch (err) {
      console.error(`[Socket] disconnect handler error: ${err.message}`);
    }
  });
});

// ──────────────────────────────────────────────
// Start the server
// ──────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`[Server] Imposter Game server running on port ${PORT}`);
});
