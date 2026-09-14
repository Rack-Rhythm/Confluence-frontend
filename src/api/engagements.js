import apiClient from './client';

export const engagementsAPI = {
  getEngagements: async (params = {}) => {
    const response = await apiClient.get('/engagements/', { params });
    return response.data;
  },

  createEngagement: async (data) => {
    const response = await apiClient.post('/engagements/', data);
    return response.data;
  },

  getEngagement: async (id) => {
    const response = await apiClient.get(`/engagements/${id}/`);
    return response.data;
  },

  respondEngagement: async (id, action, response_notes = '') => {
    // action: 'accept' | 'decline' | 'activate' | 'complete'
    const response = await apiClient.post(`/engagements/${id}/respond/`, {
      action,
      response_notes,
    });
    return response.data;
  },
};
