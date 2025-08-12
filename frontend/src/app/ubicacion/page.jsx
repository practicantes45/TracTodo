'use client';
import './ubicacion.css';
import { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import SEOHead from '../components/SEOHead/SEOHead';
import { useSEO } from '../hooks/useSEO';

export default function UbicacionPage() {
    const [mapLoaded, setMapLoaded] = useState(false);
    
    // Hook SEO para página de ubicación
    const { seoData } = useSEO('ubicacion', { path: '/ubicacion' });

    const contactInfo = {
        direccion: "San Cayetano, Río Extoras 56, San Juan del Río, Querétaro",
        telefono: "+52 427 XXX XXXX",
        email: "contacto@tractodo.com",
        horario: "Lunes a Viernes: 9:00 AM - 6:00 PM",
        whatsapp: "+52 427 XXX XXXX"
    };

    // Schema.org para LocalBusiness
    const schemaLocalBusiness = {
        "@context": "https://schema.org",
        "@type": "AutoPartsStore",
        "name": "Tractodo",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "San Cayetano, Río Extoras 56",
            "addressLocality": "San Juan del Río",
            "addressRegion": "Querétaro",
            "postalCode": "",
            "addressCountry": "MX"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "20.3881",
            "longitude": "-99.9961"
        },
        "telephone": "+52-427-XXX-XXXX",
        "email": "contacto@tractodo.com",
        "url": "https://tractodo.com",
        "openingHours": ["Mo-Fr 09:00-18:00"],
        "description": "Refaccionaria especializada en partes y componentes para tractocamión en San Juan del Río, Querétaro"
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
                    schema={schemaLocalBusiness}
                />
            )}

            <div className="layout ubicacion-page">
                {/* Navbar principal */}
                <Navbar />

                {/* Contenido principal */}
                <main className="mainContent">
                    {/* Hero Section */}
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>Nuestra Ubicación</h1>
                                <p>Visítanos en San Juan del Río, Querétaro</p>
                            </div>
                        </div>
                    </div>

                    {/* Números de contacto */}
                    <ContactNumbers pageContext="ubicacion" />

                    {/* Información de contacto y mapa */}
                    <section className="contactSection">
                        <div className="contactContainer">
                            <div className="contactInfo">
                                <h2>Información de Contacto</h2>
                                
                                <div className="infoItem">
                                    <FaMapMarkerAlt className="infoIcon" />
                                    <div>
                                        <h3>Dirección</h3>
                                        <p>{contactInfo.direccion}</p>
                                    </div>
                                </div>

                                <div className="infoItem">
                                    <FaClock className="infoIcon" />
                                    <div>
                                        <h3>Horarios de Atención</h3>
                                        <p>{contactInfo.horario}</p>
                                        <p className="note">Sábados: 9:00 AM - 2:00 PM</p>
                                    </div>
                                </div>

                                <div className="infoItem">
                                    <FaPhoneAlt className="infoIcon" />
                                    <div>
                                        <h3>Teléfono</h3>
                                        <p>{contactInfo.telefono}</p>
                                    </div>
                                </div>

                                <div className="infoItem">
                                    <FaEnvelope className="infoIcon" />
                                    <div>
                                        <h3>Email</h3>
                                        <p>{contactInfo.email}</p>
                                    </div>
                                </div>

                                <div className="infoItem">
                                    <FaWhatsapp className="infoIcon whatsapp" />
                                    <div>
                                        <h3>WhatsApp</h3>
                                        <p>{contactInfo.whatsapp}</p>
                                        <a 
                                            href={`https://wa.me/524272245923?text=Hola, me gustaría obtener información sobre sus refacciones para tractocamión`}
                                            className="whatsappLink"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Enviar mensaje
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Mapa */}
                            <div className="mapContainer">
                                <h2>Cómo llegar</h2>
                                <div className="mapWrapper">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742.567!2d-99.9961!3d20.3881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDIzJzE3LjIiTiA5OcKwNTknNDYuMCJX!5e0!3m2!1ses!2smx!4v1620000000000!5m2!1ses!2smx"
                                        width="100%"
                                        height="400"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ubicación de Tractodo en San Juan del Río, Querétaro"
                                        onLoad={() => setMapLoaded(true)}
                                    ></iframe>
                                    {!mapLoaded && (
                                        <div className="mapLoading">
                                            Cargando mapa...
                                        </div>
                                    )}
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