import axiosInstance from './axios';

export const chatAPI = {
  // Get chat messages for RFQ
  getMessages: async (rfqId) => {
    const response = await axiosInstance.get(`/api/chat/rfq/${rfqId}`);
    return response.data;
  },

  // Send message
  sendMessage: async (rfqId, message, attachments = []) => {
    const response = await axiosInstance.post(`/api/chat/rfq/${rfqId}`, {
      message,
      attachments
    });
    return response.data;
  },

  // Mark message as read
  markAsRead: async (messageId) => {
    const response = await axiosInstance.put(`/api/chat/${messageId}/read`);
    return response.data;
  }
};

