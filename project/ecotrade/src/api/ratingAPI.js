import axiosInstance from './axios';

export const ratingAPI = {
  // Create rating
  create: async (ratingData) => {
    const response = await axiosInstance.post('/api/ratings', ratingData);
    return response.data;
  },

  // Get ratings for manufacturer
  getByManufacturer: async (manufacturerId) => {
    const response = await axiosInstance.get(`/api/ratings?manufacturerId=${manufacturerId}`);
    return response.data;
  },

  // Get rating by RFQ
  getByRFQ: async (rfqId) => {
    const response = await axiosInstance.get(`/api/ratings/rfq/${rfqId}`);
    return response.data;
  }
};

