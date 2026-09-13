import apiClient from './client';

export const analyticsAPI = {
  getSummary: async () => {
    const response = await apiClient.get('/analytics/summary/');
    return response.data;
  },
};
