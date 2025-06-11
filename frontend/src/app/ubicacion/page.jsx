'use client';
import './ubicacion.css';
import { useState } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt, FaCar, FaBuilding, FaShoppingCart, FaClock, FaPlay } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function UbicacionPage() {
    const [copiedItem, setCopiedItem] = useState('');

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedItem(type);
            setTimeout(() => setCopiedItem(''), 2000);
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
        }
    };

    return (
        <div className="layout ubicacion-page">
            {/* Headers y Navbar */}
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

                {/* Sección principal con video YouTube y mapa */}
                <section className="locationMainSection">
                    <div className="locationContainer">
                        {/* Video section con YouTube */}
                        <div className="videoSection">
                            <h2>¿CÓMO LLEGAR?</h2>
                            <p className="videoDescription">
                                Mira este video donde te explicamos paso a paso cómo llegar a nuestras instalaciones
                            </p>
                            
                            <div className="youtubeVideoContainer">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src="https://www.youtube.com/embed/TU_VIDEO_ID_AQUI"
                                    title="Cómo llegar a TRACTODO"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="youtubeVideo"
                                ></iframe>
                            </div>
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
                                            <span className="day">Sábados y Domingos:</span>
                                            <span className="time">CERRADO</span>
                                        </div>
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
                                    Cómo llegar
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de referencias */}
                <section className="referencesSection">
                    <div className="referencesContainer">
                        <h2>REFERENCIAS PARA LLEGAR</h2>
                        <div className="referencesGrid">
                            <div className="referenceCard">
                                <div className="referenceIcon">
                                    <FaCar />
                                </div>
                                <h4>Agencia Nissan</h4>
                                <p>Sobre la Carretera San Juan del Río-Tequisquiapan (Paseo Central), busca la agencia Nissan como punto de referencia principal.</p>
                            </div>
                            <div className="referenceCard">
                                <div className="referenceIcon">
                                    <FaBuilding />
                                </div>
                                <h4>Tienda de Azulejos y Bomberos</h4>
                                <p>Junto a la agencia Nissan encontrarás la tienda de azulejos y la estación de bomberos. Estos son puntos clave para ubicarnos.</p>
                            </div>
                            <div className="referenceCard">
                                <div className="referenceIcon">
                                    <FaShoppingCart />
                                </div>
                                <h4>Plaza Central</h4>
                                <p>Antes de llegar a Plaza Central, da vuelta a la derecha en la calle Río Extoras. Sigue avanzando y ¡listo! Ahí estamos.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
}