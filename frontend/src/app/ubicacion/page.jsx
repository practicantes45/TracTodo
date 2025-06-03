'use client';
import './ubicacion.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt, FaClock, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaRoute } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function UbicacionPage() {
    // Función para abrir Google Maps con direcciones
    const handleGetDirections = () => {
        const address = "San Cayetano, Río Extoras 56, San Juan del Río, Querétaro, México";
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(googleMapsUrl, '_blank');
    };

    // Función para abrir en Waze
    const handleOpenWaze = () => {
        const wazeUrl = "https://www.waze.com/ul?q=REFACCIONES%20DIESEL%20TRACTODO&navigate=yes";
        window.open(wazeUrl, '_blank');
    };

    return (
        <div className="layout ubicacion-page">
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
                            <h1>Nuestra Ubicación</h1>
                            <p>Visítanos en San Juan del Río, Querétaro</p>
                        </div>
                    </div>
                </div>

                {/* Números de contacto */}
                <ContactNumbers />

                {/* Sección principal con información y mapa */}
                <section className="locationSection">
                    <div className="locationContainer">
                        {/* Lado izquierdo - Información y video */}
                        <div className="locationInfo">
                            <div className="infoContent">
                                <h2>¿CÓMO LLEGAR?</h2>
                                
                                {/* Dirección completa */}
                                <div className="addressCard">
                                    <div className="addressHeader">
                                        <FaMapMarkerAlt className="addressIcon" />
                                        <h3>Dirección Completa</h3>
                                    </div>
                                    <p className="fullAddress">
                                        San Cayetano, Río Extoras 56<br />
                                        San Juan del Río, Querétaro<br />
                                        México
                                    </p>
                                </div>

                                {/* Horarios de atención */}
                                <div className="scheduleCard">
                                    <div className="scheduleHeader">
                                        <FaClock className="scheduleIcon" />
                                        <h3>Horarios de Atención</h3>
                                    </div>
                                    <div className="scheduleDetails">
                                        <div className="scheduleItem">
                                            <span className="day">Lunes - Viernes:</span>
                                            <span className="time">9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="scheduleItem">
                                            <span className="day">Sábados:</span>
                                            <span className="time">9:00 AM - 2:00 PM</span>
                                        </div>
                                        <div className="scheduleItem">
                                            <span className="day">Domingos:</span>
                                            <span className="time">Cerrado</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de navegación */}
                                <div className="navigationButtons">
                                    <button className="navButton googleMaps" onClick={handleGetDirections}>
                                        <FaRoute className="navIcon" />
                                        Cómo llegar (Google Maps)
                                    </button>
                                    <button className="navButton waze" onClick={handleOpenWaze}>
                                        <FaRoute className="navIcon" />
                                        Abrir en Waze
                                    </button>
                                </div>

                                {/* Video de TikTok */}
                                <div className="tiktokVideo">
                                    <h3>Conócenos mejor</h3>
                                    <div className="videoContainer">
                                        {/* Puedes reemplazar este iframe con el video específico de TikTok */}
                                        <blockquote 
                                            className="tiktok-embed" 
                                            cite="https://www.tiktok.com/@tractodo4" 
                                            data-video-id="" 
                                            style={{maxWidth: '100%', minWidth: '285px'}}
                                        >
                                            <section>
                                                <div className="tiktokPlaceholder">
                                                    <p>📱 Video de TikTok</p>
                                                    <p>@tractodo4</p>
                                                    <a href="https://www.tiktok.com/@tractodo4" target="_blank" rel="noopener noreferrer">
                                                        Ver en TikTok
                                                    </a>
                                                </div>
                                            </section>
                                        </blockquote>
                                    </div>
                                </div>

                                {/* Contacto rápido */}
                                <div className="quickContact">
                                    <h3>Contacto Directo</h3>
                                    <div className="contactOptions">
                                        <a href="tel:4272245923" className="contactOption">
                                            <FaPhone className="contactIcon" />
                                            <span>Llamar Ahora</span>
                                        </a>
                                        <a href="https://wa.me/524272245923" className="contactOption whatsapp" target="_blank" rel="noopener noreferrer">
                                            <FaWhatsapp className="contactIcon" />
                                            <span>WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lado derecho - Mapa */}
                        <div className="mapSection">
                            <div className="mapContainer">
                                <h3>Encuéntranos Aquí</h3>
                                <div className="mapWrapper">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.5!2d-99.9936!3d20.3877!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d3f8a7e8e8e8e8%3A0x1234567890abcdef!2sR%C3%ADo%20Extoras%2056%2C%20San%20Cayetano%2C%20San%20Juan%20del%20R%C3%ADo%2C%20Qro.!5e0!3m2!1ses!2smx!4v1234567890123!5m2!1ses!2smx"
                                        width="100%"
                                        height="100%"
                                        style={{border: 0}}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ubicación TRACTODO"
                                    ></iframe>
                                </div>
                                <div className="mapInfo">
                                    <p>📍 REFACCIONES DIESEL TRACTODO</p>
                                    <p>San Cayetano, Río Extoras 56</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de referencias adicionales */}
                <section className="referencesSection">
                    <div className="referencesContainer">
                        <h2>Referencias para llegar</h2>
                        <div className="referencesGrid">
                            <div className="referenceCard">
                                <h4>🏪 Cerca de:</h4>
                                <ul>
                                    <li>Plaza y Tecnología SJR</li>
                                    <li>Ferrémaderas Olvera</li>
                                    <li>Office Depot</li>
                                </ul>
                            </div>
                            <div className="referenceCard">
                                <h4>🛣️ Vías principales:</h4>
                                <ul>
                                    <li>Av. Río Moctezuma</li>
                                    <li>Río Extoras</li>
                                    <li>Acceso desde carretera federal</li>
                                </ul>
                            </div>
                            <div className="referenceCard">
                                <h4>🚛 Acceso para camiones:</h4>
                                <ul>
                                    <li>Amplio estacionamiento</li>
                                    <li>Fácil maniobra para tráilers</li>
                                    <li>Entrada y salida cómoda</li>
                                </ul>
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