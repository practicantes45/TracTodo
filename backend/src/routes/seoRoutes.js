const { db } = require("../config/firebase");
const express = require("express");
const router = express.Router();
const { adminAutorizado } = require("../middlewares/funcionesPassword");
const {
  generarSEOProductos,
  obtenerSEOProducto,
  generarSitemap,
  generarRobots,
  obtenerEstadisticasSEO,
  regenerarSEOProducto,
  obtenerSchemaProducto
} = require("../controllers/seoController");

// ✅ IMPORTACIÓN CORREGIDA
const {
  obtenerMapeoSlugs,
  resolverSlug,
  regenerarSlugs,
  obtenerSlugPorId,
  verificarIntegridadSlugs
} = require("../controllers/slugController");

// MIDDLEWARE PARA VERIFICAR ADMIN
const verificarAdmin = async (req, res, next) => {
  try {
    const resultado = await adminAutorizado(req);
    if (resultado.status !== 200) {
      return res.status(resultado.status).json({ mensaje: resultado.mensajeUsuario });
    }
    next();
  } catch (error) {
    console.error('Error en verificarAdmin:', error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// ================================= RUTAS PÚBLICAS =================================

/**
 * Obtener sitemap.xml (público) - CON URLs AMIGABLES
 * GET /api/seo/sitemap.xml
 */
router.get("/sitemap.xml", generarSitemap);

/**
 * Obtener robots.txt (público)
 * GET /api/seo/robots.txt
 */
router.get("/robots.txt", generarRobots);

/**
 * Obtener mapeo completo de slugs (público)
 * GET /api/seo/slugs
 */
router.get("/slugs", obtenerMapeoSlugs);

/**
 * Resolver slug a ID (público)
 * GET /api/seo/resolver/:tipo/:slug
 * Ejemplo: /api/seo/resolver/productos/turbo-cummins-px8
 */
router.get("/resolver/:tipo/:slug", resolverSlug);

/**
 * Obtener slug por ID (público)
 * GET /api/seo/slug-por-id/:tipo/:id
 * Ejemplo: /api/seo/slug-por-id/productos/-OIGeD7XHqrBcXfwBSo
 */
router.get("/slug-por-id/:tipo/:id", obtenerSlugPorId);

/**
 * Obtener datos SEO de un producto específico (público)
 * GET /api/seo/producto/:id
 */
router.get("/producto/:id", obtenerSEOProducto);

/**
 * Obtener schema.org markup de un producto específico (público)
 * GET /api/seo/schema/:id
 */
router.get("/schema/:id", obtenerSchemaProducto);

// ================================= RUTAS DE ADMINISTRACIÓN =================================

/**
 * Verificar integridad del mapeo de slugs (solo admin)
 * GET /api/seo/verificar-slugs
 */
router.get("/verificar-slugs", verificarAdmin, verificarIntegridadSlugs);

/**
 * Regenerar mapeo de slugs (solo admin)
 * POST /api/seo/regenerar-slugs
 */
router.post("/regenerar-slugs", verificarAdmin, regenerarSlugs);

/**
 * Generar SEO para todos los productos (solo admin)
 * POST /api/seo/generar-productos
 */
router.post("/generar-productos", verificarAdmin, generarSEOProductos);

/**
 * Obtener estadísticas SEO generales (solo admin)
 * GET /api/seo/estadisticas
 */
router.get("/estadisticas", verificarAdmin, obtenerEstadisticasSEO);

/**
 * Regenerar SEO para un producto específico (solo admin)
 * PUT /api/seo/producto/:id/regenerar
 */
router.put("/producto/:id/regenerar", verificarAdmin, regenerarSEOProducto);

// ================================= RUTAS DE UTILIDADES =================================

/**
 * Health check para SEO
 * GET /api/seo/health
 */
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mensaje: "Módulo SEO funcionando correctamente con URLs amigables",
    timestamp: new Date().toISOString(),
    funciones: [
      "✅ Generación automática de títulos y descripciones SEO",
      "✅ Schema.org markup para productos",
      "✅ Sitemap.xml dinámico con URLs amigables",
      "✅ Mapeo de slugs para resolución de URLs",
      "✅ Verificación de integridad de slugs",
      "✅ Robots.txt optimizado",
      "✅ Palabras clave específicas del sector",
      "✅ Optimización para tractocamiones y refacciones"
    ],
    endpoints: {
      publicos: [
        "GET /api/seo/slugs - Obtener mapeo completo",
        "GET /api/seo/resolver/:tipo/:slug - Resolver slug a ID",
        "GET /api/seo/slug-por-id/:tipo/:id - Obtener slug por ID"
      ],
      admin: [
        "GET /api/seo/verificar-slugs - Verificar integridad",
        "POST /api/seo/regenerar-slugs - Regenerar mapeo"
      ]
    }
  });
});



