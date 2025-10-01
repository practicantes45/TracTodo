'use client';
import './sobre.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import SEOHead from '../components/SEOHead/SEOHead';
import { useSEO } from '../../hooks/useSEO';

export default function SobrePage() {
    // Hook SEO para página sobre nosotros
    const { seoData } = useSEO('sobre', { path: '/sobre' });

    // Schema.org para AboutPage
    const schemaAboutPage = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "Sobre Nosotros - Tractodo",
        "description": "Conoce la historia de Tractodo, refaccionaria especializada en tractocamiones con más de 15 años de experiencia en Querétaro",
        "mainEntity": {
            "@type": "Organization",
            "name": "Tractodo",
            "foundingDate": "2010",
            "description": "Refaccionaria especializada en partes y componentes para tractocamión",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "San Juan del Río",
                "addressRegion": "Querétaro",
                "addressCountry": "MX"
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Refacciones para Tractocamión",
                "itemListElement": [
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Product",
                            "name": "Cabezas de Motor"
                        }
                    },
                    {
                        "@type": "Offer", 
                        "itemOffered": {
                            "@type": "Product",
                            "name": "Turbos"
                        }
                    },
                    {
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Product", 
                            "name": "Árboles de Levas"
                        }
                    }
                ]
            }
        }
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
                    schema={schemaAboutPage}
                />
            )}

            <div className="layout sobre-page">

                {/* Navbar principal */}
                <Navbar />

                {/* Contenido principal */}
                <main className="mainContent">
                    {/* Hero Section con imagen de fondo */}
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>Conoce Nuestra Historia</h1>
                            </div>
                        </div>
                    </div>

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
                                    <img src="https://i.postimg.cc/4dLwnhJp/2afb9413-ab9a-4012-8dbc-e73e0733d142.jpg" alt="Camión en carretera" className="aboutTruckImage" />
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
                                    <h4>Trato Justo</h4>
                                    <p>Relacionamiento honesto y equitativo con clientes, proveedores y colaboradores.</p>
                                </div>
                                <div className="valueCard">
                                    <h4>Atención Personalizada</h4>
                                    <p>Soluciones a la medida, adaptadas a las necesidades de cada cliente.</p>
                                </div>
                                <div className="valueCard">
                                    <h4>Trabajo en Equipo</h4>
                                    <p>Colaboración y respeto mutuo para alcanzar los objetivos comunes.</p>
                                </div>
                                <div className="valueCard">
                                    <h4>Confianza</h4>
                                    <p>Compromiso cumplido, respaldado por 15 años de experiencia.</p>
                                </div>
                                <div className="valueCard">
                                    <h4>Calidad</h4>
                                    <p>Productos duraderos y confiables, garantizando el mejor rendimiento.</p>
                                </div>
                                <div className="valueCard">
                                    <h4>Seguridad</h4>
                                    <p>Empaquetado cuidadoso y entrega segura de nuestros productos.</p>
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
        </>
    );
}
