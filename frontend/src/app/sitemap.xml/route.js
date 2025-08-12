// app/sitemap.xml/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic'; // Forzar que esta ruta sea dinámica
export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tractodo-production.up.railway.app/api';
    
    console.log('🗺️ Solicitando sitemap desde:', `${backendUrl}/seo/sitemap.xml`);
    
    // Hacer petición al backend para obtener el sitemap
    const response = await fetch(`${backendUrl}
        }`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/xml',
      },
      // Agregar timeout
      signal: AbortSignal.timeout(10000) // 10 segundos
    });

    if (!response.ok) {
      console.error('❌ Error obteniendo sitemap del backend:', response.status);
      throw new Error(`Error del backend: ${response.status}`);
    }

    const sitemapContent = await response.text();
    
    console.log('✅ Sitemap obtenido exitosamente del backend');
    
    return new NextResponse(sitemapContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache por 1 hora
      },
    });
    
  } catch (error) {
    console.error('❌ Error al obtener sitemap:', error);
    
    // Sitemap de fallback si el backend no responde
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
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
        'Cache-Control': 'public, max-age=1800', // Cache por 30 minutos si es fallback
      },
    });
  }
}