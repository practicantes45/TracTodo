'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTimes, FaBars } from 'react-icons/fa';
import SearchBar from '../SearchBar/SearchBar';
import styles from './MobileMenu.module.css';

const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Inicio' },
        { href: '/productos', label: 'Productos' },
        { href: '/ubicacion', label: 'Ubicación' },
        { href: '/sobre', label: 'Sobre Nosotros' },
        { href: '/entretenimiento', label: 'Extras' }
    ];

    // Cerrar menú cuando cambia la ruta
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevenir scroll del body cuando el menú está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Botón hamburguesa */}
            <button 
                className={styles.hamburgerButton}
                onClick={toggleMenu}
                aria-label="Abrir menú de navegación"
                aria-expanded={isOpen}
            >
                {isOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Overlay de fondo */}
            <div 
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={closeMenu}
            />

            {/* Menú lateral */}
            <div className={`${styles.mobileMenu} ${isOpen ? styles.menuOpen : ''}`}>
                {/* Header del menú */}
                <div className={styles.menuHeader}>
                    <div className={styles.logoContainer}>
                        <img 
                            src="/imgs/logoblanco.png" 
                            alt="TRACTODO Logo" 
                            className={styles.menuLogo}
                        />
                    </div>
                    <button 
                        className={styles.closeButton}
                        onClick={closeMenu}
                        aria-label="Cerrar menú"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Barra de búsqueda en el menú */}
                <div className={styles.menuSearchContainer}>
                    <SearchBar />
                </div>

                {/* Lista de navegación */}
                <nav className={styles.menuNav}>
                    <ul className={styles.menuList}>
                        {navItems.map((item) => (
                            <li key={item.href} className={styles.menuItem}>
                                <Link 
                                    href={item.href}
                                    className={`${styles.menuLink} ${pathname === item.href ? styles.activeLink : ''}`}
                                    onClick={closeMenu}
                                >
                                    <span className={styles.linkText}>{item.label}</span>
                                    {pathname === item.href && (
                                        <span className={styles.activeIndicator}>●</span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer del menú con información de contacto */}
                <div className={styles.menuFooter}>
                    <div className={styles.contactInfo}>
                        <p className={styles.contactText}>¿Necesitas ayuda?</p>
                        <p className={styles.contactSubtext}>Contáctanos</p>
                    </div>
                    <div className={styles.socialLinks}>
                        <span className={styles.socialText}>Síguenos en redes</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;