import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`,
});

export const getMediaUrl = (path) => {
  if (!path) return null;
  
  // If the path contains localhost:5001 or 127.0.0.1:5001, rewrite it to use the current hostname
  let cleanPath = path;
  if (typeof path === 'string') {
    cleanPath = path.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(:5001)/, `$1${window.location.hostname}$3`);
  }

  if (cleanPath.startsWith('http') || cleanPath.startsWith('data:') || cleanPath.startsWith('/jana_feed_media')) {
    return cleanPath;
  }
  const baseUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;
  const host = baseUrl.replace('/api', '');
  return `${host}${cleanPath}`;
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

// Add a response interceptor to handle 401 Unauthorized errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear session keys
      const keysToRemove = [
        'jn_token',
        'jn_user_id',
        'jn_role',
        'jn_name',
        'jn_is_volunteer',
        'jn_volunteer_ward',
        'jn_emp_role',
        'jn_emp_dept',
        'jn_emp_dept_id',
        'jn_emp_jurisdiction',
        'jn_emp_district',
        'jn_emp_constituency',
        'jn_phone'
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));
      
      // Redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
