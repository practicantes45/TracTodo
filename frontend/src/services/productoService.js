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