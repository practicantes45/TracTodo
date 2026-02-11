import React from 'react';
import Link from 'next/link';
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

          <h1 className={styles.heroTitle}>
            TU MEJOR OPCIÓN EN REFACCIONES DIÉSEL
          </h1>
          <div className={styles.heroCTAs}>
            <Link href="/productos" className={styles.secondaryBtn} aria-label="Ver refacciones">
              Ver refacciones
            </Link>
          </div>

          <ul className={styles.heroBullets} aria-label="Beneficios principales">
            <li>Envío a todo México</li>
            <li>Asesoría experta</li>
            <li>Garantía en cada compra</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
