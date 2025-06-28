import axios from 'axios';

// Configuração da URL base da API baseada no ambiente
const getBaseURL = () => {
  // Em produção, use a URL da API no Azure
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://as-acessibilidadewebapi-afcxema8gae9g8h2.brazilsouth-01.azurewebsites.net/api';
  }
  
  // Em desenvolvimento, use o proxy local
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