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

// ================================= RUTAS ESPECÍFICAS (NO GENÉRICAS) =================================

/**
 * Health check para SEO
 */
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    mensaje: "Módulo SEO funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

/**
 * Test básico
 */
router.get("/test", (req, res) => {
  res.json({
    mensaje: "Ruta SEO funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

/**
 * Obtener sitemap.xml (público)
 */
router.get("/sitemap.xml", generarSitemap);

/**
 * Obtener robots.txt (público)
 */
router.get("/robots.txt", generarRobots);

/**
 * Obtener mapeo completo de slugs (público)
 */
router.get("/slugs", obtenerMapeoSlugs);

/**
 * Verificar integridad del mapeo de slugs (público para testing)
 */
router.get("/verificar-slugs", verificarIntegridadSlugs);

/**
 * Debug específico para un slug de producto
 */
router.get("/debug-slug/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 DEBUGGING SLUG SEO: "${slug}"`);
    
    const mapeoSnapshot = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
    const idMapeado = mapeoSnapshot.val();
    
    let productoInfo = null;
    if (idMapeado) {
      const productoSnapshot = await db.ref(`/${idMapeado}`).once("value");
      if (productoSnapshot.exists()) {
        productoInfo = { id: idMapeado, ...productoSnapshot.val() };
      }
    }
    
    const { generarSlug } = require("../services/seoService");
    
    res.json({
      slug,
      mapeoEncontrado: !!idMapeado,
      idMapeado,
      productoExiste: !!productoInfo,
      productoInfo: productoInfo ? {
        id: productoInfo.id,
        nombre: productoInfo.nombre,
        numeroParte: productoInfo.numeroParte,
        slugEsperado: generarSlug(productoInfo.nombre)
      } : null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: "Error en debugging",
      detalles: error.message
    });
  }
});

/**
 * Verificar configuración de URLs
 */
router.get("/verificar-urls", async (req, res) => {
  try {
    const sitemapSnapshot = await db.ref("/seo/sitemap").once("value");
    const sitemapCache = sitemapSnapshot.val();
    
    res.json({
      configuracion: {
        urlForzada: "https://tractodo.com",
        estado: "URL fija en código"
      },
      cache: {
        sitemap: {
          existe: !!sitemapCache,
          baseURL: sitemapCache?.baseURL,
          fechaGeneracion: sitemapCache?.fechaGeneracion
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: "Error al verificar configuración",
      detalles: error.message
    });
  }
});

// ================================= RUTAS CON PARÁMETROS ESPECÍFICOS =================================

/**
 * Resolver slug a ID
 */
router.get("/resolver/:tipo/:slug", resolverSlug);

/**
 * Obtener slug por ID
 */
router.get("/slug-por-id/:tipo/:id", obtenerSlugPorId);

/**
 * Obtener datos SEO de un producto específico
 */
router.get("/producto/:id", obtenerSEOProducto);

/**
 * Obtener schema.org markup de un producto específico
 */
router.get("/schema/:id", obtenerSchemaProducto);

// ================================= RUTAS DE ADMINISTRACIÓN =================================

/**
 * Regenerar mapeo de slugs (solo admin)
 */
router.post("/regenerar-slugs", verificarAdmin, regenerarSlugs);

/**
 * Generar SEO para todos los productos (solo admin)
 */
router.post("/generar-productos", verificarAdmin, generarSEOProductos);

/**
 * Obtener estadísticas SEO generales (solo admin)
 */
router.get("/estadisticas", verificarAdmin, obtenerEstadisticasSEO);

/**
 * Regenerar SEO para un producto específico (solo admin)
 */
router.put("/producto/:id/regenerar", verificarAdmin, regenerarSEOProducto);

/**
 * Limpiar cache y forzar regeneración del sitemap (solo admin)
 */
router.post("/limpiar-cache", verificarAdmin, async (req, res) => {
  try {
    console.log("🧹 Limpiando cache de SEO...");
    
    await db.ref("/seo/sitemap").remove();
    await db.ref("/seo/slugs").remove();
    await db.ref("/seo/productos").remove();
    
    res.json({
      mensaje: "Cache limpiado correctamente",
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

module.exports = router;