'use client';
import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaShare, FaArrowLeft } from 'react-icons/fa';
import { obtenerPostPorId } from '../../../services/blogService';
import styles from './BlogPostModal.module.css';

const BlogPostModal = ({ postId, onClose, isOpen }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && postId) {
            cargarPost();
        }
    }, [isOpen, postId]);

    const cargarPost = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📖 Cargando post para modal:', postId);
            
            const postData = await obtenerPostPorId(postId);
            console.log('📄 Datos del post recibidos:', postData);
            
            let bloques = [];
            
            // Priorizar siempre la estructura de bloques si existe
            if (postData.bloques && Array.isArray(postData.bloques) && postData.bloques.length > 0) {
                bloques = postData.bloques;
                console.log('✅ Post tiene estructura de bloques:', bloques);
            } else {
                // Solo como fallback para datos muy antiguos
                console.log('🔄 Estructura antigua detectada, creando bloques básicos...');
                const contenido = postData.contenido || postData.content || '';
                const imagenes = postData.imagenes || [];
                
                if (contenido && imagenes.length > 0) {
                    bloques.push({
                        subtitulo: '', // Subtítulo vacío para datos antiguos
                        texto: contenido,
                        imagen: imagenes[0] || ''
                    });
                }
            }
            
            const postFormateado = {
                id: postData.id,
                title: postData.titulo || postData.title,
                content: postData.contenido || postData.content,
                images: postData.imagenes || [],
                publishDate: postData.fechaPublicacion || postData.fecha || postData.publishDate,
                category: postData.categoria || postData.category || 'Tracto-Consejos',
                author: postData.autor || 'TracTodo',
                bloques: bloques
            };
            
            console.log('✅ Post formateado con bloques:', postFormateado);
            setPost(postFormateado);
        } catch (error) {
            console.error('❌ Error al cargar post:', error);
            setError('Error al cargar el artículo');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleImageError = (e) => {
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE1MCA5NUwyNTAgOTVMMjAwIDE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjE5MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc>';
        e.target.alt = 'Imagen no encontrada';
    };

    const handleShare = async () => {
        const shareData = {
            title: post.title,
            text: `Lee este artículo de TracTodo: ${post.title}`,
            url: window.location.origin + `/blog/${post.id}`
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
        const url = window.location.origin + `/blog/${post.id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Enlace copiado al portapapeles');
        });
    };

    const formatParagraph = (paragraph) => {
        if (!paragraph) return '';
        
        return paragraph
            // Procesar subtítulos (## texto) y convertirlos a h2
            .replace(/^## (.+)$/gm, '<h2 class="' + styles.contentSubtitle + '">$1</h2>')
            // Procesar títulos (# texto) y convertirlos a h1  
            .replace(/^# (.+)$/gm, '<h1 class="' + styles.contentTitle + '">$1</h1>')
            // Procesar negritas
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Procesar cursivas
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convertir doble salto de línea en párrafos
            .replace(/\n\n/g, '</p><p>')
            // Convertir saltos de línea simples en <br>
            .replace(/\n/g, '<br>')
            // Envolver todo en párrafos
            .replace(/^(.*)$/, '<p>$1</p>')
            // Eliminar párrafos vacíos
            .replace(/<p><\/p>/g, '');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                
                <div className={styles.modalHeader}>
                    <div className={styles.modalCategory}>
                        {post?.category || 'Cargando...'}
                    </div>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        title="Cerrar artículo"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.modalContent}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <h2>Cargando artículo...</h2>
                            <p>Obteniendo contenido...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <h2>Error al cargar</h2>
                            <p>{error}</p>
                            <button onClick={cargarPost} className={styles.retryButton}>
                                Intentar de nuevo
                            </button>
                        </div>
                    ) : post ? (
                        <>
                            <div className={styles.articleHeader}>
                                <h1 className={styles.articleTitle}>{post.title}</h1>
                            </div>

                            <div className={styles.articleMeta}>
                                <div className={styles.metaItem}>
                                    <FaUser />
                                    <span>Por {post.author}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <FaCalendarAlt />
                                    <span>{formatDate(post.publishDate)}</span>
                                </div>
                                <button 
                                    onClick={handleShare}
                                    className={styles.shareButton}
                                >
                                    <FaShare />
                                    <span>COMPARTIR</span>
                                </button>
                            </div>

                            <div className={styles.articleBody}>
                                {post.bloques && post.bloques.length > 0 ? (
                                    post.bloques.map((bloque, index) => {
                                        // CAMBIO AQUÍ: Layout específico por bloque
                                        // Bloque 1: Imagen izquierda, texto derecha
                                        // Bloque 2: Texto izquierda, imagen derecha
                                        const isFirstBlock = index === 0;
                                        
                                        return (
                                            <div 
                                                key={index} 
                                                className={`${styles.bloqueRow} ${!bloque.subtitulo.trim() ? styles.noSubtitle : ''}`}
                                            >
                                                {isFirstBlock ? (
                                                    // Bloque 1: Imagen izquierda, contenido derecha
                                                    <>
                                                        <div className={styles.bloqueImageContainer}>
                                                            {bloque.imagen ? (
                                                                <img
                                                                    src={bloque.imagen}
                                                                    alt={`${post.title} - ${bloque.subtitulo || 'Imagen'}`}
                                                                    className={styles.bloqueImage}
                                                                    onError={handleImageError}
                                                                />
                                                            ) : (
                                                                <div className={styles.imagePlaceholder}>
                                                                    <div className={styles.placeholderContent}>
                                                                        <span>🖼️</span>
                                                                        <p>Imagen no disponible</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={styles.bloqueTextContainer}>
                                                            {bloque.subtitulo && bloque.subtitulo.trim() && (
                                                                <h2 className={styles.bloqueSubtitulo}>{bloque.subtitulo}</h2>
                                                            )}
                                                            <div 
                                                                className={styles.bloqueTexto}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: formatParagraph(bloque.texto) 
                                                                }} 
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Bloque 2+: Contenido izquierda, imagen derecha
                                                    <>
                                                        <div className={styles.bloqueTextContainer}>
                                                            {bloque.subtitulo && bloque.subtitulo.trim() && (
                                                                <h2 className={styles.bloqueSubtitulo}>{bloque.subtitulo}</h2>
                                                            )}
                                                            <div 
                                                                className={styles.bloqueTexto}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: formatParagraph(bloque.texto) 
                                                                }} 
                                                            />
                                                        </div>
                                                        <div className={styles.bloqueImageContainer}>
                                                            {bloque.imagen ? (
                                                                <img
                                                                    src={bloque.imagen}
                                                                    alt={`${post.title} - ${bloque.subtitulo || 'Imagen'}`}
                                                                    className={styles.bloqueImage}
                                                                    onError={handleImageError}
                                                                />
                                                            ) : (
                                                                <div className={styles.imagePlaceholder}>
                                                                    <div className={styles.placeholderContent}>
                                                                        <span>🖼️</span>
                                                                        <p>Imagen no disponible</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={styles.noContentMessage}>
                                        <p>No hay contenido disponible para este artículo.</p>
                                        <p>El artículo no tiene bloques de contenido configurados.</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.articleFooter}>
                                <button 
                                    onClick={onClose}
                                    className={styles.footerButton}
                                >
                                    <FaArrowLeft />
                                    <span>VOLVER AL BLOG</span>
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default BlogPostModal;