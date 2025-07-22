'use client';
import './entretenimiento.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaShare, FaBook, FaArrowDown } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import EntertainmentVideoManager from '../components/EntertainmentVideoManager/EntertainmentVideoManager';
import { useAuth } from '../../hooks/useAuth';
import { obtenerVideosSeleccionados } from '../../services/entretenimientoVideoService';

export default function EntretenimientoPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [showStickyButton, setShowStickyButton] = useState(true);
    const [shortsData, setShortsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Datos del blog - mantienen los datos locales como estaban
    const blogData = [
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
        },
        {
            id: 4,
            title: "Mantenimiento preventivo: Calendario anual para tu flota",
            excerpt: "Un programa de mantenimiento preventivo bien estructurado puede reducir hasta un 40% los costos de reparación y aumentar significativamente la vida útil de tus vehículos.",
            image: "/imgs/blog-4.jpg",
            publishDate: "2024-01-08",
            readTime: "7 min",
            category: "Mantenimiento"
        },
        {
            id: 5,
            title: "Síntomas de problemas en el sistema de inyección",
            excerpt: "Identificar tempranamente los problemas en el sistema de inyección puede ahorrarte miles de pesos en reparaciones mayores.",
            image: "/imgs/blog-5.jpg",
            publishDate: "2024-01-05",
            readTime: "6 min",
            category: "Diagnóstico"
        }
    ];

    // Cargar videos seleccionados del backend
    useEffect(() => {
        cargarVideosSeleccionados();
    }, []);

    const cargarVideosSeleccionados = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🎬 Cargando videos seleccionados para entretenimiento...');
            
            const videos = await obtenerVideosSeleccionados();
            console.log('✅ Videos seleccionados cargados:', videos);
            
            // Transformar datos del backend al formato esperado por el frontend
            const videosFormateados = videos.map(video => ({
                id: video.id,
                title: video.titulo || video.title,
                youtubeLink: video.urlVideo || video.youtubeLink,
                category: video.categoria || video.category
            }));
            
            setShortsData(videosFormateados);
        } catch (error) {
            console.error('❌ Error al cargar videos seleccionados:', error);
            setError('Error al cargar los videos. Inténtalo de nuevo.');
            // En caso de error, usar array vacío
            setShortsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualizaciones cuando el admin modifica videos
    const handleVideosUpdate = async () => {
        console.log('🔄 Actualizando videos de entretenimiento...');
        await cargarVideosSeleccionados();
    };

    // Detectar scroll para ocultar/mostrar botón sticky
    useEffect(() => {
        const handleScroll = () => {
            const blogSection = document.querySelector('.blogSection');
            if (blogSection) {
                const blogSectionTop = blogSection.offsetTop;
                const scrollPosition = window.scrollY + window.innerHeight;
                
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

    const extractYouTubeId = (url) => {
        if (!url) {
            console.log('❌ No URL provided');
            return null;
        }
        
        console.log('🔗 Extracting ID from URL:', url);
        
        try {
            const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
            if (shortsMatch) {
                console.log('📹 Found shorts ID:', shortsMatch[1]);
                return shortsMatch[1];
            }
            
            const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
            if (watchMatch) {
                console.log('🎥 Found watch video ID:', watchMatch[1]);
                return watchMatch[1];
            }
            
            const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (shortUrlMatch) {
                console.log('🔗 Found short URL video ID:', shortUrlMatch[1]);
                return shortUrlMatch[1];
            }
            
            const directIdMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
            if (directIdMatch) {
                console.log('🎯 Direct video ID:', url);
                return url;
            }
            
        } catch (error) {
            console.error('💥 Error extracting YouTube ID:', error);
        }
        
        console.log('❌ No ID found for URL:', url);
        return null;
    };

    const handleVideoClick = (video) => {
        console.log('🎥 Video clicked:', video);
        
        try {
            const videoId = extractYouTubeId(video.youtubeLink);
            console.log('🔍 Extracted video ID:', videoId);
            
            if (videoId) {
                const videoData = {
                    ...video,
                    youtubeId: videoId,
                    isShort: video.youtubeLink.includes('/shorts/')
                };
                console.log('✅ Setting video data:', videoData);
                console.log('🎬 Opening modal...');
                
                setSelectedVideo(videoData);
                setIsVideoModalOpen(true);
                
            } else {
                console.log('❌ No video ID found, opening in new tab:', video.youtubeLink);
                window.open(video.youtubeLink, '_blank');
            }
        } catch (error) {
            console.error('💥 Error in handleVideoClick:', error);
            window.open(video.youtubeLink, '_blank');
        }
    };

    const closeVideoModal = () => {
        console.log('Closing video modal');
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

    const scrollToBlog = () => {
        const blogSection = document.querySelector('.blogSection');
        if (blogSection) {
            blogSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    };

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

    const getYouTubeThumbnail = (youtubeLink) => {
        const videoId = extractYouTubeId(youtubeLink);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        return '/imgs/default-video-thumb.jpg';
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

                        {/* Botón de gestión de videos - Solo para admin */}
                        {isAdmin && (
                            <div className="adminVideoControls">
                                <EntertainmentVideoManager onVideosUpdate={handleVideosUpdate} />
                            </div>
                        )}

                        {/* Sección de Shorts */}
                        <div className="videosSection">
                            <div className="sectionHeader">
                                <h2>VIDEOS</h2>
                                <p className="sectionDescription">
                                     Tractovideos: ¡Vía hacia la emoción y la información!
                                </p>
                            </div>

                            {/* Estado de carga */}
                            {loading && (
                                <div className="loadingContainer">
                                    <h3>Cargando videos...</h3>
                                    <p>Por favor espera un momento</p>
                                </div>
                            )}

                            {/* Estado de error */}
                            {error && (
                                <div className="errorContainer">
                                    <h3>Error al cargar videos</h3>
                                    <p>{error}</p>
                                    <button onClick={cargarVideosSeleccionados} className="retryButton">
                                        Intentar de nuevo
                                    </button>
                                </div>
                            )}

                            {/* Grid de shorts */}
                            {!loading && !error && (
                                <>
                                    {shortsData.length > 0 ? (
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
                                    ) : (
                                        <div className="noVideosMessage">
                                            <h3>No hay videos seleccionados</h3>
                                            <p>El administrador no ha seleccionado videos para mostrar en entretenimiento.</p>
                                            {isAdmin && (
                                                <p>
                                                    <strong>Como administrador, puedes seleccionar videos usando el botón "Gestionar Videos" arriba.</strong>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para ver más shorts - solo si hay videos */}
                                    {shortsData.length > 0 && (
                                        <div className="sectionFooter">
                                            <button 
                                                onClick={goToVideos}
                                                className="viewMoreButton shorts"
                                                type="button"
                                            >
                                                Ver más shorts
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Sección de Blog - mantiene el comportamiento original */}
                        <div className="blogSection">
                            <div className="sectionHeader">
                                <h2>BLOG</h2>
                                <p className="sectionDescription">
                                    Tractoinformación: ¡Conocimiento en movimiento!
                                </p>
                            </div>

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