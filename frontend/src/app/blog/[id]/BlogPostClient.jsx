'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaShare } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import SEOHead from '../../components/SEOHead/SEOHead';
import { useBlogSEO } from '../../../hooks/useSEO';
import './blog-post.css';

export default function BlogPostClient({ post }) {
    const router = useRouter();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Hook SEO para artículo individual
    const { seoData, loading: seoLoading } = useBlogSEO(post?.id, post);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE1MCA5NUwyNTAgOTVMMjAwIDE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+'; 
        e.target.alt = 'Imagen no encontrada';
    };

    const handleShare = async () => {
        const shareData = {
            title: post.title,
            text: `Lee este artículo de TracTodo: ${post.title}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                console.log('Error sharing:', error);
                copyToClipboard();
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Enlace copiado al portapapeles');
        });
    };

    // Dividir el contenido en párrafos
    const splitContentIntoParagraphs = (content) => {
        return content.split('\n\n').filter(paragraph => paragraph.trim().length > 0);
    };

    const formatParagraph = (paragraph) => {
        return paragraph
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    };

    const paragraphs = splitContentIntoParagraphs(post.content || '');
    const images = post.images || [];

    // Schema.org para artículo individual
    const schemaArticle = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.description || post.content?.substring(0, 160) + '...',
        "image": post.images?.[0] || `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/tractodo-logo.jpg`,
        "author": {
            "@type": "Organization",
            "name": post.author || "Tractodo"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Tractodo",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/tractodo-logo.jpg`
            }
        },
        "datePublished": post.publishDate,
        "dateModified": post.updatedDate || post.publishDate,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog/${post.id}`
        },
        "articleSection": post.category,
        "keywords": post.category ? [post.category, "tractocamión", "refacciones", "consejos técnicos"] : ["tractocamión", "blog", "consejos"],
        "wordCount": post.content ? post.content.split(' ').length : 0
    };

    // Si no hay post, mostrar error
    if (!post) {
        return (
            <>
                <SEOHead
                    title="Artículo no encontrado | Blog Tractodo"
                    description="El artículo que buscas no está disponible"
                    canonicalUrl={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/blog`}
                    noIndex={true}
                />
                <div className="blog-post-page">
                    <Navbar />
                    <main className="magazineMainContent">
                        <div className="errorContainer">
                            <h2>Artículo no encontrado</h2>
                            <p>El artículo que buscas no existe o ha sido removido.</p>
                            <button onClick={() => router.push('/blog')} className="magazineBackButton">
                                <FaArrowLeft />
                                <span>Volver al Blog</span>
                            </button>
                        </div>
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
                    schema={schemaArticle}
                />
            )}

            <div className="blog-post-page">
                <Navbar />
                
                <main className="magazineMainContent">
                    <div className="magazineWrapper">
                        
                        {/* Botón de regreso */}
                        <div className="magazineBackSection">
                            <button 
                                onClick={() => router.push('/blog')}
                                className="magazineBackButton"
                            >
                                <FaArrowLeft />
                                <span>Volver al Blog</span>
                            </button>
                        </div>

                        {/* Contenedor del artículo estilo magazine */}
                        <article className="magazineArticle">
                            
                            {/* Categoría discreta en esquina superior izquierda */}
                            <div className="magazineCategory">{post.category}</div>
                            
                            {/* Título principal centrado */}
                            <header className="magazineHeader">
                                <h1 className="magazineTitle">{post.title}</h1>
                            </header>

                            {/* Contenido principal con layout alternado */}
                            <div className="magazineContent">
                                
                                {/* Meta información (autor y fecha) */}
                                <div className="magazineMeta">
                                    <div className="metaAuthor">
                                        <FaUser />
                                        <span>Por {post.author}</span>
                                    </div>
                                    <div className="metaDate">
                                        <FaCalendarAlt />
                                        <span>{formatDate(post.publishDate)}</span>
                                    </div>
                                    <button 
                                        onClick={handleShare}
                                        className="metaShare"
                                    >
                                        <FaShare />
                                        <span>Compartir</span>
                                    </button>
                                </div>

                                {/* Layout alternado de contenido */}
                                <div className="magazineBody">
                                    {paragraphs.map((paragraph, index) => {
                                        const isEven = index % 2 === 0;
                                        const imageIndex = Math.floor(index / 2) % images.length;
                                        const hasImage = images.length > 0 && index < images.length * 2;

                                        return (
                                            <div key={index} className={`contentRow ${isEven ? 'row-left-image' : 'row-right-image'}`}>
                                                {isEven ? (
                                                    // Imagen izquierda, texto derecha
                                                    <>
                                                        <div className="contentImageContainer">
                                                            {hasImage && (
                                                                <img
                                                                    src={images[imageIndex]}
                                                                    alt={`${post.title} - Imagen ${imageIndex + 1}`}
                                                                    className="contentImage"
                                                                    onError={handleImageError}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="contentTextContainer">
                                                            <div 
                                                                className="contentText"
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: formatParagraph(paragraph) 
                                                                }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Texto izquierda, imagen derecha
                                                    <>
                                                        <div className="contentTextContainer">
                                                            <div 
                                                                className="contentText"
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: formatParagraph(paragraph) 
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="contentImageContainer">
                                                            {hasImage && (
                                                                <img
                                                                    src={images[imageIndex]}
                                                                    alt={`${post.title} - Imagen ${imageIndex + 1}`}
                                                                    className="contentImage"
                                                                    onError={handleImageError}
                                                                />
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Imágenes restantes si hay más que párrafos */}
                                {images.length > paragraphs.length && (
                                    <div className="extraImages">
                                        {images.slice(paragraphs.length).map((image, index) => (
                                            <div key={`extra-${index}`} className="extraImageContainer">
                                                <img
                                                    src={image}
                                                    alt={`${post.title} - Imagen adicional ${index + 1}`}
                                                    className="extraImage"
                                                    onError={handleImageError}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer del artículo */}
                            <footer className="magazineFooter">
                                <div className="magazineActions">
                                    <button 
                                        onClick={handleShare}
                                        className="magazineAction share"
                                    >
                                        <FaShare />
                                        <span>Compartir artículo</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => router.push('/blog')}
                                        className="magazineAction blog"
                                    >
                                        <FaArrowLeft />
                                        <span>Ver más artículos</span>
                                    </button>
                                </div>
                            </footer>

                        </article>
                    </div>
                </main>

                <Footer />
                <ScrollToTop />
            </div>
        </>
    );
}