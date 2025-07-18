import api from './api';

// Función para generar o recuperar UID único del usuario
const getUserUID = () => {
  let uid = localStorage.getItem('userUID');
  if (!uid) {
    uid = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userUID', uid);
  }
  return uid;
};

// Función para verificar si las cookies están aceptadas
const areCookiesAccepted = () => {
  const cookieConsent = localStorage.getItem('cookieConsent');
  return cookieConsent === 'accepted';
};

// Función mejorada para cookies usando la instancia api existente
export const registrarEventoCookie = async (accion) => {
  try {
    const uid = getUserUID(); // Usar UID consistente
    const respuesta = await api.post('/tracking', {
      uid: uid, 
      evento: 'cookie_consent',
      data: { action: accion },
      timestamp: new Date().toISOString()
    });
    
    console.log(`🍪 Evento de cookie registrado: ${accion} para usuario ${uid}`);
    return respuesta.data;
  } catch (error) {
    console.error('Error al registrar evento de cookie:', error);
    return false;
  }
};

// Función mejorada para registrar vistas de productos
export const registrarVista = async (productoId) => {
  // VERIFICAR SI LAS COOKIES ESTÁN ACEPTADAS
  if (!areCookiesAccepted()) {
    console.log('🚫 Cookies no aceptadas - no se registra la vista');
    return false;
  }

  try {
    const uid = getUserUID(); // Usar UID consistente
    const respuesta = await api.post('/tracking', {
      uid: uid,
      evento: 'ver_producto', 
      data: { id: productoId },
      timestamp: new Date().toISOString()
    });
    
    console.log(`👁️ Vista registrada: Producto ${productoId} para usuario ${uid}`);
    return respuesta.status === 200;
  } catch (error) {
    console.error('Error al registrar vista:', error);
    return false;
  }
};

// Nueva función para obtener el estado de cookies
export const getCookieConsentStatus = () => {
  return {
    accepted: areCookiesAccepted(),
    uid: areCookiesAccepted() ? getUserUID() : null,
    date: localStorage.getItem('cookieConsentDate')
  };
};