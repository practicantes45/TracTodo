
import axios from "axios";

// CONFIGURACIÓN ESPECÍFICA PARA TRACTODO.COM
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://tractodo-production.up.railway.app/api";

console.log('🔗 API configurada para:', API_URL);
console.log('🌐 Frontend URL:', window?.location?.origin || 'server-side');

// Crear instancia de axios con configuración cross-domain
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRÍTICO para cookies cross-domain
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Aumentar timeout para cross-domain
});

// Interceptor para debugging cross-domain
api.interceptors.request.use(
  config => {
    const isCrossDomain = !config.url?.includes(window?.location?.origin);
    console.log('🔄 Petición:', config.method?.toUpperCase(), config.url);
    console.log('🌐 Cross-domain:', isCrossDomain);
    
    if (config.url?.includes('administradores')) {
      console.log('🍪 Enviando cookies cross-domain automáticamente');
      console.log('🔗 Desde origen:', window?.location?.origin);
      console.log('🎯 Hacia:', config.baseURL);
    }
    return config;
  },
  error => {
    console.error('❌ Error en petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas cross-domain
api.interceptors.response.use(
  response => {
    if (response.config.url?.includes('administradores')) {
      console.log('✅ Respuesta cross-domain admin:', response.status, response.data);
      console.log('🍪 Set-Cookie headers:', response.headers['set-cookie']);
    }
    return response;
  },
  error => {
    console.log('❌ Error en respuesta cross-domain:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🚫 Token inválido - sesión expirada (cross-domain)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔥 No se pudo conectar al backend cross-domain');
    } else if (error.response?.status === 0) {
      console.error('🌐 Error de CORS - verifica configuración cross-domain');
    }
    return Promise.reject(error);
  }
);

export default api;