import apiClient from './client';

export const issuesAPI = {
  getIssues: async (params = {}) => {
    const response = await apiClient.get('/issues/', { params });
    return response.data;
  },

  getIssue: async (id) => {
    const response = await apiClient.get(`/issues/${id}/`);
    return response.data;
  },

  createIssue: async (data, isFormData = false) => {
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await apiClient.post('/issues/', data, config);
    return response.data;
  },

  updateIssue: async (id, data) => {
    const response = await apiClient.patch(`/issues/${id}/`, data);
    return response.data;
  },

  moderateIssue: async (id, actionData) => {
    // action: 'validate' | 'reject' | 'mark_duplicate', optional category, duplicate_of_id
    const response = await apiClient.post(`/issues/${id}/moderate/`, actionData);
    return response.data;
  },

  adoptIssue: async (id) => {
    const response = await apiClient.post(`/issues/${id}/adopt/`);
    return response.data;
  },

  nominateIssue: async (id, rationale = '') => {
    const response = await apiClient.post(`/issues/${id}/nominate/`, { rationale });
    return response.data;
  },

  getNominations: async () => {
    const response = await apiClient.get('/issues/nominations/');
    return response.data;
  },

  reviewNomination: async (id, action) => {
    // action: 'approve' | 'reject'
    const response = await apiClient.post(`/issues/nominations/${id}/review/`, { action });
    return response.data;
  },

  confirmResolution: async (id, confirmed, feedback = '') => {
    const response = await apiClient.post(`/issues/${id}/confirm-resolution/`, {
      confirmed,
      feedback,
    });
    return response.data;
  },
};
