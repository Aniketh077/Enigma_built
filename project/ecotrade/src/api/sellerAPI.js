import axios from './axios';

export const createSellerRequest = async (data) => {
  try {
    const response = await axios.post('/api/seller-requests', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllSellerRequests = async (params = {}) => {
  try {
    const response = await axios.get('/api/seller-requests', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSellerRequestById = async (id) => {
  try {
    const response = await axios.get(`/api/seller-requests/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const approveSellerRequest = async (id, notes = '') => {
  try {
    const response = await axios.put(`/api/seller-requests/${id}/approve`, { notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rejectSellerRequest = async (id, notes = '') => {
  try {
    const response = await axios.put(`/api/seller-requests/${id}/reject`, { notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSellerRequest = async (id) => {
  try {
    const response = await axios.delete(`/api/seller-requests/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
