'use client';
import './entretenimiento.css';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlay, FaCalendarAlt, FaClock, FaEye, FaShare, FaBook, FaArrowDown, FaUser } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import EntertainmentVideoManager from '../components/EntertainmentVideoManager/EntertainmentVideoManager';
import EntertainmentBlogManager from '../components/EntertainmentBlogManager/EntertainmentBlogManager';
import BlogPostModal from '../components/BlogPostModal/BlogPostModal';
import { useAuth } from '../../hooks/useAuth';
import { obtenerVideosSeleccionados } from '../../services/entretenimientoVideoService';
import { obtenerArticulosSeleccionados } from '../../services/entretenimientoBlogService';

function EntretenimientoContent() {
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
            // Remover código inline `código`
            .replace(/`([^`]+)`/g, '$1')
            // Remover múltiples espacios y saltos de línea
            .replace(/\s+/g, ' ')
            .trim();
    };

    /**
     * Genera un excerpt inteligente priorizando el contenido más relevante
     * @param {Object} articulo - Objeto del artículo
     * @param {number} maxLength - Longitud máxima del excerpt
     * @returns {string} - Excerpt optimizado
     */
    const generarExcerptInteligente = (articulo, maxLength = 150) => {
        const contenido = articulo.contenido || articulo.content || '';
        const limpioContenido = limpiarMarkdown(contenido);

        // Si ya tenemos un excerpt manual, usarlo
        if (articulo.excerpt && articulo.excerpt.length <= maxLength) {
            return articulo.excerpt;
        }

        // Si el contenido es muy corto, devolverlo completo
        if (limpioContenido.length <= maxLength) {
            return limpioContenido;
        }

        // Buscar el primer párrafo sustancioso (más de 50 caracteres)
        const parrafos = limpioContenido.split('\n').filter(p => p.trim().length > 50);
        
        if (parrafos.length > 0) {
            const primerParrafo = parrafos[0];
            if (primerParrafo.length <= maxLength) {
                return primerParrafo;
            }
            
            // Truncar en la palabra más cercana
            return primerParrafo.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
        }

        // Fallback: truncar el contenido completo
        return limpioContenido.substring(0, maxLength).replace(/\s+\w*$/, '') + '...';
    };

    /**
     * Extrae el primer subtítulo (## texto) del contenido
     * @param {Object} articulo - Objeto del artículo
     * @returns {string|null} - Primer subtítulo encontrado o null
     */
    const extraerPrimerSubtitulo = (articulo) => {
        const contenido = articulo.contenido || articulo.content || '';
        const subtituloMatch = contenido.match(/^## (.+)$/m);
        return subtituloMatch ? subtituloMatch[1].trim() : null;
    };

    // ===== FIN DE FUNCIONES DE CONTENIDO ===== //

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
            setShortsData([]);
        } finally {
            setLoading(false);
        }
    };

    const cargarArticulosSeleccionados = async () => {
        try {
            setBlogLoading(true);
            setBlogError(null);
            console.log('📚 Cargando artículos seleccionados para entretenimiento...');

            const articulos = await obtenerArticulosSeleccionados();
            console.log('✅ Artículos seleccionados cargados:', articulos);

            // Transformar datos del backend al formato esperado por el frontend
            const articulosFormateados = articulos.map(articulo => {
                // Generar excerpt inteligente usando las nuevas funciones
                const excerptInteligente = generarExcerptInteligente(articulo, 160);
                const subtituloDestacado = extraerPrimerSubtitulo(articulo);

                return {
                    id: articulo.id,
                    title: articulo.titulo || articulo.title,
                    excerpt: excerptInteligente,
                    subtituloDestacado: subtituloDestacado,
                    content: articulo.contenido || articulo.content,
                    images: articulo.imagenes || (articulo.imagenUrl ? [articulo.imagenUrl] : []) || (articulo.image ? [articulo.image] : []),
                    publishDate: articulo.fechaPublicacion || articulo.fecha || articulo.publishDate || new Date().toISOString(),
                    readTime: calcularTiempoLectura(articulo.contenido || ''),
                    category: articulo.categoria || articulo.category || 'Tracto-Consejos',
                    author: articulo.autor || "TracTodo",
                    bloques: articulo.bloques || []
                };
            });

            setBlogData(articulosFormateados);
        } catch (error) {
            console.error('❌ Error al cargar artículos seleccionados:', error);
            setBlogError('Error al cargar los artículos del blog. Inténtalo de nuevo.');
            setBlogData([]);
        } finally {
            setBlogLoading(false);
        }
    };

    // Función auxiliar para calcular tiempo de lectura
    const calcularTiempoLectura = (contenido) => {
        const palabrasPorMinuto = 200;
        const numeroPalabras = contenido.split(' ').length;
        const minutos = Math.ceil(numeroPalabras / palabrasPorMinuto);
        return `${minutos} min`;
    };

    // Manejar actualizaciones cuando el admin modifica videos
    const handleVideosUpdate = async () => {
        console.log('🔄 Actualizando videos de entretenimiento...');
        await cargarVideosSeleccionados();
    };

    // Manejar actualizaciones cuando el admin modifica artículos
    const handleArticulosUpdate = async () => {
        console.log('🔄 Actualizando artículos de entretenimiento...');
        await cargarArticulosSeleccionados();
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

            const normalMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (normalMatch) {
                console.log('📹 Found normal video ID:', normalMatch[1]);
                return normalMatch[1];
            }

            console.log('❌ No valid YouTube ID found');
            return null;
        } catch (error) {
            console.error('❌ Error extracting YouTube ID:', error);
            return null;
        }
    };

    const getYouTubeThumbnail = (youtubeLink) => {
        const videoId = extractYouTubeId(youtubeLink);
        if (videoId) {
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        return '/imgs/default-video-thumb.jpg';
    };

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

    const goToVideos = () => {
        router.push('/videos');
    };

    const goToBlog = () => {
        router.push('/entretenimiento/blogs');
    };

    const handleBlogClick = (postId) => {
        setSelectedPostId(postId);
        setShowBlogModal(true);
    };

    const closeBlogModal = () => {
        setShowBlogModal(false);
        setSelectedPostId(null);
    };

    // Función para manejar imágenes no encontradas
    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc>';
        e.target.alt = 'Imagen no encontrada';
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

                            {loading ? (
                                <div className="loadingContainer">
                                    <div className="spinner"></div>
                                    <p>Cargando videos...</p>
                                </div>
                            ) : error ? (
                                <div className="errorContainer">
                                    <p>{error}</p>
                                    <button onClick={cargarVideosSeleccionados} className="retryButton">
                                        Reintentar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {shortsData.length > 0 ? (
                                        <div className="shortsGrid">
                                            {shortsData.slice(0, 6).map((short) => (
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
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="noContentMessage">
                                            <h3>No hay videos disponibles</h3>
                                            <p>No se han seleccionado videos para mostrar en entretenimiento.</p>
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

                        {/* Sección de Blog */}
                        <div className="blogSection">
                            <div className="sectionHeader">
                                <h2>BLOG</h2>
                                <p className="sectionDescription">
                                    Tractoinformación: ¡Conocimiento en movimiento!
                                </p>
                            </div>

                            {/* Botón de gestión de blog - Solo para admin */}
                            {isAdmin && (
                                <div className="adminBlogControls">
                                    <EntertainmentBlogManager onArticulosUpdate={handleArticulosUpdate} />
                                </div>
                            )}

                            {blogLoading ? (
                                <div className="loadingContainer">
                                    <div className="spinner"></div>
                                    <p>Cargando artículos...</p>
                                </div>
                            ) : blogError ? (
                                <div className="errorContainer">
                                    <p>{blogError}</p>
                                    <button onClick={cargarArticulosSeleccionados} className="retryButton">
                                        Reintentar
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {blogData.length > 0 ? (
                                        <div className="blogGrid">
                                            {blogData.slice(0, 4).map((post) => (
                                                <article key={post.id} className="blogCard" onClick={() => handleBlogClick(post.id)}>
                                                    <div className="blogImageContainer">
                                                        {post.images && post.images.length > 0 ? (
                                                            <img
                                                                src={post.images[0]}
                                                                alt={post.title}
                                                                onError={handleImageError}
                                                            />
                                                        ) : (
                                                            <div className="noImagePlaceholder">
                                                                <FaBook />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="blogContent">
                                                        <div className="blogMeta">
                                                            <span className="blogAuthor">
                                                                <FaUser /> {post.author}
                                                            </span>
                                                            <span className="blogDate">
                                                                <FaCalendarAlt /> {new Date(post.publishDate).toLocaleDateString('es-ES')}
                                                            </span>
                                                            <span className="blogReadTime">
                                                                <FaClock /> {post.readTime}
                                                            </span>
                                                        </div>
                                                        <h3 className="blogTitle">{post.title}</h3>
                                                        {post.subtituloDestacado && (
                                                            <h4 className="blogSubtitle">{post.subtituloDestacado}</h4>
                                                        )}
                                                        <p className="blogExcerpt">{post.excerpt}</p>
                                                        <span className="blogCategory">{post.category}</span>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="noContentMessage">
                                            <h3>No hay artículos disponibles</h3>
                                            <p>No se han seleccionado artículos para mostrar en entretenimiento.</p>
                                            {isAdmin && (
                                                <p>
                                                    <strong>Como administrador, puedes seleccionar artículos usando el botón "Gestionar Blog" arriba.</strong>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para ver más blog - solo si hay artículos */}
                                    {blogData.length > 0 && (
                                        <div className="sectionFooter">
                                            <button
                                                onClick={goToBlog}
                                                className="viewMoreButton blog"
                                                type="button"
                                            >
                                                Ver más artículos
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Botón sticky para ir al blog - solo visible en escritorio */}
                {showStickyButton && blogData.length > 0 && (
                    <button onClick={goToBlog} className="stickyBlogButton" aria-label="Ir al blog">
                        <FaArrowDown />
                        <span>Leer Blog</span>
                    </button>
                )}

                {/* Modal de Video */}
                {isVideoModalOpen && selectedVideo && (
                    <div className="videoModal" onClick={closeVideoModal}>
                        <div className="videoModalContent" onClick={(e) => e.stopPropagation()}>
                            <button className="videoModalClose" onClick={closeVideoModal}>
                                ×
                            </button>
                            <div className="videoContainer">
                                <iframe
                                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1${selectedVideo.isShort ? '&loop=1&playlist=' + selectedVideo.youtubeId : ''}`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal del Blog */}
                {showBlogModal && selectedPostId && (
                    <BlogPostModal
                        postId={selectedPostId}
                        isOpen={showBlogModal}
                        onClose={closeBlogModal}
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
function EntretenimientoPageFallback() {
    return (
        <div className="layout entretenimiento-page">
            <Navbar />
            <main className="mainContent">
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Entretenimiento</h1>
                        </div>
                    </div>
                </div>
                <section className="entertainmentMainSection">
                    <div className="entertainmentContainer">
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
export default function EntretenimientoPage() {
    return (
        <Suspense fallback={<EntretenimientoPageFallback />}>
            <EntretenimientoContent />
        </Suspense>
    );
}