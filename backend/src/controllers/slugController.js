const { db } = require("../config/firebase");

/**
 * Obtener mapeo de slugs para resolución de URLs
 * GET /api/seo/slugs
 */
const obtenerMapeoSlugs = async (req, res) => {
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
const resolverSlug = async (req, res) => {
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
const regenerarSlugs = async (req, res) => {
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

/**
 * Obtener slug por ID (útil para generar URLs)
 * GET /api/seo/slug-por-id/:tipo/:id
 */
const obtenerSlugPorId = async (req, res) => {
  const { tipo, id } = req.params;
  
  if (!['productos', 'blog'].includes(tipo)) {
    return res.status(400).json({
      error: "Tipo inválido",
      tiposPermitidos: ['productos', 'blog']
    });
  }
  
  try {
    const snapshot = await db.ref(`/seo/slugs/mapeo/${tipo}`).once("value");
    const mapeo = snapshot.val() || {};
    
    // Buscar el slug que corresponde al ID
    const slug = Object.keys(mapeo).find(key => mapeo[key] === id);
    
    if (!slug) {
      return res.status(404).json({
        error: "ID no encontrado en el mapeo",
        id: id,
        tipo: tipo
      });
    }
    
    res.json({
      id: id,
      slug: slug,
      tipo: tipo,
      url: `https://tractodo.com/${tipo}/${slug}`
    });
    
  } catch (error) {
    console.error("Error obteniendo slug por ID:", error.message);
    res.status(500).json({
      error: "Error al obtener slug",
      detalles: error.message
    });
  }
};

/**
 * Verificar integridad del mapeo de slugs
 * GET /api/seo/verificar-slugs
 */
const verificarIntegridadSlugs = async (req, res) => {
  try {
    console.log("Verificando integridad del mapeo de slugs...");
    
    // Obtener mapeo actual
    const mapeoSnapshot = await db.ref("/seo/slugs/mapeo").once("value");
    const mapeo = mapeoSnapshot.val() || { productos: {}, blog: {} };
    
    // Obtener datos reales
    const productosSnapshot = await db.ref("/").once("value");
    const productos = productosSnapshot.val() || {};
    
    const blogSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const posts = blogSnapshot.val() || {};
    
    // Verificar productos
    const productosReales = Object.keys(productos).filter(id => productos[id]?.nombre);
    const productosEnMapeo = Object.values(mapeo.productos || {});
    
    const productosHuerfanos = productosReales.filter(id => !productosEnMapeo.includes(id));
    const slugsHuerfanos = Object.keys(mapeo.productos || {}).filter(slug => !productosReales.includes(mapeo.productos[slug]));
    
    // Verificar blog
    const postsReales = Object.keys(posts).filter(id => posts[id]?.titulo);
    const postsEnMapeo = Object.values(mapeo.blog || {});
    
    const postsHuerfanos = postsReales.filter(id => !postsEnMapeo.includes(id));
    const slugsBlogHuerfanos = Object.keys(mapeo.blog || {}).filter(slug => !postsReales.includes(mapeo.blog[slug]));
    
    const resultado = {
      estado: "verificado",
      productos: {
        total: productosReales.length,
        enMapeo: productosEnMapeo.length,
        huerfanos: productosHuerfanos.length,
        slugsRotos: slugsHuerfanos.length
      },
      blog: {
        total: postsReales.length,
        enMapeo: postsEnMapeo.length,
        huerfanos: postsHuerfanos.length,
        slugsRotos: slugsBlogHuerfanos.length
      },
      problemas: {
        productosHuerfanos,
        slugsHuerfanos,
        postsHuerfanos,
        slugsBlogHuerfanos
      },
      fechaVerificacion: new Date().toISOString()
    };
    
    // Determinar si hay problemas
    const hayProblemas = productosHuerfanos.length > 0 || slugsHuerfanos.length > 0 || 
                        postsHuerfanos.length > 0 || slugsBlogHuerfanos.length > 0;
    
    if (hayProblemas) {
      resultado.estado = "problemas_detectados";
      resultado.recomendacion = "Ejecutar POST /api/seo/regenerar-slugs para corregir problemas";
    }
    
    res.json(resultado);
    
  } catch (error) {
    console.error("Error verificando integridad:", error.message);
    res.status(500).json({
      error: "Error al verificar integridad",
      detalles: error.message
    });
  }
};

module.exports = {
  obtenerMapeoSlugs,
  resolverSlug,
  regenerarSlugs,
  obtenerSlugPorId,
  verificarIntegridadSlugs
};