import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import useSocket from '../hooks/useSocket';

const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function GameProvider({ children }) {
  const { socket, connected } = useSocket();

  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState('home');
  const [role, setRole] = useState(null);
  const [topic, setTopic] = useState(null);
  const [timer, setTimer] = useState(0);
  const [clues, setClues] = useState([]);
  const [votes, setVotes] = useState({});
  const [roundResult, setRoundResult] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
  const [finalScores, setFinalScores] = useState([]);
  const [hasSubmittedClue, setHasSubmittedClue] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPlayers, setVotedPlayers] = useState([]);
  const [imposterGuessResult, setImposterGuessResult] = useState(null);

  const toastIdRef = useRef(0);
  const errorTimeoutRef = useRef(null);
  const playerNameRef = useRef('');
  const playerIdRef = useRef(null);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  const rememberPlayerName = useCallback((name) => {
    const cleanName = (name || '').trim();
    setPlayerName(cleanName);
    playerNameRef.current = cleanName;
    if (cleanName) {
      sessionStorage.setItem('playerName', cleanName);
    }
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setErrorWithTimeout = useCallback((msg) => {
    setError(msg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onRoomCreated = (data) => {
      const code = data.roomCode || data.code;
      const savedName = playerNameRef.current || sessionStorage.getItem('playerName') || data.playerName || '';
      setRoomCode(code);
      setPlayerId(data.playerId);
      setIsHost(true);
      setPlayers(data.players || []);
      setPhase('lobby');
      sessionStorage.setItem('roomCode', code);
      if (savedName) rememberPlayerName(savedName);
    };

    const onJoinedRoom = (data) => {
      const code = data.roomCode || data.code;
      const savedName = playerNameRef.current || sessionStorage.getItem('playerName') || data.playerName || '';
      setRoomCode(code);
      setPlayerId(data.playerId);
      setPlayers(data.players || []);
      setIsHost(data.isHost || false);
      setPhase('lobby');
      sessionStorage.setItem('roomCode', code);
      if (savedName) rememberPlayerName(savedName);
    };

    const onPlayerJoined = (data) => {
      setPlayers(data.players || []);
      if (data.playerName) {
        addToast(`${data.playerName} joined! 🎉`);
      }
    };

    const onPlayerLeft = (data) => {
      setPlayers(data.players || []);
      if (data.playerId) {
        setClues((prev) => prev.filter((clue) => clue.playerId !== data.playerId));
        setVotedPlayers((prev) => prev.filter((id) => id !== data.playerId));
      }
      if (data.newHostId && data.newHostId === playerIdRef.current) {
        setIsHost(true);
      }
      if (data.playerName) {
        addToast(`${data.playerName} left 👋`, 'warning');
      }
    };

    const onPhaseChanged = (data) => {
      setPhase(data.phase);
      if (data.phase === 'clue') {
        setHasSubmittedClue(false);
        setClues([]);
      }
      if (data.phase === 'voting') {
        setHasVoted(false);
        setVotes({});
        setVotedPlayers([]);
      }
      if (data.phase === 'discussion') {
        if (data.clues) setClues(data.clues);
        setVotes({});
        setVotedPlayers([]);
        setHasVoted(false);
      }
      if (data.round !== undefined) setCurrentRound(data.round);
      if (data.totalRounds !== undefined) setTotalRounds(data.totalRounds);
    };

    const onRoleAssigned = (data) => {
      setRole(data.role);
      setTopic(data.topic || null);
      setPhase('roleReveal');
      setRoundResult(null);
      setImposterGuessResult(null);
    };

    const onTimerTick = (data) => {
      setTimer(data.secondsLeft ?? data.timeLeft ?? 0);
    };

    const onClueReceived = (data) => {
      setClues((prev) => {
        const exists = prev.find((c) => c.playerId === data.playerId);
        if (exists) return prev;
        return [...prev, { playerId: data.playerId, playerName: data.playerName, clue: data.clue }];
      });
    };

    const onVoteSubmitted = (data) => {
      const id = data.playerId || data.voterId;
      setVotedPlayers((prev) => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    };

    const onVotingStateUpdated = (data) => {
      const updatedVotedPlayers = data.votedPlayers || [];
      setVotedPlayers(updatedVotedPlayers);
      if (!updatedVotedPlayers.includes(playerIdRef.current)) {
        setHasVoted(false);
      }
    };

    const onRoundResult = (data) => {
      setRoundResult(data);
      setPhase('results');
      if (data.players) setPlayers(data.players);
      if (data.currentRound !== undefined) setCurrentRound(data.currentRound);
      if (data.totalRounds !== undefined) setTotalRounds(data.totalRounds);
    };

    const onGameOver = (data) => {
      setPhase('finalResults');
      setFinalScores(data.players || data.scores || []);
      if (data.players) setPlayers(data.players);
    };

    const onError = (data) => {
      const msg = typeof data === 'string' ? data : data.message || 'Something went wrong';
      setErrorWithTimeout(msg);
    };

    const onReconnected = (data) => {
      const code = data.roomCode || data.code;
      if (code) setRoomCode(code);
      if (data.playerId) setPlayerId(data.playerId);
      if (data.playerName) rememberPlayerName(data.playerName);
      if (data.players) setPlayers(data.players);
      if (data.phase) setPhase(data.phase);
      if (data.role) setRole(data.role);
      if (data.topic) setTopic(data.topic);
      if (data.isHost !== undefined) setIsHost(data.isHost);
      if (data.clues) setClues(data.clues);
      if (data.roundResult) setRoundResult(data.roundResult);
      if (data.currentRound !== undefined) setCurrentRound(data.currentRound);
      if (data.totalRounds !== undefined) setTotalRounds(data.totalRounds);
      addToast('Reconnected! 🔄');
    };

    const onImposterGuessResult = (data) => {
      setImposterGuessResult(data);
      if (data.players) setPlayers(data.players);
    };

    const onPlayerDisconnected = (data) => {
      setPlayers(data.players || []);
      if (data.playerName) {
        addToast(`${data.playerName} disconnected 📡`, 'warning');
      }
    };

    const onPlayerReconnected = (data) => {
      setPlayers(data.players || []);
      if (data.playerName) {
        addToast(`${data.playerName} reconnected! 🔄`);
      }
    };

    const onYouAreHost = () => {
      setIsHost(true);
      addToast('You are now the host! 👑');
    };

    socket.on('roomCreated', onRoomCreated);
    socket.on('joinedRoom', onJoinedRoom);
    socket.on('playerJoined', onPlayerJoined);
    socket.on('playerLeft', onPlayerLeft);
    socket.on('playerDisconnected', onPlayerDisconnected);
    socket.on('playerReconnected', onPlayerReconnected);
    socket.on('youAreHost', onYouAreHost);
    socket.on('phaseChanged', onPhaseChanged);
    socket.on('roleAssigned', onRoleAssigned);
    socket.on('timerTick', onTimerTick);
    socket.on('clueReceived', onClueReceived);
    socket.on('voteSubmitted', onVoteSubmitted);
    socket.on('votingStateUpdated', onVotingStateUpdated);
    socket.on('roundResult', onRoundResult);
    socket.on('gameOver', onGameOver);
    socket.on('error', onError);
    socket.on('reconnected', onReconnected);
    socket.on('imposterGuessResult', onImposterGuessResult);

    return () => {
      socket.off('roomCreated', onRoomCreated);
      socket.off('joinedRoom', onJoinedRoom);
      socket.off('playerJoined', onPlayerJoined);
      socket.off('playerLeft', onPlayerLeft);
      socket.off('playerDisconnected', onPlayerDisconnected);
      socket.off('playerReconnected', onPlayerReconnected);
      socket.off('youAreHost', onYouAreHost);
      socket.off('phaseChanged', onPhaseChanged);
      socket.off('roleAssigned', onRoleAssigned);
      socket.off('timerTick', onTimerTick);
      socket.off('clueReceived', onClueReceived);
      socket.off('voteSubmitted', onVoteSubmitted);
      socket.off('votingStateUpdated', onVotingStateUpdated);
      socket.off('roundResult', onRoundResult);
      socket.off('gameOver', onGameOver);
      socket.off('error', onError);
      socket.off('reconnected', onReconnected);
      socket.off('imposterGuessResult', onImposterGuessResult);
    };
  }, [socket, addToast, setErrorWithTimeout, rememberPlayerName]);

  // Actions
  const createRoom = useCallback((name) => {
    if (!socket) return;
    rememberPlayerName(name);
    socket.emit('createRoom', { playerName: name.trim() });
  }, [socket, rememberPlayerName]);

  const joinRoom = useCallback((code, name) => {
    if (!socket) return;
    rememberPlayerName(name);
    socket.emit('joinRoom', { code: code.toUpperCase(), name: name.trim() });
  }, [socket, rememberPlayerName]);

  const startGame = useCallback((category) => {
    if (!socket) return;
    socket.emit('startGame', { category });
  }, [socket]);

  const submitClue = useCallback((clue) => {
    if (!socket) return;
    socket.emit('submitClue', { clue });
    setHasSubmittedClue(true);
  }, [socket]);

  const submitVote = useCallback((targetId) => {
    if (!socket) return;
    socket.emit('submitVote', { targetId });
    setHasVoted(true);
  }, [socket]);

  const submitImposterGuess = useCallback((guess) => {
    if (!socket) return;
    socket.emit('submitImposterGuess', { guess });
  }, [socket]);

  const nextRound = useCallback(() => {
    if (!socket) return;
    socket.emit('nextRound');
  }, [socket]);

  const playAgain = useCallback(() => {
    if (!socket) return;
    socket.emit('playAgain');
    setPhase('lobby');
    setRole(null);
    setTopic(null);
    setClues([]);
    setVotes({});
    setRoundResult(null);
    setCurrentRound(1);
    setFinalScores([]);
    setHasSubmittedClue(false);
    setHasVoted(false);
    setVotedPlayers([]);
    setImposterGuessResult(null);
  }, [socket]);

  const leaveGame = useCallback(() => {
    if (socket && roomCode) {
      socket.emit('leaveRoom', { roomCode });
    }
    setRoomCode(null);
    setPlayerId(null);
    setPlayerName('');
    playerNameRef.current = '';
    playerIdRef.current = null;
    setPlayers([]);
    setPhase('home');
    setRole(null);
    setTopic(null);
    setClues([]);
    setVotes({});
    setRoundResult(null);
    setIsHost(false);
    setCurrentRound(1);
    setFinalScores([]);
    setHasSubmittedClue(false);
    setHasVoted(false);
    setVotedPlayers([]);
    setImposterGuessResult(null);
    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('playerName');
  }, [socket, roomCode]);

  const value = {
    socket,
    connected,
    roomCode,
    setRoomCode,
    playerId,
    playerName,
    setPlayerName,
    players,
    phase,
    setPhase,
    role,
    topic,
    timer,
    clues,
    votes,
    roundResult,
    isHost,
    error,
    toasts,
    currentRound,
    totalRounds,
    finalScores,
    hasSubmittedClue,
    hasVoted,
    votedPlayers,
    imposterGuessResult,
    createRoom,
    joinRoom,
    startGame,
    submitClue,
    submitVote,
    submitImposterGuess,
    nextRound,
    playAgain,
    leaveGame,
    addToast,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export default GameContext;
