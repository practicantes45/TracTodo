'use client';
import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import SearchBar from '../SearchBar/SearchBar';
import MobileMenu from '../MobileMenu/MobileMenu';
import VisitCounter from '../VisitCounter/VisitCounter';
import styles from './Navbar.module.css';

const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Productos' },
    { href: '/ubicacion', label: 'Ubicación' },
    { href: '/sobre', label: 'Sobre Nosotros' },
    { href: '/entretenimiento', label: 'Entretenimiento' },
  ];

  return (
    <>
      {/* ===== Barra superior SOLO móvil: menú + buscador ===== */}
      <div className={styles.mobileSearchWrapper}>
        <div className={styles.mobileSearchContainer}>
          <div className={styles.mobileMenuButton}>
            <MobileMenu />
          </div>
          <Link href="/" className={styles.mobileBrand} aria-label="Ir a inicio">
            <Image
              src="/logo-tractodo.png"
              alt="TRACTODO"
              width={600}
              height={300}
              className={styles.mobileLogoImg}
              priority
            />
          </Link>
          <div className={styles.mobileSearchBar}>
            <Suspense fallback={<div>Cargando...</div>}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ===== AppBar / Navbar Desktop ===== */}
      <nav className={styles.appBar} role="navigation" aria-label="Principal">
        {/* Marca / Logo (más grande y responsive) */}
        <div className={styles.flagAccent}>
          <Link href="/" className={styles.brand} aria-label="Ir a inicio">
            {/* Coloca tu archivo en /public/logo-tractodo.png */}
            <Image
              src="/logo-tractodo.png"
              alt="TRACTODO"
              width={800}
              height={400}
              className={styles.logoImg}
              priority
            />
          </Link>
        </div>

        {/* Navegación Desktop */}
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                prefetch
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Buscador Desktop */}
        <div className={styles.searchSection}>
          <Suspense fallback={<div>Cargando...</div>}>
            <SearchBar />
          </Suspense>
        </div>
      </nav>

      {/* Contador flotante independiente */}
      <VisitCounter />
    </>
  );
};

export default Navbar;

