const { obtenerDatosSEOProducto } = require("../services/seoService");

/**
 * Middleware optimizado para agregar SEO dinámico
 */
const agregarSEOaProductos = async (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (shouldProcessSEO(req, data)) {
      procesarSEOEnRespuesta(data)
        .then(dataConSEO => originalJson.call(this, dataConSEO))
        .catch(error => {
          console.warn("Error SEO middleware:", error.message);
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
  const incluirSEO = req.query?.incluirSEO === 'true';
  const esRutaProductos = req.path.includes('/productos');
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
    if (Array.isArray(data)) {
      // ✅ OPTIMIZACIÓN: Solo procesar primeros 10 productos para evitar sobrecarga
      const productosLimitados = data.slice(0, 10);
      const promesas = productosLimitados.map(async (producto) => {
        try {
          const seo = await obtenerDatosSEOProducto(producto.id, producto);
          return { ...producto, seo };
        } catch (error) {
          console.warn(`Error SEO para producto ${producto.id}:`, error.message);
          return producto; // Sin SEO si hay error
        }
      });
      
      const productosConSEO = await Promise.all(promesas);
      // Devolver productos con SEO + resto sin procesar
      return [...productosConSEO, ...data.slice(10)];
      
    } else if (data.producto && data.producto.id) {
      // Producto individual con recomendados
      try {
        const seoProducto = await obtenerDatosSEOProducto(data.producto.id, data.producto);
        
        // Procesar recomendados si existen (máximo 3)
        let recomendadosConSEO = data.recomendados || [];
        if (recomendadosConSEO.length > 0) {
          const recomendadosPromesas = recomendadosConSEO.slice(0, 3).map(async (rec) => {
            try {
              const seoRec = await obtenerDatosSEOProducto(rec.id, rec);
              return { ...rec, seo: seoRec };
            } catch (error) {
              return rec; // Sin SEO si hay error
            }
          });
          
          const recomendadosProcesados = await Promise.all(recomendadosPromesas);
          recomendadosConSEO = [...recomendadosProcesados, ...recomendadosConSEO.slice(3)];
        }
        
        return {
          ...data,
          producto: { ...data.producto, seo: seoProducto },
          recomendados: recomendadosConSEO
        };
      } catch (error) {
        console.warn(`Error SEO para producto principal ${data.producto.id}:`, error.message);
        return data;
      }
      
    } else if (data.productos && Array.isArray(data.productos)) {
      // Array de productos en propiedad "productos"
      const productosLimitados = data.productos.slice(0, 10);
      const promesas = productosLimitados.map(async (producto) => {
        try {
          const seo = await obtenerDatosSEOProducto(producto.id, producto);
          return { ...producto, seo };
        } catch (error) {
          return producto;
        }
      });
      
      const productosConSEO = await Promise.all(promesas);
      return {
        ...data,
        productos: [...productosConSEO, ...data.productos.slice(10)]
      };
    }
    
    return data;
    
  } catch (error) {
    console.error("Error procesando SEO en middleware:", error.message);
    return data;
  }
};

/**
 * Middleware para generar SEO automático si no existe (OPCIONAL)
 * Solo aplicar en rutas de productos individuales
 */
const generarSEOAutomatico = async (req, res, next) => {
  const esProductoIndividual = req.path.match(/\/productos\/[\w-]+$/);
  
  if (esProductoIndividual) {
    const productId = req.params.id;
    
    try {
      // El nuevo sistema siempre genera SEO, así que solo logging
      console.log(`SEO automático disponible para producto ${productId}`);
    } catch (error) {
      console.warn(`Error preparando SEO para ${productId}:`, error.message);
    }
  }
  
  next();
};

/**
 * Middleware para agregar headers SEO generales
 */
const agregarHeadersSEO = (req, res, next) => {
  // Headers SEO básicos
  res.set({
    'X-Robots-Tag': 'index, follow',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  });
  
  // Headers específicos para contenido SEO
  if (req.path.includes('sitemap.xml')) {
    res.set('Content-Type', 'application/xml; charset=utf-8');
  }
  
  if (req.path.includes('robots.txt')) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
  }
  
  // Meta tags adicionales para páginas de productos
  if (req.path.includes('/productos/')) {
    res.set('X-SEO-System', 'Tractodo-Hybrid-SEO');
  }
  
  next();
};

module.exports = {
  agregarSEOaProductos,
  generarSEOAutomatico,
  agregarHeadersSEO
};