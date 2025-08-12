'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaWhatsapp, FaArrowLeft, FaShare, FaHeart, FaStar, FaTools, FaCog } from "react-icons/fa";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import SEOHead from '../../components/SEOHead/SEOHead';
import { obtenerProductoPorIdConSEO } from '../../../services/productoService';
import { registrarVista } from '../../../services/trackingService';
import { useProductSEO } from '../../../hooks/useSEO';
import { extractIdFromSlug } from '../../../utils/slugUtils';
import './producto-individual.css';

export default function ProductoIndividualPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug;
    
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagenPrincipal, setImagenPrincipal] = useState('');
    const [favorito, setFavorito] = useState(false);

    // Extraer ID del slug
    const productId = extractIdFromSlug(slug);

    // Hook SEO para producto individual
    const { seoData, schema, loading: seoLoading } = useProductSEO(productId, producto);

    useEffect(() => {
        if (productId) {
            cargarProducto();
        } else {
            setError('ID de producto no válido');
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (producto?.imagen) {
            setImagenPrincipal(producto.imagen);
        }
    }, [producto]);

    const cargarProducto = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Cargando producto:', productId);
            
            // Obtener producto con datos SEO
            const data = await obtenerProductoPorIdConSEO(productId);
            
            if (data) {
                setProducto(data);
                
                // Registrar vista del producto
                try {
                    await registrarVista(productId, 'producto');
                    console.log('👀 Vista registrada para producto:', productId);
                } catch (vistaError) {
                    console.warn('⚠️ Error registrando vista:', vistaError);
                }
            } else {
                setError('Producto no encontrado');
            }
        } catch (err) {
            console.error('❌ Error cargando producto:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppClick = () => {
        if (!producto) return;
        
        const contactos = [
            { name: "Alan", phone: "+524272245923" },
            { name: "Laura", phone: "+524272033515" },
            { name: "Oscar", phone: "+524272032672" },
            { name: "Hugo", phone: "+524424128926" }
        ];
        
        const contacto = contactos[Math.floor(Math.random() * contactos.length)];
        const mensaje = `Hola ${contacto.name}, estoy interesado en ${producto.nombre} (${producto.numeroParte}) con precio de ${formatPrice(producto.precio)}. ¿Podrías proporcionarme más información?`;
        
        const whatsappUrl = `https://wa.me/${contacto.phone}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = producto?.nombre || 'Producto Tractodo';
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Mira este producto de Tractodo: ${title}`,
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

    const formatPrice = (price) => {
        if (!price) return 'Consultar precio';
        
        const numPrice = parseFloat(price);
        if (isNaN(numPrice)) return 'Consultar precio';
        
        return `$${numPrice.toLocaleString('es-MX', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const obtenerEspecificaciones = () => {
        if (!producto) return [];
        
        const specs = [];
        
        if (producto.marca) specs.push({ label: 'Marca', value: producto.marca });
        if (producto.numeroParte) specs.push({ label: 'Número de Parte', value: producto.numeroParte });
        if (producto.modelo) specs.push({ label: 'Modelo', value: producto.modelo });
        if (producto.categoria) specs.push({ label: 'Categoría', value: producto.categoria });
        if (producto.peso) specs.push({ label: 'Peso', value: producto.peso });
        if (producto.garantia) specs.push({ label: 'Garantía', value: producto.garantia });
        
        return specs;
    };

    if (loading || seoLoading) {
        return (
            <div className="producto-individual-page">
                <Navbar />
                <main className="mainContent">
                    <div className="loadingContainer">
                        <div className="loadingSpinner"></div>
                        <p>Cargando producto...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !producto) {
        return (
            <>
                {seoData && (
                    <SEOHead
                        title="Producto no encontrado | Tractodo"
                        description="El producto que buscas no está disponible"
                        canonicalUrl={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/productos/${slug}`}
                        noIndex={true}
                    />
                )}
                <div className="producto-individual-page">
                    <Navbar />
                    <main className="mainContent">
                        <div className="errorContainer">
                            <h2>Producto no encontrado</h2>
                            <p>{error || 'El producto que buscas no existe o no está disponible.'}</p>
                            <div className="errorActions">
                                <button onClick={() => router.push('/productos')} className="backToProductsButton">
                                    Volver a Productos
                                </button>
                            </div>
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
                    schema={schema}
                />
            )}

            <div className="producto-individual-page">
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
                            <span onClick={() => router.push('/productos')}>Productos</span>
                            <span>/</span>
                            <span className="current">{producto.nombre}</span>
                        </nav>
                    </div>

                    <section className="productoSection">
                        <div className="productoContainer">
                            
                            {/* Galería de imágenes */}
                            <div className="imageGallery">
                                <div className="mainImageContainer">
                                    <img 
                                        src={imagenPrincipal || 'https://via.placeholder.com/500x400?text=Sin+Imagen'} 
                                        alt={`${producto.nombre} - ${producto.marca}`}
                                        className="mainImage"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/500x400?text=Sin+Imagen';
                                        }}
                                    />
                                    
                                    {/* Badge de marca */}
                                    {producto.marca && (
                                        <div className="marcaBadge">
                                            {producto.marca}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Miniaturas (si hay múltiples imágenes en el futuro) */}
                                {producto.imagenes && producto.imagenes.length > 1 && (
                                    <div className="thumbnailContainer">
                                        {producto.imagenes.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img}
                                                alt={`${producto.nombre} vista ${index + 1}`}
                                                className={`thumbnail ${imagenPrincipal === img ? 'active' : ''}`}
                                                onClick={() => setImagenPrincipal(img)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Información del producto */}
                            <div className="productoInfo">
                                <div className="productoHeader">
                                    <h1 className="productoTitle">{producto.nombre}</h1>
                                    
                                    <div className="productoActions">
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
                                            title="Compartir producto"
                                        >
                                            <FaShare />
                                        </button>
                                    </div>
                                </div>

                                {/* Precio */}
                                <div className="priceContainer">
                                    <span className="price">{formatPrice(producto.precio)}</span>
                                    {producto.precioOriginal && (
                                        <span className="originalPrice">
                                            ${parseFloat(producto.precioOriginal).toLocaleString('es-MX')}
                                        </span>
                                    )}
                                </div>

                                {/* Información básica */}
                                <div className="basicInfo">
                                    {producto.numeroParte && (
                                        <p className="partNumber">
                                            <strong>Número de Parte:</strong> {producto.numeroParte}
                                        </p>
                                    )}
                                    
                                    {producto.disponibilidad && (
                                        <p className="availability">
                                            <span className="availabilityBadge available">
                                                ✓ {producto.disponibilidad}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Descripción */}
                                {producto.descripcion && (
                                    <div className="description">
                                        <h3>Descripción</h3>
                                        <p>{producto.descripcion}</p>
                                    </div>
                                )}

                                {/* Información SEO específica si está disponible */}
                                {producto.seo && (
                                    <div className="seoInfo">
                                        <div className="seoIndicator">
                                            <FaStar />
                                            <span>Producto optimizado con información técnica especializada</span>
                                        </div>
                                        
                                        {producto.seo.descripcion && producto.seo.descripcion !== producto.descripcion && (
                                            <div className="seoDescription">
                                                <h4>Información Técnica</h4>
                                                <p>{producto.seo.descripcion}</p>
                                            </div>
                                        )}
                                        
                                        {producto.seo.palabrasClave && producto.seo.palabrasClave.length > 0 && (
                                            <div className="keywords">
                                                <h4>Términos relacionados:</h4>
                                                <div className="keywordTags">
                                                    {producto.seo.palabrasClave.slice(0, 8).map((keyword, index) => (
                                                        <span key={index} className="keywordTag">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="actionButtons">
                                    <button 
                                        onClick={handleWhatsAppClick}
                                        className="whatsappButton primary"
                                    >
                                        <FaWhatsapp />
                                        Consultar por WhatsApp
                                    </button>
                                    
                                    <button 
                                        onClick={() => {
                                            // Aquí se podría agregar funcionalidad de cotización
                                            handleWhatsAppClick();
                                        }}
                                        className="quoteButton secondary"
                                    >
                                        <FaCog />
                                        Solicitar Cotización
                                    </button>
                                </div>

                                {/* Garantía y envío */}
                                <div className="warranties">
                                    <div className="warrantyItem">
                                        <FaTools className="warrantyIcon" />
                                        <div>
                                            <h4>Garantía Incluida</h4>
                                            <p>Todas nuestras refacciones incluyen garantía</p>
                                        </div>
                                    </div>
                                    
                                    <div className="warrantyItem">
                                        <FaCog className="warrantyIcon" />
                                        <div>
                                            <h4>Envío Nacional</h4>
                                            <p>Enviamos a toda la República Mexicana</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Especificaciones técnicas */}
                        {obtenerEspecificaciones().length > 0 && (
                            <div className="specificationsContainer">
                                <h3>Especificaciones Técnicas</h3>
                                <div className="specificationsGrid">
                                    {obtenerEspecificaciones().map((spec, index) => (
                                        <div key={index} className="specItem">
                                            <span className="specLabel">{spec.label}:</span>
                                            <span className="specValue">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </main>

                <Footer />
                <ScrollToTop />
            </div>
        </>
    );
}