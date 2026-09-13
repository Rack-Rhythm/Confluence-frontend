import apiClient from './client';

export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const response = await apiClient.get('/notifications/', { params });
    return response.data;
  },

  markRead: async (id) => {
    const response = await apiClient.post(`/notifications/${id}/read/`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiClient.post('/notifications/mark-all-read/');
    return response.data;
  },
};
