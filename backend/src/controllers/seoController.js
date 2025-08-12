const { db } = require("../config/firebase");
const { 
  procesarProductosParaSEO, 
  obtenerDatosSEOProducto,
  generarSchemaProducto,
  obtenerEstadisticasSistema,
  PALABRAS_CLAVE_SEO 
} = require("../services/seoService");



// ✅ NUEVA FUNCIÓN: Estadísticas detalladas
exports.obtenerEstadisticasSEO = async (req, res) => {
  try {
    const stats = obtenerEstadisticasSistema();
    
    // Obtener muestra de productos de Firebase
    const productosSnapshot = await db.ref("/").limitToFirst(100).once("value");
    const productos = productosSnapshot.val() || {};
    const totalProductos = Object.keys(productos).filter(id => productos[id]?.nombre).length;
    
    const estadisticas = {
      sistema: "SEO Híbrido Activado",
      productos: {
        total: totalProductos,
        especificos: stats.productosEspecificos,
        dinamicos: `${totalProductos - stats.productosEspecificos} (estimado)`,
        porcentajeEspecificos: ((stats.productosEspecificos / totalProductos) * 100).toFixed(1)
      },
      baseDatos: {
        ...stats.categorias,
        patronesTexto: stats.patronesTexto
      },
      cache: {
        activo: stats.cacheActual,
        duracion: "30 minutos"
      },
      ventajas: [
        "✅ SEO específico para productos documentados", 
        "✅ SEO dinámico como respaldo",
        "✅ Sin saturación de Firebase",
        "✅ Cache inteligente en memoria",
        "✅ Basado en tus fichas SEO reales"
      ],
      fechaActualizacion: new Date().toISOString()
    };
    
    res.json(estadisticas);
    
  } catch (error) {
    console.error("Error estadísticas:", error.message);
    res.status(500).json({
      error: "Error obteniendo estadísticas", 
      detalles: error.message
    });
  }
};

