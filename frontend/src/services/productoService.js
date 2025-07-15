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
// Obtener todos los productos
export const obtenerProductos = async () => {
  try {
    console.log('🔄 Obteniendo productos desde API...');
    const respuesta = await api.get('/productos');
    console.log(`✅ Productos obtenidos: ${respuesta.data.length}`);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    // En lugar de hacer throw, retornar array vacío para generateStaticParams
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
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


export const crearProducto = async (datosProducto) => {
  try {
    const respuesta = await api.post('/productos', datosProducto);
    return respuesta.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al crear producto');
  }
};

export const actualizarProducto = async (id, datosProducto) => {
  try {
    const respuesta = await api.put(`/productos/${id}`, datosProducto);
    return respuesta.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Error al actualizar producto');
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

