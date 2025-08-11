'use client';
import { useEffect, useState } from 'react';
import { obtenerSEOProducto, obtenerSchemaProducto, generarMetaTags, insertarSchema } from '../../services/seoService';

export default function SEOHead({ productoId, datosSEOPersonalizados = null }) {
  const [datosSEO, setDatosSEO] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatosSEO = async () => {
      try {
        setLoading(true);

        // Si hay datos personalizados, usarlos
        if (datosSEOPersonalizados) {
          setDatosSEO(datosSEOPersonalizados);
          setLoading(false);
          return;
        }

        // Si hay ID de producto, obtener datos del backend
        if (productoId) {
          console.log(`🔍 Cargando SEO para producto: ${productoId}`);
          
          const [seoData, schemaData] = await Promise.all([
            obtenerSEOProducto(productoId),
            obtenerSchemaProducto(productoId)
          ]);
          
          setDatosSEO(seoData);
          setSchema(schemaData);
        }
      } catch (error) {
        console.error('❌ Error cargando datos SEO:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosSEO();
  }, [productoId, datosSEOPersonalizados]);

  useEffect(() => {
    // Aplicar meta tags al document
    if (datosSEO && typeof window !== 'undefined') {
      const metaTags = generarMetaTags(datosSEO);
      
      // Actualizar título
      if (datosSEO.titulo) {
        document.title = datosSEO.titulo;
      }

      // Actualizar o crear meta tags
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
    // Insertar Schema.org
    if (schema) {
      insertarSchema(schema);
    }
  }, [schema]);

  // Este componente no renderiza nada visible
  if (loading) {
    return null;
  }

  return null;
}