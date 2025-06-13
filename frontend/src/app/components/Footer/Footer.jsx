'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaLinkedin,
  FaYoutube,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const [copiedItem, setCopiedItem] = useState('');

  const socialLinks = [
    { icon: FaLinkedin, href: 'http://www.linkedin.com/in/tractodo-refacciones-36abaa369', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://www.youtube.com/@TRACTODO', label: 'YouTube' },
    { icon: FaFacebookF, href: 'https://www.facebook.com/profile.php?id=100070995052516', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://www.instagram.com/tractodo.diesel.parts/reels/', label: 'Instagram' },
    { icon: FaTiktok, href: 'https://www.tiktok.com/@tractodo4', label: 'TikTok' }
  ];

  const quickLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Productos' },
    { href: '/ubicacion', label: 'Ubicación' },
    { href: '/sobre', label: 'Sobre Nosotros' },
    { href: '/entretenimiento', label: 'Entretenimiento' },
  ];

  const phoneNumbers = [
    { name: 'Alan', number: '427-224-59-23' },
    { name: 'Laura', number: '427-203-35-15' },
    { name: 'Oscar', number: '427-203-26-72' },
    { name: 'Hugo', number: '442-412-89-26' }
  ];

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(type);
      setTimeout(() => setCopiedItem(''), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Columna 1: Enlaces */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Enlaces</h3>
          <ul className={styles.linksList}>
            {quickLinks.map((link, index) => (
              <li key={index}>
                <Link
                  href={link.href}
                  className={`${styles.footerLink} ${pathname === link.href ? styles.activeLink : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 2: Síguenos */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Síguenos</h3>
          <div className={styles.socialContainer}>
            {socialLinks.map((social, index) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  className={styles.socialLink}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconComponent />
                </a>
              );
            })}
          </div>
        </div>

        {/* Columna 3: Información de Contacto */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Contacto</h3>
          <div className={styles.contactInfo}>
            {/* Ubicación */}
            <div className={styles.contactItem}>
              <FaMapMarkerAlt className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <span
                  className={styles.clickableContact}
                  onClick={() => copyToClipboard('Río Extoras 56, San Cayetano, 76806 San Juan del Río, Qro.', 'location')}
                >
                Río Extoras 56, San Cayetano<br />San Juan del Río, Querétaro
                </span>
                {copiedItem === 'location' && (
                  <div className={styles.copyTooltip}>
                    ¡Ubicación copiada!
                  </div>
                )}
              </div>
            </div>

            {/* Números de teléfono agrupados */}
            <div className={styles.contactItem}>
              <FaPhone className={styles.contactIcon} />
              <div className={styles.phoneGroup}>
                <div className={styles.phoneGridContainer}>
                  {phoneNumbers.map((phone, index) => (
                    <div key={index} className={styles.phoneNumber}>
                      <span
                        className={styles.clickableContact}
                        onClick={() => copyToClipboard(phone.number, `phone-${index}`)}
                      >
                        <span className={styles.phoneName}>{phone.name}:</span> {phone.number}
                      </span>
                      {copiedItem === `phone-${index}` && (
                        <div className={styles.copyTooltip}>
                          ¡Número copiado!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className={styles.contactItem}>
              <FaEnvelope className={styles.contactIcon} />
              <div className={styles.contactContent}>
                <span
                  className={styles.clickableContact}
                  onClick={() => copyToClipboard('contacto@tractodo.com', 'email')}
                >
                  contacto@tractodo.com
                </span>
                {copiedItem === 'email' && (
                  <div className={styles.copyTooltip}>
                    ¡Email copiado!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección inferior con slogan y copyright */}
      <div className={styles.footerBottom}>
        <div className={styles.slogan}>
          <span className={styles.brandName}>Tractodo</span> lo tiene todo.
        </div>
        <div className={styles.copyright}>
          <p>&copy; {currentYear} TRACTODO - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;