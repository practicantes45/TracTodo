'use client';
import './videos.css';
import { useState } from 'react';
import { FaArrowLeft, FaSearch, FaPlay, FaEye, FaShare, FaYoutube, FaTiktok } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function VideosPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Datos expandidos de shorts con links de YouTube - Estructura simplificada
    const allShorts = [
        {
            id: 1,
            title: "Cambio de Filtro en 60 Segundos",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "tutoriales"
        },
        {
            id: 2,
            title: "Tips Rápidos Motor Diésel",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "tutoriales"
        },
        {
            id: 3,
            title: "¡OFERTA FLASH! 50% OFF",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "promociones"
        },
        {
            id: 4,
            title: "Feliz Año Nuevo TRACTODO",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "festividades"
        },
        {
            id: 5,
            title: "Reparación Express Turbo",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "tutoriales"
        },
        {
            id: 6,
            title: "Black Friday Deals",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "promociones"
        },
        {
            id: 7,
            title: "Mantenimiento Preventivo Básico",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "tutoriales"
        },
        {
            id: 8,
            title: "Navidad en TRACTODO",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "festividades"
        },
        {
            id: 9,
            title: "Cyber Monday Especial",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "promociones"
        },
        {
            id: 10,
            title: "Diagnóstico Rápido de Motor",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "tutoriales"
        },
        {
            id: 11,
            title: "Cambio de Aceite Express",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "tutoriales"
        },
        {
            id: 12,
            title: "Promoción Fin de Año",
            youtubeLink: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            category: "promociones"
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos' },
        { id: 'tutoriales', label: 'Tutoriales' },
        { id: 'promociones', label: 'Promociones' },
        { id: 'festividades', label: 'Festividades' }
    ];

    // Función para extraer ID de YouTube del link
    const extractYouTubeId = (url) => {
        if (!url) return null;

        // Para YouTube Shorts
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return shortsMatch[1];

        // Para videos normales de YouTube
        const normalMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (normalMatch) return normalMatch[1];

        return null;
    };

    // Función para generar thumbnail de YouTube
    const getYouTubeThumbnail = (youtubeLink) => {
        const videoId = extractYouTubeId(youtubeLink);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        return '/imgs/default-video-thumb.jpg'; // imagen por defecto
    };

    // Filtrar shorts por categoría y búsqueda
    const filteredShorts = allShorts.filter(short => {
        const matchesCategory = selectedCategory === 'todos' || short.category === selectedCategory;
        const matchesSearch = short.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleVideoClick = (video) => {
        const videoId = extractYouTubeId(video.youtubeLink);
        if (videoId) {
            setSelectedVideo({
                ...video,
                youtubeId: videoId,
                isShort: video.youtubeLink.includes('/shorts/')
            });
            setIsVideoModalOpen(true);
        } else {
            // Si no se puede extraer el ID, abrir directamente en YouTube
            window.open(video.youtubeLink, '_blank');
        }
    };

    const closeVideoModal = () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
    };

    const handleShareVideo = (video, e) => {
        e.stopPropagation();

        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Mira este short de TRACTODO: ${video.title}`,
                url: video.youtubeLink
            });
        } else {
            navigator.clipboard.writeText(video.youtubeLink).then(() => {
                alert('Enlace copiado al portapapeles');
            });
        }
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
                                <h2>¡Arranca el motor y vamos a ver!</h2>
                                <p>{filteredShorts.length} shorts encontrados</p>
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
                                            <div
                                                className="thumbnailPlaceholder"
                                                style={{
                                                    backgroundImage: `url(${getYouTubeThumbnail(short.youtubeLink)})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                <div className="playOverlay">
                                                    <FaPlay className="playIcon" />
                                                </div>
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
                                                <span className="shortCategory">
                                                    {short.category}
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