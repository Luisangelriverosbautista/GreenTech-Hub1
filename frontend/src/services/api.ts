import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://greentech-hub1-2.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Para permitir cookies en CORS
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '');
    const status = error.response?.status;

    // Escrow endpoints may return 404 while backend rollout is pending.
    // Keep the rejection behavior, but avoid noisy global logging for this known case.
    const isKnownEscrow404 = status === 404 && requestUrl.includes('/escrows');
    const isKnownAdminOverview404 = status === 404 && requestUrl.includes('/projects/admin/overview');
    const isPublicAuthFlow =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/uploads/image');

    // Si el token expiró o es inválido
    if (status === 401 && !isPublicAuthFlow) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (!isKnownEscrow404 && !isKnownAdminOverview404) {
      console.error('Response error:', error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;