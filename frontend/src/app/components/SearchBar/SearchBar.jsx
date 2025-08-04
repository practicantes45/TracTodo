'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef(null);
  const historyRef = useRef(null);

  // Constantes para el historial
  const STORAGE_KEY = 'searchHistory';
  const TIMESTAMP_KEY = 'searchHistoryTimestamp';
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 horas en millisegundos
  const MAX_HISTORY_ITEMS = 8;

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cargar historial del localStorage al montar el componente
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Limpiar el campo de búsqueda cuando se navega a /productos sin parámetros
  useEffect(() => {
    const busquedaParam = searchParams.get('busqueda');
    if (!busquedaParam) {
      setSearchQuery('');
    } else {
      setSearchQuery(busquedaParam);
    }
  }, [searchParams]);

  // Manejar clicks fuera del componente para cerrar el historial
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        historyRef.current && 
        !historyRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowHistory(false);
        setIsInputFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadSearchHistory = () => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
      const currentTime = Date.now();

      if (savedTimestamp) {
        const timeDiff = currentTime - parseInt(savedTimestamp);
        
        // Si han pasado más de 24 horas, limpiar el historial
        if (timeDiff > TWENTY_FOUR_HOURS) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
          setSearchHistory([]);
          return;
        }
      }

      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
      }

      // Si no existe timestamp, crear uno nuevo
      if (!savedTimestamp) {
        localStorage.setItem(TIMESTAMP_KEY, currentTime.toString());
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
    }
  };

  const saveSearchToHistory = (searchTerm) => {
    try {
      const trimmedTerm = searchTerm.trim();
      if (!trimmedTerm) return;

      const updatedHistory = [
        trimmedTerm,
        ...searchHistory.filter(item => item.toLowerCase() !== trimmedTerm.toLowerCase())
      ].slice(0, MAX_HISTORY_ITEMS);

      setSearchHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      
      // Actualizar timestamp
      localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearSearchHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TIMESTAMP_KEY);
      setSearchHistory([]);
      setShowHistory(false);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setShowHistory(false);
    setIsInputFocused(false);
    // Si estamos en la página de productos, resetear completamente
    if (window.location.pathname === '/productos') {
      router.push('/productos');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('🔍 Realizando búsqueda con prioridades:', searchQuery.trim());
      
      // Guardar en el historial
      saveSearchToHistory(searchQuery.trim());
      
      // Ocultar historial
      setShowHistory(false);
      setIsInputFocused(false);
      
      // Redirigir a productos con el término de búsqueda
      router.push(`/productos?busqueda=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // Si está vacío, ir a productos sin búsqueda
      router.push('/productos');
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    
    // Mostrar historial si hay elementos y el input está enfocado
    if (searchHistory.length > 0 && isInputFocused) {
      setShowHistory(true);
    } else {
      setShowHistory(false);
    }
  };

  const handleHistoryItemClick = (historyItem) => {
    setSearchQuery(historyItem);
    setShowHistory(false);
    setIsInputFocused(false);
    
    // Realizar búsqueda automáticamente
    router.push(`/productos?busqueda=${encodeURIComponent(historyItem)}`);
  };

  const removeHistoryItem = (e, itemToRemove) => {
    e.stopPropagation();
    try {
      const updatedHistory = searchHistory.filter(item => item !== itemToRemove);
      setSearchHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      
      if (updatedHistory.length === 0) {
        setShowHistory(false);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
      }
    } catch (error) {
      console.error('Error removing history item:', error);
    }
  };

  const placeholder = isMobile 
    ? "Número de parte / Nombre / Palabras Clave" 
    : "Número de parte / Nombre / Palabras Clave";

  const filteredHistory = searchHistory.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.formWrapper}>
      <div className={styles.searchContainer}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <button type="submit" className={styles.searchButton}>
            <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
              <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input 
            ref={inputRef}
            className={styles.input} 
            placeholder={placeholder}
            required 
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
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

        {/* Historial de búsqueda */}
        {showHistory && isInputFocused && filteredHistory.length > 0 && (
          <div ref={historyRef} className={styles.historyDropdown}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>Búsquedas recientes</span>
              <button 
                className={styles.clearHistoryBtn}
                onClick={clearSearchHistory}
                aria-label="Limpiar historial"
              >
                Limpiar todo
              </button>
            </div>
            <div className={styles.historyList}>
              {filteredHistory.map((item, index) => (
                <div 
                  key={index}
                  className={styles.historyItem}
                  onClick={() => handleHistoryItemClick(item)}
                >
                  <div className={styles.historyItemContent}>
                    <svg className={styles.historyIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className={styles.historyText}>{item}</span>
                  </div>
                  <button 
                    className={styles.removeHistoryBtn}
                    onClick={(e) => removeHistoryItem(e, item)}
                    aria-label={`Eliminar "${item}" del historial`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;