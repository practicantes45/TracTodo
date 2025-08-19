const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase"); // Agregar import de db

const { getAllProductos, getProductoById, getProductoByNombre, borrarProductoPorId,actualizarProductoPorId,insertarProducto,getProductosDelMes,actualizarProductosDelMes,insertarProductosDelMes, eliminarProductoDelMes, actualizarPrecioProductoDelMes} = require("../controllers/productoController");

const { generarRecomendaciones } = require("../services/productoRecomendado");

// Obtener todos los productos
router.get("/", getAllProductos);

// NUEVA RUTA: Obtener un producto por NOMBRE (patrón específico)
router.get("/nombre/:nombre", getProductoByNombre);

// Obtener un producto por ID (mantenida por compatibilidad)
router.get("/id/:id", getProductoById);

// RUTA GENÉRICA CORREGIDA: Usar mapeo de slugs correctamente
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    // Si el slug parece ser un ID de Firebase (empieza con - y tiene caracteres específicos)
    if (slug.startsWith('-') && slug.length > 10) {
      req.params.id = slug;
      return require("../controllers/productoController").getProductoById(req, res);
    }
    
    // NUEVO: Intentar resolver el slug usando el mapeo de slugs
    const slugSnapshot = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
    const idMapeado = slugSnapshot.val();
    
    if (idMapeado) {
      // Si encontramos el ID en el mapeo, usar getProductoById
      console.log(`✅ Slug "${slug}" resuelto a ID: ${idMapeado}`);
      req.params.id = idMapeado;
      return require("../controllers/productoController").getProductoById(req, res);
    }
    
    // FALLBACK: Si no hay mapeo, intentar convertir slug a nombre y buscar por nombre
    console.log(`⚠️ Slug "${slug}" no encontrado en mapeo, intentando buscar por nombre`);
    
    // Convertir slug de vuelta a formato de nombre (guiones a espacios)
    const nombreDesdeslug = slug.replace(/-/g, ' ');
    req.params.nombre = nombreDesdeslug;
    return require("../controllers/productoController").getProductoByNombre(req, res);
    
  } catch (error) {
    console.error(`❌ Error resolviendo slug "${slug}":`, error.message);
    // Como último recurso, asumir que es un nombre
    req.params.nombre = slug;
    return require("../controllers/productoController").getProductoByNombre(req, res);
  }
});

//Crear un nuevo producto
router.post("/", insertarProducto);

// Actualizar un producto por ID
router.put("/:id", actualizarProductoPorId);

// Eliminar un producto por ID
router.delete("/:id", borrarProductoPorId);

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

// ============================================================ PRODUCTOS DEL MES ====================================================================
router.get("/mes/destacados", getProductosDelMes);
router.put("/mes/actualizar", actualizarProductosDelMes);
router.put("/mes/agregar", insertarProductosDelMes);
router.put("/mes/eliminar", eliminarProductoDelMes);
// MODIFICADO: Cambiar el nombre del parámetro en la ruta para mayor claridad
router.put("/mes/precio/:id", actualizarPrecioProductoDelMes);

module.exports = router;