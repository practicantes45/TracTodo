// app/sitemap.xml/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tractodo-production.up.railway.app/api';
    
    console.log('🗺️ Solicitando sitemap desde:', `${backendUrl}/seo/sitemap.xml`);
    
    // Hacer petición al backend para obtener el sitemap - CORREGIDO
    const response = await fetch(`${backendUrl}/seo/sitemap.xml`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml',
      },
      // Agregar timeout
      signal: AbortSignal.timeout(15000) // 15 segundos (más tiempo)
    });

    if (!response.ok) {
      console.error('❌ Error obteniendo sitemap del backend:', response.status, response.statusText);
      throw new Error(`Error del backend: ${response.status} ${response.statusText}`);
    }

    const sitemapContent = await response.text();
    
    console.log('✅ Sitemap obtenido exitosamente del backend');
    console.log(`📊 Tamaño del sitemap: ${sitemapContent.length} caracteres`);
    
    // Verificar que el sitemap contenga productos
    const productCount = (sitemapContent.match(/productos\//g) || []).length;
    console.log(`📦 URLs de productos encontradas: ${productCount}`);
    
    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // Cache por 30 minutos
      },
    });
    
  } catch (error) {
    console.error('❌ Error al obtener sitemap:', error.message);
    console.error('❌ Stack trace:', error.stack);
    
    // MEJORADO: Sitemap de fallback más informativo
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<!-- FALLBACK SITEMAP - El backend no respondió correctamente -->
<!-- Error: ${error.message} -->
<!-- Timestamp: ${new Date().toISOString()} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tractodo.com</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tractodo.com/productos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://tractodo.com/ubicacion</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tractodo.com/sobre</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tractodo.com/entretenimiento</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://tractodo.com/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://tractodo.com/videos</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // Cache por solo 5 minutos si es fallback
      },
    });
  }
}