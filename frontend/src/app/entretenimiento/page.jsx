'use client';
import './entretenimiento.css';
import { useState } from 'react';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaShare } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function EntretenimientoPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Datos de ejemplo para videos - En producción vendrían de YouTube API
    const videosData = [
        {
            id: 1,
            title: "Mantenimiento de Motor Diésel",
            thumbnail: "/imgs/video-thumb-1.jpg",
            duration: "03:45",
            views: "2.1K",
            uploadDate: "2024-01-15",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ" // ID real de YouTube
        },
        {
            id: 2,
            title: "Instalación de Sistema de Inyección",
            thumbnail: "/imgs/video-thumb-2.jpg",
            duration: "05:22",
            views: "1.8K",
            uploadDate: "2024-01-10",
            category: "tutorials",
            youtubeId: "dQw4w9WgXcQ"
        },
        {
            id: 3,
            title: "Promoción Especial - Febrero 2024",
            thumbnail: "/imgs/video-thumb-3.jpg",
            duration: "01:30",
            views: "3.2K",
            uploadDate: "2024-02-01",
            category: "promociones",
            youtubeId: "dQw4w9WgXcQ"
        },
        {
            id: 4,
            title: "Día de las Madres - Felicitación",
            thumbnail: "/imgs/video-thumb-4.jpg",
            duration: "02:15",
            views: "950",
            uploadDate: "2024-05-10",
            category: "festividades",
            youtubeId: "dQw4w9WgXcQ"
        }
    ];

    // Datos de ejemplo para blog posts
    const blogPosts = [
        {
            id: 1,
            title: "Cuando considerar una media reparación",
            excerpt: "La inversión en un tractocamión es considerable, y maximizar su vida útil es fundamental para el negocio del transporte.",
            image: "/imgs/blog-1.jpg",
            publishDate: "2024-01-18",
            readTime: "5 min",
            category: "Mantenimiento"
        },
        {
            id: 2,
            title: "La importancia de una cabeza de motor en buen estado",
            excerpt: "Una cabeza de motor en mal estado puede ser un enemigo silencioso, afectando el consumo de combustible, la potencia y, en última instancia, elevando los costos operativos.",
            image: "/imgs/blog-2.jpg",
            publishDate: "2024-01-15",
            readTime: "3 min",
            category: "Reparaciones"
        },
        {
            id: 3,
            title: "Cómo elegir las refacciones correctas para tu motor",
            excerpt: "Elegir las refacciones adecuadas es crucial para mantener el rendimiento óptimo de tu vehículo pesado y evitar costosas reparaciones futuras.",
            image: "/imgs/blog-3.jpg",
            publishDate: "2024-01-12",
            readTime: "4 min",
            category: "Guías"
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos' },
        { id: 'tutorials', label: 'Tutoriales' },
        { id: 'promociones', label: 'Promociones' },
        { id: 'festividades', label: 'Festividades' }
    ];

    // Filtrar videos según categoría seleccionada
    const filteredVideos = selectedCategory === 'todos' 
        ? videosData 
        : videosData.filter(video => video.category === selectedCategory);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
    };

    const handleBlogClick = (post) => {
        // Redirigir a la página individual del artículo
        window.location.href = `/blog/${post.id}`;
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
            // Fallback: copiar al portapapeles
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

    return (
        <div className="layout entretenimiento-page">
            
            <Navbar />

            <main className="mainContent">
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Entretenimiento</h1>
                        </div>
                    </div>
                </div>
                {/* Sección principal de contenido */}
                <section className="entertainmentMainSection">
                    <div className="entertainmentContainer">
                        
                        {/* Sección de Videos */}
                        <div className="videosSection">
                            <div className="sectionHeader">
                                <h2>VIDEOS</h2>
                                <p className="sectionDescription">
                                    Contenido educativo y promocional de nuestro canal de YouTube
                                </p>
                            </div>

                            {/* Filtros de categorías */}
                            <div className="categoryFilters">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={`categoryButton ${selectedCategory === category.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>

                            {/* Grid de videos */}
                            <div className="videosGrid">
                                {filteredVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="videoCard"
                                        onClick={() => handleVideoClick(video)}
                                    >
                                        <div className="videoThumbnail">
                                            {/* Placeholder para thumbnail - en producción vendría de YouTube */}
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
                                ))}
                            </div>

                            {/* Botón para ver más videos */}
                            <div className="sectionFooter">
                                <a 
                                    href="/videos" 
                                    className="viewMoreButton"
                                >
                                    Ver más videos
                                </a>
                            </div>
                        </div>

                        {/* Sección de Blog */}
                        <div className="blogSection">
                            <div className="sectionHeader">
                                <h2>BLOG</h2>
                                <p className="sectionDescription">
                                    Artículos y noticias sobre el mundo del transporte pesado
                                </p>
                            </div>

                            {/* Grid de posts del blog */}
                            <div className="blogGrid">
                                {blogPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="blogCard"
                                        onClick={() => handleBlogClick(post)}
                                    >
                                        <div className="blogImageContainer">
                                            {/* Placeholder para imagen - en producción tendrían imágenes reales */}
                                            <div className="blogImagePlaceholder">
                                                <div className="blogCategory">{post.category}</div>
                                            </div>
                                        </div>
                                        <div className="blogContent">
                                            <h3 className="blogTitle">{post.title}</h3>
                                            <p className="blogExcerpt">{post.excerpt}</p>
                                            <div className="blogMeta">
                                                <span className="blogDate">
                                                    <FaCalendarAlt /> {formatDate(post.publishDate)}
                                                </span>
                                                <span className="blogReadTime">
                                                    <FaClock /> {post.readTime} de lectura
                                                </span>
                                            </div>
                                            <div className="readMoreButton">
                                                Leer más
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Botón para ver más posts */}
                            <div className="sectionFooter">
                                <a href="/blog" className="viewMoreButton">
                                    Ver más artículos
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