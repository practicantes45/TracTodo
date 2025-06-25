'use client';
import './videos.css';
import { useState } from 'react';
import { FaPlay, FaEye, FaShare, FaFilter, FaSearch } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function VideosPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Datos expandidos de videos - En producción vendrían de YouTube API
    const allVideos = [
        {
            id: 1,
            title: "Mantenimiento de Motor Diésel - Guía Completa",
            thumbnail: "/imgs/video-thumb-1.jpg",
            duration: "03:45",
            views: "2.1K",
            uploadDate: "2024-01-15",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            description: "Aprende los fundamentos del mantenimiento preventivo para motores diésel en tractocamiones."
        },
        {
            id: 2,
            title: "Instalación de Sistema de Inyección",
            thumbnail: "/imgs/video-thumb-2.jpg",
            duration: "05:22",
            views: "1.8K",
            uploadDate: "2024-01-10",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            description: "Tutorial paso a paso para instalar sistemas de inyección en motores pesados."
        },
        {
            id: 3,
            title: "Promoción Especial - Febrero 2024",
            thumbnail: "/imgs/video-thumb-3.jpg",
            duration: "01:30",
            views: "3.2K",
            uploadDate: "2024-02-01",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ",
            description: "Conoce nuestras ofertas especiales del mes de febrero en refacciones para motores."
        },
        {
            id: 4,
            title: "Día de las Madres - Felicitación",
            thumbnail: "/imgs/video-thumb-4.jpg",
            duration: "02:15",
            views: "950",
            uploadDate: "2024-05-10",
            category: "festividades",
            youtubeId: "dQw4w9WgXcQ",
            description: "Felicitación especial del equipo TRACTODO para todas las madres trabajadoras del transporte."
        },
        {
            id: 5,
            title: "Cambio de Filtros en Motor Cummins",
            thumbnail: "/imgs/video-thumb-5.jpg",
            duration: "04:10",
            views: "1.5K",
            uploadDate: "2024-01-20",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            description: "Proceso detallado para el cambio de filtros de aceite y combustible en motores Cummins."
        },
        {
            id: 6,
            title: "Ofertas de Fin de Año",
            thumbnail: "/imgs/video-thumb-6.jpg",
            duration: "02:30",
            views: "2.8K",
            uploadDate: "2023-12-15",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ",
            description: "Las mejores ofertas del año en refacciones para tu tractocamión."
        },
        {
            id: 7,
            title: "Reparación de Cabeza de Motor",
            thumbnail: "/imgs/video-thumb-7.jpg",
            duration: "06:45",
            views: "3.1K",
            uploadDate: "2024-01-05",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            description: "Técnicas profesionales para la reparación y reconstrucción de cabezas de motor."
        },
        {
            id: 8,
            title: "Navidad en TRACTODO",
            thumbnail: "/imgs/video-thumb-8.jpg",
            duration: "01:45",
            views: "1.2K",
            uploadDate: "2023-12-24",
            category: "festividades",
            youtubeId: "dQw4w9WgXcQ",
            description: "Celebración navideña con todo el equipo de trabajo de TRACTODO."
        },
        {
            id: 9,
            title: "Diagnóstico de Problemas en Motor Detroit",
            thumbnail: "/imgs/video-thumb-9.jpg",
            duration: "07:20",
            views: "2.5K",
            uploadDate: "2024-01-25",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            description: "Aprende a diagnosticar los problemas más comunes en motores Detroit Diesel."
        },
        {
            id: 10,
            title: "Black Friday - Descuentos Especiales",
            thumbnail: "/imgs/video-thumb-10.jpg",
            duration: "01:20",
            views: "4.1K",
            uploadDate: "2023-11-24",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ",
            description: "Los mejores descuentos del Black Friday en refacciones para motores diésel."
        },
        {
            id: 11,
            title: "Instalación de Turbo en Motor Volvo",
            thumbnail: "/imgs/video-thumb-11.jpg",
            duration: "08:15",
            views: "1.9K",
            uploadDate: "2024-02-10",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ",
            description: "Guía completa para la instalación y configuración de turbocargadores en motores Volvo."
        },
        {
            id: 12,
            title: "Día del Trabajador - Homenaje",
            thumbnail: "/imgs/video-thumb-12.jpg",
            duration: "03:00",
            views: "800",
            uploadDate: "2024-05-01",
            category: "festividades",
            youtubeId: "dQw4w9WgXcQ",
            description: "Reconocimiento a todos los trabajadores del sector transportista en su día."
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos los Videos' },
        { id: 'tutorials', label: 'Tutoriales' },
        { id: 'promociones', label: 'Promociones' },
        { id: 'festividades', label: 'Festividades' }
    ];

    // Filtrar videos según categoría y búsqueda
    const filteredVideos = allVideos.filter(video => {
        const matchesCategory = selectedCategory === 'todos' || video.category === selectedCategory;
        const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             video.description.toLowerCase().includes(searchTerm.toLowerCase());
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
        const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
        
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Mira este video de TRACTODO: ${video.title}`,
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
        if (categoryId === 'todos') return allVideos.length;
        return allVideos.filter(video => video.category === categoryId).length;
    };

    return (
        <div className="layout videos-page">
            
            <Navbar />

            <main className="mainContent">
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Videos de TRACTODO</h1>
                        </div>
                    </div>
                </div>


                {/* Sección principal de videos */}
                <section className="videosMainSection">
                    <div className="videosContainer">
                        
                        {/* Header con estadísticas */}
                        <div className="videosHeader">
                            <div className="videosStats">
                                <h2>Biblioteca de Videos</h2>
                                <p>{filteredVideos.length} videos encontrados</p>
                            </div>
                            
                            {/* Barra de búsqueda */}
                            <div className="searchContainer">
                                <FaSearch className="searchIcon" />
                                <input
                                    type="text"
                                    placeholder="Buscar videos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
                            </div>
                        </div>

                        {/* Filtros de categorías con contador */}
                        <div className="categoryFiltersSection">
                            <div className="categoryFilters">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={`categoryButton ${selectedCategory === category.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <span className="categoryLabel">{category.label}</span>
                                        <span className="categoryCount">({getCategoryCount(category.id)})</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid de videos */}
                        <div className="videosGrid">
                            {filteredVideos.length > 0 ? (
                                filteredVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="videoCard"
                                        onClick={() => handleVideoClick(video)}
                                    >
                                        <div className="videoThumbnail">
                                            <div className="thumbnailPlaceholder">
                                                <div className="playOverlay">
                                                    <FaPlay className="playIcon" />
                                                </div>
                                                <div className="videoDuration">{video.duration}</div>
                                            </div>
                                            <button 
                                                className="shareButton"
                                                onClick={(e) => handleShareVideo(video, e)}
                                                aria-label="Compartir video"
                                            >
                                                <FaShare />
                                            </button>
                                        </div>
                                        <div className="videoInfo">
                                            <h3 className="videoTitle">{video.title}</h3>
                                            <p className="videoDescription">{video.description}</p>
                                            <div className="videoMeta">
                                                <span className="videoViews">
                                                    <FaEye /> {video.views} visualizaciones
                                                </span>
                                                <span className="videoDate">
                                                    {formatDate(video.uploadDate)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="noResults">
                                    <h3>No se encontraron videos</h3>
                                    <p>Intenta cambiar los filtros o términos de búsqueda</p>
                                </div>
                            )}
                        </div>

                        {/* Información adicional */}
                        <div className="videosFooter">
                            <div className="channelInfo">
                                <h3>Suscríbete a nuestro canal</h3>
                                <p>No te pierdas nuestros últimos videos y tutoriales</p>
                                <a 
                                    href="https://www.youtube.com/@TRACTODO" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="subscribeButton"
                                >
                                    Ver en YouTube
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Modal de video */}
                {isVideoModalOpen && selectedVideo && (
                    <div className="videoModal" onClick={closeVideoModal}>
                        <div className="videoModalContent" onClick={(e) => e.stopPropagation()}>
                            <button className="videoModalClose" onClick={closeVideoModal}>
                                ×
                            </button>
                            <div className="videoContainer">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            <div className="videoModalInfo">
                                <h3>{selectedVideo.title}</h3>
                                <p className="videoModalDescription">{selectedVideo.description}</p>
                                <div className="videoModalMeta">
                                    <span><FaEye /> {selectedVideo.views} visualizaciones</span>
                                    <span>{formatDate(selectedVideo.uploadDate)}</span>
                                </div>
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