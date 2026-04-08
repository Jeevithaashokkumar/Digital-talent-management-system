'use client';

import { create } from 'zustand';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isOnline?: boolean;
  lastSeen?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  loading: false,

  login: (userData, token) => {
    localStorage.setItem('token', token);
    set({ user: userData, token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/login';
  },

  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/auth/me'); // We need to implement this endpoint
      set({ user: res.data, loading: false });
    } catch (err) {
      set({ user: null, loading: false });
      localStorage.removeItem('token');
    }
  }
}));
