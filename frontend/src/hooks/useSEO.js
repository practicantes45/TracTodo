// hooks/useSEO.js
import { useState, useEffect } from 'react';
import { obtenerSEOProducto, obtenerSchemaProducto, generarMetaTags } from '../services/seoService';

export const useSEO = (pageKey, options = {}) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pageKey) {
      const defaultSEO = generarMetaTags(pageKey, options);
      setSeoData(defaultSEO);
    }
  }, [pageKey]);

  return {
    seoData,
    loading,
    error,
    setSeoData
  };
};

export const useProductSEO = (productId, productData = {}) => {
  const [seoData, setSeoData] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const cargarSEOProducto = async () => {
      try {
        setLoading(true);
        
        // Obtener datos SEO del producto
        const datosSEO = await obtenerSEOProducto(productId);
        
        // Obtener schema markup
        const schemaData = await obtenerSchemaProducto(productId);
        
        if (datosSEO) {
          // Usar datos SEO específicos del backend
          setSeoData({
            title: datosSEO.titulo,
            description: datosSEO.descripcion,
            keywords: datosSEO.palabrasClave || [],
            ogTitle: datosSEO.titulo,
            ogDescription: datosSEO.descripcion,
            ogImage: productData.imagen || "/images/tractodo-logo.jpg",
            ogUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${productId}`,
            canonicalUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${productId}`
          });
        } else {
          // Generar SEO dinámico como respaldo
          const titulo = `${productData.nombre || 'Producto'} | ${productData.numeroParte || ''} | Tractodo`;
          const descripcion = `${productData.descripcion || `Refacción ${productData.nombre} para tractocamión`}. Envío nacional, garantía incluida. Especialistas en motores diésel.`;
          
          setSeoData({
            title: titulo,
            description: descripcion,
            keywords: [
              productData.marca,
              productData.nombre,
              'refacciones tractocamión',
              'motor diésel',
              'Tractodo'
            ].filter(Boolean),
            ogTitle: titulo,
            ogDescription: descripcion,
            ogImage: productData.imagen || "/images/tractodo-logo.jpg",
            ogUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${productId}`,
            canonicalUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${productId}`
          });
        }
        
        if (schemaData) {
          setSchema(schemaData);
        }
        
      } catch (err) {
        console.error('Error cargando SEO del producto:', err);
        setError(err.message);
        
        // SEO de respaldo en caso de error
        setSeoData({
          title: `${productData.nombre || 'Producto'} | Tractodo`,
          description: 'Refacciones para tractocamión con garantía. Especialistas en motores diésel.',
          keywords: ['refacciones', 'tractocamión', 'motor diésel'],
          ogImage: "/images/tractodo-logo.jpg"
        });
      } finally {
        setLoading(false);
      }
    };

    cargarSEOProducto();
  }, [productId, productData]);

  return {
    seoData,
    schema,
    loading,
    error
  };
};

export const useBlogSEO = (articleId, articleData = {}) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId || !articleData) {
      setLoading(false);
      return;
    }

    // Generar SEO para artículos del blog
    const titulo = `${articleData.titulo || 'Artículo'} | Blog Tractodo`;
    const descripcion = articleData.descripcionCorta || 
      (articleData.contenido ? 
        articleData.contenido.substring(0, 160).replace(/[#*]/g, '') + '...' : 
        'Artículo especializado sobre tractocamiones y refacciones en el blog de Tractodo.'
      );

    setSeoData({
      title: titulo,
      description: descripcion,
      keywords: [
        ...(articleData.categoria ? [articleData.categoria] : []),
        'blog tractocamión',
        'consejos técnicos',
        'mantenimiento',
        'Tractodo'
      ],
      ogTitle: titulo,
      ogDescription: descripcion,
      ogImage: articleData.imagen || "/images/tractodo-logo.jpg",
      ogUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${articleId}`,
      canonicalUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${articleId}`
    });

    setLoading(false);
  }, [articleId, articleData]);

  return {
    seoData,
    loading
  };
};