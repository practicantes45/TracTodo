// hooks/useSEO.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { obtenerSEOProducto, obtenerSchemaProducto, generarMetaTags } from '../services/seoService';
import { getProductSlug } from '../utils/slugUtils';

const normalizePrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : undefined;
};

const buildProductSchema = (producto, productUrl) => {
  if (!producto) return null;

  const price = normalizePrice(producto.precioVentaSugerido ?? producto.precio);
  const imagenes = [];

  if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
    imagenes.push(...Object.values(producto.imagenesUrl).filter(Boolean));
  }

  if (producto.imagen) {
    imagenes.unshift(producto.imagen);
  }

  const uniqueImages = [...new Set(imagenes.filter(Boolean))];

  const schemaBase = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre || 'Producto',
    description: producto.descripcion || undefined,
    sku: producto.numeroParte || undefined,
    brand: producto.marca ? { '@type': 'Brand', name: producto.marca } : undefined,
    image: uniqueImages.length > 0 ? uniqueImages : undefined,
  };

  if (price) {
    schemaBase.offers = {
      '@type': 'Offer',
      priceCurrency: 'MXN',
      price,
      availability: 'https://schema.org/InStock',
      url: productUrl,
    };
  }

  return schemaBase;
};

const ensureSchemaCurrency = (schemaData, productUrl, producto) => {
  if (!schemaData) return buildProductSchema(producto, productUrl);

  const normalizedSchema = { ...schemaData };
  const offers = normalizedSchema.offers;

  if (offers) {
    if (Array.isArray(offers)) {
      normalizedSchema.offers = offers.map((offer) => ({
        ...offer,
        priceCurrency: offer.priceCurrency || 'MXN',
        url: offer.url || productUrl,
      }));
    } else {
      normalizedSchema.offers = {
        ...offers,
        priceCurrency: offers.priceCurrency || 'MXN',
        url: offers.url || productUrl,
      };
    }
  } else {
    const fallbackSchema = buildProductSchema(producto, productUrl);
    if (fallbackSchema?.offers) {
      normalizedSchema.offers = fallbackSchema.offers;
    }
  }

  if (!normalizedSchema.image) {
    const fallbackSchema = buildProductSchema(producto, productUrl);
    if (fallbackSchema?.image) {
      normalizedSchema.image = fallbackSchema.image;
    }
  }

  return normalizedSchema;
};

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
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://tractodo.com';

  // Serializar productData para dependencia estable
  const productDataString = JSON.stringify(productData);
  
  // Memoizar productData de manera segura
  const memoizedProductData = useMemo(() => {
    try {
      const parsed = JSON.parse(productDataString);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }, [productDataString]);

  const canonicalSlug = useMemo(
    () => getProductSlug(memoizedProductData) || (productId ? String(productId) : ''),
    [memoizedProductData, productId]
  );

  const productUrl = useMemo(() => {
    if (canonicalSlug) {
      return `${baseUrl}/productos/${canonicalSlug}`;
    }
    if (productId) {
      return `${baseUrl}/productos/${productId}`;
    }
    return `${baseUrl}/productos`;
  }, [baseUrl, canonicalSlug, productId]);

  const primaryImage =
    (memoizedProductData && typeof memoizedProductData === 'object' && (
      memoizedProductData.imagen ||
      memoizedProductData.imagenesUrl?.frente ||
      (memoizedProductData.imagenesUrl && typeof memoizedProductData.imagenesUrl === 'object'
        ? Object.values(memoizedProductData.imagenesUrl).find(Boolean)
        : undefined)
    )) ||
    '/images/tractodo-logo.jpg';

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
          ogImage: primaryImage,
          ogUrl: productUrl,
          canonicalUrl: productUrl
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
          ogImage: primaryImage,
          ogUrl: productUrl,
          canonicalUrl: productUrl
        });
      }
      
      if (schemaData) {
        setSchema(ensureSchemaCurrency(schemaData, productUrl, memoizedProductData));
      } else {
        setSchema(buildProductSchema(memoizedProductData, productUrl));
      }
      
    } catch (err) {
      console.error('Error cargando SEO del producto:', err);
      setError(err.message);
      
      // SEO de respaldo en caso de error
      setSeoData({
        title: `${memoizedProductData.nombre || 'Producto'} | Tractodo`,
        description: 'Refacciones para tractocamión con garantía. Especialistas en motores diésel.',
        keywords: ['refacciones', 'tractocamión', 'motor diésel'],
        ogImage: primaryImage,
        ogUrl: productUrl,
        canonicalUrl: productUrl
      });
    } finally {
      setLoading(false);
    }
  }, [productId, memoizedProductData, productUrl, primaryImage]);

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
