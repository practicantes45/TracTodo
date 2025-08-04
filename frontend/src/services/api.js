import axios from "axios";

// ✅ CAMBIO CRÍTICO: Usar variable de entorno
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para debugging
api.interceptors.request.use(
  config => {
    console.log('🔄 Enviando petición:', config.method?.toUpperCase(), config.url);
    console.log('📡 Base URL:', API_URL); // Para debug
    return config;
  },
  error => {
    console.error('❌ Error en petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      console.log('🚫 Token inválido - sesión expirada');
    }
    return Promise.reject(error);
  }
);

export default api;