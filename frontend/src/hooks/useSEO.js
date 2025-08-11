import { useState, useEffect } from 'react';
import { obtenerSEOProducto, obtenerSchemaProducto } from '../services/seoService';

export const useSEO = (productoId) => {
  const [datosSEO, setDatosSEO] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarSEO = async () => {
      if (!productoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`🔍 Hook SEO: Cargando datos para producto ${productoId}`);

        const [seoData, schemaData] = await Promise.all([
          obtenerSEOProducto(productoId).catch(err => {
            console.warn('⚠️ No se pudo obtener SEO:', err);
            return null;
          }),
          obtenerSchemaProducto(productoId).catch(err => {
            console.warn('⚠️ No se pudo obtener Schema:', err);
            return null;
          })
        ]);

        setDatosSEO(seoData);
        setSchema(schemaData);

        console.log('✅ Hook SEO: Datos cargados exitosamente');
      } catch (error) {
        console.error('❌ Hook SEO: Error al cargar datos:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    cargarSEO();
  }, [productoId]);

  return {
    datosSEO,
    schema,
    loading,
    error,
    recargar: () => {
      if (productoId) {
        cargarSEO();
      }
    }
  };
};