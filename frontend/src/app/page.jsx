'use client';
import './styles/global.css';
import './styles/responsive.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt } from "react-icons/fa";
import Navbar from './components/Navbar/Navbar';
import ContactNumbers from './components/ContactNumbers/ContactNumbers';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import VerMarcas from './components/VerMarcas/VerMarcas';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="layout">
            {/* Header con información de contacto y ubicación */}
            <header className="infoHeader">
                <div className="locationInfo">
                    <span className="locationIcon"><FaMapMarkedAlt /></span>
                    <span>Queretaro, San Juan del Río, San Cayetano, Río Extoras 56.</span>
                </div>
                <div className="line"></div>
                <div className="scheduleInfo">
                    <span className="calendarIcon"><FaCalendarCheck /></span>
                    <span>Lun - Vier. 9:00 am - 6:00 pm</span>
                </div>
            </header>

            {/* Navbar principal con estado activo */}
            <Navbar />

            {/* Contenido principal */}
            <main className="mainContent">
                <div className="heroSection">
                    {/* Logo*/}
                    <img
                        src="/imgs/logoblanco.png"
                        className="logoImage"
                        alt="Logo TRACTODO"
                    />
                    {/* Números de contacto*/}
                    <ContactNumbers />
                </div>

                {/* Banner de ofertas */}
                <div className="offerBanner">
                    <h2>PRODUCTOS DEL MES</h2>
                </div>

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

                {/* Sección de beneficios/ventajas - NUEVO DISEÑO */}
                <section className="benefitsSection">
                    <div className="benefitsContainer">
                        <div className="card-container">
                            <div className="card">
                                <div className="front-content">
                                    <div className="icon-container">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M5.8 21L7.4 14L2 9.2L9.2 8.6L12 2L14.8 8.6L22 9.2L18.8 12H18C14.9 12 12.4 14.3 12 17.3L5.8 21M17.8 21.2L22.6 16.4L21.3 15L17.7 18.6L16.2 17L15 18.2L17.8 21.2" />                                        </svg>
                                    </div>
                                    <p className="benefit-title">Calidad Garantizada</p>
                                </div>
                                <div className="content">
                                    <p className="heading">Calidad Garantizada</p>
                                    <p>
                                        Refacciones de alta calidad, certificadas y probadas para máximo rendimiento.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-container">
                            <div className="card">
                                <div className="front-content">
                                    <div className="icon-container">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12,3L2,12H5V20H19V12H22L12,3M12,8.75A2.25,2.25 0 0,1 14.25,11A2.25,2.25 0 0,1 12,13.25A2.25,2.25 0 0,1 9.75,11A2.25,2.25 0 0,1 12,8.75M7,18V16C7,14.67 9.67,14 12,14C14.33,14 17,14.67 17,16V18H7Z" />
                                        </svg>
                                    </div>
                                    <p className="benefit-title">Amplio Stock</p>
                                </div>
                                <div className="content">
                                    <p className="heading">Amplio Stock</p>
                                    <p>
                                        Amplio inventario de refacciones para las principales marcas
                                        ¡Listos para enviar!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-container">
                            <div className="card">
                                <div className="front-content">
                                    <div className="icon-container">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
                                        </svg>
                                    </div>
                                    <p className="benefit-title">Precios Competitivos</p>
                                </div>
                                <div className="content">
                                    <p className="heading">Precios Competitivos</p>
                                    <p>
                                        Precios justos, calidad garantizada
                                        ¡El mejor valor para ti!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card-container">
                            <div className="card">
                                <div className="front-content">
                                    <div className="icon-container">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
                                        </svg>
                                    </div>
                                    <p className="benefit-title">Garantía Confiable</p>
                                </div>
                                <div className="content">
                                    <p className="heading">Garantía Confiable</p>
                                    <p>
                                        Respaldo total: Garantía extendida y servicio post-venta de confianza
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer con estado activo */}
            <Footer />

            {/* Botón ScrollToTop */}
            <ScrollToTop />
        </div>
    );
}