import api from './api';

// Auth Services
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Task/Board Services
export const boardService = {
  getBoard: (id: string) => api.get(`/boards/${id}`),
  createTask: (listId: string, data: any) => api.post('/tasks', { ...data, listId }),
  updateTask: (taskId: string, data: any) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/tasks/${taskId}`),
  createList: (boardId: string, title: string) => api.post('/lists', { boardId, title }),
};

// Doc Services
export const docService = {
  getDocs: () => api.get('/docs'),
  getDoc: (id: string) => api.get(`/docs/${id}`),
  createDoc: (data: any) => api.post('/docs', data),
  updateDoc: (id: string, data: any) => api.put(`/docs/${id}`, data),
};

// Folder Services
export const folderService = {
  getFolders: () => api.get('/folders'),
  createFolder: (data: any) => api.post('/folders', data),
  updateFolder: (id: string, data: any) => api.put(`/folders/${id}`, data),
  deleteFolder: (id: string) => api.delete(`/folders/${id}`),
};

// Whiteboard Services
export const whiteboardService = {
  getWhiteboards: () => api.get('/whiteboards'),
  getWhiteboard: (id: string) => api.get(`/whiteboards/${id}`),
  createWhiteboard: (data: any) => api.post('/whiteboards', data),
  updateWhiteboard: (id: string, data: any) => api.put(`/whiteboards/${id}`, data),
};