// ✅ AGREGAR ESTA RUTA AL ARCHIVO seoRoutes.js

/**
 * Limpiar cache y forzar regeneración del sitemap (solo admin)
 * POST /api/seo/limpiar-cache
 */
router.post("/limpiar-cache", verificarAdmin, async (req, res) => {
  try {
    console.log("🧹 Limpiando cache de SEO...");
    
    // Limpiar cache de sitemap
    await db.ref("/seo/sitemap").remove();
    console.log("✅ Cache de sitemap eliminado");
    
    // Limpiar cache de slugs
    await db.ref("/seo/slugs").remove();
    console.log("✅ Cache de slugs eliminado");
    
    // Limpiar cache de productos SEO (opcional)
    await db.ref("/seo/productos").remove();
    console.log("✅ Cache de productos SEO eliminado");
    
    res.json({
      mensaje: "Cache limpiado correctamente",
      accion: "Cache de sitemap, slugs y productos SEO eliminado",
      siguientePaso: "Accede a /api/seo/sitemap.xml para regenerar con tractodo.com",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error limpiando cache:", error.message);
    res.status(500).json({
      error: "Error al limpiar cache",
      detalles: error.message
    });
  }
});

/**
 * Verificar configuración de URLs (público)
 * GET /api/seo/verificar-urls
 */
router.get("/verificar-urls", async (req, res) => {
  try {
    // Verificar variables de entorno
    const variablesEntorno = {
      FRONTEND_URL: process.env.FRONTEND_URL,
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN
    };
    
    // Verificar cache actual
    const sitemapSnapshot = await db.ref("/seo/sitemap").once("value");
    const sitemapCache = sitemapSnapshot.val();
    
    const slugsSnapshot = await db.ref("/seo/slugs").once("value");
    const slugsCache = slugsSnapshot.val();
    
    res.json({
      configuracion: {
        urlForzada: "https://tractodo.com",
        estado: "URL fija en código - NO depende de variables de entorno"
      },
      variablesEntorno,
      cache: {
        sitemap: {
          existe: !!sitemapCache,
          baseURL: sitemapCache?.baseURL,
          fechaGeneracion: sitemapCache?.fechaGeneracion,
          totalURLs: sitemapCache?.totalURLs,
          forzadoTractodo: sitemapCache?.forzadoTractodo
        },
        slugs: {
          existe: !!slugsCache,
          baseURL: slugsCache?.baseURL,
          fechaActualizacion: slugsCache?.fechaActualizacion
        }
      },
      recomendacion: sitemapCache?.baseURL !== "https://tractodo.com" 
        ? "⚠️ Cache tiene URL incorrecta - ejecutar POST /api/seo/limpiar-cache"
        : "✅ Configuración correcta",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Error verificando URLs:", error.message);
    res.status(500).json({
      error: "Error al verificar configuración",
      detalles: error.message
    });
  }
});

/**
 * Ruta de debugging para verificar datos de Firebase
 * GET /api/seo/debug-firebase
 */
router.get("/debug-firebase", async (req, res) => {
  try {
    const { debugFirebaseData } = require("../utils/debugSitemap");
    const resultado = await debugFirebaseData();
    
    res.json({
      mensaje: "Debugging completado - revisa los logs del servidor",
      resumen: resultado,
      timestamp: new Date().toISOString(),
      siguientePaso: "Accede a /api/seo/sitemap.xml para regenerar el sitemap"
    });
    
  } catch (error) {
    console.error("❌ Error en debugging:", error.message);
    res.status(500).json({
      error: "Error en debugging",
      detalles: error.message
    });
  }
});

module.exports = router;