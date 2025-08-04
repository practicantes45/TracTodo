'use client';
import './ubicacion.css';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaPhone, FaClock, FaDirections, FaPlay, FaTimes } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

function UbicacionContent() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Datos de la ubicación
    const locationData = {
        name: "TRACTODO",
        address: "Carr. San Luis Potosí - Rioverde Km 18.5, 78090 San Luis Potosí, S.L.P.",
        phone: "+52 444 123 4567",
        hours: "Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 8:00 AM - 2:00 PM",
        coordinates: {
            lat: 22.1565,
            lng: -100.9855
        }
    };

    // Imágenes de referencia
    const referenceImages = [
        {
            id: 1,
            src: "https://i.postimg.cc/bvyqS4LK/ubicacion-ref1.jpg",
            alt: "Vista frontal de TRACTODO",
            title: "Entrada Principal"
        },
        {
            id: 2,
            src: "https://i.postimg.cc/9FcxHxYB/ubicacion-ref2.jpg",
            alt: "Área de servicio TRACTODO",
            title: "Área de Servicios"
        },
        {
            id: 3,
            src: "https://i.postimg.cc/13XyKvPr/ubicacion-ref3.jpg",
            alt: "Instalaciones TRACTODO",
            title: "Nuestras Instalaciones"
        }
    ];

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setIsImageModalOpen(true);
    };

    const handleVideoClick = () => {
        setIsVideoModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImage(null);
    };

    const closeVideoModal = () => {
        setIsVideoModalOpen(false);
    };

    const handleDirections = () => {
        const encodedAddress = encodeURIComponent(locationData.address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    };

    const handleCall = () => {
        window.open(`tel:${locationData.phone}`, '_self');
    };

    // Función para manejar imágenes no encontradas
    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc>';
        e.target.alt = 'Imagen no encontrada';
    };

    return (
        <div className="layout ubicacion-page">
            <Navbar />

            <main className="mainContent">
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Nuestra Ubicación</h1>
                        </div>
                    </div>
                </div>

                {/* Sección principal de ubicación */}
                <section className="locationMainSection">
                    <div className="locationContainer">
                        
                        {/* Video y información */}
                        <div className="videoSection">
                            <h2>¿Cómo llegar?</h2>
                            <div className="youtubeVideoContainer" onClick={handleVideoClick}>
                                <img 
                                    src="https://img.youtube.com/vi/YOUTUBE_ID/maxresdefault.jpg"
                                    alt="Video de cómo llegar a TRACTODO"
                                    onError={handleImageError}
                                />
                                <div className="playOverlay">
                                    <FaPlay />
                                </div>
                            </div>
                            
                            <div className="locationInfo">
                                <div className="infoItem">
                                    <FaMapMarkerAlt className="infoIcon" />
                                    <div className="infoText">
                                        <h3>Dirección</h3>
                                        <p>{locationData.address}</p>
                                    </div>
                                </div>
                                
                                <div className="infoItem">
                                    <FaPhone className="infoIcon" />
                                    <div className="infoText">
                                        <h3>Teléfono</h3>
                                        <p>{locationData.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="infoItem">
                                    <FaClock className="infoIcon" />
                                    <div className="infoText">
                                        <h3>Horarios</h3>
                                        <p>{locationData.hours}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="actionButtons">
                                <button onClick={handleDirections} className="directionsButton">
                                    <FaDirections />
                                    Cómo llegar
                                </button>
                                <button onClick={handleCall} className="callButton">
                                    <FaPhone />
                                    Llamar
                                </button>
                            </div>
                        </div>

                        {/* Mapa y referencias */}
                        <div className="mapSection">
                            <h2>Mapa</h2>
                            <div className="mapContainer">
                                <iframe
                                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.5!2d${locationData.coordinates.lng}!3d${locationData.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDA5JzIzLjQiTiAxMDDCsDU5JzA3LjgiVw!5e0!3m2!1ses!2smx!4v1234567890`}
                                    width="100%"
                                    height="400"
                                    style={{ border: 0, borderRadius: '15px' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación de TRACTODO"
                                ></iframe>
                            </div>

                            <div className="addressInfo">
                                <div className="addressItem">
                                    <h3>Estado</h3>
                                    <p>San Luis Potosí</p>
                                </div>
                                <div className="addressItem">
                                    <h3>Código Postal</h3>
                                    <p>78090</p>
                                </div>
                                <div className="addressItem">
                                    <h3>Zona</h3>
                                    <p>Carr. San Luis Potosí - Rioverde</p>
                                </div>
                            </div>

                            {/* Imágenes de referencia */}
                            <div className="referencesSection">
                                <h3>Referencias visuales</h3>
                                <div className="referencesGrid">
                                    {referenceImages.map((image) => (
                                        <div key={image.id} className="referenceItem" onClick={() => handleImageClick(image)}>
                                            <div className="referenceImageContainer">
                                                <img 
                                                    src={image.src} 
                                                    alt={image.alt}
                                                    onError={handleImageError}
                                                />
                                                <div className="referenceOverlay">
                                                    <span>{image.title}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal de imagen */}
                {isImageModalOpen && selectedImage && (
                    <div className="modal-overlay" onClick={closeImageModal}>
                        <div className="image-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeImageModal}>
                                <FaTimes />
                            </button>
                            <img src={selectedImage.src} alt={selectedImage.alt} />
                            <h3>{selectedImage.title}</h3>
                        </div>
                    </div>
                )}

                {/* Modal de video */}
                {isVideoModalOpen && (
                    <div className="modal-overlay" onClick={closeVideoModal}>
                        <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="modal-close" onClick={closeVideoModal}>
                                <FaTimes />
                            </button>
                            <iframe
                                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                                title="Cómo llegar a TRACTODO"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* ScrollToTop Component */}
                <ScrollToTop />
            </main>

            <Footer />
        </div>
    );
}

// Componente de fallback para Suspense
function UbicacionPageFallback() {
    return (
        <div className="layout ubicacion-page">
            <Navbar />
            <main className="mainContent">
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Nuestra Ubicación</h1>
                        </div>
                    </div>
                </div>
                <section className="locationMainSection">
                    <div className="locationContainer">
                        <div className="loadingContainer">
                            <h2>Cargando...</h2>
                            <div className="spinner"></div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

// Componente principal con Suspense
export default function UbicacionPage() {
    return (
        <Suspense fallback={<UbicacionPageFallback />}>
            <UbicacionContent />
        </Suspense>
    );
}