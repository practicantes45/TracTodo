import React, { useState } from 'react';
import styles from './SearchBar.module.css'; // Importamos los estilos

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleReset = () => {
    setSearchQuery('');
  };

  return (
    <div className={styles.formWrapper}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <button type="submit" className={styles.searchButton}>
          <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
            <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input 
          className={styles.input} 
          placeholder="Nombre / Número de parte / Palabras Clave" 
          required 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.reset} type="reset" onClick={handleReset}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;