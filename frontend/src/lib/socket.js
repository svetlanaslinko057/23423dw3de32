import { io } from 'socket.io-client';

// Get API URL from environment
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Socket instance (singleton)
let socket = null;

/**
 * Get or create socket connection
 */
export function getSocket() {
  if (!socket) {
    socket = io(API_URL.replace('/api', ''), {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.log('[Socket] Connection error:', error.message);
    });
  }

  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Join rooms based on user role and context
 */
export function joinRooms(rooms) {
  const s = getSocket();
  if (s.connected) {
    s.emit('join', { rooms });
  } else {
    s.once('connect', () => {
      s.emit('join', { rooms });
    });
  }
}

/**
 * Leave rooms
 */
export function leaveRooms(rooms) {
  const s = getSocket();
  s.emit('leave', { rooms });
}

export default getSocket;
