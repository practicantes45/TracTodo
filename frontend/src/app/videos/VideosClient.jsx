'use client';
import './videos.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser, FaPlay, FaEye, FaShare, FaYoutube, FaTiktok, FaArrowLeft, FaPlus } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import AdminVideoButtons from '../components/AdminVideoButtons/AdminVideoButtons';
import VideoModal from '../components/VideoModal/VideoModal';
import { useAuth } from '../../hooks/useAuth';
import { obtenerVideos } from '../../services/videoService';
import { useSEO } from '../../hooks/useSEO';

export default function VideosPage() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [allShorts, setAllShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para el modal de agregar video
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // Hook SEO para página de videos
    const { seoData } = useSEO('videos', { path: '/videos' });

    const categories = [
        { id: 'todos', label: 'Todos' },
        { id: 'Descargas de Risa', label: 'Descargas de Risa' },
        { id: 'Cargas Promocionales', label: 'Cargas Promocionales' },
        { id: 'Entregas Festivas', label: 'Entregas Festivas' }
    ];

    // Cargar videos del backend al montar el componente
    useEffect(() => {
        cargarVideos();
    }, []);

    const cargarVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🎬 Cargando videos del backend...');

            const videos = await obtenerVideos();
            console.log('✅ Videos cargados:', videos);

            // Transformar datos si es necesario para compatibilidad
            const videosFormateados = videos.map(video => ({
                id: video.id,
                title: video.titulo || video.title,
                youtubeLink: video.urlVideo || video.youtubeLink,
                category: video.categoria || video.category,
                fecha: video.fecha
            }));

            setAllShorts(videosFormateados);
        } catch (error) {
            console.error('❌ Error al cargar videos:', error);
            setError('Error al cargar los videos. Inténtalo de nuevo.');
            // Mantener array vacío en caso de error
            setAllShorts([]);
        } finally {
            setLoading(false);
        }
    };

    // Manejar actualizaciones de videos por admin
    const handleVideoUpdate = async (action, videoData) => {
        console.log('🎬 Admin video action:', action, videoData);

        try {
            if (action === 'create') {
                // Los datos vienen formateados del modal, adaptarlos para el backend
                const datosBackend = {
                    titulo: videoData.title,
                    urlVideo: videoData.youtubeLink,
                    categoria: videoData.category,
                    fecha: new Date().toISOString()
                };

                await import('../../services/videoService').then(({ agregarVideo }) =>
                    agregarVideo(datosBackend)
                );
                console.log('✅ Video agregado al backend');

            } else if (action === 'edit') {
                // Actualizar video existente
                const datosBackend = {
                    titulo: videoData.title,
                    urlVideo: videoData.youtubeLink,
                    categoria: videoData.category
                };

                await import('../../services/videoService').then(({ actualizarVideo }) =>
                    actualizarVideo(videoData.id, datosBackend)
                );
                console.log('✅ Video editado en backend');

            } else if (action === 'delete') {
                // Eliminar video
                await import('../../services/videoService').then(({ eliminarVideo }) =>
                    eliminarVideo(videoData)
                );
                console.log('✅ Video eliminado del backend');
            }

            // Recargar videos después de cualquier operación
            await cargarVideos();

        } catch (error) {
            console.error('❌ Error en handleVideoUpdate:', error);
            alert(`Error al ${action === 'create' ? 'agregar' : action === 'edit' ? 'editar' : 'eliminar'} el video. Inténtalo de nuevo.`);
        }
    };

    // Manejar agregar video desde el botón integrado
    const handleAgregarVideo = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleVideoSaved = async (action, videoData) => {
        setIsAddModalOpen(false);
        await handleVideoUpdate(action, videoData);
    };

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
        return '/imgs/default-video-thumb.jpg';
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
        router.push('/entretenimiento');
    };

    const goToYouTubeChannel = () => {
        window.open('https://www.youtube.com/@TRACTODO', '_blank');
    };

    const goToTikTokProfile = () => {
        window.open('https://www.tiktok.com/@tractodo4', '_blank');
    };


    // Schema.org para la página de videos
    const schemaVideoGallery = {
        "@context": "https://schema.org",
        "@type": "VideoGallery",
        "name": "Videos Tractodo",
        "description": "Videos educativos sobre tractocamiones: tutoriales, instalación de refacciones, mantenimiento preventivo y más",
        "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/videos`,
        "publisher": {
            "@type": "Organization",
            "name": "Tractodo",
            "url": "https://tractodo.com"
        },
        "video": videos.slice(0, 10).map(video => ({
            "@type": "VideoObject",
            "name": video.titulo,
            "description": video.descripcion,
            "thumbnailUrl": video.thumbnail,
            "uploadDate": video.fechaPublicacion,
            "duration": video.duracion,
            "embedUrl": `https://www.youtube.com/embed/${video.videoId}`,
            "publisher": {
                "@type": "Organization",
                "name": "Tractodo"
            }
        }))
    };

    // Mostrar loading
    if (loading) {
        return (
            <>
                {seoData && (
                    <SEOHead
                        title={seoData.title}
                        description={seoData.description}
                        keywords={seoData.keywords}
                        canonicalUrl={seoData.canonicalUrl}
                    />
                )}
                <div className="layout videos-page">
                    <Navbar />
                    <main className="mainContent">
                        <div className="heroSection">
                            <div className="heroOverlay">
                                <div className="heroContent">
                                    <h1>Shorts de YouTube</h1>
                                </div>
                            </div>
                        </div>
                        <section className="videosMainSection">
                            <div className="videosContainer">
                                <div className="loadingContainer">
                                    <h2>Cargando videos...</h2>
                                    <p>Por favor espera un momento</p>
                                </div>
                            </div>
                        </section>
                    </main>
                    <Footer />
                </div>
            </>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <>
                {seoData && (
                    <SEOHead
                        title={seoData.title}
                        description={seoData.description}
                        keywords={seoData.keywords}
                        canonicalUrl={seoData.canonicalUrl}
                    />
                )}
            <div className="layout videos-page">
                <Navbar />
                <main className="mainContent">
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>Shorts de YouTube</h1>
                            </div>
                        </div>
                    </div>
                    <section className="videosMainSection">
                        <div className="videosContainer">
                            <div className="errorContainer">
                                <h2>Error al cargar videos</h2>
                                <p>{error}</p>
                                <button onClick={cargarVideos} className="retryButton">
                                    Intentar de nuevo
                                </button>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
            </>
        );
    }

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
                    schema={schemaVideoGallery}
                />
            )}
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

                        {/* Header con estadísticas y botón de agregar */}
                        <div className="videosHeader">
                            <div className="videosStats">
                                <h2>¡Arranca el motor y vamos a ver!</h2>
                                <p>{filteredShorts.length} shorts encontrados</p>
                            </div>

                            {/* BOTÓN DE AGREGAR VIDEO INTEGRADO - SOLO SI ES ADMIN */}
                            {isAdmin && (
                                <div className="adminActionsContainer">
                                    <button
                                        className="addVideoButton"
                                        onClick={handleAgregarVideo}
                                        title="Agregar nuevo video"
                                    >
                                        <FaPlus className="addIcon" />
                                        Agregar Video
                                    </button>
                                </div>
                            )}
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
                                        {/* BOTONES DE ADMIN - SOLO SI ES ADMIN */}
                                        {isAdmin && (
                                            <AdminVideoButtons
                                                video={short}
                                                onVideoUpdate={handleVideoUpdate}
                                            />
                                        )}

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

                {/* Modal de agregar video */}
                {isAddModalOpen && (
                    <VideoModal
                        isOpen={isAddModalOpen}
                        mode="create"
                        video={null}
                        onClose={handleCloseAddModal}
                        onSaved={handleVideoSaved}
                    />
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
        </>
    );
}