import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    // Detectar tipo de conexión
    if ('connection' in navigator) {
      const connection = navigator.connection;
      setConnectionType(connection.effectiveType);
      
      // Considerar conexión lenta si es 2G o slow-2g
      setIsSlowConnection(['slow-2g', '2g'].includes(connection.effectiveType));
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType);
        setIsSlowConnection(['slow-2g', '2g'].includes(connection.effectiveType));
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, []);

  return { isSlowConnection, connectionType };
};
