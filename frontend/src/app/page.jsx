'use client';
import './styles/global.css';
import './styles/responsive.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import ContactNumbers from './components/ContactNumbers/ContactNumbers';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import VerMarcas from './components/VerMarcas/VerMarcas';
import BenefitsSection from './components/BenefitsSection/BenefitsSection';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AdminPanel from './components/AdminPanel/AdminPanel';
import ManageProductsButton from './components/ManageProductsButton/ManageProductsButton';
import SEOHead from './components/SEOHead/SEOHead';
import { useSEO } from './../hooks/useSEO';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    
    // Hook SEO para página de inicio
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
        "name": "Tractodo",
        "description": "Refaccionaria especializada en partes y componentes para tractocamión",
        "url": "https://tractodo.com",
        "telephone": "+52-427-XXX-XXXX",
        "email": "contacto@tractodo.com",
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
            {/* SEO Head */}
            {seoData && (
                <SEOHead
                    title={seoData.title}
                    description={seoData.description}
                    keywords={seoData.keywords}
                    ogTitle={seoData.ogTitle}
                    ogDescription={seoData.ogDescription}
                    ogImage={seoData.ogImage}
                    ogUrl={seoData.ogUrl}
                    canonicalUrl={seoData.canonicalUrl}
                    schema={schemaOrganization}
                />
            )}

            <div className="layout">
                {/* Navbar principal con estado activo */}
                <Navbar />

                {/* Contenido principal */}
                <main className="mainContent">
                    {/* Hero Section con logo y slogan centrados */}
                    <HeroSection />

                    {/* Números de contacto*/}
                    <ContactNumbers pageContext="home" />

                    <section className="carouselSection">
                        <ProductCarousel />
                    </section>

                    {/* Sección Ver Marcas con mapeo correcto */}
                    <VerMarcas 
                        onMarcaClick={handleMarcaClick}
                        marcaMapping={marcaMapping}
                    />

                    {/* Sección de beneficios y características */}
                    <BenefitsSection />

                    {/* Panel de administración (solo visible para admins) */}
                    <AdminPanel />
                    <ManageProductsButton />
                </main>

                {/* Footer con información de contacto y enlaces */}
                <Footer />

                {/* Botón scroll to top */}
                <ScrollToTop />
            </div>
        </>
    );
}