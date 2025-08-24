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

// RUTA PARA TESTING DE RECOMENDACIONES
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
router.get("/nombre/:nombre", getProductoByNombre);
router.get("/id/:id", getProductoById);

// CRUD de productos
router.post("/", insertarProducto);
router.put("/:id", actualizarProductoPorId);
router.delete("/:id", borrarProductoPorId);

// ============================================================ RUTA GENÉRICA AL FINAL ====================================================================
// IMPORTANTE: Esta ruta DEBE estar al final para no interceptar otras rutas

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  
  try {
    console.log(`🔍 PRODUCTOS - Procesando slug: "${slug}"`);
    
    // FILTRO: Solo procesar slugs que NO sean rutas específicas conocidas
    const rutasEspecificas = ['mes', 'generar-recomendaciones', 'nombre', 'id'];
    if (rutasEspecificas.includes(slug)) {
      console.log(`❌ "${slug}" es una ruta específica, no un slug de producto`);
      return res.status(404).json({ 
        error: "Ruta no encontrada",
        mensaje: `"${slug}" no es un slug válido de producto`
      });
    }
    
    // Si el slug parece ser un ID de Firebase
    if (slug.startsWith('-') && slug.length > 10) {
      console.log(`🆔 ID directo detectado: ${slug}`);
      req.params.id = slug;
      return require("../controllers/productoController").getProductoById(req, res);
    }
    
    // PASO 1: Intentar resolver por mapeo exacto
    try {
      console.log(`🔍 Buscando en mapeo: /seo/slugs/mapeo/productos/${slug}`);
      const slugSnapshot = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
      const idMapeado = slugSnapshot.val();
      
      if (idMapeado) {
        console.log(`✅ MAPEO ENCONTRADO: "${slug}" -> ${idMapeado}`);
        
        // Verificar que el producto existe
        const productoSnapshot = await db.ref(`/${idMapeado}`).once("value");
        if (productoSnapshot.exists()) {
          const productoData = productoSnapshot.val();
          console.log(`✅ PRODUCTO CONFIRMADO: ${productoData.nombre}`);
          
          req.params.id = idMapeado;
          return require("../controllers/productoController").getProductoById(req, res);
        } else {
          console.log(`⚠️ MAPEO ROTO: Producto ${idMapeado} no existe`);
        }
      } else {
        console.log(`⚠️ Slug "${slug}" no encontrado en mapeo exacto`);
      }
    } catch (errorMapeo) {
      console.log(`❌ Error accediendo al mapeo: ${errorMapeo.message}`);
    }
    
    // PASO 2: Regenerar mapeo automáticamente
    console.log(`🔄 Regenerando mapeo para encontrar: "${slug}"`);
    await regenerarMapeoAutomatico();
    
    // PASO 3: Intentar nuevamente con mapeo actualizado
    try {
      const slugSnapshot2 = await db.ref(`/seo/slugs/mapeo/productos/${slug}`).once("value");
      const idMapeado2 = slugSnapshot2.val();
      
      if (idMapeado2) {
        console.log(`✅ ENCONTRADO después de regenerar: "${slug}" -> ${idMapeado2}`);
        req.params.id = idMapeado2;
        return require("../controllers/productoController").getProductoById(req, res);
      }
    } catch (error) {
      console.log(`❌ Error en segunda búsqueda: ${error.message}`);
    }
    
    // PASO 4: FALLBACK inteligente - Buscar por nombre
    console.log(`🔄 FALLBACK: Buscando por nombre similar a "${slug}"`);
    
    const nombresCandidatos = [
      slug.replace(/-/g, ' '),                    // "cabeza-isx" -> "cabeza isx"
      decodeURIComponent(slug.replace(/-/g, ' ')) // Por si hay caracteres especiales
    ];
    
    for (const nombreCandidato of nombresCandidatos) {
      try {
        console.log(`🔍 Probando búsqueda por nombre: "${nombreCandidato}"`);
        
        const reqTemp = { 
          ...req, 
          params: { ...req.params, nombre: nombreCandidato }
        };
        
        let resultado = null;
        const resTemp = {
          json: (data) => { resultado = data; },
          status: (code) => ({
            json: (data) => { 
              if (code !== 404) resultado = data; 
              return resTemp;
            }
          })
        };
        
        await require("../controllers/productoController").getProductoByNombre(reqTemp, resTemp);
        
        if (resultado && resultado.producto) {
          console.log(`✅ ENCONTRADO por nombre: "${nombreCandidato}" -> ${resultado.producto.nombre}`);
          return res.json(resultado);
        }
        
      } catch (error) {
        console.log(`⚠️ Error buscando por nombre "${nombreCandidato}": ${error.message}`);
      }
    }
    
    // PASO 5: No encontrado
    console.log(`❌ PRODUCTO NO ENCONTRADO: "${slug}"`);
    return res.status(404).json({ 
      error: "Producto no encontrado",
      slug: slug,
      intentosBusqueda: nombresCandidatos,
      sugerencia: "Verifica que el producto exista o intenta desde la página principal",
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

// Función auxiliar para regenerar mapeo automáticamente
async function regenerarMapeoAutomatico() {
  try {
    console.log("🔄 Regenerando mapeo automáticamente...");
    
    const productosSnapshot = await db.ref("/").once("value");
    const productos = productosSnapshot.val() || {};
    
    const productosValidos = Object.entries(productos)
      .filter(([id, producto]) => producto?.nombre)
      .map(([id, producto]) => ({ id, ...producto }));
    
    const { generarSlug } = require("../services/seoService");
    const nuevoMapeo = {};
    const slugsUsados = new Set();
    
    productosValidos.forEach(producto => {
      let slug = generarSlug(producto.nombre);
      let slugFinal = slug;
      let contador = 1;
      
      while (slugsUsados.has(slugFinal)) {
        slugFinal = `${slug}-${contador}`;
        contador++;
      }
      
      slugsUsados.add(slugFinal);
      nuevoMapeo[slugFinal] = producto.id;
    });
    
    await db.ref("/seo/slugs/mapeo/productos").set(nuevoMapeo);
    await db.ref("/seo/slugs/fechaActualizacion").set(new Date().toISOString());
    
    console.log(`✅ Mapeo regenerado: ${Object.keys(nuevoMapeo).length} productos`);
    
  } catch (error) {
    console.error("❌ Error regenerando mapeo:", error.message);
  }
}

module.exports = router;