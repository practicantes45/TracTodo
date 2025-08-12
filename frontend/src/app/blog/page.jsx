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

export default function BlogPage() {
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

    // ===== NUEVAS FUNCIONES PARA PROCESAR CONTENIDO ===== //

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

    // ===== FUNCIONES PARA MANEJAR DATOS ===== //

    const cargarPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📚 Cargando posts del blog...');
            
            const posts = await obtenerPosts();
            console.log('✅ Posts cargados:', posts);
            
            if (Array.isArray(posts)) {
                setAllPosts(posts);
            } else {
                console.warn('⚠️ Formato de datos inesperado:', posts);
                setAllPosts([]);
            }
        } catch (err) {
            console.error('❌ Error al cargar posts:', err);
            setError(err.message);
            setAllPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar posts basado en categoría y término de búsqueda
    const filteredPosts = allPosts.filter(post => {
        const matchesCategory = selectedCategory === 'todos' || post.categoria === selectedCategory;
        const matchesSearch = searchTerm === '' || 
            post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.contenido && post.contenido.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return matchesCategory && matchesSearch;
    });

    const handlePostClick = (postId) => {
        console.log('📖 Navegando al post:', postId);
        router.push(`/blog/${postId}`);
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        console.log('🏷️ Categoría cambiada a:', categoryId);
    };

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

    // Schema.org para la página de blog
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
            "headline": post.titulo,
            "description": generarDescripcionCorta(post.contenido),
            "datePublished": post.fechaCreacion,
            "dateModified": post.fechaActualizacion || post.fechaCreacion,
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
                    <main className="mainContent">
                        <div className="loadingContainer">
                            <div className="loadingSpinner"></div>
                            <p>Cargando artículos...</p>
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
                <div className="blog-page">
                    <Navbar />
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

                            {/* Botón de administración (solo para admins) */}
                            {isAdmin && (
                                <div className="adminControls">
                                    <button
                                        onClick={() => setShowBlogManager(true)}
                                        className="adminButton"
                                    >
                                        <FaCog />
                                        Gestionar Blog
                                    </button>
                                </div>
                            )}

                            {/* Barra de búsqueda y filtros */}
                            <div className="blogFilters">
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

                                <div className="categoriesContainer">
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(category.id)}
                                            className={`categoryButton ${selectedCategory === category.id ? 'active' : ''}`}
                                        >
                                            <FaTag className="categoryIcon" />
                                            {category.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Contador de resultados */}
                            <div className="resultsHeader">
                                <p>
                                    {filteredPosts.length === 0 
                                        ? 'No se encontraron artículos'
                                        : `${filteredPosts.length} artículo${filteredPosts.length !== 1 ? 's' : ''} encontrado${filteredPosts.length !== 1 ? 's' : ''}`
                                    }
                                </p>
                            </div>

                            {/* Grid de artículos */}
                            {filteredPosts.length > 0 ? (
                                <div className="postsGrid">
                                    {filteredPosts.map((post) => (
                                        <article key={post.id} className="postCard">
                                            <div className="postHeader">
                                                <div className="postMeta">
                                                    <span className="postCategory">
                                                        <FaTag />
                                                        {post.categoria}
                                                    </span>
                                                    <span className="postDate">
                                                        <FaCalendarAlt />
                                                        {formatDate(post.fechaCreacion)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="postContent">
                                                <h2 
                                                    className="postTitle"
                                                    onClick={() => handlePostClick(post.id)}
                                                >
                                                    {post.titulo}
                                                </h2>

                                                <div className="postDescription">
                                                    {generarDescripcionCorta(post.contenido)}
                                                </div>

                                                <div className="postFooter">
                                                    <div className="postStats">
                                                        <span className="postViews">
                                                            <FaEye />
                                                            {post.vistas || 0} vistas
                                                        </span>
                                                        <span className="postReadTime">
                                                            <FaClock />
                                                            {Math.max(1, Math.ceil((post.contenido?.length || 0) / 1000))} min lectura
                                                        </span>
                                                    </div>

                                                    <button
                                                        onClick={() => handlePostClick(post.id)}
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
                                <div className="noResults">
                                    <h3>No se encontraron artículos</h3>
                                    <p>
                                        {searchTerm 
                                            ? `No hay artículos que coincidan con "${searchTerm}"`
                                            : selectedCategory !== 'todos'
                                                ? `No hay artículos en la categoría "${categories.find(c => c.id === selectedCategory)?.label}"`
                                                : 'No hay artículos disponibles en este momento'
                                        }
                                    </p>
                                    {(searchTerm || selectedCategory !== 'todos') && (
                                        <button
                                            onClick={() => {
                                                setSearchTerm('');
                                                setSelectedCategory('todos');
                                            }}
                                            className="clearFiltersButton"
                                        >
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                <Footer />
                <ScrollToTop />

                {/* Modales */}
                {showBlogManager && (
                    <BlogManager
                        onClose={() => setShowBlogManager(false)}
                        onPostsUpdate={cargarPosts}
                    />
                )}

                {showPostModal && selectedPostId && (
                    <BlogPostModal
                        postId={selectedPostId}
                        onClose={() => {
                            setShowPostModal(false);
                            setSelectedPostId(null);
                        }}
                    />
                )}
            </div>
        </>
    );
}