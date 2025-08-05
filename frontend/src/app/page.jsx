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
import ManageProductsButton from './components/ManageProductsButton/ManageProductsButton'; // AGREGADO

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

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

    return (
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
                                onClick={() => handleMarcaClick('Otros')}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleMarcaClick('Otros');
                                    }
                                }}
                            >
                                <img src="https://i.postimg.cc/B6tJN9TQ/caterpillar.png" alt="Otras marcas" className="brandLogo large" />
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
    );
}