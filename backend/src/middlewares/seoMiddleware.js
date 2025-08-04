const { db } = require("../config/firebase");

/**
 * Middleware para agregar automáticamente datos SEO a las respuestas de productos
 */
const agregarSEOaProductos = async (req, res, next) => {
  // Interceptar el método json de la respuesta
  const originalJson = res.json;
  
  res.json = function(data) {
    // Solo procesar si la respuesta contiene productos
    if (shouldProcessSEO(req, data)) {
      procesarSEOEnRespuesta(data)
        .then(dataConSEO => {
          originalJson.call(this, dataConSEO);
        })
        .catch(error => {
          console.warn("Error agregando SEO:", error.message);
          originalJson.call(this, data);
        });
    } else {
      originalJson.call(this, data);
    }
  };
  
  next();
};

/**
 * Determina si la respuesta debe ser procesada para SEO
 */
const shouldProcessSEO = (req, data) => {
  // Verificar si se solicitó incluir SEO en query params
  const incluirSEO = req.query?.incluirSEO === 'true';
  
  // Verificar si es una ruta de productos
  const esRutaProductos = req.path.includes('/productos');
  
  // Verificar si la respuesta contiene datos de productos
  const tieneProductos = data && (
    Array.isArray(data) || 
    (data.producto && data.producto.id) ||
    (data.productos && Array.isArray(data.productos))
  );
  
  return incluirSEO && esRutaProductos && tieneProductos;
};

/**
 * Procesa los datos de la respuesta y agrega información SEO
 */
const procesarSEOEnRespuesta = async (data) => {
  try {
    // Obtener todos los datos SEO de una vez
    const seoSnapshot = await db.ref("/seo/productos").once("value");
    const datosSEO = seoSnapshot.val() || {};
    
    if (Array.isArray(data)) {
      // Array de productos
      return data.map(producto => ({
        ...producto,
        seo: datosSEO[producto.id] || null
      }));
      
    } else if (data.producto && data.producto.id) {
      // Producto individual con recomendados
      return {
        ...data,
        producto: {
          ...data.producto,
          seo: datosSEO[data.producto.id] || null
        },
        recomendados: data.recomendados?.map(recomendado => ({
          ...recomendado,
          seo: datosSEO[recomendado.id] || null
        })) || []
      };
      
    } else if (data.productos && Array.isArray(data.productos)) {
      // Respuesta con array de productos en propiedad "productos"
      return {
        ...data,
        productos: data.productos.map(producto => ({
          ...producto,
          seo: datosSEO[producto.id] || null
        }))
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error procesando SEO en respuesta:", error.message);
    return data;
  }
};

/**
 * Middleware específico para generar SEO faltante automáticamente
 */
const generarSEOFaltante = async (req, res, next) => {
  // Solo aplicar en rutas de productos individuales
  const esProductoIndividual = req.path.match(/\/productos\/[\w-]+$/);
  
  if (esProductoIndividual) {
    const productId = req.params.id;
    
    try {
      // Verificar si ya tiene datos SEO
      const seoSnapshot = await db.ref(`/seo/productos/${productId}`).once("value");
      
      if (!seoSnapshot.exists()) {
        console.log(`Generando SEO automático para producto ${productId}`);
        
        // Obtener datos del producto
        const productoSnapshot = await db.ref(`/${productId}`).once("value");
        
        if (productoSnapshot.exists()) {
          const producto = productoSnapshot.val();
          
          // Generar datos SEO
          const { 
            generarTituloSEO, 
            generarDescripcionSEO, 
            generarPalabrasClaveProducto,
            generarSchemaProducto,
            generarSlug
          } = require("../services/seoService");
          
          const datosSEO = {
            titulo: generarTituloSEO(producto),
            descripcion: generarDescripcionSEO(producto),
            palabrasClave: generarPalabrasClaveProducto(producto),
            schema: generarSchemaProducto({ id: productId, ...producto }),
            slug: generarSlug(producto.nombre),
            fechaCreacion: new Date().toISOString(),
            generadoAutomaticamente: true
          };
          
          // Guardar asincrónicamente (no bloquear la respuesta)
          db.ref(`/seo/productos/${productId}`).set(datosSEO)
            .then(() => console.log(`SEO generado automáticamente para ${productId}`))
            .catch(error => console.warn(`Error guardando SEO para ${productId}:`, error.message));
        }
      }
    } catch (error) {
      console.warn(`Error en generación automática de SEO para ${productId}:`, error.message);
    }
  }
  
  next();
};

/**
 * Middleware para agregar headers SEO a las respuestas HTML
 */
const agregarHeadersSEO = (req, res, next) => {
  // Headers generales para SEO
  res.set({
    'X-Robots-Tag': 'index, follow',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  });
  
  // Headers específicos para sitemap y robots
  if (req.path.includes('sitemap.xml')) {
    res.set('Content-Type', 'application/xml; charset=utf-8');
  }
  
  if (req.path.includes('robots.txt')) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
  }
  
  next();
};

module.exports = {
  agregarSEOaProductos,
  generarSEOFaltante,
  agregarHeadersSEO
};