import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import styles from './ScrollToTop.module.css';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Función para detectar scroll y mostrar/ocultar el botón
    useEffect(() => {
        const toggleVisibility = () => {
            // Obtener la posición actual del scroll
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Mostrar el botón después de hacer scroll más de 300px hacia abajo
            if (scrollTop > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        // Cleanup del event listener
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    // Función para scroll suave al inicio
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            className={`${styles.scrollToTop} ${isVisible ? styles.visible : ''}`}
            onClick={scrollToTop}
            aria-label="Volver al inicio"
            title="Volver al inicio"
        >
            <FaChevronUp className={styles.icon} />
        </button>
    );
};

export default ScrollToTop;