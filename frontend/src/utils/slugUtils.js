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