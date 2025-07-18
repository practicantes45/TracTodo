import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRÍTICO: Enviar cookies automáticamente
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
});

// Interceptor para debugging
api.interceptors.request.use(
  config => {
    console.log('🔄 Enviando petición:', config.method?.toUpperCase(), config.url);
    if (config.url?.includes('administradores')) {
      console.log('🍪 Cookies serán enviadas automáticamente');
    }
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
    if (response.config.url?.includes('administradores')) {
      console.log('✅ Respuesta de admin:', response.status, response.data);
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      console.log('🚫 Token inválido - sesión expirada');
      // No redirigir automáticamente, dejar que useAuth maneje esto
    }
    return Promise.reject(error);
  }
);

export default api;