import api from './api';

// Obtener videos seleccionados para entretenimiento
export const obtenerVideosSeleccionados = async () => {
  try {
    console.log('🎬 Obteniendo videos seleccionados para entretenimiento...');
    const respuesta = await api.get('/entretenimiento/videos-seleccionados');
    console.log('✅ Videos seleccionados obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener videos seleccionados:", error);
    throw error;
  }
};

// Obtener videos disponibles para seleccionar
export const obtenerVideosDisponibles = async () => {
  try {
    console.log('🎬 Obteniendo videos disponibles...');
    const respuesta = await api.get('/entretenimiento/videos-disponibles');
    console.log('✅ Videos disponibles obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener videos disponibles:", error);
    throw error;
  }
};

// Agregar video a entretenimiento
export const agregarVideoAEntretenimiento = async (videoId) => {
  try {
    console.log('🎬 Agregando video a entretenimiento:', videoId);
    const respuesta = await api.post('/entretenimiento/videos-seleccionados', { videoId });
    console.log('✅ Video agregado a entretenimiento:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al agregar video a entretenimiento:", error);
    throw error;
  }
};

// Eliminar video de entretenimiento
export const eliminarVideoDeEntretenimiento = async (videoId) => {
  try {
    console.log('🎬 Eliminando video de entretenimiento:', videoId);
    const respuesta = await api.delete('/entretenimiento/videos-seleccionados', { 
      data: { videoId } 
    });
    console.log('✅ Video eliminado de entretenimiento:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al eliminar video de entretenimiento:", error);
    throw error;
  }
};