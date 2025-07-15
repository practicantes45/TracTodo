'use client';
import { useAuth } from '../../../hooks/useAuth';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const { isAdmin, cerrarSesion } = useAuth();

  console.log('AdminPanel - isAdmin:', isAdmin); // Debug

  if (!isAdmin) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <h3>¡Bienvenido, admin!</h3>
        <button onClick={cerrarSesion} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}