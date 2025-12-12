import axiosInstance from './axios';

export const invitationAPI = {
  // Get invitations
  getAll: async () => {
    const response = await axiosInstance.get('/api/invitations');
    return response.data;
  },

  // Create invitation
  create: async (invitationData) => {
    const response = await axiosInstance.post('/api/invitations', invitationData);
    return response.data;
  },

  // Accept invitation
  accept: async (invitationId) => {
    const response = await axiosInstance.post(`/api/invitations/${invitationId}/accept`);
    return response.data;
  },

  // Decline invitation
  decline: async (invitationId, declineReason) => {
    const response = await axiosInstance.post(`/api/invitations/${invitationId}/decline`, {
      declineReason
    });
    return response.data;
  }
};

