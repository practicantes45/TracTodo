'use client';
import './videos.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch, FaPlay, FaEye, FaShare, FaYoutube, FaTiktok } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function VideosPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    // Datos expandidos de shorts con links de YouTube - Estructura simplificada
    const allShorts = [
        {
            id: 1,
            title: "Bomba De Inyección Isc/Px8 Nueva",
            youtubeLink: "https://youtube.com/shorts/ivOuYS8fVtY?si=Yown8ilwQMhSORMm",
            category: "Cargas Promocionales"
        },
        {
            id: 2,
            title: "Cabeza Para Motor C15 Nueva",
            youtubeLink: "https://youtube.com/shorts/upsF85WA0_s?si=p4k49MYv0x9hRGUQ",
            category: "Cargas Promocionales"
        },
        {
            id: 3,
            title: "Cabeza Para Motor C12 Nueva",
            youtubeLink: "https://youtube.com/shorts/xZxtuULfzS4?si=VjSYJyV-ODhRA4JL",
            category: "Cargas Promocionales"
        },
        {
            id: 4,
            title: "Cabeza Para Motor Isx Nueva",
            youtubeLink: "https://youtube.com/shorts/eRFUkeXfA5E?si=cN_kQN88X5IjmX8H",
            category: "Cargas Promocionales"
        },
        {
            id: 5,
            title: "Cabeza Para Motor Ism/M11 Nueva",
            youtubeLink: "https://youtube.com/shorts/Q8RcvoZFqEE?si=AZukiFUsBip_yoiD",
            category: "Cargas Promocionales"
        },
        {
            id: 6,
            title: "Cabeza Detroit Diesel Serie 60 Nueva",
            youtubeLink: "https://youtube.com/shorts/-7QCAyUXPhE?si=cr3Of0PRKf68jSrF",
            category: "Cargas Promocionales"
        },
        {
            id: 7,
            title: "Cabeza Para Motor Px8 Nueva",
            youtubeLink: "https://youtube.com/shorts/sO1Qc6HSSeE?si=AugK95ngX3VsLL1e",
            category: "Cargas Promocionales"
        },
        {
            id: 8,
            title: "Cabeza Para Motor Cummins Serie C Nueva",
            youtubeLink: "https://youtube.com/shorts/KQjZuSpgpJs?si=pAtonSpBEMmd6c8I",
            category: "Cargas Promocionales"
        },
        {
            id: 9,
            title: "Cabeza Para Motor Volvo X15 Nueva",
            youtubeLink: "https://youtube.com/shorts/7s4dGkCF0M4?si=SlbE8rg0GYZeRRW_",
            category: "Cargas Promocionales"
        },
        {
            id: 10,
            title: "Turbo Isx Marca Holset Sin Egr Nuevo",
            youtubeLink: "https://youtube.com/shorts/7S0auDBtIVw?si=FBIIJmKuZx6opukP",
            category: "Cargas Promocionales"
        },
        {
            id: 11,
            title: "Cabeza Para Motor Detroit Diesel Dd5 Nueva",
            youtubeLink: "https://youtube.com/shorts/kkoSpwsRMhY?si=2ZC18mQId0Z9xono",
            category: "Cargas Promocionales"
        },
        {
            id: 12,
            title: "Ciüeñal Bigcam 350/400 Nuevo",
            youtubeLink: "https://youtube.com/shorts/r6YwOxHHFSU?si=ParROIIqCDIVhWCb",
            category: "Cargas Promocionales"
        },
        {
            id: 13,
            title: "Cabeza Para Motor Volvo D13 Nueva",
            youtubeLink: "https://youtube.com/shorts/n0V3eG2A38Y?si=0KpTcNWEY8BdBrHk",
            category: "Cargas Promocionales"
        },
        {
            id: 14,
            title: "Cabeza Para Motor Volvo D13 Nueva",
            youtubeLink: "https://youtube.com/shorts/eZN1vRqyfCw?si=RWveWuuO9fswprwK",
            category: "Descargas de Risa"
        },
        {
            id: 15,
            title: "Vamos De Compras A Tractodo",
            youtubeLink: "https://youtube.com/shorts/t90nv-TVdQo?si=8mTTMwIHt2R5LLCw",
            category: "Cargas Promocionales"
        },
        {
            id: 16,
            title: "¿Y Las Llaves?",
            youtubeLink: "https://youtube.com/shorts/O2LGoQAV8Z8?si=mbKH47VxJjUlmoR6",
            category: "Descargas de Risa"
        },
        {
            id: 17,
            title: "Vamos De Compras A TracTodo",
            youtubeLink: "https://youtube.com/shorts/t90nv-TVdQo?si=8mTTMwIHt2R5LLCw",
            category: "Cargas Promocionales"
        },
        {
            id: 18,
            title: "Oscar En Promocionando Cigüeñales",
            youtubeLink: "https://youtube.com/shorts/N6HLP0t1SIE?si=ZzWDKJQ7OuncezSe",
            category: "Cargas Promocionales"
        },
        {
            id: 19,
            title: "TracTodo Lo Tiene Todo",
            youtubeLink: "https://youtube.com/shorts/qjuNH5pQ-aY?si=GzNC8I8Rq9tEbp4u",
            category: "Descargas de Risa"
        },
        {
            id: 20,
            title: "Feliz Día De Las Madres",
            youtubeLink: "https://youtube.com/shorts/vQyUakKFbZA?si=h4b7avWbCOundqnB",
            category: "Entregas Festivas"
        },
        {
            id: 21,
            title: "El Problema",
            youtubeLink: "https://youtube.com/shorts/ftJYh2elhxY?si=2LBVX5n4EN2aSGO7",
            category: "Descargas de Risa"
        },
        {
            id: 22,
            title: "Feliz Día Del Maestro",
            youtubeLink: "https://youtube.com/shorts/tJq3DtfwvQk?si=mzdKsYUaZIMclVeN",
            category: "Entregas Festivas"
        },
        {
            id: 23,
            title: "Llega Nueva Mercancia",
            youtubeLink: "https://youtube.com/shorts/wL4U8hBPqJE?si=-o3wr5T2bjDp7Pf9",
            category: "Cargas Promocionales"
        },
        {
            id: 24,
            title: "Conoce TracTodo",
            youtubeLink: "https://youtube.com/shorts/kIjeiX2zKyk?si=yW_3SdcR-i7of5RB",
            category: "Cargas Promocionales"
        },
        {
            id: 25,
            title: "Confía En Nosotros",
            youtubeLink: "https://youtube.com/shorts/pn7BgWt1bag?si=ZyMc_kQePGrN__Kl",
            category: "Descargas de Risa"
        },
        {
            id: 26,
            title: "No Tengas Dudas",
            youtubeLink: "https://youtube.com/shorts/WMXAFSCP00o?si=m6A8LEKcCWDk4J6o",
            category: "Descargas de Risa"
        },
        {
            id: 27,
            title: "Confía En Nosotros",
            youtubeLink: "https://youtube.com/shorts/pn7BgWt1bag?si=ZyMc_kQePGrN__Kl",
            category: "Descargas de Risa"
        },
        {
            id: 28,
            title: "¿Disculpa?",
            youtubeLink: "https://youtube.com/shorts/bA2qhK3NzLI?si=uEY_DbfESheeKLx-",
            category: "Descargas de Risa"
        },
        {
            id: 29,
            title: "Medias Reparaciones",
            youtubeLink: "https://youtube.com/shorts/Xiq3nmecwZo?si=N2y5RaZJNbn3TR9o",
            category: "Cargas Promocionales"
        },
        {
            id: 30,
            title: "Media Reparación ISM",
            youtubeLink: "https://youtube.com/shorts/uBFnf3OnzSc?si=vLE25Cqa0RezbO7C",
            category: "Cargas Promocionales"
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
        router.push('/entretenimiento');
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