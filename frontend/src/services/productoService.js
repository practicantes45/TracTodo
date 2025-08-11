// src/services/productoService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Obtener todos los productos
export const obtenerProductos = async (filtros = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Agregar filtros de marca
    if (filtros.marcas && filtros.marcas.length > 0) {
      queryParams.append('marca', filtros.marcas[0]);
    }

    // Agregar ordenamiento
    if (filtros.orden) {
      queryParams.append('orden', filtros.orden);
    } else {
      // Por defecto A-Z
      queryParams.append('orden', 'A-Z');
    }

    const url = `${API_URL}/productos${queryParams.toString() ? '?' + queryParams.toString() : '?orden=A-Z'}`;
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
// Obtener producto por ID
export const obtenerProductoPorId = async (id) => {
  try {
    const response = await fetch(`${API_URL}/productos/id/${id}`, {
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

// Obtener producto por nombre
export const obtenerProductoPorNombre = async (nombre) => {
  try {
    const response = await fetch(`${API_URL}/productos/nombre/${nombre}`, {
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

// Crear nuevo producto
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

// Actualizar producto
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

// Eliminar producto
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

// ============= PRODUCTOS DEL MES =============

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

// CORREGIDO: Agregar productos al mes
export const agregarProductosDelMes = async (productos) => {
  try {
    console.log('🔄 Enviando productos al backend:', productos);

    const response = await fetch(`${API_URL}/productos/mes/agregar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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
export const actualizarPrecioProductoDelMes = async (id, nuevoPrecio) => {
  try {
    console.log('💰 Actualizando precio del producto:', id, nuevoPrecio);

    const response = await fetch(`${API_URL}/productos/mes/precio/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ nuevoPrecio: nuevoPrecio }),
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
    console.error('❌ Error al actualizar precio:', error);
    throw error;
  }
};