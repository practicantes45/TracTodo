'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBar from '../SearchBar/SearchBar';
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
        <nav className={styles.appBar}>
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
            <div className={styles.searchSection}>
                <SearchBar />
            </div>
        </nav>
    );
};

export default Navbar;