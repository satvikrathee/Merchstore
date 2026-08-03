import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useAdminSocket = (onOrderStatusUpdate, onOrderCreated) => {
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      socket.emit('JOIN_ADMIN', { token });
    });

    socket.on('ORDER_STATUS_UPDATED', (payload) => {
      onOrderStatusUpdate(payload);
    });

    socket.on('ORDER_CREATED', (payload) => {
      if (onOrderCreated) {
        onOrderCreated(payload);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [onOrderStatusUpdate, onOrderCreated]);
};
