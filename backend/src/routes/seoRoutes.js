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

// ✅ NUEVAS RUTAS PARA SLUGS
const {
  obtenerMapeoSlugs,
  resolverSlug,
  regenerarSlugs
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
 * Obtener sitemap.xml (público) - ACTUALIZADO CON URLs AMIGABLES
 * GET /api/seo/sitemap.xml
 */
router.get("/sitemap.xml", generarSitemap);

/**
 * Obtener robots.txt (público)
 * GET /api/seo/robots.txt
 */
router.get("/robots.txt", generarRobots);

/**
 * Obtener mapeo de slugs (público) - NUEVO
 * GET /api/seo/slugs
 */
router.get("/slugs", obtenerMapeoSlugs);

/**
 * Resolver slug a ID (público) - NUEVO
 * GET /api/seo/resolver/:tipo/:slug
 */
router.get("/resolver/:tipo/:slug", resolverSlug);

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
 * Regenerar mapeo de slugs (solo admin) - NUEVO
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

// ================================= RESTO DE RUTAS (sin cambios) =================================

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
      "Generación automática de títulos y descripciones SEO",
      "Schema.org markup para productos",
      "Sitemap.xml dinámico con URLs amigables",
      "Mapeo de slugs para resolución de URLs",
      "Robots.txt optimizado",
      "Palabras clave específicas del sector",
      "Optimización para tractocamiones y refacciones"
    ]
  });
});

// ... resto de rutas sin cambios

module.exports = router;