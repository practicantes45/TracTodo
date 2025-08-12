// utils/textUtils.js

/**
 * Extrae la descripción principal para vista previa en tarjetas de productos
 * @param {string} fullDescription - Descripción completa del producto
 * @param {number} maxLength - Máximo número de caracteres (default: 150)
 * @returns {string} Descripción truncada para vista previa
 */
export const getPreviewDescription = (fullDescription, maxLength = 150) => {
  if (!fullDescription || typeof fullDescription !== 'string') {
    return 'Descripción no disponible';
  }

  // Dividir por líneas y encontrar donde empiezan las ventajas/características
  const lines = fullDescription.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Buscar el primer párrafo principal (antes de encabezados como "Ventajas:", "Características:", etc.)
  const mainParagraphLines = [];
  
  for (const line of lines) {
    // Si encontramos un encabezado (termina en :) o una lista (empieza con *), paramos
    if (line.endsWith(':') || line.startsWith('* ') || line.startsWith('•')) {
      break;
    }
    mainParagraphLines.push(line);
  }
  
  // Unir las líneas del párrafo principal
  const mainParagraph = mainParagraphLines.join(' ').trim();
  
  // Si no hay párrafo principal válido, tomar los primeros caracteres de toda la descripción
  const textToTruncate = mainParagraph || fullDescription.replace(/[*•]/g, '').replace(/\n/g, ' ');
  
  // Truncar y agregar puntos suspensivos si es necesario
  if (textToTruncate.length <= maxLength) {
    return textToTruncate;
  }
  
  // Encontrar el último espacio antes del límite para no cortar palabras
  const truncated = textToTruncate.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) { // Si el último espacio está cerca del final
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

/**
 * Limpia texto de caracteres especiales para mostrar en tarjetas
 * @param {string} text - Texto a limpiar
 * @returns {string} Texto limpio
 */
export const cleanTextForPreview = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/\*/g, '') // Quitar asteriscos
    .replace(/•/g, '') // Quitar bullets
    .replace(/\n+/g, ' ') // Convertir saltos de línea en espacios
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
};