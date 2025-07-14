'use client';
import './entretenimiento.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaShare, FaBook, FaArrowDown } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function EntretenimientoPage() {
    const router = useRouter();
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [showStickyButton, setShowStickyButton] = useState(true);

    // Datos simplificados para shorts de YouTube - Solo 5 videos
    const shortsData = [
        {
            id: 1,
            title: "Media Reparación ISM",
            youtubeLink: "https://youtube.com/shorts/uBFnf3OnzSc?si=7tFbTRzaaoV987gm",
            category: "Cargas Promocionales"
        },
        {
            id: 2,
            title: "Confianza Al  Cliente",
            youtubeLink: "https://youtube.com/shorts/u2DCUuzE9eo?si=PvtVB77U6PvsU6fQ",
            category: "Descargas de Risa"
        },
        {
            id: 3,
            title: "Dale A Tu Motor Lo Mejor",
            youtubeLink: "https://youtube.com/shorts/bA2qhK3NzLI?si=EVMAjptREbIn6U9H",
            category: "Cargas Promocionales"
        },
        {
            id: 4,
            title: "No Tengas Dudas",
            youtubeLink: "https://youtube.com/shorts/WMXAFSCP00o?si=vtD1HVKhnPEf96Zc",
            category: "Descargas de Risa"
        },
        {
            id: 5,
            title: "Cabeza Para Motor Volvo D13 Nueva",
            youtubeLink: "https://youtube.com/shorts/n0V3eG2A38Y?si=-mjo1g1NiZ5PKZAf",
            category: "Cargas Promocionales"
        }
    ];

    // Datos del blog - Solo 5 artículos
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
        },
        {
            id: 4,
            title: "Mantenimiento preventivo: Calendario anual para tu flota",
            excerpt: "Un programa de mantenimiento preventivo bien estructurado puede reducir hasta un 40% los costos de reparación.",
            image: "/imgs/blog-4.jpg",
            publishDate: "2024-01-08",
            readTime: "7 min",
            category: "Mantenimiento"
        },
        {
            id: 5,
            title: "Síntomas de problemas en el sistema de inyección",
            excerpt: "Identificar tempranamente los problemas en el sistema de inyección puede ahorrarte miles de pesos en reparaciones.",
            image: "/imgs/blog-5.jpg",
            publishDate: "2024-01-05",
            readTime: "6 min",
            category: "Diagnóstico"
        }
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

    // Función para extraer ID de YouTube del link
    const extractYouTubeId = (url) => {
        if (!url) {
            console.log('❌ No URL provided');
            return null;
        }
        
        console.log('🔗 Extracting ID from URL:', url); // Debug
        
        try {
            // Para YouTube Shorts
            const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
            if (shortsMatch) {
                console.log('📹 Found shorts ID:', shortsMatch[1]); // Debug
                return shortsMatch[1];
            }
            
            // Para videos normales de YouTube con watch?v=
            const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
            if (watchMatch) {
                console.log('🎥 Found watch video ID:', watchMatch[1]); // Debug
                return watchMatch[1];
            }
            
            // Para URLs cortas youtu.be
            const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (shortUrlMatch) {
                console.log('🔗 Found short URL video ID:', shortUrlMatch[1]); // Debug
                return shortUrlMatch[1];
            }
            
            // Para URLs que ya contienen solo el ID
            const directIdMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
            if (directIdMatch) {
                console.log('🎯 Direct video ID:', url); // Debug
                return url;
            }
            
        } catch (error) {
            console.error('💥 Error extracting YouTube ID:', error);
        }
        
        console.log('❌ No ID found for URL:', url); // Debug
        return null;
    };

    const handleVideoClick = (video) => {
        console.log('🎥 Video clicked:', video); // Debug
        
        try {
            const videoId = extractYouTubeId(video.youtubeLink);
            console.log('🔍 Extracted video ID:', videoId); // Debug
            
            if (videoId) {
                const videoData = {
                    ...video,
                    youtubeId: videoId,
                    isShort: video.youtubeLink.includes('/shorts/')
                };
                console.log('✅ Setting video data:', videoData); // Debug
                console.log('🎬 Opening modal...'); // Debug
                
                setSelectedVideo(videoData);
                setIsVideoModalOpen(true);
                
                // Verificar que el estado se actualizó
                setTimeout(() => {
                    console.log('📊 Modal state:', {
                        isOpen: isVideoModalOpen,
                        selectedVideo: selectedVideo
                    });
                }, 100);
                
            } else {
                console.log('❌ No video ID found, opening in new tab:', video.youtubeLink); // Debug
                window.open(video.youtubeLink, '_blank');
            }
        } catch (error) {
            console.error('💥 Error in handleVideoClick:', error);
            // Fallback: abrir en YouTube
            window.open(video.youtubeLink, '_blank');
        }
    };

    const closeVideoModal = () => {
        console.log('Closing video modal'); // Debug
        setIsVideoModalOpen(false);
        setSelectedVideo(null);
    };

    const handleBlogClick = (post) => {
        router.push(`/blog/${post.id}`);
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

    // Funciones de navegación usando router
    const goToVideos = () => {
        router.push('/videos');
    };

    const goToBlog = () => {
        router.push('/blog');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Función para generar thumbnail de YouTube
    const getYouTubeThumbnail = (youtubeLink) => {
        const videoId = extractYouTubeId(youtubeLink);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        return '/imgs/default-video-thumb.jpg'; // imagen por defecto si no se puede obtener
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
                                <h2>VIDEOS</h2>
                                <p className="sectionDescription">
                                     Tractovideos: ¡Vía hacia la emoción y la información!
                                </p>
                            </div>

                            {/* Grid de shorts - SIN FILTROS */}
                            <div className="shortsGrid">
                                {shortsData.map((short) => (
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
                                ))}
                            </div>

                            {/* Botón para ver más shorts - CAMBIADO A BUTTON */}
                            <div className="sectionFooter">
                                <button 
                                    onClick={goToVideos}
                                    className="viewMoreButton shorts"
                                    type="button"
                                >
                                    Ver más shorts
                                </button>
                            </div>
                        </div>

                        {/* Sección de Blog */}
                        <div className="blogSection">
                            <div className="sectionHeader">
                                <h2>BLOG</h2>
                                <p className="sectionDescription">
                                    Tractoinformación: ¡Conocimiento en movimiento!
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

                            {/* Botón para ver más artículos - CAMBIADO A BUTTON */}
                            <div className="sectionFooter">
                                <button 
                                    onClick={goToBlog}
                                    className="viewMoreButton"
                                    type="button"
                                >
                                    Ver más artículos
                                </button>
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
                                {selectedVideo.youtubeId ? (
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
                                ) : (
                                    <div className="videoErrorContainer">
                                        <div>Error al cargar el video</div>
                                        <button 
                                            className="youtubeButton"
                                            onClick={() => window.open(selectedVideo.youtubeLink, '_blank')}
                                        >
                                            Ver en YouTube
                                        </button>
                                    </div>
                                )}
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