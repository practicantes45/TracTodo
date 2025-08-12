'use client';
import './videos.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaArrowLeft, FaShare } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import SEOHead from '../components/SEOHead/SEOHead';
import { obtenerVideosSeleccionados } from '../../services/entretenimientoVideoService';
import { useSEO } from '../../hooks/useSEO';

export default function VideosPage() {
    const router = useRouter();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Hook SEO para página de videos
    const { seoData } = useSEO('videos', { path: '/videos' });

    useEffect(() => {
        cargarVideos();
    }, []);

    const cargarVideos = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🎥 Cargando videos...');

            const videosData = await obtenerVideosSeleccionados();
            console.log('✅ Videos cargados:', videosData);

            if (Array.isArray(videosData)) {
                setVideos(videosData);
            } else {
                console.warn('⚠️ Formato de datos inesperado:', videosData);
                setVideos([]);
            }
        } catch (err) {
            console.error('❌ Error al cargar videos:', err);
            setError(err.message);
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
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

    const formatDate = (publishedAt) => {
        if (!publishedAt) return '';

        try {
            const date = new Date(publishedAt);
            return date.toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return '';
        }
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
                <div className="videos-page">
                    <Navbar />
                    <main className="mainContent">
                        <div className="loadingContainer">
                            <div className="loadingSpinner"></div>
                            <p>Cargando videos...</p>
                        </div>
                    </main>
                    <Footer />
                </div>
            </>
        );
    }

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
                <div className="videos-page">
                    <Navbar />
                    <main className="mainContent">
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

            <div className="videos-page">
                <Navbar />

                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Videos Tractodo</h1>
                            <p>Tutoriales técnicos y contenido educativo para tu tractocamión</p>
                        </div>
                    </div>
                </div>

                <main className="mainContent">
                    <section className="videosMainSection">
                        <div className="videosContainer">

                            {/* Botón de regreso */}
                            <div className="backButtonContainer">
                                <button
                                    onClick={() => router.back()}
                                    className="backButton"
                                    aria-label="Regresar a la página anterior"
                                >
                                    <FaArrowLeft className="backIcon" />
                                    Regresar a entretenimiento
                                </button>
                            </div>

                            {/* Header de videos */}
                            <div className="videosHeader">
                                <h2>Nuestros Videos</h2>
                                <p>
                                    {videos.length === 0
                                        ? 'No hay videos disponibles'
                                        : `${videos.length} video${videos.length !== 1 ? 's' : ''} disponible${videos.length !== 1 ? 's' : ''}`
                                    }
                                </p>
                            </div>

                            {/* Grid de videos */}
                            {videos.length > 0 ? (
                                <div className="videosGrid">
                                    {videos.map((video) => (
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

                                                {video.descripcion && (
                                                    <p className="videoDescription">
                                                        {video.descripcion.length > 120
                                                            ? `${video.descripcion.substring(0, 120)}...`
                                                            : video.descripcion
                                                        }
                                                    </p>
                                                )}

                                                <div className="videoMeta">
                                                    {video.vistas && (
                                                        <span className="videoViews">
                                                            <FaEye />
                                                            {formatViewCount(video.vistas)} vistas
                                                        </span>
                                                    )}

                                                    {video.fechaPublicacion && (
                                                        <span className="videoDate">
                                                            <FaCalendarAlt />
                                                            {formatDate(video.fechaPublicacion)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="videoActions">
                                                    <button
                                                        onClick={() => handleVideoClick(video)}
                                                        className="watchButton"
                                                    >
                                                        <FaPlay />
                                                        Ver video
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            const url = `https://www.youtube.com/watch?v=${video.videoId}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        className="shareButton"
                                                        title="Ver en YouTube"
                                                    >
                                                        <FaShare />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="noVideos">
                                    <h3>No hay videos disponibles</h3>
                                    <p>No hay videos seleccionados para mostrar en este momento.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <Footer />
                <ScrollToTop />

                {/* Modal para video */}
                {selectedVideo && (
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
                            <div className="videoModalActions">
                                <a
                                    href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="watchOnYouTubeButton"
                                >
                                    Ver en YouTube
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}