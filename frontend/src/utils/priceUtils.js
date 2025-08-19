// Tipo de cambio USD a MXN (puedes actualizar este valor periódicamente)
const TIPO_CAMBIO_USD_MXN = 18.50; // Aproximadamente 18.50 pesos por dólar

/**
 * Convierte un precio de USD a MXN
 * @param {number} precioUSD - Precio en dólares estadounidenses
 * @returns {number} - Precio convertido a pesos mexicanos
 */
export const convertirUSDaMXN = (precioUSD) => {
  if (!precioUSD || precioUSD <= 0) return 0;
  return precioUSD * TIPO_CAMBIO_USD_MXN;
};

/**
 * Formatea un precio en pesos mexicanos para mostrar en la interfaz
 * @param {number} precioUSD - Precio base en USD que se convertirá a MXN
 * @returns {string} - Precio formateado como "$ X,XXX MXN"
 */
export const formatearPrecio = (precioUSD) => {
  if (!precioUSD || precioUSD <= 0) {
    return "$ 0 MXN";
  }
  
  // Convertir de USD a MXN
  const precioMXN = convertirUSDaMXN(precioUSD);
  
  // Formatear con separadores de miles y sin decimales
  const numeroFormateado = Math.round(precioMXN).toLocaleString('es-MX');
  
  return `$ ${numeroFormateado} MXN`;
};

/**
 * Formatea un precio en pesos mexicanos para mensajes de WhatsApp
 * @param {number} precioUSD - Precio base en USD que se convertirá a MXN
 * @returns {string} - Precio formateado como "X,XXX pesos mexicanos"
 */
export const formatearPrecioWhatsApp = (precioUSD) => {
  if (!precioUSD || precioUSD <= 0) {
    return "precio a consultar";
  }
  
  // Convertir de USD a MXN
  const precioMXN = convertirUSDaMXN(precioUSD);
  
  // Formatear con separadores de miles y sin decimales
  const numeroFormateado = Math.round(precioMXN).toLocaleString('es-MX');
  
  return `${numeroFormateado} pesos mexicanos`;
};

/**
 * Obtiene el tipo de cambio actual (para futuras implementaciones con API)
 * @returns {number} - Tipo de cambio USD a MXN
 */
export const obtenerTipoCambio = () => {
  return TIPO_CAMBIO_USD_MXN;
};

/**
 * Actualiza el tipo de cambio (para futuras implementaciones)
 * @param {number} nuevoTipoCambio - Nuevo tipo de cambio USD a MXN
 */
export const actualizarTipoCambio = (nuevoTipoCambio) => {
  // En el futuro esto podría actualizar una variable global o localStorage
  console.log(`Tipo de cambio actualizado a: ${nuevoTipoCambio}`);
};

/**
 * Formatea solo el número sin símbolo de moneda (útil para cálculos)
 * @param {number} precioUSD - Precio base en USD
 * @returns {number} - Precio en MXN sin formato
 */
export const obtenerPrecioMXN = (precioUSD) => {
  if (!precioUSD || precioUSD <= 0) return 0;
  return Math.round(convertirUSDaMXN(precioUSD));
};