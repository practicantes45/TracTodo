'use client';
import './sobre.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
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
                    
                    {/* Números de contacto */}
                    <ContactNumbers pageContext="sobre" />

                    {/* Sección ¿Quiénes Somos? */}
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
                                
                                {/* Imagen */}
                                <div className="aboutImageContent">
                                    <img 
                                        src="https://i.postimg.cc/Y0yJ9Ztw/sobre-nosotros.jpg" 
                                        alt="Equipo de Tractodo - Especialistas en refacciones para tractocamión"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección Nuestra Misión */}
                    <section className="missionSection">
                        <div className="missionContainer">
                            <h2>NUESTRA MISIÓN</h2>
                            <p>
                                Proveer refacciones de alta calidad para motores diésel de tractocamión, garantizando disponibilidad inmediata, precios competitivos y asesoría técnica especializada para mantener en movimiento el transporte de carga en México.
                            </p>
                        </div>
                    </section>

                    {/* Sección Nuestra Visión */}
                    <section className="visionSection">
                        <div className="visionContainer">
                            <h2>NUESTRA VISIÓN</h2>
                            <p>
                                Ser la refaccionaria líder en el centro de México, reconocida por nuestra experiencia, confiabilidad y compromiso con la excelencia en el servicio al transporte pesado.
                            </p>
                        </div>
                    </section>

                    {/* Sección Por qué elegirnos */}
                    <section className="whyChooseSection">
                        <div className="whyChooseContainer">
                            <h2>¿POR QUÉ ELEGIRNOS?</h2>
                            
                            <div className="featuresGrid">
                                <div className="featureCard">
                                    <FaCalendarCheck className="featureIcon" />
                                    <h3>15+ Años de Experiencia</h3>
                                    <p>Más de una década especializándonos en refacciones para transporte pesado y motores diésel.</p>
                                </div>
                                
                                <div className="featureCard">
                                    <FaMapMarkedAlt className="featureIcon" />
                                    <h3>Ubicación Estratégica</h3>
                                    <p>Ubicados en el corazón de México, facilitamos el acceso desde cualquier parte del país.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección de valores */}
                    <section className="valuesSection">
                        <div className="valuesContainer">
                            <h2>NUESTROS VALORES</h2>
                            
                            <div className="valuesGrid">
                                <div className="valueItem">
                                    <h3>Calidad</h3>
                                    <p>Solo ofrecemos refacciones que cumplen con los más altos estándares de calidad.</p>
                                </div>
                                
                                <div className="valueItem">
                                    <h3>Confiabilidad</h3>
                                    <p>Nuestros clientes pueden contar con nosotros para sus necesidades más urgentes.</p>
                                </div>
                                
                                <div className="valueItem">
                                    <h3>Experiencia</h3>
                                    <p>Conocimiento profundo del sector automotriz pesado y sus requerimientos.</p>
                                </div>
                                
                                <div className="valueItem">
                                    <h3>Servicio</h3>
                                    <p>Atención personalizada y asesoría técnica especializada para cada cliente.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
                <ScrollToTop />
            </div>
        </>
    );
}