import React from 'react';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroOverlay}>
        <div className={styles.heroContent}>
          <img
            src="https://i.postimg.cc/GtqNfHdW/logopeke.png"
            className={styles.logoImage}
            alt="Logo TRACTODO"
          />
          <p className={styles.heroSlogan}>TracTodo lo tiene todo</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;