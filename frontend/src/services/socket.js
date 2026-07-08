import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    // allow polling fallback to improve reliability during dev/network issues
    transports: ['polling', 'websocket'],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('Socket connected', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connect error:', error.message || error);
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`Socket reconnect attempt ${attempt}`);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnect failed');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (room) => {
  if (socket) {
    socket.emit('join_chat', { room });
  }
};

export const sendMessage = (room, message, sender) => {
  if (socket) {
    socket.emit('send_message', { room, message, sender });
  }
};