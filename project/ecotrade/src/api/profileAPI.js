import axiosInstance from './axios';

export const profileAPI = {
  // Get profile
  get: async () => {
    const response = await axiosInstance.get('/api/users/profile');
    return response.data;
  },

  // Update profile
  update: async (profileData) => {
    const response = await axiosInstance.put('/api/users/profile', profileData);
    return response.data;
  }
};

