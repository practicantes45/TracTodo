import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';
import { obtenerSEOProducto, obtenerSchemaProducto } from '@/services/seoService';
import { extractIdFromSlug } from '@/utils/slugUtils';

export const dynamicParams = true;

// ✅ FUNCIÓN MEJORADA: Usa las funciones existentes de seoService
export async function generateMetadata({ params }) {
  const { nombre } = await params;

  const API_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api';
  const rawSlug = decodeURIComponent(nombre ?? '');
  const posibleId = extractIdFromSlug(rawSlug);

  const slugSegments = rawSlug ? rawSlug.split('-').filter(Boolean) : [];
  let baseSegments = [...slugSegments];

  if (posibleId && baseSegments.length > 0) {
    const lastSegment = baseSegments[baseSegments.length - 1];
    if (lastSegment.toLowerCase() === posibleId.toLowerCase()) {
      baseSegments = baseSegments.slice(0, -1);
    }
  }

  const slugSinId = baseSegments.join('-');
  const nombreParaBusqueda = (slugSinId || rawSlug)
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  try {
    let data = null;

    if (posibleId) {
      try {
        const response = await fetch(`${API_URL}/productos/${encodeURIComponent(posibleId)}`);
        if (response.ok) {
          data = await response.json();
          console.log(`🆔 Producto resuelto por ID: ${posibleId}`);
        } else {
          console.warn(`⚠️ No se pudo obtener producto por ID: ${response.status}`);
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo producto por ID, se intentará con el nombre.', error);
      }
    }

    if ((!data || !data.producto) && nombreParaBusqueda) {
      try {
        const response = await fetch(`${API_URL}/productos/${encodeURIComponent(nombreParaBusqueda)}`);
        if (response.ok) {
          data = await response.json();
          console.log(`🔍 Producto resuelto por nombre: ${nombreParaBusqueda}`);
        } else {
          console.warn(`⚠️ No se pudo obtener producto por nombre: ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos del producto por nombre:', error);
      }
    }

    if (data?.producto) {
      const producto = data.producto;
      let seoData = null;
      let schemaData = null;

      try {
        seoData = await obtenerSEOProducto(producto.id);
        schemaData = await obtenerSchemaProducto(producto.id);
        console.log(`🧾 SEO del backend obtenido para: ${producto.nombre}`);
      } catch (seoError) {
        console.warn('No se pudo obtener SEO del backend, usando generación local:', seoError);
      }

      const finalSchema = schemaData || {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": producto.nombre,
        "description": producto.descripcion || `Refacción ${producto.nombre} para tractocamión`,
        "sku": producto.numeroParte || producto.id,
        "brand": { "@type": "Brand", "name": producto.marca || "Tractodo" },
        "offers": {
          "@type": "Offer",
          "price": String(producto.precioVentaSugerido || producto.precio || 0),
          "priceCurrency": "MXN",
          "availability": "https://schema.org/InStock"
        },
        "seller": {
          "@type": "Organization",
          "name": "Tractodo",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "MX",
            "addressRegion": "Querétaro",
            "addressLocality": "San Juan del Río"
          }
        }
      };

      if (finalSchema.offers) {
        finalSchema.offers.priceCurrency = "MXN";
        finalSchema.offers.price = String(producto.precioVentaSugerido || producto.precio || 0);
      }

      console.log(`ℹ️ Schema.org final para ${producto.nombre}: ${finalSchema.offers?.priceCurrency} ${finalSchema.offers?.price}`);

      const titulo = seoData?.titulo || `${producto.nombre} | TRACTODO`;
      const descripcion = seoData?.descripcion || `Compra ${producto.nombre} en TRACTODO. ${producto.descripcion || 'Repuestos y refacciones de calidad para maquinaria pesada.'} Envío nacional, garantía incluida.`;

      return {
        title: titulo,
        description: descripcion,
        keywords: seoData?.palabrasClave?.join(', ') || `${producto.marca || 'Tractodo'}, ${producto.nombre}, refacciones tractocamión`,
        openGraph: {
          title: titulo,
          description: descripcion,
          images: producto.imagenUrl ? [producto.imagenUrl] : ['/images/tractodo-logo.jpg'],
        },
        other: {
          'script:ld+json': JSON.stringify(finalSchema)
        }
      };
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos del producto para metadata:', error);
  }

  const fallbackNombreBase = (slugSinId || rawSlug || nombre || '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const fallbackNombre = fallbackNombreBase
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

  console.log(`ℹ️ Usando metadata de fallback para: ${fallbackNombre || rawSlug}`);

  return {
    title: `${fallbackNombre || 'Producto'} | TRACTODO`,
    description: `Compra ${fallbackNombre || 'este producto'} en TRACTODO. Repuestos y refacciones de calidad para maquinaria pesada.`,
    openGraph: {
      title: `${fallbackNombre || 'Producto'} | TRACTODO`,
      description: `Compra ${fallbackNombre || 'este producto'} en TRACTODO. Repuestos y refacciones de calidad.`,
    },
  };
}

export default async function ProductoIndividualPage({ params }) {
    const awaitedParams = await params;
    return <ProductoIndividualClient params={awaitedParams} />;
}
