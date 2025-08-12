'use client';
import './blog.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaCalendarAlt, FaClock, FaEye, FaUser, FaTag, FaArrowLeft, FaCog } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import BlogManager from '../components/BlogManager/BlogManager';
import BlogPostModal from '../components/BlogPostModal/BlogPostModal';
import SEOHead from '../components/SEOHead/SEOHead';
import { useAuth } from '../../hooks/useAuth';
import { obtenerPosts } from '../../services/blogService';
import { useSEO } from '../../hooks/useSEO';

export default function BlogClient() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBlogManager, setShowBlogManager] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [showPostModal, setShowPostModal] = useState(false);

    // Hook SEO para página de blog
    const { seoData } = useSEO('blog', { path: '/blog' });

    // CATEGORÍAS ACTUALIZADAS
    const categories = [
        { id: 'todos', label: 'Todos los Artículos' },
        { id: 'Tracto-Consejos', label: 'Tracto-Consejos' },
        { id: 'Tracto-Promociones', label: 'Tracto-Promociones' },
        { id: 'Tracto-Casos de Éxito', label: 'Tracto-Casos de Éxito' },
        { id: 'Tracto-Preguntas Frecuentes', label: 'Tracto-Preguntas Frecuentes' }
    ];

    // Cargar posts del backend al montar el componente
    useEffect(() => {
        cargarPosts();
    }, []);

    // ===== FUNCIONES PARA PROCESAR CONTENIDO (del archivo bueno) ===== //

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
            // Normalizar espacios y saltos de línea
            .replace(/\n\s*\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    /**
     * Genera un excerpt inteligente priorizando subtítulos
     * @param {object} post - Post con contenido o bloques
     * @param {number} maxLength - Máximo de caracteres (default: 200)
     * @returns {string} - Excerpt procesado
     */
    const generarExcerptInteligente = (post, maxLength = 200) => {
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

    /**
     * Genera descripción corta del contenido para SEO
     * @param {string} content - Contenido completo
     * @returns {string} - Descripción de máximo 160 caracteres
     */
    const generarDescripcionCorta = (content) => {
        if (!content) return '';
        
        const textoLimpio = limpiarMarkdown(content);
        const maxLength = 160;
        
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

    // ===== FIN DE FUNCIONES DE PROCESAMIENTO ===== //

    const cargarPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📚 Cargando posts del blog desde la base de datos...');
            
            const posts = await obtenerPosts();
            console.log('✅ Posts cargados:', posts);
            
            // Transformar datos del backend al formato esperado por el frontend - MEJORADO
            const postsFormateados = posts.map(post => {
                // Generar excerpt inteligente usando las nuevas funciones
                const excerptInteligente = generarExcerptInteligente(post, 180);
                const subtituloDestacado = extraerPrimerSubtitulo(post);
                
                return {
                    id: post.id,
                    title: post.titulo || post.title,
                    excerpt: excerptInteligente,
                    subtituloDestacado: subtituloDestacado, // NUEVO campo para mostrar subtítulo si existe
                    content: post.contenido || post.content,
                    images: post.imagenes || (post.imagenUrl ? [post.imagenUrl] : []) || (post.image ? [post.image] : []),
                    publishDate: post.fechaPublicacion || post.fecha || post.publishDate,
                    readTime: calcularTiempoLectura(post.contenido || ''),
                    category: post.categoria || post.category || 'Tracto-Consejos',
                    author: post.autor || "TracTodo",
                    views: Math.floor(Math.random() * 5000) + "K",
                    tags: extraerTags(post.titulo, post.contenido || ''),
                    bloques: post.bloques || [] // Mantener bloques para el modal
                };
            });
            
            setAllPosts(postsFormateados);
        } catch (error) {
            console.error('❌ Error al cargar posts:', error);
            setError('Error al cargar los artículos del blog. Inténtalo de nuevo.');
            setAllPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Funciones auxiliares para procesar datos (sin cambios)
    const calcularTiempoLectura = (contenido) => {
        const palabrasPorMinuto = 200;
        const numeroPalabras = contenido.split(' ').length;
        const minutos = Math.ceil(numeroPalabras / palabrasPorMinuto);
        return `${minutos} min`;
    };

    const extraerTags = (titulo, contenido) => {
        const texto = `${titulo || ''} ${contenido || ''}`.toLowerCase();
        const tagsComunes = ['tracto', 'motor', 'reparación', 'mantenimiento', 'refacciones', 'diagnóstico', 'tractocamión', 'sistema', 'problemas'];
        return tagsComunes.filter(tag => texto.includes(tag)).slice(0, 4);
    };

    // Manejar actualizaciones desde el admin
    const handleBlogUpdate = async () => {
        console.log('🔄 Recargando posts después de actualización admin...');
        await cargarPosts();
        setShowBlogManager(false);
    };

    // Filtrar posts según categoría y búsqueda
    const filteredPosts = allPosts.filter(post => {
        const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Abrir modal en lugar de navegar
    const handlePostClick = (post) => {
        setSelectedPostId(post.id);
        setShowPostModal(true);
        // Prevenir scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
    };

    // Cerrar modal
    const handleCloseModal = () => {
        setShowPostModal(false);
        setSelectedPostId(null);
        // Restaurar scroll del body
        document.body.style.overflow = 'unset';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryCount = (categoryId) => {
        if (categoryId === 'todos') return allPosts.length;
        return allPosts.filter(post => post.category === categoryId).length;
    };

    // Función para manejar imágenes no encontradas
    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+';
        e.target.alt = 'Imagen no encontrada';
    };

    // Schema.org para la página de blog (SEO)
    const schemaBlog = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog Tractodo",
        "description": "Artículos especializados sobre mantenimiento de tractocamiones, consejos técnicos y casos de éxito",
        "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog`,
        "publisher": {
            "@type": "Organization",
            "name": "Tractodo",
            "url": "https://tractodo.com"
        },
        "blogPost": filteredPosts.slice(0, 10).map(post => ({
            "@type": "BlogPosting",
            "headline": post.title,
            "description": generarDescripcionCorta(post.content),
            "datePublished": post.publishDate,
            "dateModified": post.publishDate,
            "author": {
                "@type": "Organization",
                "name": "Tractodo"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Tractodo"
            },
            "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${post.id}`
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
                <div className="blog-page">
                    <Navbar />
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>BLOG TRACTODO</h1>
                            </div>
                        </div>
                    </div>
                    <main className="mainContent">
                        <section className="blogMainSection">
                            <div className="blogContainer">
                                <div className="loadingContainer">
                                    <h2>Cargando artículos...</h2>
                                    <p>Obteniendo contenido desde la base de datos...</p>
                                </div>
                            </div>
                        </section>
                    </main>
                    <Footer />
                    <ScrollToTop />
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
                <div className="blog-page">
                    <Navbar />
                    <div className="heroSection">
                        <div className="heroOverlay">
                            <div className="heroContent">
                                <h1>BLOG TRACTODO</h1>
                            </div>
                        </div>
                    </div>
                    <main className="mainContent">
                        <section className="blogMainSection">
                            <div className="blogContainer">
                                <div className="errorContainer">
                                    <h2>Error al cargar artículos</h2>
                                    <p>{error}</p>
                                    <button onClick={cargarPosts} className="retryButton">
                                        Intentar de nuevo
                                    </button>
                                </div>
                            </div>
                        </section>
                    </main>
                    <Footer />
                    <ScrollToTop />
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
                    schema={schemaBlog}
                />
            )}

            <div className="blog-page">
                <Navbar />
                
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>BLOG TRACTODO</h1>
                            <p>Consejos, tutoriales y casos de éxito para tu tractocamión</p>
                        </div>
                    </div>
                </div>

                <main className="mainContent">
                    <section className="blogMainSection">
                        <div className="blogContainer">
                            
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

                            {/* Header con estadísticas y botón de gestión admin */}
                            <div className="blogHeader">
                                <div className="blogStats">
                                    <h2>Artículos del Blog</h2>
                                    <p>{filteredPosts.length} artículos encontrados</p>
                                </div>
                                
                                {/* Botón de gestión para admin */}
                                {isAdmin && (
                                    <div className="adminActionsContainer">
                                        <button
                                            className="manageBlogButton"
                                            onClick={() => setShowBlogManager(true)}
                                            title="Gestionar artículos del blog"
                                        >
                                            <FaCog className="manageIcon" />
                                            Gestionar Blog
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="searchContainer">
                                <FaSearch className="searchIcon" />
                                <input
                                    type="text"
                                    placeholder="Buscar artículos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
                            </div>

                            {/* Filtros de categorías con contadores */}
                            <div className="categoryFilters">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        className={`categoryButton ${selectedCategory === category.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <span className="categoryLabel">{category.label}</span>
                                        <span className="categoryCount">({getCategoryCount(category.id)})</span>
                                    </button>
                                ))}
                            </div>

                            {/* Grid de posts - ACTUALIZADO CON NUEVAS FUNCIONES */}
                            {allPosts.length > 0 ? (
                                <div className="postsGrid">
                                    {filteredPosts.map((post) => (
                                        <article
                                            key={post.id}
                                            className="postCard"
                                            onClick={() => handlePostClick(post)}
                                        >
                                            <div className="postImageContainer">
                                                <img 
                                                    src={(post.images && post.images[0]) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+'} 
                                                    alt={post.title} 
                                                    className="postImage"
                                                    onError={handleImageError}
                                                />
                                                <div className="postCategory">{post.category}</div>
                                                {post.images && post.images.length > 1 && (
                                                    <div className="imageCount">+{post.images.length - 1}</div>
                                                )}
                                            </div>
                                            <div className="postContent">
                                                <h3 className="postTitle">{post.title}</h3>
                                                
                                                {/* MOSTRAR SUBTÍTULO DESTACADO SI EXISTE */}
                                                {post.subtituloDestacado && (
                                                    <h4 className="postSubtitle">{post.subtituloDestacado}</h4>
                                                )}
                                                
                                                <p className="postExcerpt">{post.excerpt}</p>
                                                <div className="postMeta">
                                                    <span className="postAuthor">
                                                        <FaUser /> {post.author}
                                                    </span>
                                                    <span className="postDate">
                                                        <FaCalendarAlt /> {formatDate(post.publishDate)}
                                                    </span>
                                                    <span className="postReadTime">
                                                        <FaClock /> {post.readTime}
                                                    </span>
                                                    <span className="postViews">
                                                        <FaEye /> {post.views}
                                                    </span>
                                                </div>
                                                <div className="postTags">
                                                    {post.tags.map((tag, index) => (
                                                        <span key={index} className="postTag">
                                                            <FaTag /> {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="noPostsContainer">
                                    <h3>No hay artículos disponibles</h3>
                                    <p>Aún no se han publicado artículos en esta categoría.</p>
                                    {isAdmin && (
                                        <p>
                                            <strong>Como administrador, puedes agregar artículos usando el botón "Gestionar Blog" arriba.</strong>
                                        </p>
                                    )}
                                </div>
                            )}

                        </div>
                    </section>
                </main>

                <Footer />
                <ScrollToTop />

                {/* Modal de gestión del blog para admin */}
                {isAdmin && showBlogManager && (
                    <BlogManager 
                        onClose={() => setShowBlogManager(false)}
                        onUpdate={handleBlogUpdate}
                    />
                )}

                {/* Modal para mostrar artículo */}
                <BlogPostModal
                    postId={selectedPostId}
                    isOpen={showPostModal}
                    onClose={handleCloseModal}
                />
            </div>
        </>
    );
}