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

  getEvaluations: async (pitchId) => {
    const response = await apiClient.get(`/pitches/${pitchId}/evaluations/`);
    return response.data;
  },

  submitEvaluation: async (pitchId, evalData) => {
    const response = await apiClient.post(`/pitches/${pitchId}/evaluations/`, evalData);
    return response.data;
  },

  getDiscussions: async (pitchId) => {
    const response = await apiClient.get(`/pitches/${pitchId}/discussions/`);
    return response.data;
  },

  postDiscussion: async (pitchId, content) => {
    const response = await apiClient.post(`/pitches/${pitchId}/discussions/`, { content });
    return response.data;
  },

  getTeam: async (pitchId) => {
    const response = await apiClient.get(`/pitches/${pitchId}/team/`);
    return response.data;
  },

  addTeamMember: async (pitchId, memberData) => {
    const response = await apiClient.post(`/pitches/${pitchId}/team/`, memberData);
    return response.data;
  },

  removeTeamMember: async (pitchId, memberId) => {
    const response = await apiClient.delete(`/pitches/${pitchId}/team/${memberId}/`);
    return response.data;
  },

  // Issue 31: Review Sessions
  getReviewSessions: async (params = {}) => {
    const response = await apiClient.get('/pitches/review-sessions/', { params });
    return response.data;
  },

  createReviewSession: async (data) => {
    const response = await apiClient.post('/pitches/review-sessions/', data);
    return response.data;
  },

  // Issue 32 & 33: Projects
  getProjects: async (params = {}) => {
    const response = await apiClient.get('/pitches/projects/', { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await apiClient.get(`/pitches/projects/${id}/`);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await apiClient.patch(`/pitches/projects/${id}/`, data);
    return response.data;
  },

  // Issue 34: Project Milestones
  getProjectMilestones: async (projectId) => {
    const response = await apiClient.get(`/pitches/projects/${projectId}/milestones/`);
    return response.data;
  },

  createProjectMilestone: async (projectId, data) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/milestones/`, data);
    return response.data;
  },

  updateProjectMilestone: async (projectId, milestoneId, data) => {
    const response = await apiClient.patch(`/pitches/projects/${projectId}/milestones/${milestoneId}/`, data);
    return response.data;
  },

  reviewProjectMilestone: async (projectId, milestoneId, actionData) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/milestones/${milestoneId}/review/`, actionData);
    return response.data;
  },

  // Issue 35: Deployment Gate
  submitDeployment: async (projectId, data) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/submit-deployment/`, data);
    return response.data;
  },

  approveDeployment: async (projectId) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/approve-deployment/`);
    return response.data;
  },

  // Issue 39 & 40: Project Discussions & Status History
  getProjectDiscussions: async (projectId) => {
    const response = await apiClient.get(`/pitches/projects/${projectId}/discussions/`);
    return response.data;
  },

  postProjectDiscussion: async (projectId, content) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/discussions/`, { content });
    return response.data;
  },

  getProjectStatusHistory: async (projectId) => {
    const response = await apiClient.get(`/pitches/projects/${projectId}/status-history/`);
    return response.data;
  },

  // Issue 51: Project Industry Workflow
  expressProjectInterest: async (projectId, data) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/express-interest/`, data);
    return response.data;
  },

  getProjectEngagements: async (projectId) => {
    const response = await apiClient.get(`/pitches/projects/${projectId}/engagements/`);
    return response.data;
  },

  // Issue 55: Verified Outcome Certificates
  generateProjectCertificates: async (projectId) => {
    const response = await apiClient.post(`/pitches/projects/${projectId}/certificates/generate/`);
    return response.data;
  },

  verifyCertificate: async (certificateId) => {
    const response = await apiClient.get(`/pitches/certificates/${certificateId}/verify/`);
    return response.data;
  },
};



