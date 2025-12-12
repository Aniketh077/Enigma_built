import axios from './axios';

const API_URL = '/api/upload';

export const uploadSingleImage = async (file, folder = 'images', token) => {
  const formData = new FormData();
  formData.append('image', file);

  // Send folder as query parameter instead of form data
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    params: {
      folder: folder
    }
  };

  const response = await axios.post(`${API_URL}/single?folder=${folder}`, formData, config);
  return response.data;
};

export const uploadMultipleImages = async (files, folder = 'images', token) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  // Send folder as query parameter
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  };

  const response = await axios.post(`${API_URL}/multiple?folder=${folder}`, formData, config);

  // Return URLs array (backend now includes this)
  return {
    ...response.data,
    urls: response.data.urls || response.data.files.map(file => file.url)
  };
};

export const deleteImage = async (imageUrl, token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };
  
  const response = await axios.delete(`${API_URL}/delete`, {
    ...config,
    data: { imageUrl }
  });
  return response.data;
};

export const uploadFile = async (formData) => {
  // Get type from formData if it exists
  const type = formData.get('type') || 'image';
  
  const response = await axios.post(`${API_URL}/single?type=${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const uploadAPI = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  uploadFile
};