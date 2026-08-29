import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('campusiq_token');

    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO Client] Connection error:', err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
