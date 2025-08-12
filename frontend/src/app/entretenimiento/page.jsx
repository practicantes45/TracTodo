'use client';
import './entretenimiento.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaShare, FaBook, FaArrowDown, FaUser } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import EntertainmentVideoManager from '../components/EntertainmentVideoManager/EntertainmentVideoManager';
import EntertainmentBlogManager from '../components/EntertainmentBlogManager/EntertainmentBlogManager';
import BlogPostModal from '../components/BlogPostModal/BlogPostModal';
import SEOHead from '../components/SEOHead/SEOHead';
import { useAuth } from '../../hooks/useAuth';
import { obtenerVideosSeleccionados } from '../../services/entretenimientoVideoService';
import { obtenerArticulosSeleccionados } from '../../services/entretenimientoBlogService';
import { useSEO } from '../hooks/useSEO';

export default function EntretenimientoPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [showStickyButton, setShowStickyButton] = useState(true);
    const [shortsData, setShortsData] = useState([]);
    const [blogData, setBlogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogLoading, setBlogLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blogError, setBlogError] = useState(null);

    // Estados para el modal del blog
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [showBlogModal, setShowBlogModal] = useState(false);

    // Hook SEO para página de entretenimiento
    const { seoData } = useSEO('entretenimiento', { path: '/entretenimiento' });

    // Cargar videos seleccionados del backend
    useEffect(() => {
        cargarVideosSeleccionados();
    }, []);

    // Cargar artículos seleccionados del backend
    useEffect(() => {
        cargarArticulosSeleccionados();
    }, []);

    // ===== FUNCIONES PARA PROCESAR CONTENIDO ===== //

    /**
     * Limpia el contenido Markdown y convierte a texto plano legible
     * @param {string} content - Contenido con marcadores Markdown
     * @returns {string} - Texto limpio sin marcadores
     */
    const limpiarMarkdown = (content) => {
        if (!content) return '';

        return content
            // Remover subtítulos (## texto) pero mantener el texto
            .replace(/^## (.+)$/gm, '$1')
            // Remover títulos (# texto) pero mantener el texto  
            .replace(/^# (.+)$/gm, '$1')
            // Remover negritas (**texto**) pero mantener el texto
            .replace(/\*\*(.*?)\*\*/g, '$1')
            // Remover cursivas (*texto*) pero mantener el texto
            .replace(/\*(.*?)\*/g, '$1')
            // Remover enlaces [texto](url) pero mantener el texto
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remover líneas horizontales
            .replace(/^---+$/gm, '')
            // Remover múltiples saltos de línea
            .replace(/\n{3,}/g, '\n\n')
            // Limpiar espacios extra
            .trim();
    };

    /**
     * Genera descripción corta del contenido
     * @param {string} content - Contenido completo
     * @returns {string} - Descripción de máximo 120 caracteres
     */
    const generarDescripcionCorta = (content) => {
        if (!content) return '';
        
        const textoLimpio = limpiarMarkdown(content);
        const maxLength = 120;
        
        if (textoLimpio.length <= maxLength) {
            return textoLimpio;
        }
        
        // Cortar en la palabra más cercana al límite
        const cortado = textoLimpio.substring(0, maxLength);
        const ultimoEspacio = cortado.lastIndexOf(' ');
        
        return ultimoEspacio > 0 
            ? cortado.substring(0, ultimoEspacio) + '...'
            : cortado + '...';
    };

    // ===== FUNCIONES PARA CARGAR DATOS ===== //

    const cargarVideosSeleccionados = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🎥 Cargando videos seleccionados...');
            
            const videos = await obtenerVideosSeleccionados();
            console.log('✅ Videos seleccionados cargados:', videos);
            
            if (Array.isArray(videos)) {
                setShortsData(videos);
            } else {
                console.warn('⚠️ Formato de datos de videos inesperado:', videos);
                setShortsData([]);
            }
        } catch (err) {
            console.error('❌ Error al cargar videos seleccionados:', err);
            setError(err.message);
            setShortsData([]);
        } finally {
            setLoading(false);
        }
    };

    const cargarArticulosSeleccionados = async () => {
        try {
            setBlogLoading(true);
            setBlogError(null);
            console.log('📚 Cargando artículos seleccionados...');
            
            const articulos = await obtenerArticulosSeleccionados();
            console.log('✅ Artículos seleccionados cargados:', articulos);
            
            if (Array.isArray(articulos)) {
                setBlogData(articulos);
            } else {
                console.warn('⚠️ Formato de datos de artículos inesperado:', articulos);
                setBlogData([]);
            }
        } catch (err) {
            console.error('❌ Error al cargar artículos seleccionados:', err);
            setBlogError(err.message);
            setBlogData([]);
        } finally {
            setBlogLoading(false);
        }
    };

    // ===== FUNCIONES DE EVENTOS ===== //

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        setIsVideoModalOpen(true);
        console.log('🎥 Video seleccionado:', video.titulo);
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
        setIsVideoModalOpen(false);
    };

    const handleBlogClick = (postId) => {
        setSelectedPostId(postId);
        setShowBlogModal(true);
        console.log('📖 Post seleccionado:', postId);
    };

    const closeBlogModal = () => {
        setSelectedPostId(null);
        setShowBlogModal(false);
    };

    const navigateToPage = (page) => {
        console.log(`🔗 Navegando a: ${page}`);
        router.push(`/${page}`);
    };

    // ===== FUNCIONES DE UTILIDAD ===== //

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return 'Fecha no disponible';
        }
    };

    const formatDuration = (duration) => {
        if (!duration) return '';
        
        // Si viene en formato ISO 8601 (PT4M13S)
        if (duration.startsWith('PT')) {
            const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
                const minutes = parseInt(match[1] || 0);
                const seconds = parseInt(match[2] || 0);
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        
        return duration;
    };

    const formatViewCount = (viewCount) => {
        if (!viewCount) return '0';
        
        const count = parseInt(viewCount);
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    // Schema.org para la página de entretenimiento
    const schemaEntertainment = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Entretenimiento Tractodo",
        "description": "Contenido educativo sobre tractocamiones: videos técnicos, artículos especializados, consejos y casos de éxito",
        "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/entretenimiento`,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": shortsData.length + blogData.length,
            "itemListElement": [
                ...shortsData.slice(0, 5).map((video, index) => ({
                    "@type": "VideoObject",
                    "position": index + 1,
                    "name": video.titulo,
                    "description": video.descripcion,
                    "thumbnailUrl": video.thumbnail,
                    "embedUrl": `https://www.youtube.com/embed/${video.videoId}`
                })),
                ...blogData.slice(0, 5).map((post, index) => ({
                    "@type": "BlogPosting",
                    "position": shortsData.length + index + 1,
                    "headline": post.titulo,
                    "description": generarDescripcionCorta(post.contenido),
                    "datePublished": post.fechaCreacion
                }))
            ]
        }
    };

    return (
        <>
            {/* SEO Head */}
            {seoData && (
                <SEOHead
                    title={seoData.title}
                    description={seoData.description}
                    keywords={seoData.keywords}
                    ogTitle={seoData.ogTitle}
                    ogDescription={seoData.ogDescription}
                    ogImage={seoData.ogImage}
                    ogUrl={seoData.ogUrl}
                    canonicalUrl={seoData.canonicalUrl}
                    schema={schemaEntertainment}
                />
            )}

            <div className="layout entretenimiento-page">
                <Navbar />

                <main className="mainContent">
                    {/* Hero Section */}
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>Entretenimiento Tractodo</h1>
                                <p>Videos técnicos, artículos especializados y contenido educativo para tu tractocamión</p>
                            </div>
                        </div>
                    </div>

                    {/* Sección principal de entretenimiento */}
                    <section className="entertainmentMainSection">
                        <div className="entertainmentContainer">
                            
                            {/* Botones de navegación rápida */}
                            <div className="quickNavigation">
                                <button
                                    onClick={() => navigateToPage('videos')}
                                    className="navButton videosButton"
                                >
                                    <FaPlay className="navIcon" />
                                    <span>Ver Todos los Videos</span>
                                    <small>{shortsData.length} disponibles</small>
                                </button>

                                <button
                                    onClick={() => navigateToPage('blog')}
                                    className="navButton blogButton"
                                >
                                    <FaBook className="navIcon" />
                                    <span>Ver Todo el Blog</span>
                                    <small>{blogData.length} artículos</small>
                                </button>
                            </div>

                            {/* Sección de Videos */}
                            <div className="contentSection">
                                <div className="sectionHeader">
                                    <h2>🎥 Videos Destacados</h2>
                                    <p>Tutoriales técnicos y contenido educativo sobre tractocamiones</p>
                                </div>

                                {loading ? (
                                    <div className="loadingContainer">
                                        <div className="loadingSpinner"></div>
                                        <p>Cargando videos...</p>
                                    </div>
                                ) : error ? (
                                    <div className="errorContainer">
                                        <p>❌ Error al cargar videos: {error}</p>
                                        <button onClick={cargarVideosSeleccionados} className="retryButton">
                                            Intentar de nuevo
                                        </button>
                                    </div>
                                ) : shortsData.length > 0 ? (
                                    <div className="videosGrid">
                                        {shortsData.slice(0, 6).map((video) => (
<div key={video.videoId} className="videoCard">
                                                <div 
                                                    className="videoThumbnailContainer"
                                                    onClick={() => handleVideoClick(video)}
                                                >
                                                    <img 
                                                        src={video.thumbnail} 
                                                        alt={`Thumbnail de ${video.titulo}`}
                                                        className="videoThumbnail"
                                                        loading="lazy"
                                                    />
                                                    <div className="playOverlay">
                                                        <FaPlay className="playIcon" />
                                                    </div>
                                                    
                                                    {video.duracion && (
                                                        <div className="videoDuration">
                                                            {formatDuration(video.duracion)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="videoInfo">
                                                    <h3 
                                                        className="videoTitle"
                                                        onClick={() => handleVideoClick(video)}
                                                    >
                                                        {video.titulo}
                                                    </h3>

                                                    <div className="videoMeta">
                                                        {video.vistas && (
                                                            <span className="videoViews">
                                                                <FaEye />
                                                                {formatViewCount(video.vistas)}
                                                            </span>
                                                        )}
                                                        
                                                        {video.fechaPublicacion && (
                                                            <span className="videoDate">
                                                                <FaCalendarAlt />
                                                                {formatDate(video.fechaPublicacion)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="noContent">
                                        <p>No hay videos seleccionados para mostrar.</p>
                                    </div>
                                )}

                                {shortsData.length > 6 && (
                                    <div className="viewMoreContainer">
                                        <button
                                            onClick={() => navigateToPage('videos')}
                                            className="viewMoreButton"
                                        >
                                            Ver todos los videos
                                            <FaArrowDown className="arrowIcon" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sección de Blog */}
                            <div className="contentSection">
                                <div className="sectionHeader">
                                    <h2>📚 Artículos Destacados</h2>
                                    <p>Consejos técnicos, casos de éxito y guías especializadas</p>
                                </div>

                                {blogLoading ? (
                                    <div className="loadingContainer">
                                        <div className="loadingSpinner"></div>
                                        <p>Cargando artículos...</p>
                                    </div>
                                ) : blogError ? (
                                    <div className="errorContainer">
                                        <p>❌ Error al cargar artículos: {blogError}</p>
                                        <button onClick={cargarArticulosSeleccionados} className="retryButton">
                                            Intentar de nuevo
                                        </button>
                                    </div>
                                ) : blogData.length > 0 ? (
                                    <div className="blogGrid">
                                        {blogData.slice(0, 6).map((post) => (
                                            <article key={post.id} className="blogCard">
                                                <div className="blogHeader">
                                                    <div className="blogMeta">
                                                        <span className="blogCategory">
                                                            {post.categoria}
                                                        </span>
                                                        <span className="blogDate">
                                                            <FaCalendarAlt />
                                                            {formatDate(post.fechaCreacion)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="blogContent">
                                                    <h3 
                                                        className="blogTitle"
                                                        onClick={() => handleBlogClick(post.id)}
                                                    >
                                                        {post.titulo}
                                                    </h3>

                                                    <div className="blogDescription">
                                                        {generarDescripcionCorta(post.contenido)}
                                                    </div>

                                                    <div className="blogFooter">
                                                        <div className="blogStats">
                                                            <span className="blogViews">
                                                                <FaEye />
                                                                {post.vistas || 0} vistas
                                                            </span>
                                                            <span className="blogReadTime">
                                                                <FaClock />
                                                                {Math.max(1, Math.ceil((post.contenido?.length || 0) / 1000))} min
                                                            </span>
                                                        </div>

                                                        <button
                                                            onClick={() => handleBlogClick(post.id)}
                                                            className="readMoreButton"
                                                        >
                                                            Leer más
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="noContent">
                                        <p>No hay artículos seleccionados para mostrar.</p>
                                    </div>
                                )}

                                {blogData.length > 6 && (
                                    <div className="viewMoreContainer">
                                        <button
                                            onClick={() => navigateToPage('blog')}
                                            className="viewMoreButton"
                                        >
                                            Ver todos los artículos
                                            <FaArrowDown className="arrowIcon" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Paneles de administración (solo para admins) */}
                            {isAdmin && (
                                <div className="adminSection">
                                    <h3>Panel de Administración</h3>
                                    <div className="adminButtons">
                                        <EntertainmentVideoManager 
                                            onVideosUpdate={cargarVideosSeleccionados}
                                        />
                                        <EntertainmentBlogManager 
                                            onArticulosUpdate={cargarArticulosSeleccionados}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <Footer />
                <ScrollToTop />

                {/* Modal para video */}
                {isVideoModalOpen && selectedVideo && (
                    <div className="videoModal" onClick={closeVideoModal}>
                        <div className="videoModalContent" onClick={(e) => e.stopPropagation()}>
                            <div className="videoModalHeader">
                                <h3>{selectedVideo.titulo}</h3>
                                <button 
                                    className="closeButton"
                                    onClick={closeVideoModal}
                                    aria-label="Cerrar video"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="videoPlayerContainer">
                                <iframe
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                                    title={selectedVideo.titulo}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            {selectedVideo.descripcion && (
                                <div className="videoModalDescription">
                                    <p>{selectedVideo.descripcion}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal para blog */}
                {showBlogModal && selectedPostId && (
                    <BlogPostModal
                        postId={selectedPostId}
                        onClose={closeBlogModal}
                    />
                )}
            </div>
        </>
    );
}