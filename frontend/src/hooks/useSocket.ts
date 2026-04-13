import { useEffect, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

let socket: Socket | null = null;

export const useSocket = () => {
  const user = useAuthStore(state => state.user);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && !socket) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiUrl.replace(/\/api$/, '');
      
      socket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        socket?.emit('join-chat', user.id);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      // We keep the socket alive during the session, 
      // but we could cleanup if needed.
    };
  }, [user]);

  const emit = useCallback((event: string, data: any) => {
    socket?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socket?.on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
  }, []);

  const off = useCallback((event: string, callback: (...args: any[]) => void) => {
    socket?.off(event, callback);
  }, []);

  return { socket, isConnected, emit, on, off };
};
