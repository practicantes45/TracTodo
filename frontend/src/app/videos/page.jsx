'use client';
import './videos.css';
import { useState } from 'react';
import { FaArrowLeft, FaSearch, FaPlay, FaEye, FaShare, FaYoutube, FaTiktok } from "react-icons/fa";
import SearchBar from '../components/SearchBar/SearchBar';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function VideosPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Datos expandidos de shorts - En producción vendrían de YouTube API
    const allShorts = [
        {
            id: 1,
            title: "Cambio de Filtro en 60 Segundos",
            thumbnail: "/imgs/short-thumb-1.jpg",
            duration: "0:58",
            views: "12.5K",
            uploadDate: "2024-01-15",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 2,
            title: "Tips Rápidos Motor Diésel",
            thumbnail: "/imgs/short-thumb-2.jpg",
            duration: "0:45",
            views: "8.3K",
            uploadDate: "2024-01-10",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 3,
            title: "¡OFERTA FLASH! 50% OFF",
            thumbnail: "/imgs/short-thumb-3.jpg",
            duration: "0:30",
            views: "25.1K",
            uploadDate: "2024-01-08",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 4,
            title: "Feliz Año Nuevo TRACTODO",
            thumbnail: "/imgs/short-thumb-4.jpg",
            duration: "0:40",
            views: "18.7K",
            uploadDate: "2024-01-01",
            category: "festividades",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 5,
            title: "Reparación Express Turbo",
            thumbnail: "/imgs/short-thumb-5.jpg",
            duration: "0:55",
            views: "15.2K",
            uploadDate: "2023-12-28",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 6,
            title: "Black Friday Deals",
            thumbnail: "/imgs/short-thumb-6.jpg",
            duration: "0:35",
            views: "32.8K",
            uploadDate: "2023-11-24",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 7,
            title: "Mantenimiento Preventivo Básico",
            thumbnail: "/imgs/short-thumb-7.jpg",
            duration: "1:00",
            views: "9.8K",
            uploadDate: "2023-12-20",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 8,
            title: "Navidad en TRACTODO",
            thumbnail: "/imgs/short-thumb-8.jpg",
            duration: "0:38",
            views: "22.3K",
            uploadDate: "2023-12-25",
            category: "festividades",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 9,
            title: "Cyber Monday Especial",
            thumbnail: "/imgs/short-thumb-9.jpg",
            duration: "0:42",
            views: "28.5K",
            uploadDate: "2023-11-27",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        },
        {
            id: 10,
            title: "Diagnóstico Rápido de Motor",
            thumbnail: "/imgs/short-thumb-10.jpg",
            duration: "0:52",
            views: "14.7K",
            uploadDate: "2023-12-15",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            isShort: true
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos' },
        { id: 'tutorials', label: 'Tutoriales' },
        { id: 'promociones', label: 'Promociones' },
        { id: 'festividades', label: 'Festividades' }
    ];

    // Filtrar shorts por categoría y búsqueda
    const filteredShorts = allShorts.filter(short => {
        const matchesCategory = selectedCategory === 'todos' || short.category === selectedCategory;
        const matchesSearch = short.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
    };

    const handleShareVideo = (video, e) => {
        e.stopPropagation();
        const youtubeUrl = video.isShort
            ? `https://www.youtube.com/shorts/${video.youtubeId}`
            : `https://www.youtube.com/watch?v=${video.youtubeId}`;

        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Mira este short de TRACTODO: ${video.title}`,
                url: youtubeUrl
            });
        } else {
            navigator.clipboard.writeText(youtubeUrl).then(() => {
                alert('Enlace copiado al portapapeles');
            });
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryCount = (categoryId) => {
        if (categoryId === 'todos') return allShorts.length;
        return allShorts.filter(short => short.category === categoryId).length;
    };

    const handleBackToEntertainment = () => {
        window.location.href = '/entretenimiento';
    };

    // Función para ir al canal de YouTube
    const goToYouTubeChannel = () => {
        window.open('https://www.youtube.com/@TRACTODO', '_blank');
    };

    // Función para ir al perfil de TikTok
    const goToTikTokProfile = () => {
        window.open('https://www.tiktok.com/@tractodo4', '_blank');
    };

    return (
        <div className="layout videos-page">
            <Navbar />

            <main className="mainContent">
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Shorts de YouTube</h1>
                        </div>
                    </div>
                </div>

                {/* Sección principal de shorts */}
                <section className="videosMainSection">
                    <div className="videosContainer">
                        
                        {/* Botón de regreso */}
                        <div className="backButtonContainer">
                            <button 
                                className="backButton" 
                                onClick={handleBackToEntertainment}
                                aria-label="Regresar a entretenimiento"
                            >
                                <FaArrowLeft className="backIcon" />
                                Regresar a Entretenimiento
                            </button>
                        </div>

                        {/* Header con estadísticas y búsqueda */}
                        <div className="videosHeader">
                            <div className="videosStats">
                                <h2>Shorts de TRACTODO</h2>
                                <p>{filteredShorts.length} shorts encontrados</p>
                            </div>
                            
                            {/* Barra de búsqueda */}
                            <div className="searchContainer">
                                <FaSearch className="searchIcon" />
                                <input
                                    type="text"
                                    placeholder="Buscar shorts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
                            </div>
                        </div>

                        {/* Filtros de categorías con contadores */}
                        <div className="categoryFilters">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    className={`categoryButton ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    {category.label}
                                    <span className="categoryCount">
                                        {getCategoryCount(category.id)}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Grid de shorts */}
                        <div className="shortsGrid">
                            {filteredShorts.length > 0 ? (
                                filteredShorts.map((short) => (
                                    <div
                                        key={short.id}
                                        className="shortCard"
                                        onClick={() => handleVideoClick(short)}
                                    >
                                        <div className="shortThumbnail">
                                            <div className="thumbnailPlaceholder">
                                                <div className="playOverlay">
                                                    <FaPlay className="playIcon" />
                                                </div>
                                                <div className="shortDuration">{short.duration}</div>
                                                <div className="shortBadge">SHORT</div>
                                                <button
                                                    className="shareButton"
                                                    onClick={(e) => handleShareVideo(short, e)}
                                                    aria-label="Compartir short"
                                                >
                                                    <FaShare />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="shortInfo">
                                            <h3 className="shortTitle">{short.title}</h3>
                                            <div className="shortMeta">
                                                <span className="shortViews">
                                                    <FaEye /> {short.views} vistas
                                                </span>
                                                <span className="shortDate">
                                                    {formatDate(short.uploadDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="noResults">
                                    <h3>No se encontraron shorts</h3>
                                    <p>Intenta con otros términos de búsqueda o cambia la categoría.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer de videos con botones sociales */}
                        <footer className="videosFooter">
                            <div className="channelInfo">
                                <h3>¡Síguenos en nuestras redes!</h3>
                                <p>
                                    Descubre más contenido educativo sobre refacciones, mantenimiento y 
                                    reparaciones de vehículos pesados en nuestros canales oficiales.
                                </p>
                            </div>
                            
                            <div className="socialButtonsContainer">
                                <button 
                                    className="youtubeButton"
                                    onClick={goToYouTubeChannel}
                                    aria-label="Visitar canal de YouTube"
                                >
                                    <FaYoutube className="youtubeIcon" />
                                    <span className="buttonText">Ir al Canal</span>
                                </button>
                                
                                <button 
                                    className="tiktokButton"
                                    onClick={goToTikTokProfile}
                                    aria-label="Visitar perfil de TikTok"
                                >
                                    <FaTiktok className="tiktokIcon" />
                                    <span className="buttonText">Ver TikTok</span>
                                </button>
                            </div>
                        </footer>

                    </div>
                </section>

                {/* Modal de video/short */}
                {isVideoModalOpen && selectedVideo && (
                    <div className="videoModal" onClick={closeVideoModal}>
                        <div className="videoModalContent" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="videoModalClose"
                                onClick={closeVideoModal}
                                aria-label="Cerrar modal"
                            >
                                ×
                            </button>
                            <div className="videoContainer">
                                <iframe
                                    src={selectedVideo.isShort
                                        ? `https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=1`
                                        : `https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`
                                    }
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
}