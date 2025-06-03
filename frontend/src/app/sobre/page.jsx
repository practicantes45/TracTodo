'use client';
import './sobre.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function SobrePage() {
    return (
        <div className="layout sobre-page">
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

            {/* Navbar principal */}
            <Navbar />

            {/* Contenido principal */}
            <main className="mainContent">
                {/* Hero Section con imagen de fondo */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Sobre Nosotros</h1>
                            <p>Conoce más sobre TRACTODO y nuestro compromiso con la calidad</p>
                        </div>
                    </div>
                </div>

                {/* Números de contacto */}
                <ContactNumbers />

                {/* Sección ¿Quiénes Somos? - MODIFICADA para layout horizontal */}
                <section className="aboutSection">
                    <div className="aboutContainer">
                        <div className="aboutContentWithImage">
                            {/* Contenido de texto */}
                            <div className="aboutTextContent">
                                <h2>¿QUIÉNES SOMOS?</h2>
                                <p>
                                    En Tractodo, llevamos más de 15 años ofreciendo soluciones confiables en refacciones para motores diésel. Fundados en 2010 en San Juan del Río, Querétaro, nacimos con la idea de brindar todo lo necesario para el tractocamión, de ahí nuestro nombre.
                                </p>
                                <p>
                                    Nos especializamos en piezas para mantenimiento y reparación de transporte pesado, con un enfoque en la calidad, la atención personalizada y la disponibilidad inmediata. Somos tu aliado en el camino.
                                </p>
                            </div>

                            {/* Imagen del camión - MOVIDA AQUÍ */}
                            <div className="aboutImageContent">
                                <img src="/imgs/empresa.jpg" alt="Camión en carretera" className="aboutTruckImage" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección Misión y Visión */}
                <section className="missionVisionSection">
                    <div className="missionVisionContainer">
                        <div className="missionCard">
                            <h3>MISIÓN</h3>
                            <p>
                                Satisfacer con refacciones de calidad las necesidades de nuestros clientes como flotillas, transportadoras, constructoras y talleres diésel superando las expectativas de surtido de refacciones para tracto camiones, equipo pesado, camiones de equipo medio, transporte urbano, y carga. Con una cobertura nacional. 
                            </p>
                        </div>
                        <div className="visionCard">
                            <h3>VISIÓN</h3>
                            <p>
                                Ser la proveedora de refacciones a diésel número uno en el centro de la república y con miras a expandir nuestra presencia en todo el país como líderes en el ramo, fortaleciendo la relación con los clientes y proveedores a base de confianza una capacitación óptima con colaboradores y empleados.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sección Valores - ÚLTIMA SECCIÓN */}
                <section className="valuesSection">
                    <div className="valuesContainer">
                        <h2>VALORES</h2>
                        <div className="valuesGrid">
                            <div className="valueCard">
                                <h4>Calidad</h4>
                                <p>Ofrecemos únicamente productos que cumplen con los más altos estándares de calidad y durabilidad.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Confianza</h4>
                                <p>Construimos relaciones duraderas basadas en la transparencia y el cumplimiento de nuestras promesas.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Servicio</h4>
                                <p>Nos enfocamos en brindar una atención personalizada y asesoría experta a cada cliente.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Innovación</h4>
                                <p>Nos mantenemos a la vanguardia tecnológica para ofrecer las mejores soluciones del mercado.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Responsabilidad</h4>
                                <p>Actuamos con integridad y compromiso social en todas nuestras operaciones comerciales.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Excelencia</h4>
                                <p>Buscamos la mejora continua en todos nuestros procesos para superar las expectativas.</p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <Footer />

            {/* Botón ScrollToTop */}
            <ScrollToTop />
        </div>
    );
}