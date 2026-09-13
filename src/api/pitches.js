import apiClient from './client';

export const pitchesAPI = {
  getPitches: async (params = {}) => {
    const response = await apiClient.get('/pitches/', { params });
    return response.data;
  },

  getPitch: async (id) => {
    const response = await apiClient.get(`/pitches/${id}/`);
    return response.data;
  },

  createPitch: async (data) => {
    const response = await apiClient.post('/pitches/', data);
    return response.data;
  },

  submitFeedback: async (pitchId, feedback_text) => {
    const response = await apiClient.post(`/pitches/${pitchId}/feedback/`, { feedback_text });
    return response.data;
  },

  scoreFeedback: async (feedbackId, data) => {
    // data: { relevance_score, mentor_notes, is_shared_with_students }
    const response = await apiClient.post(`/pitches/feedback/${feedbackId}/score/`, data);
    return response.data;
  },

  reviewAction: async (pitchId, actionData) => {
    // action: 'select_winner' | 'merge_pitches' | 'assign_mentor' | 'reject'
    const response = await apiClient.post(`/pitches/${pitchId}/review-action/`, actionData);
    return response.data;
  },

  updateLifecycle: async (lifecycleId, data) => {
    // data: { milestones, deliverables, test_results, ip_records, outcome_status }
    const response = await apiClient.post(`/pitches/lifecycle/${lifecycleId}/update/`, data);
    return response.data;
  },
};
