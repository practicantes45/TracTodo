import api from './api';

// Buscar productos con filtros
export const buscarProductos = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const respuesta = await api.get(`/productos/buscar?${queryString}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
};

// Obtener filtros disponibles
export const obtenerFiltros = async () => {
  try {
    const respuesta = await api.get('/productos/filtros');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener filtros:", error);
    throw error;
  }
};

// Buscar por categoría
export const buscarPorCategoria = async (categoria) => {
  try {
    const respuesta = await api.get(`/productos/categoria/${categoria}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al buscar por categoría:", error);
    throw error;
  }
};

// Buscar por rango de precio
export const buscarPorPrecio = async (min, max) => {
  try {
    const respuesta = await api.get(`/productos/precio?min=${min}&max=${max}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al buscar por precio:", error);
    throw error;
  }
};