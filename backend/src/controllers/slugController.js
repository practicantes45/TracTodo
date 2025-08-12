const { db } = require("../config/firebase");

/**
 * Obtener mapeo de slugs para resolución de URLs
 * GET /api/seo/slugs
 */
exports.obtenerMapeoSlugs = async (req, res) => {
  try {
    const snapshot = await db.ref("/seo/slugs").once("value");
    const mapeoData = snapshot.val();
    
    if (!mapeoData) {
      return res.status(404).json({
        error: "Mapeo de slugs no encontrado",
        mensaje: "Ejecuta la generación del sitemap primero"
      });
    }
    
    res.json({
      mapeo: mapeoData.mapeo,
      fechaActualizacion: mapeoData.fechaActualizacion,
      totalProductos: Object.keys(mapeoData.mapeo.productos || {}).length,
      totalPosts: Object.keys(mapeoData.mapeo.blog || {}).length
    });
    
  } catch (error) {
    console.error("Error obteniendo mapeo de slugs:", error.message);
    res.status(500).json({
      error: "Error al obtener mapeo de slugs",
      detalles: error.message
    });
  }
};

/**
 * Resolver slug a ID (para el frontend)
 * GET /api/seo/resolver/:tipo/:slug
 */
exports.resolverSlug = async (req, res) => {
  const { tipo, slug } = req.params;
  
  if (!['productos', 'blog'].includes(tipo)) {
    return res.status(400).json({
      error: "Tipo inválido",
      tiposPermitidos: ['productos', 'blog']
    });
  }
  
  try {
    const snapshot = await db.ref(`/seo/slugs/mapeo/${tipo}/${slug}`).once("value");
    const id = snapshot.val();
    
    if (!id) {
      return res.status(404).json({
        error: "Slug no encontrado",
        slug: slug,
        tipo: tipo
      });
    }
    
    res.json({
      slug: slug,
      id: id,
      tipo: tipo,
      url: `https://tractodo.com/${tipo}/${slug}`
    });
    
  } catch (error) {
    console.error("Error resolviendo slug:", error.message);
    res.status(500).json({
      error: "Error al resolver slug",
      detalles: error.message
    });
  }
};

/**
 * Regenerar todos los slugs
 * POST /api/seo/regenerar-slugs
 */
exports.regenerarSlugs = async (req, res) => {
  try {
    console.log("Regenerando mapeo de slugs...");
    
    // Obtener productos
    const productosSnapshot = await db.ref("/").once("value");
    const productos = productosSnapshot.val() || {};
    
    // Obtener posts
    const blogSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const posts = blogSnapshot.val() || {};
    
    const { generarSlug } = require("../services/seoService");
    
    // Generar slugs únicos para productos
    const productosMapeo = {};
    const slugsUsados = new Set();
    
    Object.entries(productos)
      .filter(([id, producto]) => producto.nombre && producto.nombre.trim())
      .forEach(([id, producto]) => {
        let slug = generarSlug(producto.nombre);
        let slugFinal = slug;
        let contador = 1;
        
        while (slugsUsados.has(slugFinal)) {
          slugFinal = `${slug}-${contador}`;
          contador++;
        }
        
        slugsUsados.add(slugFinal);
        productosMapeo[slugFinal] = id;
      });
    
    // Generar slugs únicos para blog
    const blogMapeo = {};
    const slugsBlogUsados = new Set();
    
    Object.entries(posts)
      .filter(([id, post]) => post.titulo && post.titulo.trim())
      .forEach(([id, post]) => {
        let slug = generarSlug(post.titulo);
        let slugFinal = slug;
        let contador = 1;
        
        while (slugsBlogUsados.has(slugFinal)) {
          slugFinal = `${slug}-${contador}`;
          contador++;
        }
        
        slugsBlogUsados.add(slugFinal);
        blogMapeo[slugFinal] = id;
      });
    
    // Guardar mapeo actualizado
    const nuevoMapeo = {
      mapeo: {
        productos: productosMapeo,
        blog: blogMapeo
      },
      fechaActualizacion: new Date().toISOString()
    };
    
    await db.ref("/seo/slugs").set(nuevoMapeo);
    
    res.json({
      mensaje: "Slugs regenerados correctamente",
      estadisticas: {
        productos: Object.keys(productosMapeo).length,
        blog: Object.keys(blogMapeo).length
      },
      fechaActualizacion: nuevoMapeo.fechaActualizacion
    });
    
  } catch (error) {
    console.error("Error regenerando slugs:", error.message);
    res.status(500).json({
      error: "Error al regenerar slugs",
      detalles: error.message
    });
  }
};

module.exports = {
  obtenerMapeoSlugs,
  resolverSlug,
  regenerarSlugs
};