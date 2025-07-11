import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Configurar axios para incluir cookies en las peticiones
axios.defaults.withCredentials = true;

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirigir al login si no está autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;