/**
 * Configuración centralizada para SEO
 * CORREGIDO: Encoding UTF-8 y sin descripciones genéricas
 */

// Configuración del sitio
const SITIO_CONFIG = {
  nombre: "Tractodo",
  // ELIMINADO: descripcion genérica que causaba conflictos
  url: process.env.FRONTEND_URL || "https://tractodo.com",
  telefono: "+52-427-XXX-XXXX",
  email: "contacto@tractodo.com",
  direccion: "San Cayetano, Río Extoras 56 Querétaro, San Juan del Río",
  horario: "Lunes a Viernes 9:00 AM - 6:00 PM",
  redesSociales: {
    facebook: "https://facebook.com/tractodo",
    instagram: "https://instagram.com/tractodo",
    whatsapp: "https://wa.me/52427XXXXXXX"
  }
};

// Configuración SEO por defecto
const SEO_DEFAULTS = {
  tituloMaxLength: 60,
  descripcionMaxLength: 155, // REDUCIDO para optimizar
  palabrasClaveMax: 10,
  imagenPorDefecto: "/images/tractodo-logo.jpg",
  idioma: "es-MX",
  region: "MX"
};

// NUEVO: Descripciones específicas que coinciden con frontend
const DESCRIPCIONES_ESPECIFICAS = {
  inicio: "Compra refacciones para tractocamión de las mejores marcas en Tractodo, San Juan del Río. Envíos a todo México, precios competitivos.",
  productos: "Explora nuestro catálogo con más de 500 refacciones para tractocamión: cabezas de motor, medias reparaciones y más. Envío inmediato.",
  sobre: "Conoce la historia de Tractodo, líderes en venta de refacciones para tractocamión en San Juan del Río. Experiencia, calidad y servicio.",
  entretenimiento: "Disfruta artículos, videos y tips sobre mantenimiento de motores diésel, novedades del transporte y consejos prácticos.",
  ubicacion: "Visítanos en San Juan del Río. Tractodo ofrece refacciones para tractocamión, asesoría técnica y envíos a todo México.",
  blog: "Lee guías, tutoriales y noticias del sector transporte. Aprende cómo optimizar el rendimiento de tu motor diésel.",
  videos: "Videos educativos sobre tractocamiones: instalación de refacciones, mantenimiento preventivo, diagnósticos y más."
};

// Patrones de título SEO por tipo de producto (CORREGIDO encoding)
const PATRONES_TITULO = {
  cabezaMotor: "{marca} {modelo} Cabeza de Motor | {numeroParte} | Tractodo",
  turbo: "Turbo {marca} {modelo} | {numeroParte} | Tractodo Querétaro", 
  arbolLevas: "Árbol de Levas {marca} {modelo} | {numeroParte} | Tractodo",
  kitReparacion: "Kit Media Reparación {marca} {modelo} | {numeroParte} | Tractodo",
  refaccion: "Refacción {marca} {modelo} | {numeroParte} | Tractodo",
  default: "{nombre} | {numeroParte} | Tractodo Refacciones"
};

// Patrones de descripción SEO (CORREGIDO encoding)
const PATRONES_DESCRIPCION = {
  cabezaMotor: "Cabeza de motor {marca} {modelo} original y remanufacturada. Envío nacional, garantía incluida. Especialistas en motores diésel para tractocamión.",
  turbo: "Turbo {marca} {modelo} nuevo y remanufacturado. Refacciones para tractocamión con garantía. Envío a todo México. Precios competitivos en Tractodo.",
  arbolLevas: "Árbol de levas {marca} {modelo} original. Repuestos para motor diésel, envío nacional. Refaccionaria especializada en tractocamiones.",
  kitReparacion: "Kit de media reparación {marca} {modelo} completo. Componentes originales, garantía incluida. Especialistas en motores diésel pesados.",
  default: "Refacciones {marca} para tractocamión. Partes originales y compatibles, envío nacional, garantía incluida. Especialistas en motores diésel."
};

// Configuración de Schema.org (CORREGIDO encoding)
const SCHEMA_CONFIG = {
  organizacion: {
    "@type": "Organization",
    "name": "Tractodo",
    "alternateName": "Tractodo Refaccionaria",
    "description": "Refaccionaria especializada en partes para tractocamión y motores diésel",
    "url": SITIO_CONFIG.url,
    "telephone": SITIO_CONFIG.telefono,
    "email": SITIO_CONFIG.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Río Extoras 56",
      "addressLocality": "San Juan del Río", 
      "addressRegion": "Querétaro",
      "postalCode": "76806",
      "addressCountry": "MX"
    },
    "areaServed": {
      "@type": "Country",
      "name": "México"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Refacciones para Tractocamión",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Cabezas de Motor"
        },
        {
          "@type": "OfferCatalog", 
          "name": "Turbos"
        },
        {
          "@type": "OfferCatalog",
          "name": "Árboles de Levas"
        },
        {
          "@type": "OfferCatalog",
          "name": "Kits de Media Reparación"
        }
      ]
    }
  }
};

