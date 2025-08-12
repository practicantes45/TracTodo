// utils/metadataUtils.js
import { SEO_DEFAULTS } from '../services/seoService';

/**
 * Genera metadata server-side para Next.js App Router
 */
export const generatePageMetadata = (pageKey, customData = {}) => {
  const defaultData = SEO_DEFAULTS.pages[pageKey] || SEO_DEFAULTS.pages.inicio;
  const baseUrl = SEO_DEFAULTS.baseUrl;
  
  const title = customData.title || defaultData.title;
  const description = customData.description || defaultData.description;
  const path = customData.path || '';
  const image = customData.image || SEO_DEFAULTS.defaultImage;

  return {
    title,
    description,
    keywords: (customData.keywords || defaultData.keywords).join(', '),
    
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: SEO_DEFAULTS.siteName,
      images: [
        {
          url: image,
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
      description,
      images: [image],
      site: SEO_DEFAULTS.twitterHandle,
    },
    
    alternates: {
      canonical: `${baseUrl}${path}`,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    
    authors: [{ name: SEO_DEFAULTS.siteName }],
    
    metadataBase: new URL(baseUrl),
  };
};