'use client';
import './ubicacion.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt, FaCar, FaBuilding, FaShoppingCart, FaClock, FaPlay, FaInfoCircle, FaTimes, FaTruck } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import VideoSection from '../components/VideoSection/VideoSection';
import SEOHead from '../components/SEOHead/SEOHead';
import { useSEO } from '../../hooks/useSEO';

export default function UbicacionClient() {
    const [copiedItem, setCopiedItem] = useState('');
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState({ src: '', alt: '', title: '' });

    // Hook SEO para página de ubicación
    const { seoData } = useSEO('ubicacion', { path: '/ubicacion' });

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItem(type);
            setTimeout(() => setCopiedItem(''), 2000);
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
        }
    };

    const openImageModal = (src, alt, title) => {
        setCurrentImage({ src, alt, title });
        setImageModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
        document.body.style.overflow = 'auto';
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

                <Navbar />

                <main className="mainContent">
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>Te Mostramos Cómo Llegar</h1>
                            </div>
                        </div>
                    </div>

                    <ContactNumbers pageContext="ubicacion" />

                    {/* Sección principal con videos y mapa */}
                    <section className="locationMainSection">
                        <div className="locationContainer">
                            {/* Contenedor de videos */}
                            <div className="videosContainer">
                                {/* Video de ubicación */}
                                <VideoSection
                                    title="¿CÓMO ENCONTRARNOS?"
                                    description="Mira este video donde te explicamos paso a paso la ruta para llegar a nuestras instalaciones"
                                    videoId="xlIeCDPO9Es"
                                    thumbnailUrl="https://img.youtube.com/vi/xlIeCDPO9Es/maxresdefault.jpg"
                                />

                                {/* Video de envíos */}
                                <VideoSection
                                    title="EMBARQUES"
                                    description="Tractodo asegura todo: envíos de refacciones a toda la República Mexicana con rapidez y confianza."
                                    videoId="tBnKNwgzQ-c"
                                    thumbnailUrl="https://img.youtube.com/vi/tBnKNwgzQ-c/maxresdefault.jpg"
                                    className="envios"
                                />
                            </div>

                            {/* Map section */}
                            <div className="mapSection">
                                <h2>NUESTRA UBICACIÓN</h2>

                                <div className="addressInfo">
                                    <div className="addressCard">
                                        <h3><FaMapMarkedAlt /> Dirección</h3>
                                        <p
                                            className="clickableAddress"
                                            onClick={() => copyToClipboard('San Cayetano, Río Extoras 56, Querétaro, San Juan del Río', 'address')}
                                        >
                                            San Cayetano, Río Extoras 56<br />
                                            Querétaro, San Juan del Río
                                        </p>
                                        {copiedItem === 'address' && (
                                            <div className="copyTooltip">¡Dirección copiada!</div>
                                        )}
                                    </div>

                                    <div className="scheduleCard">
                                        <h3><FaClock /> Horarios de Atención</h3>
                                        <div className="scheduleDetails">
                                            <div className="scheduleItem">
                                                <span className="day">Lunes a Viernes:</span>
                                                <span className="time">9:00 AM - 6:00 PM</span>
                                            </div>
                                            <div className="scheduleItem closed">
                                                <span className="day">Domingos:</span>
                                                <span className="time">CERRADO</span>
                                            </div>
                                        </div>
                                        <div className="scheduleNote">
                                            <FaInfoCircle className="noteIcon" />
                                            <span>Sábado solo entrega programada</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mapa de Google */}
                                <div className="mapContainer">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.567!2d-99.9842!3d20.3881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d31f8c8f8c8f8c%3A0x8f8c8f8c8f8c8f8c!2sR%C3%ADo%20Extoras%2056%2C%20San%20Cayetano%2C%2076800%20San%20Juan%20del%20R%C3%ADo%2C%20Qro.!5e0!3m2!1ses!2smx!4v1620000000000!5m2!1ses!2smx"
                                        width="100%"
                                        height="400"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ubicación de TRACTODO en Google Maps"
                                    ></iframe>
                                </div>

                                <div className="actionButtons">
                                    <a
                                        href="https://www.google.com/maps/dir//Río+Extoras+56,+San+Cayetano,+76800+San+Juan+del+Río,+Qro./"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="actionButton directions"
                                    >
                                        <FaMapMarkedAlt />
                                        Ver ruta en Maps
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Sección de referencias */}
                    <section className="referencesSection">
                        <div className="referencesContainer">
                            <h2>REFERENCIAS PARA UBICARNOS</h2>
                            <div className="referencesGrid">
                                <div className="referenceCard">
                                    <div className="referenceImageContainer" onClick={() => openImageModal('https://i.postimg.cc/B6SVX8mK/nissan.png', 'Agencia Nissan', 'Agencia Nissan')}>
                                        <img
                                            src="https://i.postimg.cc/B6SVX8mK/nissan.png"
                                            alt="Agencia Nissan"
                                            className="referenceImage"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="referenceIcon" style={{ display: 'none' }}>
                                            <FaCar />
                                        </div>
                                    </div>
                                    <h4>Agencia Nissan</h4>
                                    <p>Sobre la Carretera San Juan del Río-Tequisquiapan (Paseo Central), busca la agencia Nissan como punto de referencia principal.</p>
                                </div>
                                <div className="referenceCard">
                                    <div className="referenceImageContainer" onClick={() => openImageModal('https://i.postimg.cc/5yjKShd9/tienda.jpg', 'Tienda de Azulejos y Bomberos', 'Tienda de Azulejos y Bomberos')}>
                                        <img
                                            src="https://i.postimg.cc/5yjKShd9/tienda.jpg"
                                            alt="Tienda de Azulejos y Bomberos"
                                            className="referenceImage"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="referenceIcon" style={{ display: 'none' }}>
                                            <FaBuilding />
                                        </div>
                                    </div>
                                    <h4>Tienda de Azulejos y Bomberos</h4>
                                    <p>Junto a la agencia Nissan encontrarás la tienda de azulejos y la estación de bomberos. Estos son puntos clave para ubicarnos.</p>
                                </div>
                                <div className="referenceCard">
                                    <div className="referenceImageContainer" onClick={() => openImageModal('https://i.postimg.cc/vB0S9QKS/plaza.jpg', 'Plaza Central', 'Plaza Central')}>
                                        <img
                                            src="https://i.postimg.cc/vB0S9QKS/plaza.jpg"
                                            alt="Plaza Central"
                                            className="referenceImage"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="referenceIcon" style={{ display: 'none' }}>
                                            <FaShoppingCart />
                                        </div>
                                    </div>
                                    <h4>Plaza Central</h4>
                                    <p>Antes de llegar a Plaza Central, da vuelta a la derecha en la calle Río Extoras. Sigue avanzando y ¡listo! Ahí estamos.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Modal de Imagen */}
                {imageModalOpen && (
                    <div className="modal-overlay" onClick={closeImageModal}>
                        <div className="image-modal" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeImageModal}>
                                <FaTimes />
                            </button>
                            <div className="modal-content">
                                <img
                                    src={currentImage.src}
                                    alt={currentImage.alt}
                                    className="modal-image"
                                />
                                <div className="modal-title">
                                    {currentImage.title}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
                <ScrollToTop />
            </div>
        </>
    );
}