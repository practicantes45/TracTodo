'use client';
import './styles/global.css';
import './styles/responsive.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt } from "react-icons/fa";
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import ContactNumbers from './components/ContactNumbers/ContactNumbers';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import VerMarcas from './components/VerMarcas/VerMarcas';
import BenefitsSection from './components/BenefitsSection/BenefitsSection';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');

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
                </section>

                {/* Sección de marcas destacadas */}
                <section className="brandSection">
                    <h2>MARCAS DESTACADAS</h2>

                    {/* Contenedor de fondo que abarca todo el ancho */}
                    <div className="brandBackgroundContainer">
                        <img src="/imgs/croquis2.png" className="fondoCroquis" alt="Patrón de fondo" />
                    </div>

                    {/* Contenedor de tarjetas centrado y controlado */}
                    <div className="brandCardsContainer">
                        <div className="brandGrid">
                            <div className="brandCard">
                                <img src="/imgs/marcas/volvo.png" alt="Volvo" className="brandLogo large" />
                            </div>
                            <div className="brandCard">
                                <img src="/imgs/marcas/detroit.png" alt="Detroit" className="brandLogo large" />
                            </div>
                            <div className="brandCard">
                                <img src="/imgs/marcas/caterpillar.png" alt="Caterpillar" className="brandLogo large" />
                            </div>
                            <div className="brandCard">
                                <img src="/imgs/marcas/mercedes.png" alt="Mercedes-Benz" className="brandLogo extraLarge" />
                            </div>
                            <div className="brandCard">
                                <img src="/imgs/marcas/cummins.png" alt="Cummins" className="brandLogo large" />
                            </div>
                            <div className="brandCard">
                                <img src="/imgs/marcas/navistar.png" alt="Navistar" className="brandLogo large" />
                            </div>
                        </div>
                    </div>

                    <VerMarcas />
                </section>

                {/* Sección de beneficios/ventajas - NUEVO COMPONENTE */}
                <BenefitsSection />
            </main>

            {/* Footer con estado activo */}
            <Footer />

            {/* Botón ScrollToTop */}
            <ScrollToTop />
        </div>
    );
}