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

  getUniversityStudents: async (universityId) => {
    const response = await apiClient.get(`/users/universities/${universityId}/students/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getUniversityMentors: async (universityId) => {
    const response = await apiClient.get(`/users/universities/${universityId}/mentors/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  getUniversityCoordinators: async (universityId) => {
    const response = await apiClient.get(`/users/universities/${universityId}/coordinators/`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.results || []);
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.patch(`/users/${id}/`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}/`);
    return response.data;
  },

  createUniversity: async (data) => {
    const response = await apiClient.post('/auth/universities/', data);
    return response.data;
  },

  updateUniversity: async (id, data) => {
    const response = await apiClient.patch(`/auth/universities/${id}/`, data);
    return response.data;
  },

  deleteUniversity: async (id) => {
    const response = await apiClient.delete(`/auth/universities/${id}/`);
    return response.data;
  },

  createOrganization: async (data) => {
    const response = await apiClient.post('/auth/organizations/', data);
    return response.data;
  },

  updateOrganization: async (id, data) => {
    const response = await apiClient.patch(`/auth/organizations/${id}/`, data);
    return response.data;
  },

  deleteOrganization: async (id) => {
    const response = await apiClient.delete(`/auth/organizations/${id}/`);
    return response.data;
  },
};

