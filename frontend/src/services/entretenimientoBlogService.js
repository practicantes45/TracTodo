import api from './api';

// Obtener artículos seleccionados para entretenimiento
export const obtenerArticulosSeleccionados = async () => {
  try {
    console.log('📚 Frontend: Obteniendo artículos seleccionados para entretenimiento...');
    const respuesta = await api.get('/entretenimiento/articulos-seleccionados');
    
    console.log('📚 Frontend: Respuesta recibida:', respuesta);
    
    if (!respuesta.data) {
      console.log('⚠️ Frontend: No hay datos en la respuesta');
      return [];
    }
    
    const articulos = Array.isArray(respuesta.data) ? respuesta.data : [];
    console.log('✅ Frontend: Artículos seleccionados obtenidos:', articulos.length);
    console.log('📚 Frontend: Datos de artículos:', articulos);
    return articulos;
  } catch (error) {
    console.error("❌ Frontend: Error al obtener artículos seleccionados:", error);
    
    // Manejar errores específicos
    if (error.response?.status === 404) {
      console.log('ℹ️ Frontend: No hay artículos seleccionados aún');
      return [];
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al obtener artículos seleccionados');
  }
};

// Obtener artículos disponibles para seleccionar
export const obtenerArticulosDisponibles = async () => {
  try {
    console.log('📚 Frontend: Obteniendo artículos disponibles...');
    const respuesta = await api.get('/entretenimiento/articulos-disponibles');
    
    console.log('📚 Frontend: Respuesta disponibles recibida:', respuesta);
    
    if (!respuesta.data) {
      console.log('⚠️ Frontend: No hay datos en la respuesta');
      return [];
    }
    
    const articulos = Array.isArray(respuesta.data) ? respuesta.data : [];
    console.log('✅ Frontend: Artículos disponibles obtenidos:', articulos.length);
    console.log('📚 Frontend: Datos disponibles:', articulos);
    return articulos;
  } catch (error) {
    console.error("❌ Frontend: Error al obtener artículos disponibles:", error);
    
    // Manejar errores específicos
    if (error.response?.status === 404) {
      console.log('ℹ️ Frontend: No hay artículos disponibles');
      return [];
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al obtener artículos disponibles');
  }
};

// Agregar artículo a entretenimiento
export const agregarArticuloAEntretenimiento = async (articuloId) => {
  if (!articuloId) {
    throw new Error('ID del artículo es requerido');
  }

  try {
    console.log('📚 Frontend: Agregando artículo a entretenimiento:', articuloId);
    
    const payload = { articuloId: articuloId };
    console.log('📚 Frontend: Payload a enviar:', payload);
    
    const respuesta = await api.post('/entretenimiento/articulos-seleccionados', payload);
    
    console.log('✅ Frontend: Respuesta de agregar:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Frontend: Error al agregar artículo a entretenimiento:", error);
    console.error("❌ Frontend: Error response:", error.response);
    console.error("❌ Frontend: Error data:", error.response?.data);
    
    // Manejar errores específicos del backend
    if (error.response?.status === 400) {
      const mensaje = error.response.data?.mensaje || 'Error de validación';
      throw new Error(mensaje);
    }
    
    if (error.response?.status === 404) {
      throw new Error('Artículo no encontrado');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor');
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al agregar artículo');
  }
};

// Eliminar artículo de entretenimiento
export const eliminarArticuloDeEntretenimiento = async (articuloId) => {
  if (!articuloId) {
    throw new Error('ID del artículo es requerido');
  }

  try {
    console.log('📚 Frontend: Eliminando artículo de entretenimiento:', articuloId);
    
    const payload = { articuloId: articuloId };
    console.log('📚 Frontend: Payload a enviar:', payload);
    
    const respuesta = await api.delete('/entretenimiento/articulos-seleccionados', { 
      data: payload 
    });
    
    console.log('✅ Frontend: Respuesta de eliminar:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Frontend: Error al eliminar artículo de entretenimiento:", error);
    console.error("❌ Frontend: Error response:", error.response);
    console.error("❌ Frontend: Error data:", error.response?.data);
    
    // Manejar errores específicos del backend
    if (error.response?.status === 400) {
      const mensaje = error.response.data?.mensaje || 'Error de validación';
      throw new Error(mensaje);
    }
    
    if (error.response?.status === 404) {
      throw new Error('Artículo no encontrado en entretenimiento');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Error interno del servidor');
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al eliminar artículo');
  }
};