import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`,
});

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
  const host = baseUrl.replace('/api', '');
  return `${host}${path}`;
};

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jn_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
