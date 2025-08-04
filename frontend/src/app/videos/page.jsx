'use client';
import './videos.css';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser, FaPlay, FaEye, FaShare, FaYoutube, FaTiktok, FaArrowLeft, FaPlus } from "react-icons/fa";
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import AdminVideoButtons from '../components/AdminVideoButtons/AdminVideoButtons';
import VideoModal from '../components/VideoModal/VideoModal';
import { useAuth } from '../../hooks/useAuth';
import { obtenerVideos } from '../../services/videoService';

function VideosContent() {
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

    const handleBackToEntertainment = () => {
        router.push('/entretenimiento');
    };

    // Función para manejar imágenes no encontradas
    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+';
        e.target.alt = 'Imagen no encontrada';
    };

    // Renderizar estado de carga
    if (loading) {
        return (
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
                                <div className="spinner"></div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        );
    }

    // Renderizar estado de error
    if (error) {
        return (
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
        );
    }

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
                                aria-label="Regresar a Entretenimiento"
                            >
                                <FaArrowLeft className="backIcon" />
                                Regresar
                            </button>
                        </div>

                        {/* Botones de administración - Solo para admin */}
                        {isAdmin && (
                            <AdminVideoButtons
                                onVideoUpdate={handleVideoUpdate}
                                existingVideos={allShorts}
                                showAddButton={true}
                                onAddVideo={handleAgregarVideo}
                            />
                        )}

                        {/* Filtros y controles */}
                        <div className="videosControls">
                            <div className="categoryTabs">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        className={`categoryTab ${selectedCategory === category.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>

                            <div className="searchContainer">
                                <input
                                    type="text"
                                    placeholder="Buscar videos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="clearSearchButton"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Grid de videos */}
                        <div className="shortsGrid">
                            {filteredShorts.length > 0 ? (
                                filteredShorts.map((short) => (
                                    <div key={short.id} className="shortCard" onClick={() => handleVideoClick(short)}>
                                        <div className="shortThumbnail">
                                            <img
                                                src={getYouTubeThumbnail(short.youtubeLink)}
                                                alt={short.title}
                                                onError={handleImageError}
                                            />
                                            <div className="playOverlay">
                                                <FaPlay />
                                            </div>
                                            <div className="videoControls">
                                                <button
                                                    className="shareButton"
                                                    onClick={(e) => handleShareVideo(short, e)}
                                                    aria-label="Compartir video"
                                                >
                                                    <FaShare />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="shortInfo">
                                            <h3 className="shortTitle">{short.title}</h3>
                                            <p className="shortCategory">{short.category}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="noVideosMessage">
                                    <h3>No se encontraron videos</h3>
                                    <p>
                                        {searchTerm
                                            ? `No hay videos que coincidan con "${searchTerm}"`
                                            : selectedCategory !== 'todos'
                                            ? `No hay videos en la categoría "${categories.find(c => c.id === selectedCategory)?.label}"`
                                            : 'No hay videos disponibles en este momento'
                                        }
                                    </p>
                                    {isAdmin && (
                                        <p>Como administrador, puedes agregar videos usando el botón "Agregar Video" arriba.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer de videos */}
                        <div className="videosFooter">
                            <div className="channelInfo">
                                <h3>¡Suscríbete a nuestro canal!</h3>
                                <p>No te pierdas nuestros últimos videos y contenido exclusivo.</p>
                            </div>
                            <div className="subscribeButtonContainer">
                                <a
                                    href="https://www.youtube.com/@TRACTODO"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="subscribeButton"
                                >
                                    <FaYoutube />
                                    Suscribirse
                                </a>
                                <a
                                    href="https://www.youtube.com/@TRACTODO"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="viewChannelButton"
                                >
                                    Ver Canal
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal de Video */}
                {isVideoModalOpen && selectedVideo && (
                    <VideoModal
                        isOpen={isVideoModalOpen}
                        video={selectedVideo}
                        onClose={closeVideoModal}
                    />
                )}

                {/* ScrollToTop Component */}
                <ScrollToTop />
            </main>

            <Footer />
        </div>
    );
}

// Componente de fallback para Suspense
function VideosPageFallback() {
    return (
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
                            <h2>Cargando...</h2>
                            <div className="spinner"></div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

// Componente principal con Suspense
export default function VideosPage() {
    return (
        <Suspense fallback={<VideosPageFallback />}>
            <VideosContent />
        </Suspense>
    );
}