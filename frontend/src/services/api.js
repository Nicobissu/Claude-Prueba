import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');

// SolPeds
export const getSolPeds = (params) => api.get('/solpeds', { params });
export const getSolPedById = (id) => api.get(`/solpeds/${id}`);
export const createSolPed = (data) => api.post('/solpeds', data);
export const updateSolPed = (id, data) => api.put(`/solpeds/${id}`, data);
export const updateSolPedStatus = (id, data) => api.put(`/solpeds/${id}/status`, data);
export const updateSolPedItems = (id, data) => api.put(`/solpeds/${id}/items`, data);
export const deleteSolPed = (id) => api.delete(`/solpeds/${id}`);
export const getStatistics = () => api.get('/solpeds/statistics');

// Comentarios
export const createComment = (data) => api.post('/comments', data);
export const getCommentsBySolPed = (solPedId) => api.get(`/comments/solped/${solPedId}`);

// Todos
export const createTodo = (data) => api.post('/todos', data);
export const updateTodo = (id, data) => api.put(`/todos/${id}`, data);
export const deleteTodo = (id) => api.delete(`/todos/${id}`);

// Notificaciones
export const getNotifications = (params) => api.get('/notifications', { params });
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.put('/notifications/read-all');
export const getUnreadCount = () => api.get('/notifications/count');

// Config
export const getAreas = () => api.get('/config/areas');
export const getUnits = () => api.get('/config/units');

// Users (Admin)
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Attachments
export const uploadAttachment = (formData) => api.post('/attachments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);

export default api;
