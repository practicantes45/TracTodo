import api from './api';

// Función mejorada para cookies usando la instancia api existente
export const registrarEventoCookie = async (accion) => {
  try {
    const respuesta = await api.post('/tracking', {
      uid: 'user-' + Date.now(), 
      evento: 'cookie_consent',
      data: { action: accion },
      timestamp: new Date().toISOString()
    });
    return respuesta.data;
  } catch (error) {
    console.error('Error al registrar evento de cookie:', error);
    return false;
  }
};

// Mantener las funciones existentes igual...
export const registrarVista = async (productoId) => {
  try {
    const respuesta = await api.post('/tracking', {
      uid: 'user-' + Date.now(),
      evento: 'ver_producto', 
      data: { id: productoId },
      timestamp: new Date().toISOString()
    });
    return respuesta.status === 200;
  } catch (error) {
    console.error('Error al registrar vista:', error);
    return false;
  }
};