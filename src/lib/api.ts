import axios from 'axios';

// Configuração da URL base da API baseada no ambiente
const getBaseURL = () => {
  // Em produção, use a variável de ambiente ou uma URL relativa
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '/api';
  }
  
  // Em desenvolvimento, use o proxy ou URL completa
  return import.meta.env.VITE_API_URL || '/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout para requisições
  timeout: 30000,
});

// Interceptador para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirecionar para login se não estiver na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
); 