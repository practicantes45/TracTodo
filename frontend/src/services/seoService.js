// services/seoService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene datos SEO de un producto específico
 */
export const obtenerSEOProducto = async (id) => {
  try {
    const response = await fetch(`${API_URL}/seo/producto/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Producto sin SEO específico
      }
      throw new Error(`Error al obtener SEO del producto: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerSEOProducto:', error);
    return null; // Retorna null en caso de error para usar SEO por defecto
  }
};

/**
 * Obtiene Schema markup de un producto específico
 */
export const obtenerSchemaProducto = async (id) => {
  try {
    const response = await fetch(`${API_URL}/seo/schema/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerSchemaProducto:', error);
    return null;
  }
};

/**
 * Obtiene estadísticas SEO (solo admin)
 */
export const obtenerEstadisticasSEO = async () => {
  try {
    const response = await fetch(`${API_URL}/seo/estadisticas`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener estadísticas SEO: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerEstadisticasSEO:', error);
    throw error;
  }
};

/**
 * Genera SEO para todos los productos (solo admin)
 */
export const generarSEOProductos = async () => {
  try {
    const response = await fetch(`${API_URL}/seo/generar-productos`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al generar SEO: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en generarSEOProductos:', error);
    throw error;
  }
};

/**
 * Regenera SEO para un producto específico (solo admin)
 */
export const regenerarSEOProducto = async (id) => {
  try {
    const response = await fetch(`${API_URL}/seo/producto/${id}/regenerar`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al regenerar SEO: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en regenerarSEOProducto:', error);
    throw error;
  }
};

/**
 * Configuraciones SEO por defecto para cada página
 */
export const SEO_DEFAULTS = {
  siteName: "Tractodo",
  baseUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || "https://tractodo.com",
  defaultImage: "/images/tractodo-logo.jpg",
  twitterHandle: "@tractodo",

  pages: {
    inicio: {
      title: "Refacciones para Tractocamión en San Juan del Río | Tractodo - Calidad y Garantía",
      description: "Compra refacciones para tractocamión de las mejores marcas en Tractodo, San Juan del Río. Envíos a todo México, precios competitivos y atención personalizada.",
      keywords: ["refacciones tractocamión", "partes motor diésel", "turbos", "cabezas motor", "Querétaro", "Cummins", "Caterpillar", "Detroit"]
    },

    ubicacion: {
      title: "Ubicación — Tractodo Refacciones en San Juan del Río",
      description: "Visítanos en San Juan del Río. Tractodo ofrece refacciones para tractocamión, asesoría técnica y envíos a todo México. Consulta horarios y localización exacta.",
      keywords: ["ubicación Tractodo", "San Juan del Río", "Querétaro", "refaccionaria", "contacto", "dirección"]
    },

    sobre: {
      title: "Sobre Tractodo | Expertos en Refacciones para Tractocamión en San Juan del Río",
      description: "Conoce la historia de Tractodo, líderes en venta de refacciones para tractocamión en San Juan del Río. Experiencia, calidad y servicio que respaldan tu camino.",
      keywords: ["historia Tractodo", "experiencia", "refacciones tractocamión", "Querétaro", "especialistas motor diésel"]
    },

    entretenimiento: {
      title: "Consejos y Noticias para Transportistas | Tractodo San Juan del Río",
      description: "Disfruta artículos, videos y tips sobre mantenimiento de motores diésel, novedades del transporte y consejos prácticos para el tractocamión.",
      keywords: ["videos tractocamión", "tutoriales motor", "mantenimiento diésel", "consejos técnicos", "blog automotriz"]
    },

    productos: {
      title: "Catálogo de Refacciones para Tractocamión | Tractodo San Juan del Río",
      description: "Explora nuestro catálogo con más de 500 refacciones para tractocamión: cabezas de motor, medias reparaciones, componentes y más. Disponibles para envío inmediato.",
      keywords: ["catálogo refacciones", "turbos tractocamión", "cabezas motor", "árboles levas", "kits reparación", "Cummins", "Caterpillar"]
    },

    blog: {
      title: "Blog de Mantenimiento y Refacciones para Tractocamión | Tractodo San Juan del Río",
      description: "Lee guías, tutoriales y noticias del sector transporte. Aprende cómo optimizar el rendimiento de tu motor diésel y cuidar tu tractocamión.",
      keywords: ["blog tractocamión", "consejos mantenimiento", "tutoriales técnicos", "casos éxito", "promociones refacciones"]
    },

    videos: {
      title: "Videos Tractodo | Tutoriales y Contenido Técnico",
      description: "Videos educativos sobre tractocamiones: instalación de refacciones, mantenimiento preventivo, diagnósticos y más. Contenido técnico especializado.",
      keywords: ["videos técnicos", "tutoriales tractocamión", "instalación refacciones", "mantenimiento preventivo", "diagnósticos motor"]
    }
  }
};

/**
 * Genera meta tags para una página específica
 */
export const generarMetaTags = (pageKey, customData = {}) => {
  const defaultData = SEO_DEFAULTS.pages[pageKey] || SEO_DEFAULTS.pages.inicio;

  return {
    title: customData.title || defaultData.title,
    description: customData.description || defaultData.description,
    keywords: customData.keywords || defaultData.keywords,
    ogTitle: customData.ogTitle || customData.title || defaultData.title,
    ogDescription: customData.ogDescription || customData.description || defaultData.description,
    ogImage: customData.ogImage || SEO_DEFAULTS.defaultImage,
    ogUrl: customData.ogUrl || `${SEO_DEFAULTS.baseUrl}${customData.path || ''}`,
    twitterCard: 'summary_large_image',
    twitterSite: SEO_DEFAULTS.twitterHandle,
    canonicalUrl: customData.canonicalUrl || `${SEO_DEFAULTS.baseUrl}${customData.path || ''}`
  };
};