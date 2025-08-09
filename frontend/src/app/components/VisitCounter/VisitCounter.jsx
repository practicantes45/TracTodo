'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaEye } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import styles from './VisitCounter.module.css';
import { registrarVista, obtenerContadorVistas } from '../../../services/visitService';

const VisitCounter = ({ isMobile = false }) => {
    const [visitCount, setVisitCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [error, setError] = useState(null);

    // Obtener la ruta actual
    const pathname = usePathname();

    // Refs para control estricto
    const isInitialized = useRef(false);
    const isMounted = useRef(false);
    const initPromise = useRef(null);

    // Verificar si la página actual está permitida - SOLO página de inicio
    const isPageAllowed = () => {
        return pathname === '/';
    };

    // Si la página no está permitida, no renderizar el componente
    if (!isPageAllowed()) {
        return null;
    }

    // Detectar tamaño de pantalla
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 769);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Control de scroll para visibilidad
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsVisible(scrollY < 100);
        };

        if (isLargeScreen && !isMobile) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [isLargeScreen, isMobile]);

    // Inicialización única del contador
    useEffect(() => {
        if (typeof window === 'undefined') return;

        isMounted.current = true;

        // Si ya se inicializó o hay una inicialización en curso, no hacer nada
        if (isInitialized.current || initPromise.current) {
            return;
        }

        isInitialized.current = true;

        const initializeCounter = async () => {
            try {
                if (!isMounted.current) return;

                setIsLoading(true);
                setError(null);

                // Clave para controlar vistas por sesión de navegación
                const sessionKey = 'tractodo_visit_session';
                const currentSession = sessionStorage.getItem(sessionKey);
                const newSessionId = Date.now().toString();

                console.log('🔄 Inicializando contador...', { currentSession, newSessionId });

                if (!currentSession) {
                    // Primera visita en esta sesión - registrar vista
                    console.log('✅ Primera visita - registrando vista');
                    const response = await registrarVista();

                    if (!isMounted.current) return;

                    setVisitCount(response.vistasTotales);
                    sessionStorage.setItem(sessionKey, newSessionId);
                } else {
                    // Ya existe sesión - solo obtener contador
                    console.log('📊 Sesión existente - obteniendo contador');
                    const response = await obtenerContadorVistas();

                    if (!isMounted.current) return;

                    setVisitCount(response.vistasTotales);
                }

            } catch (error) {
                console.error('❌ Error al inicializar contador:', error);

                if (!isMounted.current) return;

                setError('Error de conexión');

                // Fallback: usar contador local
                const fallbackCount = getFallbackCount();
                setVisitCount(fallbackCount);
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        // Crear promesa de inicialización
        initPromise.current = initializeCounter();

        return () => {
            isMounted.current = false;
        };
    }, [pathname]);

    const getFallbackCount = () => {
        if (typeof window === 'undefined') return 15847;

        const baseCount = 15847;
        const sessionKey = 'tractodo_visit_session';
        const localCountKey = 'tractodo_local_count';

        // Verificar si ya registramos en esta sesión
        const hasSession = sessionStorage.getItem(sessionKey);

        if (!hasSession) {
            // Primera vez en esta sesión
            const currentLocalCount = parseInt(localStorage.getItem(localCountKey) || '0');
            const newCount = currentLocalCount + 1;

            localStorage.setItem(localCountKey, newCount.toString());
            sessionStorage.setItem(sessionKey, Date.now().toString());

            return baseCount + newCount;
        } else {
            // Sesión existente
            const localCount = parseInt(localStorage.getItem(localCountKey) || '0');
            return baseCount + localCount;
        }
    };

    const formatNumber = (num) => {
        if (!num || isNaN(num)) return '0';
        return num.toLocaleString('es-MX');
    };

    // Determinar clases CSS
    const shouldFloat = isLargeScreen && !isMobile;
    const counterClasses = `${styles.visitCounter} ${isMobile ? styles.mobileVersion :
            shouldFloat ? `${styles.floatingCounter} ${!isVisible ? styles.hidden : ''}` : ''
        }`;

    return (
        <div className={counterClasses}>
            <div className={styles.counterContainer}>
                <div className={styles.iconContainer}>
                    <FaEye className={styles.eyeIcon} />
                </div>

                <div className={styles.counterContent}>
                    <div className={styles.counterLabel}>
                        {isMobile ? 'Visitas Totales' : 'Visitas'}
                        {error && (
                            <span className={styles.errorIndicator}>ERROR</span>
                        )}
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
            </div>

            <div className={styles.glowEffect}></div>
            <div className={styles.pulse}></div>
        </div>
    );
};

export default VisitCounter;