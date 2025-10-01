// services/productoService.js
const API_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api';

const buildAuthHeaders = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const cookieHeader = typeof document !== 'undefined'
      ? document.cookie?.split('; ').find(value => value.startsWith('token='))
      : null;

    if (cookieHeader) {
      const [, rawToken = ''] = cookieHeader.split('=');
      const token = decodeURIComponent(rawToken);
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    }

    const storedSession = window.localStorage?.getItem('adminSession');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed?.token) {
          return { Authorization: `Bearer ${parsed.token}` };
        }
      } catch (error) {
        console.warn('No se pudo leer adminSession para auth:', error);
      }
    }
  } catch (error) {
    console.warn('No se pudo generar encabezados de autorización:', error);
  }

  return {};
};

const fetchWithAuth = (url, init = {}) => {
  const authHeaders = buildAuthHeaders();
  const headers = {
    ...(init.headers || {}),
    ...authHeaders,
  };

  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    credentials: 'include',
    ...init,
    headers,
  });
};

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

    const response = await fetchWithAuth(url, {
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

    const response = await fetchWithAuth(url, {
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

export const obtenerProductoPorId = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/productos/${id}`, {
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

// CORREGIDO: Agregar credentials y mejor manejo de errores
export const crearProducto = async (productoData) => {
  try {
    console.log('📤 Enviando datos para crear producto:', productoData);

    const response = await fetchWithAuth(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ← AGREGADO: Enviar cookies de autenticación
      body: JSON.stringify(productoData),
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);
      
      if (response.status === 401) {
        throw new Error('No autorizado - Debes iniciar sesión como administrador');
      } else if (response.status === 403) {
        throw new Error('Prohibido - No tienes permisos para crear productos');
      } else if (response.status === 400) {
        throw new Error('Datos inválidos - Revisa que todos los campos requeridos estén completos');
      } else {
        throw new Error(`Error al crear producto: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('✅ Producto creado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    throw error;
  }
};

// CORREGIDO: Agregar credentials
export const actualizarProducto = async (id, productoData) => {
  try {
    console.log('📤 Actualizando producto:', id, productoData);

    const response = await fetchWithAuth(`${API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ← AGREGADO: Enviar cookies de autenticación
      body: JSON.stringify(productoData),
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);

      if (response.status === 401) {
        throw new Error('No autorizado - Debes iniciar sesión como administrador');
      } else if (response.status === 403) {
        throw new Error('Prohibido - No tienes permisos para actualizar productos');
      } else if (response.status === 400) {
        throw new Error('Datos inválidos - Revisa que todos los campos estén correctos');
      } else {
        throw new Error(`Error al actualizar producto: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('✅ Producto actualizado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    throw error;
  }
};

// CORREGIDO: Agregar credentials
export const eliminarProducto = async (id) => {
  try {
    console.log('🗑️ Eliminando producto:', id);

    const response = await fetchWithAuth(`${API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ← AGREGADO: Enviar cookies de autenticación
    });

    console.log('📡 Respuesta del servidor:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Error del servidor:', errorData);

      if (response.status === 401) {
        throw new Error('No autorizado - Debes iniciar sesión como administrador');
      } else if (response.status === 403) {
        throw new Error('Prohibido - No tienes permisos para eliminar productos');
      } else if (response.status === 404) {
        throw new Error('Producto no encontrado');
      } else {
        throw new Error(`Error al eliminar producto: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('✅ Producto eliminado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    throw error;
  }
};

// ============= PRODUCTOS DEL MES - MANTENER IGUAL =============

// Obtener productos del mes
export const obtenerProductosDelMes = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/productos/mes/destacados`, {
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

// CORREGIDO: Agregar productos al mes con nuevoPrecio
export const agregarProductosDelMes = async (productos) => {
  try {
    console.log('📄 Enviando productos al backend:', productos);

    const response = await fetchWithAuth(`${API_URL}/productos/mes/agregar`, {
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

    const response = await fetchWithAuth(`${API_URL}/productos/mes/eliminar`, {
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

// CORREGIDO: Actualizar precio con nuevoPrecio
export const actualizarPrecioProductoDelMes = async (id, nuevoPrecio) => {
  try {
    console.log('💰 Actualizando precio del producto del mes:', { id, nuevoPrecio });

    const response = await fetchWithAuth(`${API_URL}/productos/mes/precio/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ nuevoPrecio: parseFloat(nuevoPrecio) }),
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

// Nueva función para obtener producto por nombre
export const obtenerProductoPorNombre = async (nombre) => {
  try {
    // Decodificar el nombre de la URL por si tiene caracteres especiales
    const nombreDecodificado = decodeURIComponent(nombre);
    
    const response = await fetchWithAuth(`${API_URL}/productos/${nombreDecodificado}`, {
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

// Agregar al final del archivo services/productoService.js

/**
 * Obtiene productos con datos SEO incluidos
 */
export const obtenerProductosConSEO = async (filtros = {}) => {
  try {
    // Agregar parámetro para incluir SEO
    const queryParams = new URLSearchParams(filtros);
    queryParams.append('incluirSEO', 'true');

    const url = `${API_URL}/productos?${queryParams.toString()}`;
    console.log('🔗 Solicitando productos con SEO:', url);

    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener productos con SEO: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerProductosConSEO:', error);
    // Fallback a productos normales si falla
    return await obtenerProductos(filtros);
  }
};

/**
 * Obtiene un producto por ID con datos SEO incluidos
 */
export const obtenerProductoPorIdConSEO = async (id) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/productos/${id}?incluirSEO=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener producto con SEO: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener producto por ID con SEO:', error);
    // Fallback a producto normal si falla
    return await obtenerProductoPorId(id);
  }
};
