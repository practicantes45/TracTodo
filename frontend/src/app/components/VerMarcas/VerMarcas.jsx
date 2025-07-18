'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './VerMarcas.module.css';

const VerMasMarcasButton = () => {
  const router = useRouter();

  const handleClick = () => {
    console.log('🔗 Navegando a productos con marca: Otros');
    router.push('/productos?marca=Otros');
  };

  return (
    <div className={styles.buttonContainer}>
      <button className={styles.button} onClick={handleClick}>
        <span className={styles.buttonText}>Ver más marcas</span>
      </button>
    </div>
  );
};

export default VerMasMarcasButton;