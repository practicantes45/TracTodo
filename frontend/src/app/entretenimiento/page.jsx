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
import { useAuth } from '../../hooks/useAuth';
import { obtenerVideosSeleccionados } from '../../services/entretenimientoVideoService';
import { obtenerArticulosSeleccionados } from '../../services/entretenimientoBlogService';

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
            // Normalizar espacios y saltos de línea
            .replace(/\n\s*\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    /**
     * Genera un excerpt inteligente priorizando subtítulos
     * @param {object} post - Post con contenido o bloques
     * @param {number} maxLength - Máximo de caracteres (default: 180)
     * @returns {string} - Excerpt procesado
     */
    const generarExcerptInteligente = (post, maxLength = 160) => {
        let contenido = '';

        // PRIORIDAD 1: Si tiene bloques, usar el primer bloque
        if (post.bloques && Array.isArray(post.bloques) && post.bloques.length > 0) {
            const primerBloque = post.bloques[0];

            // Si hay subtítulo, incluirlo como inicio del excerpt
            if (primerBloque.subtitulo && primerBloque.subtitulo.trim()) {
                contenido = `${primerBloque.subtitulo.trim()}. `;
            }

            // Agregar texto del bloque
            if (primerBloque.texto && primerBloque.texto.trim()) {
                const textoLimpio = limpiarMarkdown(primerBloque.texto);
                contenido += textoLimpio;
            }
        }
        // PRIORIDAD 2: Usar contenido legacy
        else if (post.contenido || post.content) {
            contenido = post.contenido || post.content;
        }

        // Limpiar y truncar
        const contenidoLimpio = limpiarMarkdown(contenido);

        if (contenidoLimpio.length <= maxLength) {
            return contenidoLimpio;
        }

        // Truncar inteligentemente (por palabras, no por caracteres)
        const palabras = contenidoLimpio.split(' ');
        let excerptFinal = '';

        for (const palabra of palabras) {
            if ((excerptFinal + palabra + ' ').length > maxLength - 3) {
                break;
            }
            excerptFinal += palabra + ' ';
        }

        return excerptFinal.trim() + '...';
    };

    /**
     * Extrae el primer subtítulo del contenido para usarlo como título destacado
     * @param {object} post - Post con contenido o bloques  
     * @returns {string|null} - Primer subtítulo encontrado o null
     */
    const extraerPrimerSubtitulo = (post) => {
        // Buscar en bloques primero
        if (post.bloques && Array.isArray(post.bloques) && post.bloques.length > 0) {
            const primerBloque = post.bloques[0];
            if (primerBloque.subtitulo && primerBloque.subtitulo.trim()) {
                return primerBloque.subtitulo.trim();
            }
        }

        // Buscar en contenido legacy
        const contenido = post.contenido || post.content || '';
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
            setBlogError('Error al cargar los artículos del blog.');
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

    // Abrir modal del blog directamente
    const handleBlogClick = (post) => {
        console.log('📖 Blog post clicked:', post);
        setSelectedPostId(post.id);
        setShowBlogModal(true);
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
    };

    // Cerrar modal del blog
    const handleCloseBlogModal = () => {
        setShowBlogModal(false);
        setSelectedPostId(null);
        // Restaurar scroll del body
        document.body.style.overflow = 'unset';
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

                        {/* Sección de Blog */}
                        <div className="blogSection">
                            <div className="sectionHeader">
                                <h2>BLOG</h2>
                                <p className="sectionDescription">
                                    Tractoinformación: ¡Conocimiento en movimiento!
                                </p>
                            </div>
                            {/* Botón de gestión de artículos - Solo para admin */}
                            {isAdmin && (
                                <div className="adminBlogControls">
                                    <EntertainmentBlogManager onArticulosUpdate={handleArticulosUpdate} />
                                </div>
                            )}

                            {/* Estado de carga del blog */}
                            {blogLoading && (
                                <div className="loadingContainer">
                                    <h3>Cargando artículos...</h3>
                                    <p>Por favor espera un momento</p>
                                </div>
                            )}

                            {/* Estado de error del blog */}
                            {blogError && (
                                <div className="errorContainer">
                                    <h3>Error al cargar artículos</h3>
                                    <p>{blogError}</p>
                                    <button onClick={cargarArticulosSeleccionados} className="retryButton">
                                        Intentar de nuevo
                                    </button>
                                </div>
                            )}

                            {/* Grid de blog */}
                            {!blogLoading && !blogError && (
                                <>
                                    {blogData.length > 0 ? (
                                        <div className="blogGrid">
                                            {blogData.map((post) => (
                                                <article
                                                    key={post.id}
                                                    className="blogCard"
                                                    onClick={() => handleBlogClick(post)}
                                                >
                                                    <div className="blogImageContainer">
                                                        <img
                                                            src={(post.images && post.images[0]) || '/imgs/default-blog.jpg'}
                                                            alt={post.title}
                                                            className="blogImage"
                                                            onError={handleImageError}
                                                        />
                                                        <div className="blogCategory">{post.category}</div>
                                                        {post.images && post.images.length > 1 && (
                                                            <div className="imageCount">+{post.images.length - 1}</div>
                                                        )}
                                                    </div>
                                                    <div className="blogContent">
                                                        <h3 className="blogTitle">{post.title}</h3>

                                                        {/* MOSTRAR SUBTÍTULO DESTACADO SI EXISTE */}
                                                        {post.subtituloDestacado && (
                                                            <h4 className="blogSubtitle">{post.subtituloDestacado}</h4>
                                                        )}

                                                        <p className="blogExcerpt">{post.excerpt}</p>
                                                        <div className="blogMeta">
                                                            <span className="blogAuthor">
                                                                <FaUser /> {post.author}
                                                            </span>
                                                            <span className="blogDate">
                                                                <FaCalendarAlt /> {formatDate(post.publishDate)}
                                                            </span>
                                                        </div>
                                                        <button className="readMoreButton">
                                                            <span>Leer más</span>
                                                        </button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="noBlogMessage">
                                            <h3>No hay artículos seleccionados</h3>
                                            <p>El administrador no ha seleccionado artículos para mostrar en entretenimiento.</p>
                                            {isAdmin && (
                                                <p>
                                                    <strong>Como administrador, puedes seleccionar artículos usando el botón "Gestionar Artículos" arriba.</strong>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para ver más artículos - solo si hay artículos */}
                                    {blogData.length > 0 && (
                                        <div className="sectionFooter">
                                            <button
                                                onClick={goToBlog}
                                                className="viewMoreButton"
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

                {/* Modal para mostrar artículo del blog */}
                <BlogPostModal
                    postId={selectedPostId}
                    isOpen={showBlogModal}
                    onClose={handleCloseBlogModal}
                />

            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
}