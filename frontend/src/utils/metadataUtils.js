// utils/metadataUtils.js
import { SEO_DEFAULTS } from '../services/seoService';

/**
 * Genera metadata server-side para Next.js App Router
 * CORREGIDO: Encoding y longitud optimizada
 */
export const generatePageMetadata = (pageKey, customData = {}) => {
  const defaultData = SEO_DEFAULTS.pages[pageKey] || SEO_DEFAULTS.pages.inicio;
  const baseUrl = SEO_DEFAULTS.baseUrl;
  
  const title = customData.title || defaultData.title;
  const description = customData.description || defaultData.description;
  const path = customData.path || '';
  const image = customData.image || SEO_DEFAULTS.defaultImage;

  // NUEVO: Asegurar que description no exceda 155 caracteres
  const optimizedDescription = description.length > 155 
    ? description.substring(0, 152) + '...'
    : description;

  return {
    title,
    description: optimizedDescription,
    keywords: (customData.keywords || defaultData.keywords).join(', '),
    
    // CORREGIDO: Evitar duplicación con client-side
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    
    openGraph: {
      title,
      description: optimizedDescription,
      url: `${baseUrl}${path}`,
      siteName: SEO_DEFAULTS.siteName,
      images: [
        {
          url: image.startsWith('http') ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'es_MX',
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description: optimizedDescription,
      images: [image.startsWith('http') ? image : `${baseUrl}${image}`],
      site: SEO_DEFAULTS.twitterHandle,
    },
    
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    
    authors: [{ name: SEO_DEFAULTS.siteName }],
    
    metadataBase: new URL(baseUrl),
    
    // NUEVO: Meta adicionales para mejor SEO
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
    },
  };
};

/**
 * NUEVA función para generar metadata de productos individuales
 */
export const generateProductMetadata = (producto, productId) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://tractodo.com';
  
  const title = producto.nombre 
    ? `${producto.nombre} | ${producto.numeroParte || ''} | Tractodo`
    : 'Producto | Tractodo';
    
  const description = producto.descripcion 
    ? `${producto.descripcion.substring(0, 140)}. Envío nacional, garantía incluida.`
    : 'Refacciones para tractocamión de calidad. Envío nacional, garantía incluida.';

  return {
    title,
    description: description.length > 155 ? description.substring(0, 152) + '...' : description,
    
    openGraph: {
      title,
      description,
      url: `${baseUrl}/productos/${productId}`,
      siteName: 'Tractodo',
      images: [
        {
          url: producto.imagen || `${baseUrl}/images/tractodo-logo.jpg`,
          width: 1200,
          height: 630,
          alt: producto.nombre || 'Producto Tractodo',
        },
      ],
      type: 'product',
    },
    
    alternates: {
      canonical: `${baseUrl}/productos/${productId}`,
    },
  };
};