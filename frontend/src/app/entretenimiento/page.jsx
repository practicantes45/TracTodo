'use client';
import './entretenimiento.css';
import { useState, useEffect } from 'react';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaShare, FaBook, FaArrowDown } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function EntretenimientoPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showStickyButton, setShowStickyButton] = useState(true);

    // Datos de ejemplo para shorts de YouTube
    const shortsData = [
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
        }
    ];

    // Datos del blog
    const blogData = [
        {
            id: 1,
            title: "Guía completa de mantenimiento preventivo",
            excerpt: "Aprende los fundamentos del mantenimiento preventivo para vehículos pesados y cómo implementar un programa efectivo.",
            image: "/imgs/blog-1.jpg",
            publishDate: "2024-01-20",
            readTime: "5 min",
            category: "Mantenimiento"
        },
        {
            id: 2,
            title: "Las 10 fallas más comunes en motores diésel",
            excerpt: "Identifica y soluciona los problemas más frecuentes en motores diésel para evitar costosas reparaciones.",
            image: "/imgs/blog-2.jpg",
            publishDate: "2024-01-15",
            readTime: "3 min",
            category: "Reparaciones"
        },
        {
            id: 3,
            title: "Cómo elegir las refacciones correctas para tu motor",
            excerpt: "Elegir las refacciones adecuadas es crucial para mantener el rendimiento óptimo de tu vehículo pesado.",
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

    // Detectar scroll para ocultar/mostrar botón sticky
    useEffect(() => {
        const handleScroll = () => {
            const blogSection = document.querySelector('.blogSection');
            if (blogSection) {
                const blogSectionTop = blogSection.offsetTop;
                const scrollPosition = window.scrollY + window.innerHeight;
                
                // Ocultar botón cuando el usuario está cerca o en la sección del blog
                if (scrollPosition >= blogSectionTop + 100) {
                    setShowStickyButton(false);
                } else {
                    setShowStickyButton(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filtrar shorts según categoría seleccionada
    const filteredShorts = selectedCategory === 'todos'
        ? shortsData
        : shortsData.filter(short => short.category === selectedCategory);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsVideoModalOpen(true);
    };

    const closeVideoModal = () => {
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
    };

    const handleBlogClick = (post) => {
        window.location.href = `/blog/${post.id}`;
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

    // Función para hacer scroll al blog
    const scrollToBlog = () => {
        const blogSection = document.querySelector('.blogSection');
        if (blogSection) {
            blogSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
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

    const handleSubscribe = async (email) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubscribed(true);
            setIsSubscriptionModalOpen(false);
            alert('¡Gracias por suscribirte! Te notificaremos sobre nuevos shorts y artículos.');
        } catch (error) {
            alert('Error al suscribirse. Inténtalo de nuevo.');
        }
    };

    const closeSubscriptionModal = () => {
        setIsSubscriptionModalOpen(false);
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

                        {/* Sección de Shorts */}
                        <div className="videosSection">
                            <div className="sectionHeader">
                                <h2>SHORTS</h2>
                                <p className="sectionDescription">
                                    Contenido rápido y educativo de nuestro canal de YouTube
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
                                        <h3>No hay shorts disponibles</h3>
                                        <p>Intenta con otra categoría o vuelve más tarde.</p>
                                    </div>
                                )}
                            </div>

                            {/* Botón para ver más shorts */}
                            <div className="sectionFooter">
                                <a href="/videos" className="viewMoreButton shorts">
                                    Ver más shorts
                                </a>
                            </div>
                        </div>

                        {/* Sección de Blog */}
                        <div className="blogSection">
                            <div className="sectionHeader">
                                <h2>BLOG</h2>
                                <p className="sectionDescription">
                                    Artículos detallados sobre mantenimiento, reparaciones y más
                                </p>
                            </div>

                            {/* Grid de blog */}
                            <div className="blogGrid">
                                {blogData.map((post) => (
                                    <article
                                        key={post.id}
                                        className="blogCard"
                                        onClick={() => handleBlogClick(post)}
                                    >
                                        <div className="blogImageContainer">
                                            <img src={post.image} alt={post.title} className="blogImage" />
                                            <div className="blogCategory">{post.category}</div>
                                        </div>
                                        <div className="blogContent">
                                            <h3 className="blogTitle">{post.title}</h3>
                                            <p className="blogExcerpt">{post.excerpt}</p>
                                            <div className="blogMeta">
                                                <span className="blogDate">
                                                    <FaCalendarAlt /> {formatDate(post.publishDate)}
                                                </span>
                                                <span className="blogReadTime">
                                                    <FaClock /> {post.readTime}
                                                </span>
                                            </div>
                                            <button className="readMoreButton">
                                                <span>Leer más</span>
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Botón para ver más artículos */}
                            <div className="sectionFooter">
                                <a href="/blog" className="viewMoreButton">
                                    Ver más artículos
                                </a>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Botón Sticky para Ver Blog - Solo móvil */}
                {showStickyButton && (
                    <button 
                        className="more-content-sticky"
                        onClick={scrollToBlog}
                        aria-label="Ver blog de TRACTODO"
                    >
                        <FaBook className="sticky-button-icon" />
                        Ver Blog
                        <FaArrowDown className="sticky-button-icon" />
                    </button>
                )}

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