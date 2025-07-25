import api from './api';

// Obtener artículos seleccionados para entretenimiento
export const obtenerArticulosSeleccionados = async () => {
  try {
    console.log('📚 Obteniendo artículos seleccionados para entretenimiento...');
    const respuesta = await api.get('/entretenimiento/articulos-seleccionados');
    console.log('✅ Artículos seleccionados obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener artículos seleccionados:", error);
    throw error;
  }
};

// Obtener artículos disponibles para seleccionar
export const obtenerArticulosDisponibles = async () => {
  try {
    console.log('📚 Obteniendo artículos disponibles...');
    const respuesta = await api.get('/entretenimiento/articulos-disponibles');
    console.log('✅ Artículos disponibles obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener artículos disponibles:", error);
    throw error;
  }
};

// Agregar artículo a entretenimiento
export const agregarArticuloAEntretenimiento = async (articuloId) => {
  try {
    console.log('📚 Agregando artículo a entretenimiento:', articuloId);
    const respuesta = await api.post('/entretenimiento/articulos-seleccionados', { articuloId });
    console.log('✅ Artículo agregado a entretenimiento:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al agregar artículo a entretenimiento:", error);
    throw error;
  }
};

// Eliminar artículo de entretenimiento
export const eliminarArticuloDeEntretenimiento = async (articuloId) => {
  try {
    console.log('📚 Eliminando artículo de entretenimiento:', articuloId);
    const respuesta = await api.delete('/entretenimiento/articulos-seleccionados', { 
      data: { articuloId } 
    });
    console.log('✅ Artículo eliminado de entretenimiento:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al eliminar artículo de entretenimiento:", error);
    throw error;
  }
};