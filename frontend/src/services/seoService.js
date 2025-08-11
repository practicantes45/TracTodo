// services/seoService.js
import api from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Obtener sitemap.xml
 */
export const obtenerSitemap = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/seo/sitemap.xml`, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml, text/xml',
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error al obtener sitemap: ${respuesta.status}`);
    }

    const xmlContent = await respuesta.text();
    return xmlContent;
  } catch (error) {
    console.error('❌ Error al obtener sitemap:', error);
    throw error;
  }
};

/**
 * Obtener robots.txt
 */
export const obtenerRobots = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/seo/robots.txt`, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!respuesta.ok) {
      throw new Error(`Error al obtener robots.txt: ${respuesta.status}`);
    }

    const textContent = await respuesta.text();
    return textContent;
  } catch (error) {
    console.error('❌ Error al obtener robots.txt:', error);
    throw error;
  }
};

/**
 * Obtener datos SEO de una página específica
 */
export const obtenerSEOPagina = async (nombrePagina) => {
  try {
    if (!nombrePagina) {
      throw new Error('Nombre de página es requerido');
    }

    console.log(`🔍 Obteniendo SEO para página: ${nombrePagina}`);
    
    const respuesta = await api.get(`/seo/pagina/${nombrePagina}`);
    
    console.log('✅ Datos SEO de página obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error(`❌ Error al obtener SEO de página ${nombrePagina}:`, error);
    
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron datos SEO para esta página');
      return null;
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al obtener datos SEO de la página');
  }
};
/**
 * Obtener datos SEO de un producto específico
 */
export const obtenerSEOProducto = async (productoId) => {
  try {
    if (!productoId) {
      throw new Error('ID del producto es requerido');
    }

    console.log(`🔍 Obteniendo SEO para producto: ${productoId}`);
    
    const respuesta = await api.get(`/seo/producto/${productoId}`);
    
    console.log('✅ Datos SEO obtenidos:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error(`❌ Error al obtener SEO del producto ${productoId}:`, error);
    
    // Manejar errores específicos
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontraron datos SEO para este producto');
      return null;
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al obtener datos SEO del producto');
  }
};

/**
 * Obtener schema.org markup de un producto específico
 */
export const obtenerSchemaProducto = async (productoId) => {
  try {
    if (!productoId) {
      throw new Error('ID del producto es requerido');
    }

    console.log(`🔍 Obteniendo Schema para producto: ${productoId}`);
    
    const respuesta = await api.get(`/seo/schema/${productoId}`);
    
    console.log('✅ Schema obtenido:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error(`❌ Error al obtener Schema del producto ${productoId}:`, error);
    
    // Manejar errores específicos
    if (error.response?.status === 404) {
      console.log('ℹ️ No se encontró Schema para este producto');
      return null;
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error al obtener Schema del producto');
  }
};

/**
 * Health check del módulo SEO (para admin)
 */
export const verificarSaludSEO = async () => {
  try {
    const respuesta = await api.get('/seo/health');
    
    console.log('✅ Estado del módulo SEO:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error('❌ Error al verificar salud SEO:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas SEO (solo admin)
 */
export const obtenerEstadisticasSEO = async () => {
  try {
    const respuesta = await api.get('/seo/estadisticas');
    
    console.log('✅ Estadísticas SEO obtenidas:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas SEO:', error);
    throw error;
  }
};

/**
 * Regenerar SEO para un producto (solo admin)
 */
export const regenerarSEOProducto = async (productoId) => {
  try {
    if (!productoId) {
      throw new Error('ID del producto es requerido');
    }

    console.log(`🔄 Regenerando SEO para producto: ${productoId}`);
    
    const respuesta = await api.put(`/seo/producto/${productoId}/regenerar`);
    
    console.log('✅ SEO regenerado:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error(`❌ Error al regenerar SEO del producto ${productoId}:`, error);
    throw error;
  }
};

/**
 * Obtener palabras clave disponibles (solo admin)
 */
export const obtenerPalabrasClave = async () => {
  try {
    const respuesta = await api.get('/seo/palabras-clave');
    
    console.log('✅ Palabras clave obtenidas:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error('❌ Error al obtener palabras clave:', error);
    throw error;
  }
};

/**
 * Utilidad para generar meta tags dinámicamente
 */
export const generarMetaTags = (datosSEO) => {
  if (!datosSEO) return [];

  const metaTags = [
    // Meta básicos
    { name: 'title', content: datosSEO.titulo },
    { name: 'description', content: datosSEO.descripcion },
    
    // Open Graph
    { property: 'og:title', content: datosSEO.titulo },
    { property: 'og:description', content: datosSEO.descripcion },
    { property: 'og:type', content: 'product' },
    { property: 'og:site_name', content: 'Tractodo' },
    
    // Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: datosSEO.titulo },
    { name: 'twitter:description', content: datosSEO.descripcion },
    
    // SEO específico
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'Tractodo' },
  ];

  // Agregar imagen si existe
  if (datosSEO.imagenPrincipal) {
    metaTags.push(
      { property: 'og:image', content: datosSEO.imagenPrincipal },
      { name: 'twitter:image', content: datosSEO.imagenPrincipal }
    );
  }

  // Agregar palabras clave si existen
  if (datosSEO.palabrasClave && datosSEO.palabrasClave.length > 0) {
    metaTags.push({
      name: 'keywords',
      content: datosSEO.palabrasClave.join(', ')
    });
  }

  return metaTags;
};

/**
 * Utilidad para insertar Schema.org en el head
 */
export const insertarSchema = (schemaData) => {
  if (!schemaData || typeof window === 'undefined') return;

  // Remover schema anterior si existe
  const existingSchema = document.querySelector('script[type="application/ld+json"][data-tractodo-schema]');
  if (existingSchema) {
    existingSchema.remove();
  }

  // Crear nuevo script de schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-tractodo-schema', 'true');
  script.textContent = JSON.stringify(schemaData, null, 2);
  
  // Insertar en el head
  document.head.appendChild(script);
};