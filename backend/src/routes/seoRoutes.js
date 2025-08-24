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
// RUTA GENÉRICA MEJORADA: Resolver slugs correctamente
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 DEBUGGING SLUG: "${slug}"`);
    
    // Si el slug parece ser un ID de Firebase (empieza con - y tiene caracteres específicos)
    if (slug.startsWith('-') && slug.length > 10) {
      console.log(`🆔 Detectado como ID directo: ${slug}`);
      req.params.id = slug;
      return require("../controllers/productoController").getProductoById(req, res);
    }
    
    // PASO 1: PRIORIDAD - Resolver usando mapeo exacto
    try {
      const slugSnapshot = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
      const idMapeado = slugSnapshot.val();
      
      if (idMapeado) {
        console.log(`✅ MAPEO EXACTO: "${slug}" -> ID: ${idMapeado}`);
        
        // VERIFICAR que el producto realmente existe
        const productoSnapshot = await db.ref(`/${idMapeado}`).once("value");
        if (productoSnapshot.exists()) {
          const productoData = productoSnapshot.val();
          console.log(`✅ PRODUCTO VERIFICADO: ${productoData.nombre} (${productoData.numeroParte})`);
          
          req.params.id = idMapeado;
          return require("../controllers/productoController").getProductoById(req, res);
        } else {
          console.log(`⚠️ MAPEO ROTO: ID ${idMapeado} no existe en productos`);
        }
      } else {
        console.log(`⚠️ Slug "${slug}" no encontrado en mapeo exacto`);
      }
    } catch (errorMapeo) {
      console.log(`❌ Error accediendo al mapeo: ${errorMapeo.message}`);
    }
    
    // PASO 2: Verificar integridad del mapeo y regenerar si es necesario
    console.log(`🔄 Verificando integridad del mapeo de slugs...`);
    await verificarYRegenerarSlugs();
    
    // PASO 3: INTENTAR DE NUEVO con mapeo actualizado
    try {
      const slugSnapshot2 = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
      const idMapeado2 = slugSnapshot2.val();
      
      if (idMapeado2) {
        console.log(`✅ MAPEO REGENERADO EXITOSO: "${slug}" -> ID: ${idMapeado2}`);
        req.params.id = idMapeado2;
        return require("../controllers/productoController").getProductoById(req, res);
      }
    } catch (error) {
      console.log(`❌ Error en segunda verificación: ${error.message}`);
    }
    
    // PASO 4: Si absolutamente no encuentra nada, error 404 SIN FALLBACK
    console.log(`❌ PRODUCTO NO ENCONTRADO para slug: "${slug}"`);
    return res.status(404).json({ 
      error: "Producto no encontrado",
      slug: slug,
      debug: "Slug no encontrado en mapeo y mapeo verificado",
      sugerencia: "Contacta al administrador para regenerar el sitemap",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`💥 Error general resolviendo slug "${slug}":`, error.message);
    return res.status(500).json({
      error: "Error interno del servidor",
      detalles: error.message
    });
  }
});

// FUNCIÓN AUXILIAR: Verificar y regenerar slugs automáticamente
async function verificarYRegenerarSlugs() {
  try {
    console.log("🔧 Verificando integridad de slugs...");
    
    // Obtener mapeo actual
    const mapeoSnapshot = await db.ref("/seo/slugs/mapeo/productos").once("value");
    const mapeoActual = mapeoSnapshot.val() || {};
    
    // Obtener productos actuales
    const productosSnapshot = await db.ref("/").once("value");
    const productos = productosSnapshot.val() || {};
    
    const productosValidos = Object.entries(productos)
      .filter(([id, producto]) => producto?.nombre)
      .map(([id, producto]) => ({ id, ...producto }));
    
    // Verificar si hay discrepancias
    const idsEnMapeo = Object.values(mapeoActual);
    const idsReales = productosValidos.map(p => p.id);
    
    const mapeosRotos = idsEnMapeo.filter(id => !idsReales.includes(id));
    const productosHuerfanos = idsReales.filter(id => !idsEnMapeo.includes(id));
    
    if (mapeosRotos.length > 0 || productosHuerfanos.length > 0) {
      console.log(`⚠️ MAPEO DESACTUALIZADO: ${mapeosRotos.length} mapeos rotos, ${productosHuerfanos.length} productos huérfanos`);
      
      // Regenerar mapeo
      console.log("🔄 Regenerando mapeo de slugs...");
      const nuevoMapeo = {};
      const slugsUsados = new Set();
      
      productosValidos.forEach(producto => {
        let slug = generarSlug(producto.nombre, producto.numeroParte);
        let slugFinal = slug;
        let contador = 1;
        
        while (slugsUsados.has(slugFinal)) {
          slugFinal = `${slug}-${contador}`;
          contador++;
        }
        
        slugsUsados.add(slugFinal);
        nuevoMapeo[slugFinal] = producto.id;
      });
      
      // Guardar mapeo actualizado
      await db.ref("/seo/slugs/mapeo/productos").set(nuevoMapeo);
      await db.ref("/seo/slugs/fechaActualizacion").set(new Date().toISOString());
      
      console.log(`✅ Mapeo regenerado: ${Object.keys(nuevoMapeo).length} productos mapeados`);
    } else {
      console.log("✅ Mapeo de slugs íntegro");
    }
    
  } catch (error) {
    console.error("❌ Error verificando slugs:", error.message);
  }
}

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


/**
 * Debug específico para un slug
 * GET /api/seo/debug-slug/:slug
 */
router.get("/debug-slug/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 DEBUGGING SLUG: "${slug}"`);
    
    // 1. Verificar en mapeo
    const mapeoSnapshot = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
    const idMapeado = mapeoSnapshot.val();
    
    // 2. Si existe, verificar producto
    let productoInfo = null;
    if (idMapeado) {
      const productoSnapshot = await db.ref(`/${idMapeado}`).once("value");
      if (productoSnapshot.exists()) {
        productoInfo = { id: idMapeado, ...productoSnapshot.val() };
      }
    }
    
    // 3. Buscar productos con nombres similares
    const todosSnapshot = await db.ref("/").once("value");
    const todosProductos = todosSnapshot.val() || {};
    
    const productosSimilares = Object.entries(todosProductos)
      .filter(([id, producto]) => producto?.nombre)
      .map(([id, producto]) => ({
        id,
        nombre: producto.nombre,
        numeroParte: producto.numeroParte,
        slugGenerado: generarSlug(producto.nombre, producto.numeroParte)
      }))
      .filter(p => p.slugGenerado.includes(slug.replace(/-/g, ' ').toLowerCase()) ||
                   slug.includes(p.slugGenerado.replace(/-/g, ' ').toLowerCase()))
      .slice(0, 5);
    
    res.json({
      slug,
      mapeoEncontrado: !!idMapeado,
      idMapeado,
      productoExiste: !!productoInfo,
      productoInfo: productoInfo ? {
        nombre: productoInfo.nombre,
        numeroParte: productoInfo.numeroParte
      } : null,
      productosSimilares,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: "Error en debugging",
      detalles: error.message
    });
  }
});

module.exports = router;