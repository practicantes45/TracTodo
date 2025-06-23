'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoClose } from 'react-icons/io5';
import VisitCounter from '../VisitCounter/VisitCounter';
import styles from './MobileMenu.module.css';

const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { href: '/', label: 'Inicio' },
        { href: '/productos', label: 'Productos' },
        { href: '/ubicacion', label: 'Ubicación' },
        { href: '/sobre', label: 'Sobre Nosotros' },
        { href: '/entretenimiento', label: 'Extras' }
    ];

    // Cerrar menú cuando cambie la ruta
    useEffect(() => {
        setIsOpen(false);
        // Asegurar que el body vuelva a su estado normal
        document.body.style.overflow = 'unset';
    }, [pathname]);

    // Prevenir scroll del body cuando el menú está abierto
    useEffect(() => {
        if (isOpen) {
            // Guardar la posición actual del scroll
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Restaurar scroll
            const scrollY = document.body.style.top;
            document.body.style.overflow = 'unset';
            document.body.style.position = 'static';
            document.body.style.top = 'auto';
            document.body.style.width = 'auto';
            
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        // Cleanup al desmontar el componente
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.position = 'static';
            document.body.style.top = 'auto';
            document.body.style.width = 'auto';
        };
    }, [isOpen]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLinkClick = (href) => {
        setIsOpen(false);
        
        // Forzar navegación programática
        setTimeout(() => {
            if (pathname !== href) {
                router.push(href);
            }
        }, 100);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Botón hamburguesa */}
            <button 
                className={`${styles.hamburgerButton} ${isOpen ? `${styles.active} ${styles.menuIsOpen}` : ''}`}
                onClick={toggleMenu}
                aria-label="Menú de navegación"
                aria-expanded={isOpen}
            >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
            </button>

            {/* Overlay de fondo */}
            <div 
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={closeMenu}
            ></div>

            {/* Menú lateral */}
            <nav className={`${styles.mobileMenu} ${isOpen ? styles.menuOpen : ''}`}>
                {/* Header del menú con logo y botón cerrar */}
                <div className={styles.menuHeader}>
                    <div className={styles.logoContainer}>
                        <img 
                            src="/imgs/logopeke2.png" 
                            alt="TRACTODO" 
                            className={styles.menuLogo}
                        />
                    </div>
                    {/* Botón de cerrar */}
                    <button 
                        className={styles.closeButton}
                        onClick={closeMenu}
                        aria-label="Cerrar menú"
                    >
                        <IoClose />
                    </button>
                </div>

                {/* Contador de visitas móvil */}
                <div className={styles.mobileCounterSection}>
                    <VisitCounter isMobile={true} />
                </div>

                {/* Lista de navegación */}
                <ul className={styles.menuList}>
                    {navItems.map((item) => (
                        <li key={item.href} className={styles.menuItem}>
                            <button
                                className={`${styles.menuLink} ${pathname === item.href ? styles.activeLink : ''}`}
                                onClick={() => handleLinkClick(item.href)}
                                type="button"
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Footer del menú con slogan */}
                <div className={styles.menuFooter}>
                    <p className={styles.menuSlogan}>
                        <span className={styles.brandName}>Tractodo</span> lo tiene todo.
                    </p>
                </div>
            </nav>
        </>
    );
};

export default MobileMenu;