// Configuración de sitemap
const SITEMAP_CONFIG = {
  prioridadPaginas: {
    home: 1.0,
    productos: 0.9,
    productoIndividual: 0.8,
    blog: 0.7,
    postBlog: 0.6,
    categoria: 0.7,
    contacto: 0.5
  },
  frecuenciaCambio: {
    home: "daily",
    productos: "daily", 
    productoIndividual: "weekly",
    blog: "weekly",
    postBlog: "monthly",
    categoria: "weekly",
    contacto: "monthly"
  }
};

// URLs que siempre deben incluirse en el sitemap
const URLS_ESTATICAS = [
  {
    loc: "/",
    priority: 1.0,
    changefreq: "daily"
  },
  {
    loc: "/productos",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    loc: "/ubicacion",
    priority: 0.8,
    changefreq: "weekly"
  },
  {
    loc: "/sobre", 
    priority: 0.7,
    changefreq: "monthly"
  },
  {
    loc: "/entretenimiento",
    priority: 0.6,
    changefreq: "monthly"
  },
  {
    loc: "/blog",
    priority: 0.7,
    changefreq: "weekly"
  },
  {
    loc: "/videos",
    priority: 0.6,
    changefreq: "monthly"
  }
];

// Configuración de robots.txt
const ROBOTS_CONFIG = {
  permitidos: [
    "/",
    "/productos",
    "/productos/*",
    "/entretenimiento",
    "/blog",
    "/videos",
    "/ubicacion",
    "/sobre"
  ],
  bloqueados: [
    "/admin",
    "/admin/*",
    "/api",
    "/api/*",
    "/dashboard",
    "/dashboard/*",
    "/login",
    "/backup",
    "/backup/*",
    "/*.tmp",
    "/*.temp",
    "/node_modules"
  ],
  crawlDelay: 1,
  userAgents: [
    {
      name: "*",
      rules: "default"
    },
    {
      name: "Googlebot",
      rules: "permissive"
    },
    {
      name: "Bingbot", 
      rules: "permissive"
    }
  ]
};

// Mapeo de palabras clave por tipo de producto (CORREGIDO encoding)
const KEYWORDS_BY_TYPE = {
  cabezaMotor: [
    "cabeza de motor",
    "cabeza de motor para tractocamión", 
    "venta de cabezas de motor",
    "cabeza remanufacturada",
    "cabeza de motor original"
  ],
  turbo: [
    "turbo para tractocamión",
    "turbo nuevo", 
    "reemplazo de turbo",
    "venta de turbo",
    "turbo para motor diésel"
  ],
  arbolLevas: [
    "árbol de levas",
    "árbol de levas para tractocamión",
    "repuesto de árbol de levas",
    "venta de árbol de levas",
    "árbol de levas original"
  ],
  kitReparacion: [
    "kit de media reparación",
    "media reparación completa",
    "componentes de media reparación", 
    "kit de reparación motor",
    "media reparación para motor diésel"
  ],
  general: [
    "refacciones para tractocamión",
    "partes para motor",
    "repuestos para tractocamión",
    "tractopartes",
    "refaccionaria diésel"
  ]
};

// Configuración de caché para SEO
const CACHE_CONFIG = {
  seo: {
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    maxSize: 1000
  },
  sitemap: {
    ttl: 6 * 60 * 60 * 1000, // 6 horas
    regenerateInterval: 4 * 60 * 60 * 1000 // Regenerar cada 4 horas
  },
  robots: {
    ttl: 24 * 60 * 60 * 1000 // 24 horas
  }
};

// NUEVA FUNCIÓN: Obtener descripción específica por página
const obtenerDescripcionEspecifica = (pagina) => {
  return DESCRIPCIONES_ESPECIFICAS[pagina] || DESCRIPCIONES_ESPECIFICAS.inicio;
};

module.exports = {
  SITIO_CONFIG,
  SEO_DEFAULTS,
  DESCRIPCIONES_ESPECIFICAS, // NUEVO
  obtenerDescripcionEspecifica, // NUEVO
  PATRONES_TITULO,
  PATRONES_DESCRIPCION,
  SCHEMA_CONFIG,
  SITEMAP_CONFIG,
  URLS_ESTATICAS,
  ROBOTS_CONFIG,
  KEYWORDS_BY_TYPE,
  CACHE_CONFIG
};