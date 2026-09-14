import apiClient from './client';

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login/', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch('/auth/profile/', data);
    return response.data;
  },

  getUniversities: async () => {
    const response = await apiClient.get('/auth/universities/');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getOrganizations: async () => {
    const response = await apiClient.get('/auth/organizations/');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  refreshToken: async (refresh) => {
    const response = await apiClient.post('/auth/token/refresh/', { refresh });
    return response.data;
  },

  getUsers: async (params) => {
    const response = await apiClient.get('/users/', { params });
    return response.data;
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  },
};
