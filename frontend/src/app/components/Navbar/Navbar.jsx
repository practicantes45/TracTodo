'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import MobileMenu from '../MobileMenu/MobileMenu';
import VisitCounter from '../VisitCounter/VisitCounter';
import styles from './Navbar.module.css';

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { href: '/', label: 'Inicio' },
        { href: '/productos', label: 'Productos' },
        { href: '/ubicacion', label: 'Ubicación' },
        { href: '/sobre', label: 'Sobre Nosotros' },
        { href: '/entretenimiento', label: 'Entretenimiento' }
    ];

    const handleNavClick = (href, e) => {
        e.preventDefault();

        // NUEVO: Si hacemos clic en "Productos", resetear cualquier búsqueda
        if (href === '/productos') {
            console.log('🔄 Navegando a productos - reseteando búsqueda');
            router.push('/productos'); // Esto eliminará cualquier parámetro de búsqueda
        } else if (pathname !== href) {
            router.push(href);
        }
    };

    return (
        <>
            {/* SearchBar móvil - encima de todo */}
            <div className={styles.mobileSearchWrapper}>
                <div className={styles.mobileSearchContainer}>
                    <div className={styles.mobileMenuButton}>
                        <MobileMenu />
                    </div>
                    <div className={styles.mobileSearchBar}>
                        <Suspense fallback={<div>Cargando...</div>}>
                            <SearchBar />
                        </Suspense>
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
                                className={`${styles.navLink} ${pathname === item.href ?
                                styles.active : ''}`}
                                onClick={(e) => handleNavClick(item.href, e)}
                                prefetch={true}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Sección central con contador de visitas - REMOVIDO */}
                <div className={styles.centerSection}>
                    {/* El contador ahora se maneja solo como flotante */}
                </div>

                {/* SearchBar desktop - visible solo en desktop */}
                <div className={styles.searchSection}>
                    <Suspense fallback={<div>Cargando...</div>}>
                        <SearchBar />
                    </Suspense>
                </div>
            </nav>

            {/* Contador flotante independiente - SOLO ESTE SE MANTIENE */}
            <VisitCounter />
        </>
    );
};

export default Navbar;