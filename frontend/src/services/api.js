import axios from "axios";

// CONFIGURACIÓN CORREGIDA PARA DESARROLLO LOCAL
const API_URL = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

const resolveAuthToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const cookieHeader = typeof document !== 'undefined'
      ? document.cookie?.split('; ').find(value => value.startsWith('token='))
      : null;

    if (cookieHeader) {
      const [, rawToken = ''] = cookieHeader.split('=');
      const token = decodeURIComponent(rawToken);
      if (token) {
        return token;
      }
    }

    const storedSession = window.localStorage?.getItem('adminSession');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed?.token) {
          return parsed.token;
        }
      } catch (error) {
        console.warn('No se pudo leer adminSession para axios auth:', error);
      }
    }
  } catch (error) {
    console.warn('No se pudo obtener token para axios:', error);
  }

  return null;
};

console.log('🔗 API configurada para:', API_URL);

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
    const token = resolveAuthToken();
    if (token && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

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
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔥 No se pudo conectar al backend. ¿Está corriendo en puerto 3000?');
    }
    return Promise.reject(error);
  }
);

export default api;
