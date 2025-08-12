// components/SEOProvider/SEOProvider.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { obtenerEstadisticasSEO } from '../../services/seoService';

const SEOContext = createContext();

export const useSEOContext = () => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEOContext debe usarse dentro de SEOProvider');
  }
  return context;
};

export default function SEOProvider({ children }) {
  const [estadisticasSEO, setEstadisticasSEO] = useState(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  const cargarEstadisticas = async () => {
    try {
      setLoadingEstadisticas(true);
      const stats = await obtenerEstadisticasSEO();
      setEstadisticasSEO(stats);
    } catch (error) {
      console.error('Error cargando estadísticas SEO:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const value = {
    estadisticasSEO,
    loadingEstadisticas,
    cargarEstadisticas
  };

  return (
    <SEOContext.Provider value={value}>
      {children}
    </SEOContext.Provider>
  );
}