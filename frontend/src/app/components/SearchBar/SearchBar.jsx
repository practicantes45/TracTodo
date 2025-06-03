'use client';
import React, { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil para ajustar el placeholder
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleReset = () => {
    setSearchQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Aquí puedes agregar la lógica de búsqueda
      console.log('Buscando:', searchQuery);
      // Por ejemplo, redirigir a una página de resultados
      // router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Placeholders diferentes para móvil y desktop
  const placeholder = isMobile 
    ? "Nombre / Número de parte / Palabras Clave" 
    : "Nombre / Número de parte / Palabras Clave";

  return (
    <div className={styles.formWrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <button type="submit" className={styles.searchButton}>
          <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
            <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input 
          className={styles.input} 
          placeholder={placeholder}
          required 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
          name="search"
          aria-label="Buscar productos"
        />
        <button 
          className={styles.reset} 
          type="reset" 
          onClick={handleReset}
          aria-label="Limpiar búsqueda"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;