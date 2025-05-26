import React from 'react';
import Link from 'next/link';
import styles from './VerMarcas.module.css';

const VerMasMarcasButton = () => {
  return (
    <div className={styles.buttonContainer}>
      <Link href="/marcas" passHref>
        <button className={styles.button}>
          <span className={styles.buttonText}>Ver más marcas</span>
        </button>
      </Link>
    </div>
  );
};

export default VerMasMarcasButton;