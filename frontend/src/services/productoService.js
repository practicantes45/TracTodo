// services/productoService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tractodo-production.up.railway.app/api';

export const obtenerProductos = async (filtros = {}) => {
  try {
    // Construir query params solo con valores que existen
    const queryParams = new URLSearchParams();

    if (filtros.marcas && filtros.marcas.length > 0) {
      // El backend espera un solo parámetro 'marca', así que enviamos uno por uno
      // o modificamos para enviar el primero seleccionado
      queryParams.append('marca', filtros.marcas[0]);
    }

    if (filtros.orden) {
      queryParams.append('orden', filtros.orden === 'A-Z' ? 'asc' : 'desc');
    }

    const url = `${API_URL}/productos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('🔗 Solicitando productos con filtros:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductos:', error);
    throw error;
  }
};

export const buscarProductos = async (params) => {
  try {
    const queryParams = new URLSearchParams();

    // Agregar parámetros de búsqueda
    if (params.q) {
      queryParams.append('q', params.q);
    }

    // Agregar filtros de marca y orden
    if (params.marcas && params.marcas.length > 0) {
      queryParams.append('marca', params.marcas[0]);
    }

    if (params.orden) {
      queryParams.append('orden', params.orden === 'A-Z' ? 'asc' : 'desc');
    }

    const url = `${API_URL}/productos?${queryParams.toString()}`;
    console.log('🔍 Buscando productos con filtros:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al buscar productos: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en buscarProductos:', error);
    throw error;
  }
};

// FUNCIÓN PRINCIPAL: Obtener producto por nombre (con soporte para URL amigables)
export const obtenerProductoPorNombre = async (nombre) => {
  try {
    console.log('🔍 Obteniendo producto por nombre:', nombre);
    
    // El backend ya maneja la búsqueda inteligente, solo enviamos el nombre tal como viene
    const response = await fetch(`${API_URL}/productos/${encodeURIComponent(nombre)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener producto: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener producto por nombre:', error);
    throw error;
  }
};

// MANTENER por compatibilidad con funciones admin
export const obtenerProductoPorId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener producto: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    throw error;
  }
};

// Función para generar URL amigable a partir del nombre
export const generarURLAmigable = (nombre) => {
  if (!nombre) return '';
  
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Quitar caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .replace(/^-+|-+$/g, '') // Quitar guiones al inicio y final
    .trim();
};

// Función para intentar convertir URL amigable de vuelta al nombre original
export const convertirDeURLAmigable = (urlAmigable) => {
  if (!urlAmigable) return '';
  
  return urlAmigable
    .replace(/-/g, ' ') // Guiones a espacios
    .replace(/\b\w/g, l => l.toUpperCase()) // Primera letra de cada palabra en mayúscula
    .trim();
};

export const crearProducto = async (productoData) => {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productoData),
    });

    if (!response.ok) {
      throw new Error(`Error al crear producto: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al crear producto:', error);
    throw error;
  }
};

export const actualizarProducto = async (id, productoData) => {
  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productoData),
    });

    if (!response.ok) {
      throw new Error(`Error al actualizar producto: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

export const eliminarProducto = async (id) => {
  try {
    const response = await fetch(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar producto: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    throw error;
  }
};

// Obtener productos del mes
export const obtenerProductosDelMes = async () => {
  try {
    const response = await fetch(`${API_URL}/productos/mes/destacados`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos del mes: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener productos del mes:', error);
    throw error;
  }
};

// Agregar productos al mes con precios específicos
export const agregarProductosDelMes = async (productos) => {
  try {
    console.log('🔄 Enviando productos al backend:', productos);

    const response = await fetch(`${API_URL}/productos/mes/agregar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Para enviar cookies de autenticación
      body: JSON.stringify({ productos: productos }),
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al agregar productos del mes: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Productos agregados exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al agregar productos del mes:', error);
    throw error;
  }
};

// Eliminar producto del mes
export const eliminarProductoDelMes = async (id) => {
  try {
    console.log('🗑️ Eliminando producto del mes:', id);

    const response = await fetch(`${API_URL}/productos/mes/eliminar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: id }),
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al eliminar producto del mes: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Producto eliminado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al eliminar producto del mes:', error);
    throw error;
  }
};

// Actualizar precio de producto del mes
export const actualizarPrecioProductoDelMes = async (id, precioMes) => {
  try {
    console.log('💰 Actualizando precio del producto del mes:', { id, precioMes });

    const response = await fetch(`${API_URL}/productos/mes/precio/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ precioMes: parseFloat(precioMes) }),
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);
      throw new Error(`Error al actualizar precio: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Precio actualizado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al actualizar precio del producto del mes:', error);
    throw error;
  }
};