import apiClient from './client';

export const analyticsAPI = {
  getSummary: async (params = {}) => {
    const response = await apiClient.get('/analytics/summary/', { params });
    return response.data;
  },

  getInstitutional: async (params = {}) => {
    const response = await apiClient.get('/analytics/institutional/', { params });
    return response.data;
  },
};
