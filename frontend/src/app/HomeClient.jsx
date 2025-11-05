'use client';
import './styles/global.css';
import './styles/responsive.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import ProductCarousel from './components/ProductCarousel/ProductCarousel.jsx';
import VerMarcas from './components/VerMarcas/VerMarcas';
import BenefitsSection from './components/BenefitsSection/BenefitsSection';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AdminPanel from './components/AdminPanel/AdminPanel';
import ManageProductsButton from './components/ManageProductsButton/ManageProductsButton';
import SEOHead from './components/SEOHead/SEOHead';
import { useSEO } from '../hooks/useSEO';

export default function HomeClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Hook SEO para datos adicionales (schema, etc.)
    const { seoData } = useSEO('inicio');

    // Función para manejar clic en marca
    const handleMarcaClick = (marca) => {
        console.log(`🔗 Navegando a productos con marca: ${marca}`);
        router.push(`/productos?marca=${encodeURIComponent(marca)}`);
    };

    // Mapeo de nombres de imagen a nombres de marca (para coincidir con el backend)
    const marcaMapping = {
        'Volvo': 'Volvo',
        'Detroit': 'Detroit',
        'Caterpillar': 'Caterpillar',
        'Mercedes-Benz': 'Mercedes Benz',
        'Cummins': 'Cummins',
        'Navistar': 'Navistar'
    };

    // Schema.org para la página de inicio
    const schemaOrganization = {
        "@context": "https://schema.org",
        "@type": "AutoPartsStore",
        "name": "Refacciones para Tractocamión en San Juan del Río | Tractodo - Calidad y Garantía",
        "description": "Compra refacciones para tractocamión de las mejores marcas en Tractodo, San Juan del Río. Envíos a todo México, precios competitivos y atención personalizada.",
        "url": "https://tractodo.com",
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+524272245923",
                "contactType": "customer service",
                "areaServed": "MX",
                "availableLanguage": ["Spanish", "English"],
                "contactOption": "TollFree"
            },
            {
                "@type": "ContactPoint",
                "telephone": "+524272033515",
                "contactType": "sales",
                "areaServed": "MX",
                "availableLanguage": ["Spanish"]
            },
            {
                "@type": "ContactPoint",
                "telephone": "+524272032672",
                "contactType": "technical support",
                "areaServed": "MX"
            },
            {
                "@type": "ContactPoint",
                "telephone": "+524424128926",
                "contactType": "billing",
                "areaServed": "MX"
            }
        ],
        "email": "tractodo62@gmail.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "San Cayetano, Río Extoras 56",
            "addressLocality": "San Juan del Río",
            "addressRegion": "Querétaro",
            "addressCountry": "MX"
        },
        "openingHours": "Mo-Fr 09:00-18:00",
        "areaServed": "Mexico",
        "currenciesAccepted": "MXN",
        "paymentAccepted": ["Cash", "Credit Card"],
        "priceRange": "$$"
    };

    return (
        <>
            {/* SEO Head adicional para Schema */}
            {seoData && (
                <SEOHead
                    schema={schemaOrganization}
                />
            )}

            <div className="layout">
                {/* Navbar principal con estado activo */}
                <Navbar />

                {/* Contenido principal */}
                <main className="mainContent homeMainContent">
                    {/* Hero Section con logo y slogan centrados */}
                    <HeroSection />

                    <section className="whatsappNotice">
                      <div className="whatsappNotice__content">
                        <h2>Recomendación</h2>
                        <p>
En computadora, te sugerimos usar WhatsApp Web.
Desde celular, continúa sin problema y disfruta tu experiencia en TracTodo.                        </p>
                      </div>
                    </section>
                    {/* Números de contacto*/}
                    

                    <section className="carouselSection">
                        <ProductCarousel />
                        <ManageProductsButton />
                    </section>

                    {/* Sección de marcas destacadas */}
                    <section className="brandSection">
                        <h2>MARCAS DESTACADAS</h2>

                        {/* Contenedor de fondo que abarca todo el ancho */}
                        <div className="brandBackgroundContainer">
                            <img src="https://i.postimg.cc/zfgsfzFh/croquis2.png" className="fondoCroquis" alt="Patrón de fondo" />
                        </div>

                        {/* Contenedor de tarjetas centrado y controlado */}
                        <div className="brandCardsContainer">
                            <div className="brandGrid">
                                <div
                                    className="brandCard clickable"
                                    onClick={() => handleMarcaClick(marcaMapping['Volvo'])}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMarcaClick(marcaMapping['Volvo']);
                                        }
                                    }}
                                >
                                    <img src="https://i.postimg.cc/CdpYFRWz/volvo.png" alt="Volvo" className="brandLogo large" />
                                </div>
                                <div
                                    className="brandCard clickable"
                                    onClick={() => handleMarcaClick(marcaMapping['Detroit'])}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMarcaClick(marcaMapping['Detroit']);
                                        }
                                    }}
                                >
                                    <img src="https://i.postimg.cc/q7JJhCgK/detroit.png" alt="Detroit" className="brandLogo large" />
                                </div>
                                <div
                                    className="brandCard clickable"
                                    onClick={() => handleMarcaClick('Caterpillar')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMarcaClick('Caterpillar');
                                        }
                                    }}
                                >
                                    <img src="https://i.postimg.cc/B6tJN9TQ/caterpillar.png" alt="Caterpillar" className="brandLogo large" />
                                </div>
                                <div
                                    className="brandCard clickable"
                                    onClick={() => handleMarcaClick(marcaMapping['Mercedes-Benz'])}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMarcaClick(marcaMapping['Mercedes-Benz']);
                                        }
                                    }}
                                >
                                    <img src="https://i.postimg.cc/RhH457pk/mercedes.png" alt="Mercedes-Benz" className="brandLogo extraLarge" />
                                </div>
                                <div
                                    className="brandCard clickable"
                                    onClick={() => handleMarcaClick(marcaMapping['Cummins'])}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMarcaClick(marcaMapping['Cummins']);
                                        }
                                    }}
                                >
                                    <img src="https://i.postimg.cc/SKgyWNzv/cummins.png" alt="Cummins" className="brandLogo large" />
                                </div>
                                <div
                                    className="brandCard clickable"
                                    onClick={() => handleMarcaClick(marcaMapping['Navistar'])}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleMarcaClick(marcaMapping['Navistar']);
                                        }
                                    }}
                                >
                                    <img src="https://i.postimg.cc/QtPhy4mg/navistar.png" alt="Navistar" className="brandLogo large" />
                                </div>
                            </div>
                        </div>

                        <VerMarcas />
                    </section>

                    {/* Sección de beneficios/ventajas */}
                    <BenefitsSection />
                </main>

                {/* Footer con estado activo */}
                <Footer />
                <AdminPanel />
                {/* Botón ScrollToTop */}
                <ScrollToTop />
            </div>
        </>
    );
}

