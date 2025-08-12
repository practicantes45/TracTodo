'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaEye, FaUser, FaTag, FaShare, FaHeart } from "react-icons/fa";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import SEOHead from '../../components/SEOHead/SEOHead';
import { obtenerPostPorId } from '../../../services/blogService';
import { useBlogSEO } from '../../../hooks/useSEO';
import './blog-post.css';

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id;
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorito, setFavorito] = useState(false);

    // Hook SEO para artículo individual
    const { seoData, loading: seoLoading } = useBlogSEO(postId, post);

    useEffect(() => {
        if (postId) {
            cargarPost();
        }
    }, [postId]);

    const cargarPost = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📖 Cargando post:', postId);
            
            const data = await obtenerPostPorId(postId);
            
            if (data) {
                setPost(data);
                
                // Incrementar vistas (opcional - se podría hacer en el backend)
                if (data.vistas !== undefined) {
                    // Aquí se podría hacer una llamada para incrementar vistas
                    console.log('👀 Vista registrada para post:', postId);
                }
            } else {
                setError('Artículo no encontrado');
            }
        } catch (err) {
            console.error('❌ Error cargando post:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = post?.titulo || 'Artículo de Tractodo';
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Lee este interesante artículo: ${title}`,
                    url: url
                });
            } catch (err) {
                console.log('Error compartiendo:', err);
                copyToClipboard(url);
            }
        } else {
            copyToClipboard(url);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Enlace copiado al portapapeles');
        }).catch(() => {
            alert('No se pudo copiar el enlace');
        });
    };

    const toggleFavorito = () => {
        setFavorito(!favorito);
        // Aquí se podría integrar con un sistema de favoritos
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

    const formatContent = (content) => {
        if (!content) return '';
        
        // Procesar contenido Markdown básico
        return content
            // Convertir títulos
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Convertir negritas
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convertir cursivas
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convertir enlaces
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Convertir saltos de línea
            .replace(/\n/g, '<br />');
    };

    const calculateReadTime = (content) => {
        if (!content) return 1;
        const wordsPerMinute = 200;
        const wordCount = content.split(' ').length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    };

    if (loading || seoLoading) {
        return (
            <div className="blog-post-page">
                <Navbar />
                <main className="mainContent">
                    <div className="loadingContainer">
                        <div className="loadingSpinner"></div>
                        <p>Cargando artículo...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !post) {
        return (
            <>
                {seoData && (
                    <SEOHead
                        title="Artículo no encontrado | Blog Tractodo"
                        description="El artículo que buscas no está disponible"
                        canonicalUrl={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${postId}`}
                        noIndex={true}
                    />
                )}
                <div className="blog-post-page">
                    <Navbar />
                    <main className="mainContent">
                        <div className="errorContainer">
                            <h2>Artículo no encontrado</h2>
                            <p>{error || 'El artículo que buscas no existe o ha sido removido.'}</p>
                            <div className="errorActions">
                                <button onClick={() => router.push('/blog')} className="backToBlogButton">
                                    Volver al Blog
                                </button>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </>
        );
    }

    // Schema.org para artículo individual
    const schemaArticle = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.titulo,
        "description": post.descripcionCorta || post.contenido?.substring(0, 160) + '...',
        "image": post.imagen || `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/tractodo-logo.jpg`,
        "author": {
            "@type": "Organization",
            "name": "Tractodo"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Tractodo",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/tractodo-logo.jpg`
            }
        },
        "datePublished": post.fechaCreacion,
        "dateModified": post.fechaActualizacion || post.fechaCreacion,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${postId}`
        },
        "articleSection": post.categoria,
        "keywords": post.categoria ? [post.categoria, "tractocamión", "refacciones", "consejos técnicos"] : ["tractocamión", "blog", "consejos"],
        "wordCount": post.contenido ? post.contenido.split(' ').length : 0
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
                    schema={schemaArticle}
                />
            )}

            <div className="blog-post-page">
                <Navbar />

                <main className="mainContent">
                    {/* Breadcrumb y navegación */}
                    <div className="breadcrumbContainer">
                        <button 
                            onClick={() => router.back()}
                            className="backButton"
                        >
                            <FaArrowLeft />
                            Volver
                        </button>
                        
                        <nav className="breadcrumb">
                            <span onClick={() => router.push('/')}>Inicio</span>
                            <span>/</span>
                            <span onClick={() => router.push('/blog')}>Blog</span>
                            <span>/</span>
                            <span className="current">{post.titulo}</span>
                        </nav>
                    </div>

                    <article className="blogPostContainer">
                        {/* Header del artículo */}
                        <header className="postHeader">
                            <div className="postMeta">
                                {post.categoria && (
                                    <span className="postCategory">
                                        <FaTag />
                                        {post.categoria}
                                    </span>
                                )}
                                
                                <span className="postDate">
                                    <FaCalendarAlt />
                                    {formatDate(post.fechaCreacion)}
                                </span>
                                
                                <span className="postReadTime">
                                    <FaClock />
                                    {calculateReadTime(post.contenido)} min de lectura
                                </span>
                                
                                {post.vistas !== undefined && (
                                    <span className="postViews">
                                        <FaEye />
                                        {post.vistas} vistas
                                    </span>
                                )}
                            </div>

                            <div className="postTitleContainer">
                                <h1 className="postTitle">{post.titulo}</h1>
                                
                                <div className="postActions">
                                    <button 
                                        onClick={toggleFavorito}
                                        className={`favoriteButton ${favorito ? 'active' : ''}`}
                                        title="Agregar a favoritos"
                                    >
                                        <FaHeart />
                                    </button>
                                    
                                    <button 
                                        onClick={handleShare}
                                        className="shareButton"
                                        title="Compartir artículo"
                                    >
                                        <FaShare />
                                    </button>
                                </div>
                            </div>

                            {/* Imagen destacada si existe */}
                            {post.imagen && (
                                <div className="featuredImageContainer">
                                    <img 
                                        src={post.imagen}
                                        alt={post.titulo}
                                        className="featuredImage"
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            {/* Descripción corta si existe */}
                            {post.descripcionCorta && (
                                <div className="postSummary">
                                    <p>{post.descripcionCorta}</p>
                                </div>
                            )}
                        </header>

                        {/* Contenido del artículo */}
                        <div className="postContent">
                            <div 
                                className="contentBody"
                                dangerouslySetInnerHTML={{ 
                                    __html: formatContent(post.contenido) 
                                }}
                            />
                        </div>

                        {/* Footer del artículo */}
                        <footer className="postFooter">
                            <div className="postStats">
                                <p>
                                    <FaUser className="authorIcon" />
                                    Publicado por <strong>Tractodo</strong>
                                </p>
                                
                                {post.fechaActualizacion && post.fechaActualizacion !== post.fechaCreacion && (
                                    <p className="lastUpdated">
                                        Última actualización: {formatDate(post.fechaActualizacion)}
                                    </p>
                                )}
                            </div>

                            <div className="shareSection">
                                <h4>¿Te gustó este artículo?</h4>
                                <div className="shareButtons">
                                    <button 
                                        onClick={handleShare}
                                        className="shareButtonLarge"
                                    >
                                        <FaShare />
                                        Compartir
                                    </button>
                                    
                                    <button 
                                        onClick={toggleFavorito}
                                        className={`favoriteButtonLarge ${favorito ? 'active' : ''}`}
                                    >
                                        <FaHeart />
                                        {favorito ? 'Guardado' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </footer>

                        {/* Navegación a otros artículos */}
                        <div className="relatedNavigation">
                            <div className="navigationButtons">
                                <button 
                                    onClick={() => router.push('/blog')}
                                    className="viewAllPostsButton"
                                >
                                    <FaArrowLeft />
                                    Ver todos los artículos
                                </button>
                                
                                {post.categoria && (
                                    <button 
                                        onClick={() => router.push(`/blog?categoria=${encodeURIComponent(post.categoria)}`)}
                                        className="viewCategoryButton"
                                    >
                                        <FaTag />
                                        Más de {post.categoria}
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                </main>

                <Footer />
                <ScrollToTop />
            </div>
        </>
    );
}