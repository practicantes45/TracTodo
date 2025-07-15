// hooks/useProductNavigation.js
import { useState } from 'react';

export const useProductNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToProduct = async (producto) => {
    try {
      setIsNavigating(true);
      console.log('Producto seleccionado:', producto);
      // Por ahora solo console.log para diseño
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsNavigating(false);
    } catch (error) {
      console.error('Error:', error);
      setIsNavigating(false);
    }
  };

  return {
    navigateToProduct,
    isNavigating
  };
};