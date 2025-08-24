const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

const { getAllProductos, getProductoById, getProductoByNombre, borrarProductoPorId,actualizarProductoPorId,insertarProducto,getProductosDelMes,actualizarProductosDelMes,insertarProductosDelMes, eliminarProductoDelMes, actualizarPrecioProductoDelMes} = require("../controllers/productoController");

const { generarRecomendaciones } = require("../services/productoRecomendado");

// ============================================================ RUTAS ESPECÍFICAS PRIMERO ====================================================================

// Obtener todos los productos
router.get("/", getAllProductos);

// ============================================================ PRODUCTOS DEL MES ====================================================================
router.get("/mes/destacados", getProductosDelMes);
router.put("/mes/actualizar", actualizarProductosDelMes);
router.put("/mes/agregar", insertarProductosDelMes);
router.put("/mes/eliminar", eliminarProductoDelMes);
router.put("/mes/precio/:id", actualizarPrecioProductoDelMes);

// NUEVA RUTA PARA TESTING DE RECOMENDACIONES
router.post("/generar-recomendaciones", async (req, res) => {
  try {
    console.log("🔧 Generación manual de recomendaciones solicitada");
    await generarRecomendaciones();
    res.json({ mensaje: "Recomendaciones generadas exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al generar recomendaciones", detalles: error.message });
  }
});

// RUTAS CON PARÁMETROS ESPECÍFICOS
router.get("/id/:id", getProductoById);
router.get("/nombre/:nombre", getProductoByNombre);

//Crear un nuevo producto
router.post("/", insertarProducto);

// Actualizar un producto por ID
router.put("/:id", actualizarProductoPorId);

// Eliminar un producto por ID
router.delete("/:id", borrarProductoPorId);

// ============================================================ RUTA GENÉRICA AL FINAL ====================================================================
// IMPORTANTE: Esta ruta DEBE estar al final para no interceptar otras rutas

// RUTA GENÉRICA MEJORADA: Resolver slugs correctamente
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 RUTA GENÉRICA PRODUCTOS - Procesando slug: "${slug}"`);
    
    // FILTRO: Solo procesar slugs que parezcan slugs de productos
    const slugsExcluidos = [
      'verificar-slugs', 'sitemap.xml', 'robots.txt', 'estadisticas', 
      'generar-productos', 'health', 'limpiar-cache', 'debug-firebase'
    ];
    
    if (slugsExcluidos.includes(slug)) {
      console.log(`❌ SLUG EXCLUIDO: "${slug}" no es un slug de producto`);
      return res.status(404).json({ 
        error: "Ruta no encontrada", 
        mensaje: `${slug} no es una ruta válida de productos`,
        sugerencia: "Verifica que la URL sea correcta"
      });
    }
    
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
    
    // Si no encuentra nada, error 404 específico para productos
    console.log(`❌ PRODUCTO NO ENCONTRADO para slug: "${slug}"`);
    return res.status(404).json({ 
      error: "Producto no encontrado",
      slug: slug,
      tipo: "producto",
      sugerencia: "Verifica que el slug del producto sea correcto o contacta al administrador",
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

module.exports = router;