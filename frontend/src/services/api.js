// frontend/src/services/api.js
import axios from 'axios';

/**
 * NEXT_PUBLIC_API_BASE puede venir:
 *  - sin /api  → ej: http://localhost:8080
 *  - con /api  → ej: http://localhost:8080/api
 * Normalizamos para no duplicar /api ni dejarlo fuera.
 */
function resolveBaseURL() {
  const base = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080').trim();

  // Quita trailing slash
  const noTrail = base.replace(/\/+$/, '');

  // Si ya trae /api al final, lo dejamos; si no, lo agregamos
  if (/\/api$/i.test(noTrail)) {
    return noTrail; // p.ej. http://localhost:8080/api
  }
  return `${noTrail}/api`; // p.ej. http://localhost:8080/api
}

export const API_URL = resolveBaseURL();

/**
 * Intenta resolver un token desde:
 *  - cookie "token"
 *  - localStorage "adminSession".token
 */
const resolveAuthToken = () => {
  if (typeof window === 'undefined') return null;

  try {
    // 1) Cookie "token"
    if (typeof document !== 'undefined' && document.cookie) {
      const cookie = document.cookie
        .split('; ')
        .find((value) => value.startsWith('token='));
      if (cookie) {
        const [, rawToken = ''] = cookie.split('=');
        const token = decodeURIComponent(rawToken || '');
        if (token) return token;
      }
    }

    // 2) localStorage "adminSession"
    const raw = window.localStorage?.getItem('adminSession');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
      } catch (e) {
        console.warn('No se pudo parsear adminSession:', e);
      }
    }
  } catch (e) {
    console.warn('No se pudo obtener token para axios:', e);
  }

  return null;
};

console.log('🔗 API configurada para:', API_URL);

// ===============================
// Instancia Axios
// ===============================
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRÍTICO: envía cookies (sesión/admin)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s
});

// ===============================
// Interceptor de petición
// ===============================
api.interceptors.request.use(
  (config) => {
    // Token Bearer si existe
    const token = resolveAuthToken();
    if (token) {
      config.headers = config.headers || {};
      // No sobrescribir si ya venía set (ej. peticiones especiales)
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Logging útil
    const method = (config.method || 'GET').toUpperCase();
    const url = `${config.baseURL?.replace(/\/+$/, '')}/${String(config.url || '').replace(/^\/+/, '')}`;
    console.log(`🔄 ${method} ${url}`);

    return config;
  },
  (error) => {
    console.error('❌ Error preparando petición:', error);
    return Promise.reject(error);
  }
);

// ===============================
// Interceptor de respuesta
// ===============================
api.interceptors.response.use(
  (response) => {
    // Log específico de endpoints de admin si quieres
    if (String(response.config.url || '').includes('administradores')) {
      console.log('✅ Respuesta admin:', response.status, response.data);
    }
    return response;
  },
  (error) => {
    // Conexión rechazada o caído
    if (error.code === 'ECONNABORTED') {
      console.error('⏳ Timeout al conectar con el backend.');
    }
    if (error.code === 'ERR_NETWORK') {
      console.error(`🔥 No se pudo conectar al backend: ${API_URL}`);
    }
    if (error?.response?.status === 401) {
      console.warn('🚫 401 Unauthorized: sesión expirada o token inválido.');
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Helper opcional, por si quieres construir URLs fuera de axios.
 */
export function apiUrl(path = '/') {
  const cleanBase = API_URL.replace(/\/+$/, '');
  const cleanPath = String(path).replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

