const express = require("express");
const router = express.Router();
const { adminAutorizado } = require("../middlewares/funcionesPassword");
const seoController = require('../controllers/seoController');
const {
  generarSEOProductos,
  obtenerSEOProducto,
  generarSitemap,
  generarRobots,
  obtenerEstadisticasSEO,
  regenerarSEOProducto,
  obtenerSchemaProducto
} = require("../controllers/seoController");

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
 * Obtener sitemap.xml (público)
 * GET /api/seo/sitemap.xml
 */
router.get("/sitemap.xml", generarSitemap);

/**
 * Obtener robots.txt (público)
 * GET /api/seo/robots.txt
 */
router.get("/robots.txt", generarRobots);

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
    mensaje: "Módulo SEO funcionando correctamente",
    timestamp: new Date().toISOString(),
    funciones: [
      "Generación automática de títulos y descripciones SEO",
      "Schema.org markup para productos",
      "Sitemap.xml dinámico",
      "Robots.txt optimizado",
      "Palabras clave específicas del sector",
      "Optimización para tractocamiones y refacciones"
    ]
  });
});

/**
 * Obtener palabras clave disponibles (solo admin)
 * GET /api/seo/palabras-clave
 */
router.get("/palabras-clave", verificarAdmin, (req, res) => {
  const { PALABRAS_CLAVE_SEO } = require("../services/seoService");
  
  res.json({
    mensaje: "Palabras clave SEO organizadas por categorías",
    categorias: {
      generales: {
        cantidad: PALABRAS_CLAVE_SEO.generales.length,
        ejemplos: PALABRAS_CLAVE_SEO.generales.slice(0, 5)
      },
      longTail: {
        cantidad: PALABRAS_CLAVE_SEO.longTail.length,
        ejemplos: PALABRAS_CLAVE_SEO.longTail.slice(0, 5)
      },
      componentes: {
        cantidad: PALABRAS_CLAVE_SEO.componentes.length,
        ejemplos: PALABRAS_CLAVE_SEO.componentes.slice(0, 5)
      },
      marca: {
        cantidad: PALABRAS_CLAVE_SEO.marca.length,
        ejemplos: PALABRAS_CLAVE_SEO.marca.slice(0, 5)
      },
      mediasReparaciones: {
        cantidad: PALABRAS_CLAVE_SEO.mediasReparaciones.length,
        ejemplos: PALABRAS_CLAVE_SEO.mediasReparaciones.slice(0, 5)
      }
    },
    totalPalabrasClave: Object.values(PALABRAS_CLAVE_SEO).reduce((acc, cat) => acc + cat.length, 0)
  });
});

/**
 * Test de generación SEO para un producto específico (solo admin)
 * POST /api/seo/test-producto/:id
 */
router.post("/test-producto/:id", verificarAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { db } = require("../config/firebase");
    const { 
      generarTituloSEO, 
      generarDescripcionSEO, 
      generarPalabrasClaveProducto,
      generarSchemaProducto 
    } = require("../services/seoService");
    
    // Obtener producto
    const snapshot = await db.ref(`/${id}`).once("value");
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    const producto = snapshot.val();
    
    // Generar datos SEO de prueba (sin guardar)
    const seoTest = {
      titulo: generarTituloSEO(producto),
      descripcion: generarDescripcionSEO(producto),
      palabrasClave: generarPalabrasClaveProducto(producto),
      schema: generarSchemaProducto({ id, ...producto })
    };
    
    res.json({
      mensaje: "Test de generación SEO completado",
      producto: {
        id,
        nombre: producto.nombre,
        marca: producto.marca,
        numeroParte: producto.numeroParte
      },
      seoGenerado: seoTest
    });
    
  } catch (error) {
    console.error(`Error en test SEO del producto ${id}:`, error.message);
    res.status(500).json({
      error: "Error en test de SEO",
      detalles: error.message
    });
  }
});

/**
 * Test de producto específico (solo admin)
 * GET /api/seo/test?numeroParte=4037050&texto=turbo px8
 */
router.get("/test", verificarAdmin, seoController.testProductoEspecifico);

/**
 * Estadísticas detalladas del sistema híbrido
 * GET /api/seo/estadisticas-detalladas  
 */
router.get("/estadisticas-detalladas", verificarAdmin, async (req, res) => {
  try {
    const { obtenerEstadisticasSistema } = require("../services/seoService");
    const stats = obtenerEstadisticasSistema();
    
    res.json({
      mensaje: "Sistema SEO Híbrido - Estadísticas Detalladas",
      sistema: "Específico + Dinámico",
      ...stats,
      ejemplos: {
        especificos: [
          "Turbo PX8 (4037050)",
          "Árbol Levas M11 (4059893)", 
          "Cabeza Navistar Maxxforce (M5011241R91)"
        ],
        dinamicos: [
          "Productos no documentados específicamente",
          "Nuevos productos agregados",
          "Variantes no catalogadas"
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;