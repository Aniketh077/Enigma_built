import axios from 'axios';

// Default to localhost:5000 if env variable is not set
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log(`Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error.response || error);
    
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access - clear user data
      localStorage.removeItem('user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/role-selection') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/verify-email') &&
          !window.location.pathname.includes('/forgot-password') &&
          !window.location.pathname.includes('/reset-password')) {
        window.location.href = '/role-selection';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;