import api from './api';

// Obtener todos los videos
export const obtenerVideos = async () => {
  try {
    console.log('🎬 Obteniendo videos del backend...');
    const respuesta = await api.get('/entretenimiento/videos');
    console.log('✅ Videos obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener videos:", error);
    throw error;
  }
};

// Agregar nuevo video
export const agregarVideo = async (videoData) => {
  try {
    console.log('🎬 Agregando video:', videoData);
    const respuesta = await api.post('/entretenimiento/videos', videoData);
    console.log('✅ Video agregado:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al agregar video:", error);
    throw error;
  }
};

// Actualizar video
export const actualizarVideo = async (id, videoData) => {
  try {
    console.log('🎬 Actualizando video:', id, videoData);
    const respuesta = await api.put(`/entretenimiento/videos/${id}`, videoData);
    console.log('✅ Video actualizado:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al actualizar video:", error);
    throw error;
  }
};

// Eliminar video
export const eliminarVideo = async (id) => {
  try {
    console.log('🎬 Eliminando video:', id);
    const respuesta = await api.delete(`/entretenimiento/videos/${id}`);
    console.log('✅ Video eliminado:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al eliminar video:", error);
    throw error;
  }
};