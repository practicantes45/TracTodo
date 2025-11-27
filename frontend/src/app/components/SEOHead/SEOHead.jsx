// components/SEOHead/SEOHead.jsx
import Head from 'next/head';

export default function SEOHead({ 
  title,
  description,
  keywords = [],
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterSite = '@tractodo',
  canonicalUrl,
  schema,
  noIndex = false,
  children
}) {
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Head>
      {/* 
        ELIMINADO: Meta title y description básicos 
        (ahora se manejan server-side para evitar duplicación)
      */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      
      {/* Keywords solo si no están en server-side */}
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      
      {/* Meta tags de robots - solo si es noIndex */}
      {noIndex && (
        <>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex, nofollow" />
        </>
      )}
      
      {/* Schema.org markup - MANTENER (no se duplica) */}
      {schema && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      
      {/* Meta tags adicionales específicos */}
      <meta name="author" content="Tractodo" />
      <meta name="copyright" content="Tractodo" />
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Datos específicos para análisis */}
      <meta name="geo.region" content="MX-QRO" />
      <meta name="geo.placename" content="San Juan del Río" />
      <meta name="geo.position" content="20.3881;-99.9968" />
      <meta name="ICBM" content="20.3881, -99.9968" />

      {/* Open Graph */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:type" content="product" />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Preload de recursos críticos */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {children}
    </Head>
  );
}
