import { create } from 'zustand';
import api from '@/services/api';

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Card {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  order: number;
  dueDate?: string;
  tags: string[];
  listId: string;
  boardId: string;
  subTasks?: SubTask[];
  assignee?: { name: string; email: string };
}

interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
  tasks: Card[];
}

interface Board {
  id: string;
  title: string;
  description?: string;
  lists: List[];
}

interface BoardStore {
  boards: any[];
  currentBoard: Board | null;
  loading: boolean;
  error: string | null;

  activeView: string;
  setActiveView: (view: string) => void;
  fetchBoards: () => Promise<void>;
  fetchBoardDetails: (id: string) => Promise<void>;
  addCard: (listId: string, cardData: any) => Promise<void>;
  updateCard: (cardId: string, updateData: any) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, newListId: string, newOrder: number) => Promise<void>;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  boards: [],
  currentBoard: null,
  activeView: 'Boards',
  loading: false,
  error: null,

  setActiveView: (view) => set({ activeView: view }),

  fetchBoards: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/boards');
      set({ boards: res.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch boards', loading: false });
    }
  },

  fetchBoardDetails: async (id) => {
    set({ loading: true });
    try {
      const res = await api.get(`/boards/${id}`);
      set({ currentBoard: res.data, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch board details', loading: false });
    }
  },

  addCard: async (listId, cardData) => {
    try {
      const res = await api.post('/tasks', { ...cardData, listId });
      const current = get().currentBoard;
      if (current) {
        const updatedLists = current.lists.map(l => 
          l.id === listId ? { ...l, tasks: [...l.tasks, res.data] } : l
        );
        set({ currentBoard: { ...current, lists: updatedLists } });
      }
    } catch (err) {
      set({ error: 'Failed to add card' });
    }
  },

  updateCard: async (cardId, updateData) => {
    try {
      const res = await api.put(`/tasks/${cardId}`, updateData);
      const current = get().currentBoard;
      if (current) {
        const updatedLists = current.lists.map(l => ({
          ...l,
          tasks: l.tasks.map(t => t.id === cardId ? res.data : t)
        }));
        set({ currentBoard: { ...current, lists: updatedLists } });
      }
    } catch (err) {
      set({ error: 'Failed to update card' });
    }
  },

  deleteCard: async (cardId) => {
    try {
      await api.delete(`/tasks/${cardId}`);
      const current = get().currentBoard;
      if (current) {
        const updatedLists = current.lists.map(l => ({
          ...l,
          tasks: l.tasks.filter(t => t.id !== cardId)
        }));
        set({ currentBoard: { ...current, lists: updatedLists } });
      }
    } catch (err) {
      set({ error: 'Failed to delete card' });
    }
  },

  moveCard: async (cardId, newListId, newOrder) => {
    // Optimistic Update
    const current = get().currentBoard;
    if (!current) return;

    let movedCard: Card | undefined;
    const oldLists = current.lists.map(l => {
      const card = l.tasks.find(t => t.id === cardId);
      if (card) movedCard = { ...card, listId: newListId, order: newOrder };
      return { ...l, tasks: l.tasks.filter(t => t.id !== cardId) };
    });

    if (movedCard) {
      const newLists = oldLists.map(l => 
        l.id === newListId ? { ...l, tasks: [...l.tasks, movedCard!] } : l
      );
      set({ currentBoard: { ...current, lists: newLists } });
      
      try {
        await api.put(`/tasks/${cardId}`, { listId: newListId, order: newOrder });
      } catch (err) {
        set({ error: 'Failed to sync move to backend', currentBoard: current });
      }
    }
  }
}));
