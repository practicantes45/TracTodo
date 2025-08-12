// utils/textUtils.js - REEMPLAZAR COMPLETAMENTE

/**
 * Extrae la descripción principal para vista previa en tarjetas de productos
 * @param {string} fullDescription - Descripción completa del producto
 * @param {number} maxLength - Máximo número de caracteres (default: 80)
 * @returns {string} Descripción truncada para vista previa
 */
export const getPreviewDescription = (fullDescription, maxLength = 80) => {
  if (!fullDescription || typeof fullDescription !== 'string') {
    return 'Descripción no disponible';
  }

  // Limpiar texto primero - remover caracteres especiales
  let cleanText = fullDescription
    .replace(/\*/g, '') // Quitar asteriscos
    .replace(/•/g, '') // Quitar bullets  
    .replace(/\n+/g, ' ') // Convertir saltos de línea en espacios
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();

  // Dividir por líneas y encontrar donde empiezan las ventajas/características
  const lines = cleanText.split(/[:\n]/).map(line => line.trim()).filter(line => line.length > 0);
  
  // Tomar solo la primera oración/línea principal
  let mainText = lines[0] || cleanText;
  
  // Si encuentra palabras como "Ventajas", "Características", etc., tomar solo lo anterior
  const stopWords = ['ventajas', 'características', 'especificaciones', 'beneficios', 'incluye'];
  for (const stopWord of stopWords) {
    const index = mainText.toLowerCase().indexOf(stopWord);
    if (index !== -1) {
      mainText = mainText.substring(0, index).trim();
      break;
    }
  }
  
  // Si aún está vacío, tomar los primeros caracteres del texto completo
  if (!mainText || mainText.length < 10) {
    mainText = cleanText;
  }
  
  // Truncar más agresivamente
  if (mainText.length <= maxLength) {
    return mainText;
  }
  
  // Encontrar el último espacio antes del límite para no cortar palabras
  const truncated = mainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  // Si el último espacio está muy al final, usarlo; si no, cortar directamente
  if (lastSpaceIndex > maxLength * 0.7) {
    return truncated.substring(0, lastSpaceIndex).trim() + '...';
  }
  
  return truncated.trim() + '...';
};

/**
 * Versión extra corta para móviles
 * @param {string} fullDescription - Descripción completa
 * @returns {string} Descripción muy corta para móvil
 */
export const getShortPreviewDescription = (fullDescription) => {
  return getPreviewDescription(fullDescription, 50);
};