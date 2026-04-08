import { create } from 'zustand';
import api from '@/services/api';

interface Query {
  id: string;
  title: string;
  message: string;
  status: 'pending' | 'replied';
  adminReply?: string;
  isRead: boolean;
  adminId?: string;
  userId: string;
  createdAt: string;
  user?: { name: string; email: string };
}

interface QueryStore {
  queries: Query[];
  loading: boolean;
  error: string | null;
  submitQuery: (data: { title: string; message: string }) => Promise<void>;
  fetchUserQueries: () => Promise<void>;
  fetchAllQueries: () => Promise<void>;
  replyToQuery: (queryId: string, reply: string) => Promise<void>;
  markAsRead: (queryId: string) => Promise<void>;
}

export const useQueryStore = create<QueryStore>((set, get) => ({
  queries: [],
  loading: false,
  error: null,

  submitQuery: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post('/queries/submit', data);
      set(state => ({ queries: [res.data, ...state.queries], loading: false }));
    } catch (err) {
      set({ error: 'Failed to deploy query', loading: false });
    }
  },

  fetchUserQueries: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/queries/my');
      set({ queries: res.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch your tactical queries', loading: false });
    }
  },

  fetchAllQueries: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/queries/all');
      set({ queries: res.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to access global query stream', loading: false });
    }
  },

  replyToQuery: async (queryId, adminReply) => {
    try {
      const res = await api.put(`/queries/${queryId}/reply`, { adminReply });
      set(state => ({
        queries: state.queries.map(q => q.id === queryId ? res.data : q)
      }));
    } catch (err) {
      set({ error: 'Failed to transmit reply' });
    }
  },
  
  markAsRead: async (queryId) => {
    try {
      const res = await api.put(`/queries/${queryId}/read`);
      set(state => ({
        queries: state.queries.map(q => q.id === queryId ? { ...q, isRead: true } : q)
      }));
    } catch (err) {
      console.error("Failed to mark query as read:", err);
    }
  }
}));