// ✅ NUEVA FUNCIÓN: Test de producto específico
exports.testProductoEspecifico = async (req, res) => {
  const { numeroParte, texto } = req.query;
  
  try {
    let resultado = { encontrado: false };
    
    if (numeroParte) {
      // Test por número de parte
      const { PRODUCTOS_ESPECIFICOS } = require("../services/seoService");
      if (PRODUCTOS_ESPECIFICOS[numeroParte]) {
        resultado = {
          encontrado: true,
          tipo: "numero_parte",
          datos: PRODUCTOS_ESPECIFICOS[numeroParte]
        };
      }
    }
    
    if (!resultado.encontrado && texto) {
      // Test por texto
      const { MAPEO_POR_TEXTO, PRODUCTOS_ESPECIFICOS } = require("../services/seoService");
      const textoLower = texto.toLowerCase();
      
      for (const [patron, numeroParteEspecifico] of Object.entries(MAPEO_POR_TEXTO)) {
        if (textoLower.includes(patron)) {
          resultado = {
            encontrado: true,
            tipo: "texto",
            patron: patron,
            datos: PRODUCTOS_ESPECIFICOS[numeroParteEspecifico]
          };
          break;
        }
      }
    }
    
    res.json({
      consulta: { numeroParte, texto },
      ...resultado,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error test producto:", error.message);
    res.status(500).json({
      error: "Error en test",
      detalles: error.message
    });
  }
};

/**
 * Genera y actualiza datos SEO para todos los productos
 */
exports.generarSEOProductos = async (req, res) => {
  try {
    console.log("Iniciando generación de SEO para productos...");
    
    const resultado = await procesarProductosParaSEO();
    
    res.status(200).json({
      mensaje: "SEO generado correctamente",
      productosActualizados: Object.keys(resultado).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generando SEO:", error.message);
    res.status(500).json({
      error: "Error al generar SEO",
      detalles: error.message
    });
  }
};

/**
 * Obtiene datos SEO de un producto específico
 */
exports.obtenerSEOProducto = async (req, res) => {
  const { id } = req.params;
  
  try {
    const datosSEO = await obtenerDatosSEOProducto(id);
    
    if (!datosSEO) {
      return res.status(404).json({
        error: "Datos SEO no encontrados para este producto"
      });
    }
    
    res.json(datosSEO);
  } catch (error) {
    console.error(`Error obteniendo SEO del producto ${id}:`, error.message);
    res.status(500).json({
      error: "Error al obtener datos SEO",
      detalles: error.message
    });
  }
};

/**
 * Genera sitemap.xml dinámicamente con URLs amigables - VERSIÓN CORREGIDA
 */
exports.generarSitemap = async (req, res) => {
  try {
    console.log("🔄 Generando sitemap.xml con URLs amigables - VERSIÓN CORREGIDA...");
    
    // ✅ FORZAR URL BASE - NO usar variables de entorno
    const baseURL = "https://tractodo.com";
    console.log(`🌐 URL base forzada: ${baseURL}`);
    
    // ✅ LIMPIAR CACHE ANTERIOR si existe
    try {
      await db.ref("/seo/sitemap").remove();
      console.log("🗑️ Cache de sitemap anterior eliminado");
    } catch (error) {
      console.log("ℹ️ No había cache anterior de sitemap");
    }
    
    // DEBUGGING: Verificar conexión a Firebase
    console.log("🔍 Verificando conexión a Firebase...");
    
    // Obtener todos los productos con debugging mejorado
    console.log("📦 Obteniendo productos desde Firebase...");
    const productosSnapshot = await db.ref("/").once("value");
    const todosLosDatos = productosSnapshot.val() || {};
    
    console.log(`📊 Total de nodos en raíz de Firebase: ${Object.keys(todosLosDatos).length}`);
    
    // Filtrar solo productos válidos (que tengan nombre)
    const productos = {};
    let productosConNombre = 0;
    let productosSinNombre = 0;
    
    Object.entries(todosLosDatos).forEach(([id, datos]) => {
      // Verificar que sea un producto válido (tiene nombre y no es un nodo de sistema)
      if (datos && typeof datos === 'object' && datos.nombre && datos.nombre.trim()) {
        productos[id] = datos;
        productosConNombre++;
      } else if (datos && typeof datos === 'object' && 
                 !id.startsWith('seo') && 
                 !id.startsWith('tracking') && 
                 !id.startsWith('usuarios') &&
                 !id.startsWith('entretenimiento') &&
                 !id.startsWith('backups') &&
                 !id.startsWith('recomendaciones') &&
                 !id.startsWith('productosDelMes')) {
        productosSinNombre++;
        console.log(`⚠️ Producto sin nombre válido encontrado - ID: ${id}, datos:`, datos);
      }
    });
    
    console.log(`✅ Productos válidos encontrados: ${productosConNombre}`);
    console.log(`⚠️ Productos sin nombre válido: ${productosSinNombre}`);
    
    // Obtener posts del blog con debugging
    console.log("📝 Obteniendo posts del blog...");
    const blogSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const posts = blogSnapshot.val() || {};
    console.log(`📖 Posts de blog encontrados: ${Object.keys(posts).length}`);
    
    // Función para generar slug único
    const { generarSlug } = require("../services/seoService");
    
    // Generar XML del sitemap - PÁGINAS ESTÁTICAS
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Página principal -->
  <url>
    <loc>${baseURL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Páginas principales -->
  <url>
    <loc>${baseURL}/productos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseURL}/ubicacion</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseURL}/sobre</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseURL}/entretenimiento</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseURL}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseURL}/videos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;

    // ✅ Generar slugs únicos para productos - MEJORADO
    console.log("🔧 Generando URLs amigables para productos...");
    const productosConSlug = [];
    const slugsUsados = new Set();
    
    if (Object.keys(productos).length > 0) {
      Object.entries(productos).forEach(([id, producto]) => {
        try {
          let slug = generarSlug(producto.nombre);
          let slugFinal = slug;
          let contador = 1;
          
          // Asegurar que el slug sea único
          while (slugsUsados.has(slugFinal)) {
            slugFinal = `${slug}-${contador}`;
            contador++;
          }
          
          slugsUsados.add(slugFinal);
          productosConSlug.push({
            id,
            slug: slugFinal,
            nombre: producto.nombre,
            lastmod: producto.fechaActualizacion || new Date().toISOString()
          });
          
          console.log(`✅ Producto agregado: ${producto.nombre} -> ${slugFinal}`);
        } catch (error) {
          console.error(`❌ Error procesando producto ${id}:`, error.message);
        }
      });

      // Agregar productos al sitemap con URLs amigables
      productosConSlug.forEach(({ slug, nombre, lastmod }) => {
        sitemap += `
  <!-- Producto: ${nombre} -->
  <url>
    <loc>${baseURL}/productos/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
      
      console.log(`✅ ${productosConSlug.length} productos agregados al sitemap con URLs amigables`);
    } else {
      console.log("⚠️ No se encontraron productos válidos para agregar al sitemap");
    }

    // ✅ Generar slugs únicos para posts del blog - MEJORADO
    console.log("📝 Generando URLs amigables para blog...");
    const postsConSlug = [];
    const slugsBlogUsados = new Set();
    
    if (Object.keys(posts).length > 0) {
      Object.entries(posts)
        .filter(([id, post]) => post.titulo && post.titulo.trim())
        .forEach(([id, post]) => {
          try {
            let slug = generarSlug(post.titulo);
            let slugFinal = slug;
            let contador = 1;
            
            // Asegurar que el slug sea único
            while (slugsBlogUsados.has(slugFinal)) {
              slugFinal = `${slug}-${contador}`;
              contador++;
            }
            
            slugsBlogUsados.add(slugFinal);
            postsConSlug.push({
              id,
              slug: slugFinal,
              titulo: post.titulo,
              lastmod: post.fechaActualizacion || post.fechaPublicacion || new Date().toISOString()
            });
            
            console.log(`✅ Post agregado: ${post.titulo} -> ${slugFinal}`);
          } catch (error) {
            console.error(`❌ Error procesando post ${id}:`, error.message);
          }
        });

      // Agregar posts del blog con URLs amigables
      postsConSlug.forEach(({ slug, titulo, lastmod }) => {
        sitemap += `
  <!-- Blog: ${titulo} -->
  <url>
    <loc>${baseURL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
      
      console.log(`✅ ${postsConSlug.length} posts de blog agregados al sitemap con URLs amigables`);
    } else {
      console.log("⚠️ No se encontraron posts de blog para agregar al sitemap");
    }
    
    // Agregar páginas de categorías/marcas principales con URLs amigables
    const marcas = [
      { nombre: "Cummins", slug: "cummins" },
      { nombre: "Caterpillar", slug: "caterpillar" }, 
      { nombre: "Detroit Diesel", slug: "detroit-diesel" },
      { nombre: "Navistar", slug: "navistar" },
      { nombre: "Volvo", slug: "volvo" },
      { nombre: "Mercedes Benz", slug: "mercedes-benz" }
    ];
    
    marcas.forEach(({ nombre, slug }) => {
      sitemap += `
  <!-- Categoría: ${nombre} -->
  <url>
    <loc>${baseURL}/productos/marca/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
    
    // Agregar páginas de tipos de productos
    const tiposProductos = [
      { nombre: "Turbos", slug: "turbos" },
      { nombre: "Cabezas de Motor", slug: "cabezas-motor" },
      { nombre: "Árboles de Levas", slug: "arboles-levas" },
      { nombre: "Kits de Reparación", slug: "kits-reparacion" }
    ];
    
    tiposProductos.forEach(({ nombre, slug }) => {
      sitemap += `
  <!-- Tipo: ${nombre} -->
  <url>
    <loc>${baseURL}/productos/tipo/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
    
    sitemap += `
</urlset>`;
    
    // Calcular total de URLs
    const totalURLs = sitemap.split('<url>').length - 1;
    
    // ✅ Guardar mapeo de slugs para el frontend (solo si hay productos/posts)
    const mapeoSlugs = {
      productos: productosConSlug.reduce((acc, { id, slug }) => {
        acc[slug] = id;
        return acc;
      }, {}),
      blog: postsConSlug.reduce((acc, { id, slug }) => {
        acc[slug] = id;
        return acc;
      }, {})
    };
    
    // ✅ Guardar sitemap NUEVO en Firebase
    await db.ref("/seo/sitemap").set({
      contenido: sitemap,
      fechaGeneracion: new Date().toISOString(),
      totalURLs: totalURLs,
      baseURL: baseURL,
      forzadoTractodo: true,
      debug: {
        productosEncontrados: productosConNombre,
        productosSinNombre: productosSinNombre,
        postsEncontrados: Object.keys(posts).length,
        productosEnSitemap: productosConSlug.length,
        postsEnSitemap: postsConSlug.length
      }
    });
    
    // ✅ Guardar mapeo de slugs para que el frontend pueda resolver URLs
    await db.ref("/seo/slugs").set({
      mapeo: mapeoSlugs,
      fechaActualizacion: new Date().toISOString(),
      baseURL: baseURL
    });
    
    // ✅ HEADERS CORRECTOS PARA XML
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.send(sitemap);
    
    console.log(`🎉 SITEMAP GENERADO EXITOSAMENTE:`);
    console.log(`   📊 Total URLs: ${totalURLs}`);
    console.log(`   🌐 Base URL: ${baseURL}`);
    console.log(`   📝 Productos: ${productosConSlug.length}`);
    console.log(`   📖 Posts blog: ${postsConSlug.length}`);
    console.log(`   🏷️ Categorías: ${marcas.length + tiposProductos.length}`);
    console.log(`   📅 Generado: ${new Date().toISOString()}`);
    
    // ✅ Log de ejemplos de URLs generadas
    if (productosConSlug.length > 0) {
      console.log(`   🔗 Ejemplo producto: ${baseURL}/productos/${productosConSlug[0].slug}`);
    } else {
      console.log(`   ⚠️ No se generaron URLs de productos`);
    }
    
    if (postsConSlug.length > 0) {
      console.log(`   🔗 Ejemplo blog: ${baseURL}/blog/${postsConSlug[0].slug}`);
    } else {
      console.log(`   ⚠️ No se generaron URLs de blog`);
    }
    
  } catch (error) {
    console.error("❌ Error generando sitemap:", error.message);
    console.error("❌ Stack trace completo:", error.stack);
    res.status(500).json({
      error: "Error al generar sitemap",
      detalles: error.message
    });
  }
};
/**
 * Genera robots.txt
 */
exports.generarRobots = async (req, res) => {
  try {
    const baseURL = process.env.FRONTEND_URL || "https://tractodo.com";
    
    const robots = `# Robots.txt para Tractodo - Refaccionaria de Tractocamión
# Generado automáticamente: ${new Date().toISOString()}

User-agent: *
Allow: /

# Páginas principales permitidas
Allow: /productos
Allow: /entretenimiento
Allow: /blog
Allow: /sobre
Allow: /videos
Allow: /ubicacion
Allow: /productos/*

# Bloquear rutas de administración
Disallow: /admin
Disallow: /api
Disallow: /dashboard
Disallow: /login

# Bloquear archivos temporales y backups
Disallow: /backup
Disallow: /*.tmp
Disallow: /*.temp

# Permitir bots específicos
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Sitemap
Sitemap: ${baseURL}/api/seo/sitemap.xml

# Crawl-delay para evitar sobrecarga
Crawl-delay: 1`;

    // Guardar robots.txt en Firebase para cache
    await db.ref("/seo/robots").set({
      contenido: robots,
      fechaGeneracion: new Date().toISOString()
    });
    
    res.set('Content-Type', 'text/plain');
    res.send(robots);
    
    console.log("Robots.txt generado correctamente");
    
  } catch (error) {
    console.error("Error generando robots.txt:", error.message);
    res.status(500).json({
      error: "Error al generar robots.txt",
      detalles: error.message
    });
  }
};

/**
 * Obtiene estadísticas SEO generales
 */
exports.obtenerEstadisticasSEO = async (req, res) => {
  try {
    // Obtener datos de productos
    const productosSnapshot = await db.ref("/").once("value");
    const productos = productosSnapshot.val() || {};
    const totalProductos = Object.keys(productos).filter(id => productos[id]?.nombre).length;
    
    // Obtener datos SEO generados
    const seoSnapshot = await db.ref("/seo/productos").once("value");
    const datosSEO = seoSnapshot.val() || {};
    const productosConSEO = Object.keys(datosSEO).length;
    
    // Obtener posts del blog
    const blogSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const posts = blogSnapshot.val() || {};
    const totalPosts = Object.keys(posts).length;
    
    // Calcular métricas
    const porcentajeSEO = totalProductos > 0 ? (productosConSEO / totalProductos * 100).toFixed(2) : 0;
    
    // Análisis de palabras clave por categoría
    const analisisPalabrasClave = {
      generales: PALABRAS_CLAVE_SEO.generales.length,
      longTail: PALABRAS_CLAVE_SEO.longTail.length,
      componentes: PALABRAS_CLAVE_SEO.componentes.length,
      marca: PALABRAS_CLAVE_SEO.marca.length,
      mediasReparaciones: PALABRAS_CLAVE_SEO.mediasReparaciones.length,
      total: Object.values(PALABRAS_CLAVE_SEO).reduce((acc, cat) => acc + cat.length, 0)
    };
    
    const estadisticas = {
      productos: {
        total: totalProductos,
        conSEO: productosConSEO,
        porcentajeOptimizado: parseFloat(porcentajeSEO)
      },
      blog: {
        totalPosts: totalPosts
      },
      palabrasClave: analisisPalabrasClave,
      sitemap: {
        urlsEstimadas: totalProductos + totalPosts + 10 // +10 para páginas estáticas
      },
      fechaActualizacion: new Date().toISOString()
    };
    
    res.json(estadisticas);
    
  } catch (error) {
    console.error("Error obteniendo estadísticas SEO:", error.message);
    res.status(500).json({
      error: "Error al obtener estadísticas",
      detalles: error.message
    });
  }
};

/**
 * Regenera datos SEO para un producto específico
 */
exports.regenerarSEOProducto = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Obtener producto
    const productoSnapshot = await db.ref(`/${id}`).once("value");
    
    if (!productoSnapshot.exists()) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }
    
    const producto = productoSnapshot.val();
    
    // Regenerar datos SEO
    const { 
      generarTituloSEO, 
      generarDescripcionSEO, 
      generarPalabrasClaveProducto,
      generarSlug
    } = require("../services/seoService");
    
    const datosSEO = {
      titulo: generarTituloSEO(producto),
      descripcion: generarDescripcionSEO(producto),
      palabrasClave: generarPalabrasClaveProducto(producto),
      schema: generarSchemaProducto({ id, ...producto }),
      slug: generarSlug(producto.nombre),
      fechaActualizacion: new Date().toISOString()
    };
    
    // Guardar en Firebase
    await db.ref(`/seo/productos/${id}`).set(datosSEO);
    
    res.json({
      mensaje: "SEO regenerado correctamente",
      producto: {
        id,
        nombre: producto.nombre
      },
      seo: datosSEO
    });
    
  } catch (error) {
    console.error(`Error regenerando SEO del producto ${id}:`, error.message);
    res.status(500).json({
      error: "Error al regenerar SEO",
      detalles: error.message
    });
  }
};

/**
 * Obtiene schema.org markup para un producto
 */
exports.obtenerSchemaProducto = async (req, res) => {
  const { id } = req.params;
  
  try {
    const datosSEO = await obtenerDatosSEOProducto(id);
    
    if (!datosSEO || !datosSEO.schema) {
      return res.status(404).json({
        error: "Schema markup no encontrado para este producto"
      });
    }
    
    res.json(datosSEO.schema);
    
  } catch (error) {
    console.error(`Error obteniendo schema del producto ${id}:`, error.message);
    res.status(500).json({
      error: "Error al obtener schema markup",
      detalles: error.message
    });
  }
};