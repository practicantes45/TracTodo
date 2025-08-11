'use client';
import { useEffect, useState } from 'react';
import { obtenerSEOProducto, obtenerSchemaProducto, obtenerSEOPagina, generarMetaTags, insertarSchema } from '../../../services/seoService';

export default function SEOHead({ productoId = null, pagina = null }) {
  const [datosSEO, setDatosSEO] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosSEO = async () => {
      try {
        setLoading(true);

        if (productoId) {
          // Para productos individuales
          console.log(`🔍 Cargando SEO para producto: ${productoId}`);
          const [seoData, schemaData] = await Promise.all([
            obtenerSEOProducto(productoId),
            obtenerSchemaProducto(productoId)
          ]);
          setDatosSEO(seoData);
          setSchema(schemaData);
        } else if (pagina) {
          // Para páginas estáticas
          console.log(`🔍 Cargando SEO para página: ${pagina}`);
          const seoData = await obtenerSEOPagina(pagina);
          setDatosSEO(seoData);
        }
      } catch (error) {
        console.error('❌ Error cargando datos SEO:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosSEO();
  }, [productoId, pagina]);

  // Resto del código igual...
  useEffect(() => {
    if (datosSEO && typeof window !== 'undefined') {
      const metaTags = generarMetaTags(datosSEO);
      
      if (datosSEO.titulo) {
        document.title = datosSEO.titulo;
      }

      metaTags.forEach(tag => {
        let element = null;
        
        if (tag.name) {
          element = document.querySelector(`meta[name="${tag.name}"]`);
          if (!element) {
            element = document.createElement('meta');
            element.setAttribute('name', tag.name);
            document.head.appendChild(element);
          }
          element.setAttribute('content', tag.content);
        } else if (tag.property) {
          element = document.querySelector(`meta[property="${tag.property}"]`);
          if (!element) {
            element = document.createElement('meta');
            element.setAttribute('property', tag.property);
            document.head.appendChild(element);
          }
          element.setAttribute('content', tag.content);
        }
      });
    }
  }, [datosSEO]);

  useEffect(() => {
    if (schema) {
      insertarSchema(schema);
    }
  }, [schema]);

  return null;
}