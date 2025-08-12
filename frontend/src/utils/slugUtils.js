// Función para generar slug URL-friendly desde el nombre del producto
export const generateSlug = (nombre) => {
  if (!nombre) return '';
  
  return nombre
    .toLowerCase()
    .normalize('NFD') // Remover acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Multiple guiones a uno solo
    .replace(/^-|-$/g, ''); // Remover guiones al inicio/final
};

// Función para generar slug único (en caso de duplicados)
export const generateUniqueSlug = (nombre, existingSlugs = []) => {
  let baseSlug = generateSlug(nombre);
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

// Función para obtener el slug de un producto
export const getProductSlug = (producto) => {
  // Si el producto ya tiene un slug guardado, usarlo
  if (producto.slug) {
    return producto.slug;
  }
  
  // Si no, generar uno desde el nombre
  return generateSlug(producto.nombre);
};

// FUNCIÓN FALTANTE: Extraer ID desde un slug
export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  
  // Si el slug contiene un ID al final (formato: nombre-producto-ID)
  // Buscar patrones como: -abc123, -12345, --abc123
  const idMatch = slug.match(/-([a-zA-Z0-9_-]+)$/);
  
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }
  
  // Si no encuentra patrón, intentar usar el slug completo como ID
  // o extraer la última parte después del último guión
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Si la última parte parece un ID (contiene letras y números, o solo números)
  if (lastPart && (lastPart.length >= 3)) {
    return lastPart;
  }
  
  // Como último recurso, usar el slug completo
  return slug;
};

// Función para crear slug con ID embebido
export const createSlugWithId = (nombre, id) => {
  const baseSlug = generateSlug(nombre);
  return `${baseSlug}-${id}`;
};