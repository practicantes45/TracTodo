// hooks/useSEO.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { obtenerSEOProducto, obtenerSchemaProducto, generarMetaTags } from '../services/seoService';

export const useSEO = (pageKey, options = {}) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Serializar options para dependencia estable
  const optionsString = JSON.stringify(options);
  
  // Memoizar options de manera segura
  const memoizedOptions = useMemo(() => {
    try {
      return JSON.parse(optionsString);
    } catch {
      return {};
    }
  }, [optionsString]);

  useEffect(() => {
    if (pageKey) {
      const defaultSEO = generarMetaTags(pageKey, memoizedOptions);
      setSeoData(defaultSEO);
    }
  }, [pageKey, memoizedOptions]);

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

  // Serializar productData para dependencia estable
  const productDataString = JSON.stringify(productData);
  
  // Memoizar productData de manera segura
  const memoizedProductData = useMemo(() => {
    try {
      return JSON.parse(productDataString);
    } catch {
      return {};
    }
  }, [productDataString]);

  const cargarSEOProducto = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

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
          ogImage: memoizedProductData.imagen || "/images/tractodo-logo.jpg",
          ogUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${productId}`,
          canonicalUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${productId}`
        });
      } else {
        // Generar SEO dinámico como respaldo
        const titulo = `${memoizedProductData.nombre || 'Producto'} | ${memoizedProductData.numeroParte || ''} | Tractodo`;
        const descripcion = `${memoizedProductData.descripcion || `Refacción ${memoizedProductData.nombre} para tractocamión`}. Envío nacional, garantía incluida. Especialistas en motores diésel.`;
        
        setSeoData({
          title: titulo,
          description: descripcion,
          keywords: [
            memoizedProductData.marca,
            memoizedProductData.nombre,
            'refacciones tractocamión',
            'motor diésel',
            'Tractodo'
          ].filter(Boolean),
          ogTitle: titulo,
          ogDescription: descripcion,
          ogImage: memoizedProductData.imagen || "/images/tractodo-logo.jpg",
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
        title: `${memoizedProductData.nombre || 'Producto'} | Tractodo`,
        description: 'Refacciones para tractocamión con garantía. Especialistas en motores diésel.',
        keywords: ['refacciones', 'tractocamión', 'motor diésel'],
        ogImage: "/images/tractodo-logo.jpg"
      });
    } finally {
      setLoading(false);
    }
  }, [productId, memoizedProductData]);

  useEffect(() => {
    cargarSEOProducto();
  }, [cargarSEOProducto]);

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

  // Serializar articleData para dependencia estable
  const articleDataString = JSON.stringify(articleData);
  
  // Memoizar articleData de manera segura
  const memoizedArticleData = useMemo(() => {
    try {
      return JSON.parse(articleDataString);
    } catch {
      return {};
    }
  }, [articleDataString]);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    // Generar SEO para artículos del blog
    const titulo = `${memoizedArticleData.titulo || 'Artículo'} | Blog Tractodo`;
    const descripcion = memoizedArticleData.descripcionCorta || 
      (memoizedArticleData.contenido ? 
        memoizedArticleData.contenido.substring(0, 160).replace(/[#*]/g, '') + '...' : 
        'Artículo especializado sobre tractocamiones y refacciones en el blog de Tractodo.'
      );

    setSeoData({
      title: titulo,
      description: descripcion,
      keywords: [
        ...(memoizedArticleData.categoria ? [memoizedArticleData.categoria] : []),
        'blog tractocamión',
        'consejos técnicos',
        'mantenimiento',
        'Tractodo'
      ],
      ogTitle: titulo,
      ogDescription: descripcion,
      ogImage: memoizedArticleData.imagen || "/images/tractodo-logo.jpg",
      ogUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${articleId}`,
      canonicalUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${articleId}`
    });

    setLoading(false);
  }, [articleId, memoizedArticleData]);

  return {
    seoData,
    loading
  };
};