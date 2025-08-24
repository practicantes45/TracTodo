const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

const { getAllProductos, getProductoById, getProductoByNombre, borrarProductoPorId,actualizarProductoPorId,insertarProducto,getProductosDelMes,actualizarProductosDelMes,insertarProductosDelMes, eliminarProductoDelMes, actualizarPrecioProductoDelMes} = require("../controllers/productoController");

const { generarRecomendaciones } = require("../services/productoRecomendado");

// Obtener todos los productos
router.get("/", getAllProductos);

// NUEVA RUTA: Obtener un producto por NOMBRE (patrón específico)
router.get("/nombre/:nombre", getProductoByNombre);

// Obtener un producto por ID (mantenida por compatibilidad)
router.get("/id/:id", getProductoById);

// RUTA GENÉRICA MEJORADA: Resolver slugs correctamente
router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 Procesando slug: "${slug}"`);
    
    // Si el slug parece ser un ID de Firebase (empieza con - y tiene caracteres específicos)
    if (slug.startsWith('-') && slug.length > 10) {
      console.log(`🆔 Detectado como ID directo: ${slug}`);
      req.params.id = slug;
      return require("../controllers/productoController").getProductoById(req, res);
    }
    
    // PASO 1: Intentar resolver el slug usando el mapeo de slugs
    try {
      const slugSnapshot = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
      const idMapeado = slugSnapshot.val();
      
      if (idMapeado) {
        console.log(`✅ Slug "${slug}" resuelto a ID: ${idMapeado}`);
        req.params.id = idMapeado;
        return require("../controllers/productoController").getProductoById(req, res);
      } else {
        console.log(`⚠️ Slug "${slug}" no encontrado en mapeo`);
      }
    } catch (errorMapeo) {
      console.log(`❌ Error accediendo al mapeo: ${errorMapeo.message}`);
    }
    
    // PASO 2: FALLBACK - Buscar por nombre con múltiples estrategias
    console.log(`🔄 Fallback: Buscando por nombre "${slug}"`);
    
    // Convertir slug a posibles nombres
    const nombresDePrueba = [
      slug.replace(/-/g, ' '),           // "cabeza-c-66" -> "cabeza c 66"
      slug.replace(/-/g, ''),            // "cabeza-c-66" -> "cabezac66"  
      slug.replace(/([a-z])([0-9])/g, '$1 $2'), // Separar letras de números
      decodeURIComponent(slug.replace(/-/g, ' ')) // Por si hay caracteres especiales
    ];
    
    // Intentar con cada variante
    for (const nombrePrueba of nombresDePrueba) {
      try {
        console.log(`🔍 Probando con nombre: "${nombrePrueba}"`);
        req.params.nombre = nombrePrueba;
        
        // Usar una copia de req para no modificar el original
        const reqCopia = { ...req, params: { ...req.params, nombre: nombrePrueba } };
        
        // Intentar buscar por nombre
        const resultado = await new Promise((resolve, reject) => {
          const resMock = {
            json: (data) => resolve(data),
            status: (code) => ({
              json: (data) => code === 404 ? resolve(null) : reject(data)
            })
          };
          
          require("../controllers/productoController").getProductoByNombre(reqCopia, resMock);
        });
        
        if (resultado && resultado.producto) {
          console.log(`✅ Encontrado con nombre: "${nombrePrueba}" -> ${resultado.producto.nombre}`);
          return res.json(resultado);
        }
        
      } catch (errorNombre) {
        console.log(`⚠️ Error con nombre "${nombrePrueba}": ${errorNombre.message}`);
        continue;
      }
    }
    
    // PASO 3: Si no encuentra nada, error 404
    console.log(`❌ Producto no encontrado para slug: "${slug}"`);
    return res.status(404).json({ 
      error: "Producto no encontrado",
      slug: slug,
      sugerencia: "Verifica que el producto exista y que los slugs estén actualizados"
    });
    
  } catch (error) {
    console.error(`💥 Error general resolviendo slug "${slug}":`, error.message);
    return res.status(500).json({
      error: "Error interno del servidor",
      detalles: error.message
    });
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
router.put("/mes/precio/:id", actualizarPrecioProductoDelMes);

module.exports = router;