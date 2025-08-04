'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import styles from './SearchBar.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchBarContent() {
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

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        historyRef.current && 
        !historyRef.current.contains(event.target)
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

  // Función para cargar el historial de localStorage
  const loadSearchHistory = () => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(TIMESTAMP_KEY);
      
      if (savedHistory && savedTimestamp) {
        const now = new Date().getTime();
        const timestamp = parseInt(savedTimestamp);
        
        // Si han pasado más de 24 horas, limpiar el historial
        if (now - timestamp > TWENTY_FOUR_HOURS) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TIMESTAMP_KEY);
          setSearchHistory([]);
        } else {
          setSearchHistory(JSON.parse(savedHistory));
        }
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
    }
  };

  // Función para guardar búsqueda en el historial
  const saveToHistory = (query) => {
    try {
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery) return;

      let newHistory = [...searchHistory];
      
      // Remover si ya existe
      newHistory = newHistory.filter(item => item.toLowerCase() !== trimmedQuery);
      
      // Agregar al inicio
      newHistory.unshift(query.trim());
      
      // Limitar a MAX_HISTORY_ITEMS
      if (newHistory.length > MAX_HISTORY_ITEMS) {
        newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      }

      setSearchHistory(newHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      localStorage.setItem(TIMESTAMP_KEY, new Date().getTime().toString());
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Función para limpiar historial
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    setShowHistory(false);
  };

  // Función para realizar búsqueda
  const handleSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    console.log('🔍 Realizando búsqueda:', trimmedQuery);
    
    // Guardar en historial
    saveToHistory(trimmedQuery);
    
    // Navegar a productos con parámetro de búsqueda
    router.push(`/productos?busqueda=${encodeURIComponent(trimmedQuery)}`);
    
    // Ocultar historial
    setShowHistory(false);
    setIsInputFocused(false);
    
    // Blur del input en móvil para ocultar teclado
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleHistoryClick = (historyItem) => {
    setSearchQuery(historyItem);
    handleSearch(historyItem);
  };

  const filteredHistory = searchHistory.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.searchContainer}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Buscar productos..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          🔍
        </button>
      </form>

      {/* Historial de búsquedas */}
      {showHistory && isInputFocused && (filteredHistory.length > 0 || searchHistory.length > 0) && (
        <div ref={historyRef} className={styles.historyDropdown}>
          <div className={styles.historyHeader}>
            <span className={styles.historyTitle}>Búsquedas recientes</span>
            <button 
              className={styles.clearHistoryBtn}
              onClick={clearHistory}
              type="button"
            >
              Limpiar
            </button>
          </div>
          <div className={styles.historyList}>
            {(searchQuery ? filteredHistory : searchHistory).map((item, index) => (
              <button
                key={index}
                className={styles.historyItem}
                onClick={() => handleHistoryClick(item)}
                type="button"
              >
                🔍 {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SearchBar = () => {
  return (
    <Suspense fallback={<div className={styles.searchContainer}><div className={styles.searchForm}><input className={styles.searchInput} placeholder="Cargando búsqueda..." disabled /><button className={styles.searchButton}>🔍</button></div></div>}>
      <SearchBarContent />
    </Suspense>
  );
};

export default SearchBar;