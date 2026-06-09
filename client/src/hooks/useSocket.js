import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let globalSocket = null;

export default function useSocket() {
  const [connected, setConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);
  const socketRef = useRef(null);

  const getSocket = useCallback(() => {
    if (globalSocket && globalSocket.connected) {
      return globalSocket;
    }

    if (globalSocket) {
      return globalSocket;
    }

    globalSocket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['polling', 'websocket'],
    });

    return globalSocket;
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    setSocketInstance(socket);

    const onConnect = () => {
      setConnected(true);
      const storedCode = sessionStorage.getItem('roomCode');
      const storedName = sessionStorage.getItem('playerName');
      if (storedCode && storedName) {
        socket.emit('reconnect', { code: storedCode, name: storedName, roomCode: storedCode, playerName: storedName });
      }
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onConnectError = () => {
      setConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (socket.connected) {
      setConnected(true);
    }

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [getSocket]);

  return { socket: socketInstance, connected };
}
