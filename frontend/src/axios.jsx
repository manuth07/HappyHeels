import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Sending request with Authorization header:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('No token found in localStorage');
  }
  return config;
});

//ADD: Auto handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hasToken = Boolean(localStorage.getItem('token'));
    const errorMessage = error.response?.data?.message || '';

    console.log('API Error:', status, errorMessage);

    // Only logout on specific authentication errors, not all 401/403
    if (hasToken && status === 401 && (
      errorMessage.includes('token') || 
      errorMessage.includes('expired') || 
      errorMessage.includes('invalid') ||
      errorMessage.includes('signature')
    )) {
      console.log('Token invalid or expired. Clearing session and redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (hasToken && status === 403) {
      // For 403, show error but don't logout immediately
      console.log('Access denied. Please check your permissions.');
    }

    return Promise.reject(error);
  }
);

export default API;
