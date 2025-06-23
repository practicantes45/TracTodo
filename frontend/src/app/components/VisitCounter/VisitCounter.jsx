'use client';
import React, { useState, useEffect } from 'react';
import { FaEye, FaUsers } from 'react-icons/fa';
import styles from './VisitCounter.module.css';

/**
 * DEMO: Contador de Visitas Visual
 * 
 * Este es un componente de demostración que simula un contador de visitas.
 * 
 * IMPORTANTE: 
 * - Actualmente usa localStorage para demo visual únicamente
 * - El número base (15,847) es simulado para mostrar el diseño
 * - Para producción, debe conectarse a un backend real con:
 *   • Base de datos para almacenar visitas reales
 *   • API endpoint para obtener/actualizar contador
 *   • Lógica para visitantes únicos (IP, cookies, etc.)
 *   • Validación y límites de rate limiting
 * 
 * @param {boolean} isMobile - Si true, usa estilos para versión móvil
 */
const VisitCounter = ({ isMobile = false }) => {
    const [visitCount, setVisitCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // DEMO: Contador visual simulado hasta implementar backend
        const getDemoCount = () => {
            // Número base simulado para demo
            const baseCount = 15847;
            
            // Obtener contador local solo para demo visual
            const localDemo = localStorage.getItem('tractodo_demo_count');
            const localIncrement = localDemo ? parseInt(localDemo) : 0;
            
            return baseCount + localIncrement;
        };

        // DEMO: Simular incremento local para demo
        const updateDemoCount = () => {
            const currentLocal = localStorage.getItem('tractodo_demo_count');
            const localCount = currentLocal ? parseInt(currentLocal) : 0;
            const newLocalCount = localCount + 1;
            
            // Guardar solo el incremento local
            localStorage.setItem('tractodo_demo_count', newLocalCount.toString());
            
            return getDemoCount();
        };

        // Simular carga y mostrar contador demo
        const timer = setTimeout(() => {
            const count = updateDemoCount();
            setVisitCount(count);
            setIsLoading(false);
        }, 800); // Tiempo de carga más realista

        return () => clearTimeout(timer);
    }, []);

    // Formatear número con separadores de miles
    const formatNumber = (num) => {
        return num.toLocaleString('es-MX');
    };

    return (
        <div className={`${styles.visitCounter} ${isMobile ? styles.mobileVersion : ''}`}>
            <div className={styles.counterContainer}>
                <div className={styles.iconContainer}>
                    <FaEye className={styles.eyeIcon} />
                </div>
                
                <div className={styles.counterContent}>
                    <div className={styles.counterLabel}>
                        {isMobile ? 'Visitas Totales' : 'Visitas'}
                        <span className={styles.demoIndicator}>DEMO</span>
                    </div>
                    <div className={styles.counterNumber}>
                        {isLoading ? (
                            <div className={styles.loading}>
                                <span className={styles.loadingDot}></span>
                                <span className={styles.loadingDot}></span>
                                <span className={styles.loadingDot}></span>
                            </div>
                        ) : (
                            <span className={styles.number}>
                                {formatNumber(visitCount)}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.usersIcon}>
                    <FaUsers />
                </div>
            </div>

            {/* Efectos decorativos */}
            <div className={styles.glowEffect}></div>
            <div className={styles.pulse}></div>
        </div>
    );
};

export default VisitCounter;