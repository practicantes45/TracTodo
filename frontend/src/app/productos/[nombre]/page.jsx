import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';
import { obtenerSEOProducto, obtenerSchemaProducto } from '@/services/seoService';

export const dynamicParams = true;

// ✅ FUNCIÓN MEJORADA: Usa las funciones existentes de seoService
export async function generateMetadata({ params }) {
  const { nombre } = await params;
  
  try {
    // ✅ OBTENER DATOS REALES DEL PRODUCTO
    const nombreParaBusqueda = nombre.replace(/-/g, ' ').toLowerCase();
    
    // Llamar al backend usando tu función existente del servicio de productos
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tractodo-production.up.railway.app/api';
    const response = await fetch(`${API_URL}/productos/nombre/${encodeURIComponent(nombreParaBusqueda)}`);
    
    if (response.ok) {
      const data = await response.json();
      const producto = data.producto;
      
      if (producto) {
        console.log(`📦 Producto encontrado: ${producto.nombre} - Precio: MXN ${producto.precioVentaSugerido || producto.precio || 0}`);
        
        // ✅ INTENTAR OBTENER SEO OPTIMIZADO DEL BACKEND
        let seoData = null;
        let schemaData = null;
        
        try {
          seoData = await obtenerSEOProducto(producto.id);
          schemaData = await obtenerSchemaProducto(producto.id);
          console.log(`🎯 SEO del backend obtenido para: ${producto.nombre}`);
        } catch (error) {
          console.warn('No se pudo obtener SEO del backend, usando generación local:', error);
        }
        
        // ✅ GENERAR SCHEMA.ORG CON PRECIO CORRECTO EN MXN (respaldo o del backend)
        const finalSchema = schemaData || {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": producto.nombre,
          "description": producto.descripcion || `Refacción ${producto.nombre} para tractocamión`,
          "sku": producto.numeroParte || producto.id,
          "brand": { "@type": "Brand", "name": producto.marca || "Tractodo" },
          "offers": {
            "@type": "Offer",
            "price": (producto.precioVentaSugerido || producto.precio || 0).toString(),
            "priceCurrency": "MXN", // ✅ FORZAR MXN EXPLÍCITAMENTE
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
        
        // ✅ ASEGURAR QUE EL SCHEMA TENGA MXN (incluso si viene del backend)
        if (finalSchema.offers) {
          finalSchema.offers.priceCurrency = "MXN";
          finalSchema.offers.price = (producto.precioVentaSugerido || producto.precio || 0).toString();
        }
        
        console.log(`✅ Schema.org final para ${producto.nombre}: ${finalSchema.offers?.priceCurrency} ${finalSchema.offers?.price}`);
        
        // ✅ USAR SEO OPTIMIZADO O GENERAR BÁSICO
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
          // ✅ AGREGAR SCHEMA.ORG AL HTML INICIAL
          other: {
            'script:ld+json': JSON.stringify(finalSchema)
          }
        };
      }
    } else {
      console.warn(`⚠️ No se pudo obtener producto: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos del producto para metadata:', error);
  }
  
  // ✅ FALLBACK: Si no se puede obtener el producto real
  const nombreDecodificado = decodeURIComponent(nombre);
  const nombreFormateado = nombreDecodificado
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
    
  console.log(`📝 Usando metadata de fallback para: ${nombreFormateado}`);
    
  return {
    title: `${nombreFormateado} | TRACTODO`,
    description: `Compra ${nombreFormateado} en TRACTODO. Repuestos y refacciones de calidad para maquinaria pesada.`,
    openGraph: {
      title: `${nombreFormateado} | TRACTODO`,
      description: `Compra ${nombreFormateado} en TRACTODO. Repuestos y refacciones de calidad.`,
    },
  };
}

export default async function ProductoIndividualPage({ params }) {
    const awaitedParams = await params;
    return <ProductoIndividualClient params={awaitedParams} />;
}