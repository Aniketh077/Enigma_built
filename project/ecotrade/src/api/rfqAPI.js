import axiosInstance from './axios';

// RFQ API functions
export const rfqAPI = {
  // Create RFQ
  create: async (rfqData) => {
    const response = await axiosInstance.post('/api/rfqs', rfqData);
    return response.data;
  },

  // Get user's RFQs
  getMyRFQs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await axiosInstance.get(`/api/rfqs/my-rfqs?${params.toString()}`);
    return response.data;
  },

  // Get RFQ Pool (for manufacturers)
  getRFQPool: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(val => params.append(key, val));
        } else {
          params.append(key, filters[key]);
        }
      }
    });
    const response = await axiosInstance.get(`/api/rfqs/pool?${params.toString()}`);
    return response.data;
  },

  // Get accepted RFQs (for manufacturers)
  getAcceptedRFQs: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await axiosInstance.get(`/api/rfqs/accepted?${params.toString()}`);
    return response.data;
  },

  // Get RFQ by ID
  getById: async (rfqId) => {
    const response = await axiosInstance.get(`/api/rfqs/${rfqId}`);
    return response.data;
  },

  // Update RFQ
  update: async (rfqId, updateData) => {
    const response = await axiosInstance.put(`/api/rfqs/${rfqId}`, updateData);
    return response.data;
  },

  // Delete RFQ
  delete: async (rfqId) => {
    const response = await axiosInstance.delete(`/api/rfqs/${rfqId}`);
    return response.data;
  },

  // Request RFQ (manufacturer)
  requestRFQ: async (rfqId, requestData) => {
    const response = await axiosInstance.post(`/api/rfqs/${rfqId}/request`, requestData);
    return response.data;
  },

  // Accept manufacturer
  acceptManufacturer: async (rfqId, manufacturerRequestId) => {
    const response = await axiosInstance.post(`/api/rfqs/${rfqId}/accept-manufacturer`, {
      manufacturerRequestId
    });
    return response.data;
  },

  // Reject manufacturer
  rejectManufacturer: async (rfqId, manufacturerRequestId, rejectionReason) => {
    const response = await axiosInstance.post(`/api/rfqs/${rfqId}/reject-manufacturer`, {
      manufacturerRequestId,
      rejectionReason
    });
    return response.data;
  },

  // Update RFQ status
  updateStatus: async (rfqId, statusData) => {
    const response = await axiosInstance.put(`/api/rfqs/${rfqId}/status`, statusData);
    return response.data;
  }
};

