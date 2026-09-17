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
    const isFD = isFormData || (typeof FormData !== 'undefined' && data instanceof FormData);
    const config = isFD ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await apiClient.post('/issues/', data, config);
    return response.data;
  },

  updateIssue: async (id, data) => {
    const response = await apiClient.patch(`/issues/${id}/`, data);
    return response.data;
  },

  deleteIssue: async (id) => {
    const response = await apiClient.delete(`/issues/${id}/`);
    return response.data;
  },

  forceAdoptIssue: async (id, universityId) => {
    const response = await apiClient.post(`/issues/${id}/force-adopt/`, { university_id: universityId });
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

  confirmResolution: async (id, confirmed, details = {}) => {
    const payload = typeof details === 'string'
      ? { confirmed, feedback: details, reason: details }
      : { confirmed, ...details };
    const response = await apiClient.post(`/issues/${id}/confirm-resolution/`, payload);
    return response.data;
  },

  getStatusHistory: async (id) => {
    const response = await apiClient.get(`/issues/${id}/status-history/`);
    return response.data;
  },

  getActionInbox: async () => {
    const response = await apiClient.get('/issues/action-inbox/');
    return response.data;
  },

  getOpenCalls: async (params = {}) => {
    const response = await apiClient.get('/issues/open-calls/', { params });
    return response.data;
  },

  createOpenCall: async (data) => {
    const response = await apiClient.post('/issues/open-calls/', data);
    return response.data;
  },

  getDiscussions: async (issueId, params = {}) => {
    const response = await apiClient.get(`/issues/${issueId}/discussions/`, { params });
    return response.data;
  },

  postDiscussion: async (issueId, data) => {
    const payload = typeof data === 'string' ? { content: data } : data;
    const response = await apiClient.post(`/issues/${issueId}/discussions/`, payload);
    return response.data;
  },

  getCollaborators: async (issueId) => {
    const response = await apiClient.get(`/issues/${issueId}/collaborators/`);
    return response.data;
  },

  addCollaborator: async (issueId, payload) => {
    const response = await apiClient.post(`/issues/${issueId}/collaborators/`, payload);
    return response.data;
  },

  removeCollaborator: async (issueId, collaboratorId) => {
    const response = await apiClient.delete(`/issues/${issueId}/collaborators/${collaboratorId}/`);
    return response.data;
  },

  getStatusContract: async () => {
    const response = await apiClient.get('/issues/status-contract/');
    return response.data;
  },

  getActivityTimeline: async (issueId, params = {}) => {
    const response = await apiClient.get(`/issues/${issueId}/activity/`, { params });
    return response.data;
  },
};
