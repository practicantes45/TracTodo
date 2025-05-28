'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '../SearchBar/SearchBar';
import MobileMenu from '../MobileMenu/MobileMenu';
import styles from './Navbar.module.css';

const Navbar = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Inicio' },
        { href: '/productos', label: 'Productos' },
        { href: '/ubicacion', label: 'Ubicación' },
        { href: '/sobre', label: 'Sobre Nosotros' },
        { href: '/entretenimiento', label: 'Entretenimiento' }
    ];

    return (
        <>
            {/* SearchBar móvil - encima de todo */}
            <div className={styles.mobileSearchWrapper}>
                <div className={styles.mobileSearchContainer}>
                    <div className={styles.mobileMenuButton}>
                        <MobileMenu />
                    </div>
                    <div className={styles.mobileSearchBar}>
                        <SearchBar />
                    </div>
                </div>
            </div>

            {/* Navbar desktop normal */}
            <nav className={styles.appBar}>
                {/* Menú hamburguesa - solo visible en móvil (oculto porque ya está arriba) */}
                <div className={styles.mobileMenuContainer}>
                    <MobileMenu />
                </div>

                {/* Navegación desktop - oculta en móvil */}
                <ul className={styles.navList}>
                    {navItems.map((item) => (
                        <li key={item.href} className={styles.navItem}>
                            <Link 
                                href={item.href}
                                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* SearchBar desktop - visible solo en desktop */}
                <div className={styles.searchSection}>
                    <SearchBar />
                </div>
            </nav>
        </>
    );
};

export default Navbar;