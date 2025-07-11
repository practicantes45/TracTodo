import api from './api';

// Buscar productos con filtros
export const buscarProductos = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    // Usa el mismo endpoint con query params
    const respuesta = await api.get(`/productos?${queryString}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
};

// Obtener todos los productos
export const obtenerProductos = async () => {
  try {
    const respuesta = await api.get('/productos');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (id) => {
  try {
    const respuesta = await api.get(`/productos/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }
};

// Crear producto (solo admin)
export const crearProducto = async (datosProducto) => {
  try {
    const respuesta = await api.post('/productos', datosProducto);
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

// Actualizar producto (solo admin)
export const actualizarProducto = async (id, datosProducto) => {
  try {
    const respuesta = await api.put(`/productos/${id}`, datosProducto);
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

// Eliminar producto (solo admin)
export const eliminarProducto = async (id) => {
  try {
    const respuesta = await api.delete(`/productos/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};

// Obtener productos del mes
export const obtenerProductosDelMes = async () => {
  try {
    const respuesta = await api.get('/productos/mes/destacados');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener productos del mes:", error);
    throw error;
  }
};