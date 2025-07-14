import api from './api';

// Registrar vista de producto
export const registrarVista = async (productoId) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/tracking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evento: 'ver_producto',
        data: { id: productoId }
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error al registrar vista:', error);
    return false;
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