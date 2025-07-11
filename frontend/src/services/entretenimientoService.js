import api from './api';

// Obtener todo el contenido de entretenimiento
export const obtenerEntretenimiento = async () => {
  try {
    const respuesta = await api.get('/entretenimiento');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener entretenimiento:", error);
    throw error;
  }
};

// Obtener contenido por ID
export const obtenerEntretenimientoPorId = async (id) => {
  try {
    const respuesta = await api.get(`/entretenimiento/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener contenido:", error);
    throw error;
  }
};

// Crear contenido (solo admin)
export const crearEntretenimiento = async (datos) => {
  try {
    const respuesta = await api.post('/entretenimiento', datos);
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear contenido:", error);
    throw error;
  }
};

// Actualizar contenido (solo admin)
export const actualizarEntretenimiento = async (id, datos) => {
  try {
    const respuesta = await api.put(`/entretenimiento/${id}`, datos);
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar contenido:", error);
    throw error;
  }
};

// Eliminar contenido (solo admin)
export const eliminarEntretenimiento = async (id) => {
  try {
    const respuesta = await api.delete(`/entretenimiento/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar contenido:", error);
    throw error;
  }
};