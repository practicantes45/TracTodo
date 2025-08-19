// utils/priceUtils.js

/**
 * Formatea un precio en pesos mexicanos con coma como separador de miles
 * @param {number|string} precio - El precio a formatear
 * @param {boolean} incluirSimbolo - Si incluir el símbolo $ (default: true)
 * @param {boolean} mostrarCentavos - Si mostrar centavos (default: false)
 * @returns {string} Precio formateado
 */
export const formatearPrecio = (precio, incluirSimbolo = true, mostrarCentavos = false) => {
  // Convertir a número si es string
  const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : precio;
  
  // Validar que sea un número válido
  if (isNaN(precioNumerico) || precioNumerico < 0) {
    return incluirSimbolo ? '$0' : '0';
  }

  // Configurar opciones de formateo para pesos mexicanos
  const opciones = {
    style: 'decimal',
    minimumFractionDigits: mostrarCentavos ? 2 : 0,
    maximumFractionDigits: mostrarCentavos ? 2 : 0,
    useGrouping: true
  };

  // Formatear con locale mexicano (coma como separador de miles)
  const numeroFormateado = precioNumerico.toLocaleString('es-MX', opciones);
  
  return incluirSimbolo ? `$${numeroFormateado}` : numeroFormateado;
};

/**
 * Formatea precio específicamente para mensajes de WhatsApp
 * @param {number|string} precio - El precio a formatear
 * @returns {string} Precio formateado para WhatsApp
 */
export const formatearPrecioWhatsApp = (precio) => {
  return formatearPrecio(precio, false, false);
};

/**
 * Formatea precio específicamente para SEO y metadata
 * @param {number|string} precio - El precio a formatear
 * @param {string} moneda - Código de moneda (default: 'MXN')
 * @returns {string} Precio formateado para SEO
 */
export const formatearPrecioSEO = (precio, moneda = 'MXN') => {
  const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : precio;
  
  if (isNaN(precioNumerico) || precioNumerico < 0) {
    return '0.00 MXN';
  }

  // Formatear con 2 decimales para SEO
  const numeroFormateado = precioNumerico.toLocaleString('es-MX', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
  
  return `${numeroFormateado} ${moneda}`;
};

/**
 * Obtiene el precio como número limpio para cálculos
 * @param {number|string} precio - El precio a limpiar
 * @returns {number} Precio como número
 */
export const obtenerPrecioNumerico = (precio) => {
  const precioNumerico = typeof precio === 'string' ? parseFloat(precio) : precio;
  return isNaN(precioNumerico) ? 0 : precioNumerico;
};