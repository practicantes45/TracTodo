'use client';
import { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';
import { registrarEventoCookie } from '../../../services/trackingService';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = async () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Registrar evento de aceptación
    const resultado = await registrarEventoCookie('accepted');
    
    if (resultado) {
      console.log('✅ Cookies aceptadas y sistema de tracking activado');
    } else {
      console.error('❌ Error al activar sistema de tracking');
    }
    
    setIsVisible(false);
    
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('cookiesAccepted'));
  };

  const handleReject = async () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Registrar evento de rechazo
    await registrarEventoCookie('rejected');
    console.log('❌ Cookies rechazadas - sistema de tracking desactivado');
    
    setIsVisible(false);
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('cookiesRejected'));
  };

  if (!isVisible) return null;

  return (
    <>
      <div className={styles.cookieOverlay} />
      
      <div className={styles.cookieModal}>
        <div className={styles.cookieContent}>
          <div className={styles.cookieHeader}>
            <span className={styles.cookieEmoji}>🍪</span>
            <h3>¡Nos encantan las cookies!</h3>
          </div>

          <p className={styles.cookieDescription}>
            Usamos cookies para mejorar tu experiencia, recordar tus preferencias y 
            recomendarte productos que podrían interesarte basándose en tu navegación.
            ¿Nos das permiso para usarlas?
          </p>

          <div className={styles.cookieActions}>
            <button 
              className={`${styles.cookieBtn} ${styles.cookieBtnReject}`}
              onClick={handleReject}
            >
              No, gracias
            </button>
            
            <button 
              className={`${styles.cookieBtn} ${styles.cookieBtnAccept}`}
              onClick={handleAccept}
            >
              ¡Acepto!
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;