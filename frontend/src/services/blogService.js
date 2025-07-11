import api from './api';

// Obtener todos los posts del blog
export const obtenerPosts = async () => {
  try {
    const respuesta = await api.get('/blog');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener posts:", error);
    throw error;
  }
};

// Obtener post por ID
export const obtenerPostPorId = async (id) => {
  try {
    const respuesta = await api.get(`/blog/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener post:", error);
    throw error;
  }
};

// Crear post (solo admin)
export const crearPost = async (datosPost) => {
  try {
    const respuesta = await api.post('/blog', datosPost);
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear post:", error);
    throw error;
  }
};

// Actualizar post (solo admin)
export const actualizarPost = async (id, datosPost) => {
  try {
    const respuesta = await api.put(`/blog/${id}`, datosPost);
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar post:", error);
    throw error;
  }
};

// Eliminar post (solo admin)
export const eliminarPost = async (id) => {
  try {
    const respuesta = await api.delete(`/blog/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar post:", error);
    throw error;
  }
};

// Buscar posts
export const buscarPosts = async (termino) => {
  try {
    const respuesta = await api.get(`/blog/buscar?q=${termino}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al buscar posts:", error);
    throw error;
  }
};