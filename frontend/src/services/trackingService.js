import api from './api';

// Registrar vista de producto
export const registrarVista = async (productoId) => {
  try {
    const respuesta = await api.post('/tracking/vista', { productoId });
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar vista:", error);
    // No lanzar error para no afectar la experiencia del usuario
  }
};

// Registrar clic en producto
export const registrarClic = async (productoId) => {
  try {
    const respuesta = await api.post('/tracking/clic', { productoId });
    return respuesta.data;
  } catch (error) {
    console.error("Error al registrar clic:", error);
  }
};

// Obtener estadísticas (solo admin)
export const obtenerEstadisticas = async () => {
  try {
    const respuesta = await api.get('/tracking/estadisticas');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    throw error;
  }
};

// Obtener productos más vistos
export const obtenerProductosMasVistos = async (limite = 10) => {
  try {
    const respuesta = await api.get(`/tracking/mas-vistos?limite=${limite}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener productos más vistos:", error);
    throw error;
  }
};