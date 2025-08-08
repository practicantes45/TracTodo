'use client';
import './producto-individual.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaWhatsapp, FaShare, FaCopy, FaCheckCircle, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaRedo } from "react-icons/fa";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import ProductImageModal from '../../components/ProductImageModal/ProductImageModal';
import { obtenerProductoPorNombre, generarURLAmigable } from '../../../services/productoService';
import { registrarVista } from '../../../services/trackingService';

export default function ProductoIndividualClient({ params }) {
    const router = useRouter();
    const [producto, setProducto] = useState(null);
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Estados para el carrusel de imágenes del producto principal
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagenesProducto, setImagenesProducto] = useState([]);

    // Estados para zoom, rotación y pan del carrusel principal
    const [carouselZoom, setCarouselZoom] = useState(100);
    const [carouselRotation, setCarouselRotation] = useState(0);
    const [carouselPanX, setCarouselPanX] = useState(0);
    const [carouselPanY, setCarouselPanY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const carouselImageRef = useRef(null);

    // Estados para el modal de imágenes
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    // Estados para el carrusel de productos relacionados
    const [currentSlide, setCurrentSlide] = useState(0);
    const [itemsPerSlide, setItemsPerSlide] = useState(3);

    // Lista de contactos para WhatsApp
    const contactList = [
        {
            name: "Alan",
            phoneNumber: "+524272245923",
            message: "Hola Alan, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
        },
        {
            name: "Laura",
            phoneNumber: "+524272033515",
            message: "Hola Laura, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
        },
        {
            name: "Oscar",
            phoneNumber: "+524272032672",
            message: "Hola Oscar, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
        },
        {
            name: "Hugo",
            phoneNumber: "+524424128926",
            message: "Hola Hugo, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
        }
    ];

    // Detectar tamaño de pantalla para items per slide
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setItemsPerSlide(1);
            } else if (window.innerWidth <= 1024) {
                setItemsPerSlide(2);
            } else {
                setItemsPerSlide(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setCurrentSlide(0);
    }, [productosRelacionados, itemsPerSlide]);

    // Cargar producto cuando cambia el parámetro
    useEffect(() => {
        if (params.nombre) {
            cargarProducto();
        }
    }, [params.nombre]);

    // Resetear zoom, rotación y pan cuando cambia la imagen
    useEffect(() => {
        setCarouselZoom(100);
        setCarouselRotation(0);
        setCarouselPanX(0);
        setCarouselPanY(0);
    }, [currentImageIndex]);

    // FUNCIÓN MEJORADA para cargar producto por nombre
    // Función para cargar producto por nombre
const cargarProducto = async () => {
    try {
        setLoading(true);
        setError('');
        console.log('🔄 Cargando producto por nombre/URL:', params.nombre);

        // Decodificar la URL
        const nombreDecodificado = decodeURIComponent(params.nombre);
        console.log('📝 Nombre decodificado:', nombreDecodificado);

        // Obtener producto por nombre (el backend maneja URLs amigables)
        const data = await obtenerProductoPorNombre(nombreDecodificado);
        console.log('📦 Datos del producto recibidos:', data);
        console.log('📦 Tipo de data:', typeof data);
        console.log('📦 Keys de data:', Object.keys(data || {}));

        // NUEVO: Verificar diferentes formatos de respuesta del backend
        let producto = null;
        let recomendados = [];

        if (data) {
            // Formato 1: { producto: {...}, recomendados: [...] }
            if (data.producto) {
                producto = data.producto;
                recomendados = data.recomendados || [];
                console.log('✅ Formato encontrado: { producto, recomendados }');
            }
            // Formato 2: { producto: {...}, recomendaciones: [...] }
            else if (data.recomendaciones) {
                producto = data.producto;
                recomendados = data.recomendaciones || [];
                console.log('✅ Formato encontrado: { producto, recomendaciones }');
            }
            // Formato 3: El producto viene directamente
            else if (data.nombre || data.id) {
                producto = data;
                recomendados = [];
                console.log('✅ Formato encontrado: producto directo');
            }
            // Formato 4: Array con el producto como primer elemento
            else if (Array.isArray(data) && data.length > 0) {
                producto = data[0];
                recomendados = [];
                console.log('✅ Formato encontrado: array de productos');
            }
        }

        console.log('🎯 Producto procesado:', producto);
        console.log('🔗 Recomendados procesados:', recomendados);

        if (producto && (producto.nombre || producto.id)) {
            setProducto(producto);
            setProductosRelacionados(recomendados);

            const imagenes = procesarImagenesProducto(producto);
            setImagenesProducto(imagenes);
            setCurrentImageIndex(0);

            console.log('🖼️ Imágenes procesadas:', imagenes);
            console.log('🔗 Productos relacionados encontrados:', recomendados?.length || 0);

            // Registrar vista usando el ID del producto
            if (producto.id) {
                await registrarVista(producto.id);
            }
        } else {
            console.error('❌ Estructura de datos no válida:', data);
            throw new Error('Formato de respuesta del backend no válido');
        }
    } catch (error) {
        console.error("❌ Error al cargar producto:", error);
        console.error("❌ Error stack:", error.stack);
        setError(`No se pudo cargar el producto: ${error.message}`);
    } finally {
        // IMPORTANTE: Agregar setLoading(false) en finally para asegurar que siempre se ejecute
        setLoading(false);
    }
};
    // FUNCIÓN MEJORADA para procesar imágenes del producto
    const procesarImagenesProducto = (producto) => {
        console.log('🖼️ Iniciando procesamiento de imágenes para:', producto.nombre);
        const imagenes = [];

        try {
            // 1. Prioridad: imagenesUrl (objeto con múltiples imágenes)
            if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
                console.log('🖼️ Encontrado imagenesUrl:', Object.keys(producto.imagenesUrl));
                
                const ordenImagenes = ['frente', 'trasera', 'lateral', 'superior', 'inferior'];
                
                // Agregar primero las imágenes en orden específico
                ordenImagenes.forEach(tipo => {
                    if (producto.imagenesUrl[tipo] && 
                        typeof producto.imagenesUrl[tipo] === 'string' && 
                        producto.imagenesUrl[tipo].trim() !== '') {
                        
                        imagenes.push({
                            tipo,
                            url: producto.imagenesUrl[tipo],
                            descripcion: `Vista ${tipo}`
                        });
                        console.log(`✅ Agregada imagen ${tipo}:`, producto.imagenesUrl[tipo]);
                    }
                });

                // Agregar cualquier otra imagen que no esté en el orden específico
                Object.entries(producto.imagenesUrl).forEach(([tipo, url]) => {
                    if (url && typeof url === 'string' && url.trim() !== '' && !ordenImagenes.includes(tipo)) {
                        imagenes.push({
                            tipo,
                            url,
                            descripcion: `Vista ${tipo}`
                        });
                        console.log(`✅ Agregada imagen adicional ${tipo}:`, url);
                    }
                });
            }

            // 2. Fallback: imagenUrl directa
            if (imagenes.length === 0 && producto.imagenUrl && 
                typeof producto.imagenUrl === 'string' && producto.imagenUrl.trim() !== '') {
                imagenes.push({
                    tipo: 'principal',
                    url: producto.imagenUrl,
                    descripcion: 'Imagen principal'
                });
                console.log('✅ Usando imagenUrl como fallback:', producto.imagenUrl);
            }

            // 3. Fallback final: imagen por defecto
            if (imagenes.length === 0) {
                imagenes.push({
                    tipo: 'default',
                    url: '/imgs/producto-placeholder.jpg',
                    descripcion: 'Imagen no disponible'
                });
                console.log('⚠️ Usando imagen por defecto');
            }

            console.log(`✅ Procesamiento completado: ${imagenes.length} imágenes`);
            return imagenes;

        } catch (error) {
            console.error('❌ Error procesando imágenes:', error);
            return [{
                tipo: 'error',
                url: '/imgs/producto-placeholder.jpg',
                descripción: 'Error al cargar imágenes'
            }];
        }
    };

    // Funciones de navegación del carrusel de imágenes
    const nextImage = () => {
        setCurrentImageIndex(prev => 
            prev === imagenesProducto.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex(prev => 
            prev === 0 ? imagenesProducto.length - 1 : prev - 1
        );
    };

    // Funciones para controles de zoom y rotación
    const handleZoomIn = () => {
        setCarouselZoom(prev => Math.min(prev + 25, 300));
    };

    const handleZoomOut = () => {
        setCarouselZoom(prev => Math.max(prev - 25, 50));
    };

    const handleRotate = () => {
        setCarouselRotation(prev => (prev + 90) % 360);
    };

    const handleResetView = () => {
        setCarouselZoom(100);
        setCarouselRotation(0);
        setCarouselPanX(0);
        setCarouselPanY(0);
    };

    // Funciones para el sistema de arrastrar (pan)
    const handleMouseDown = (e) => {
        if (carouselZoom > 100) {
            setIsDragging(true);
            setDragStart({ 
                x: e.clientX - carouselPanX, 
                y: e.clientY - carouselPanY 
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && carouselZoom > 100) {
            setCarouselPanX(e.clientX - dragStart.x);
            setCarouselPanY(e.clientY - dragStart.y);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Función para volver a la página anterior
    const handleBack = () => {
        router.back();
    };

    // Función para compartir producto
    const handleShare = async () => {
        if (navigator.share && producto) {
            try {
                await navigator.share({
                    title: producto.nombre,
                    text: `Mira este producto: ${producto.nombre}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error al compartir:', error);
                handleCopyUrl();
            }
        } else {
            handleCopyUrl();
        }
    };

    // Función para copiar URL
    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Funciones para WhatsApp
    const handleWhatsAppClick = () => {
        if (!producto) return;

        const randomContact = contactList[Math.floor(Math.random() * contactList.length)];
        const precio = producto.precioVentaSugerido || producto.precio || 0;
        const personalizedMessage = randomContact.message
            .replace('{producto}', producto.nombre)
            .replace('{precio}', precio.toLocaleString());

        const cleanPhoneNumber = randomContact.phoneNumber.replace(/\D/g, '');
        const formattedNumber = cleanPhoneNumber.startsWith('52') 
            ? cleanPhoneNumber 
            : `52${cleanPhoneNumber}`;

        const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(personalizedMessage)}`;
        window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    };

    // Funciones para el modal de imágenes
    const openImageModal = (index = 0) => {
        setModalImageIndex(index);
        setIsModalOpen(true);
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
    };

    // Funciones para el carrusel de productos relacionados
    const nextSlide = () => {
        const maxSlide = Math.ceil(productosRelacionados.length / itemsPerSlide) - 1;
        setCurrentSlide(prev => prev === maxSlide ? 0 : prev + 1);
    };

    const prevSlide = () => {
        const maxSlide = Math.ceil(productosRelacionados.length / itemsPerSlide) - 1;
        setCurrentSlide(prev => prev === 0 ? maxSlide : prev - 1);
    };

    // Función para navegar a producto relacionado
    const handleRelatedProductClick = (productoRelacionado) => {
        const urlAmigable = generarURLAmigable(productoRelacionado.nombre);
        router.push(`/productos/${urlAmigable}`);
    };

    // Renderizado de estados de carga y error
    if (loading) {
        return (
            <div className="producto-individual-page">
                <Navbar />
                <main className="mainContent">
                    <div className="loadingContainer">
                        <div className="spinner"></div>
                        <p>Cargando producto...</p>
                        <small>Si tarda mucho, verifica tu conexión</small>
                    </div>
                </main>
                <Footer />
                <ScrollToTop />
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="producto-individual-page">
                <Navbar />
                <main className="mainContent">
                    <div className="errorContainer">
                        <h2>Producto no encontrado</h2>
                        <p>{error || 'No se pudo cargar el producto'}</p>
                        <button onClick={handleBack} className="backButton">
                            <FaArrowLeft /> Volver a productos
                        </button>
                        <button onClick={() => window.location.reload()} className="backButton" style={{ marginTop: '10px' }}>
                            Reintentar
                        </button>
                    </div>
                </main>
                <Footer />
                <ScrollToTop />
            </div>
        );
    }

    return (
        <div className="producto-individual-page">
            <Navbar />
            
            <main className="mainContent">
                {/* Botón de regreso */}
                <div className="backButtonContainer">
                    <button onClick={handleBack} className="backButton">
                        <FaArrowLeft />
                        Volver a productos
                    </button>
                </div>

                {/* Detalle del producto */}
                <section className="productDetailSection">
                    <div className="productDetailContainer">
                        {/* Sección de imagen con carrusel */}
                        <div className="productImageSection">
                            <div 
                                className="productImageContainer"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {imagenesProducto.length > 0 ? (
                                    <div className="carouselImageWrapper">
                                        <img
                                            ref={carouselImageRef}
                                            src={imagenesProducto[currentImageIndex]?.url}
                                            alt={imagenesProducto[currentImageIndex]?.descripcion || producto.nombre}
                                            className="productImage"
                                            style={{
                                                transform: `scale(${carouselZoom / 100}) rotate(${carouselRotation}deg) translate(${carouselPanX}px, ${carouselPanY}px)`,
                                                cursor: carouselZoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                            }}
                                            onError={(e) => {
                                                console.warn('❌ Error cargando imagen:', e.target.src);
                                                e.target.src = '/imgs/producto-placeholder.jpg';
                                            }}
                                            onClick={() => openImageModal(currentImageIndex)}
                                        />
                                    </div>
                                ) : (
                                    <div className="noImagePlaceholder">
                                        <p>Sin imagen disponible</p>
                                    </div>
                                )}

                                {/* Controles del carrusel */}
                                {imagenesProducto.length > 1 && (
                                    <>
                                        <button 
                                            onClick={prevImage} 
                                            className="carouselArrow carouselArrowLeft"
                                            aria-label="Imagen anterior"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button 
                                            onClick={nextImage} 
                                            className="carouselArrow carouselArrowRight"
                                            aria-label="Siguiente imagen"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </>
                                )}

                                {/* Controles de zoom y rotación */}
                                <div className="carouselControls">
                                    <button onClick={handleZoomOut} className="controlButton" title="Alejar">
                                        <FaSearchMinus />
                                    </button>
                                    <button onClick={handleZoomIn} className="controlButton" title="Acercar">
                                        <FaSearchPlus />
                                    </button>
                                    <button onClick={handleRotate} className="controlButton" title="Rotar">
                                        <FaRedo />
                                    </button>
                                    <button onClick={handleResetView} className="controlButton" title="Reset">
                                        Vista Original
                                    </button>
                                </div>

                                {/* Indicadores del carrusel */}
                                {imagenesProducto.length > 1 && (
                                    <div className="carouselIndicators">
                                        {imagenesProducto.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                aria-label={`Ir a imagen ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección de información */}
                        <div className="productInfoSection">
                            {/* Header con título y acciones */}
                            <div className="productHeader">
                                <h1 className="productTitle">{producto.nombre}</h1>
                                <div className="productActions">
                                    <button onClick={handleShare} className="shareButton" title="Compartir">
                                        <FaShare />
                                    </button>
                                    <button onClick={handleCopyUrl} className="copyButton" title="Copiar enlace">
                                        {copied ? <FaCheckCircle /> : <FaCopy />}
                                    </button>
                                </div>
                            </div>

                            {/* Información básica */}
                            <div className="productBasicInfo">
                                {producto.numeroParte && (
                                    <div className="productInfo">
                                        <span className="productInfoLabel">Número de Parte:</span>
                                        <span className="productInfoValue">{producto.numeroParte}</span>
                                    </div>
                                )}
                                
                                {producto.marca && (
                                    <div className="productInfo">
                                        <span className="productInfoLabel">Marca:</span>
                                        <span className="productInfoValue">{producto.marca}</span>
                                    </div>
                                )}
                                
                                {producto.tipoProducto && (
                                    <div className="productInfo">
                                        <span className="productInfoLabel">Tipo:</span>
                                        <span className="productInfoValue">{producto.tipoProducto}</span>
                                    </div>
                                )}
                                
                                {producto.ubicacion && (
                                    <div className="productInfo">
                                        <span className="productInfoLabel">Ubicación:</span>
                                        <span className="productInfoValue">{producto.ubicacion}</span>
                                    </div>
                                )}
                                
                                {producto.compatibilidad && (
                                    <div className="productInfo">
                                        <span className="productInfoLabel">Compatible con:</span>
                                        <span className="productInfoValue">{producto.compatibilidad}</span>
                                    </div>
                                )}
                            </div>

                            {/* Precio */}
                            <div className="productPricing">
                                {producto.precioVentaSugerido ? (
                                    <div className="priceContainer">
                                        <span className="currentPrice">${producto.precioVentaSugerido.toLocaleString()}</span>
                                        {producto.precio && producto.precio !== producto.precioVentaSugerido && (
                                            <span className="originalPrice">${producto.precio.toLocaleString()}</span>
                                        )}
                                    </div>
                                ) : producto.precio ? (
                                    <div className="priceContainer">
                                        <span className="currentPrice">${producto.precio.toLocaleString()}</span>
                                    </div>
                                ) : (
                                    <div className="priceContainer">
                                        <span className="contactPrice">Consultar precio</span>
                                    </div>
                                )}
                            </div>

                            {/* Metadatos adicionales */}
                            {(producto.numeroMotor || producto.aplicaciones || producto.año) && (
                                <div className="productMeta">
                                    {producto.numeroMotor && (
                                        <div className="metaItem">
                                            <span className="metaLabel">Motor:</span>
                                            <span className="metaValue">{producto.numeroMotor}</span>
                                        </div>
                                    )}
                                    {producto.aplicaciones && (
                                        <div className="metaItem">
                                            <span className="metaLabel">Aplicaciones:</span>
                                            <span className="metaValue">{producto.aplicaciones}</span>
                                        </div>
                                    )}
                                    {producto.año && (
                                        <div className="metaItem">
                                            <span className="metaLabel">Año:</span>
                                            <span className="metaValue">{producto.año}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Botón de WhatsApp */}
                            <div className="productContactSection">
                                <button onClick={handleWhatsAppClick} className="whatsappButton">
                                    <FaWhatsapp />
                                    Consultar por WhatsApp
                                </button>
                                <p className="contactNote">
                                    Te conectaremos con uno de nuestros especialistas
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Descripción del producto */}
                {producto.descripcion && (
                    <section className="descriptionSection">
                        <div className="descriptionContainer">
                            <h2>Descripción del Producto</h2>
                            <p className="productDescription">
                                {producto.descripcion}
                            </p>
                        </div>
                    </section>
                )}

                {/* Productos relacionados */}
                {productosRelacionados.length > 0 && (
                    <section className="relatedProductsSection">
                        <div className="relatedProductsContainer">
                            <h2>Productos Relacionados</h2>
                            <div className="relatedCarouselWrapper">
                                <div className="relatedCarousel">
                                    <div 
                                        className="relatedCarouselTrack"
                                        style={{
                                            transform: `translateX(-${currentSlide * (100 / Math.ceil(productosRelacionados.length / itemsPerSlide))}%)`
                                        }}
                                    >
                                        {productosRelacionados.map((productoRel, index) => (
                                            <div key={productoRel.id || index} className="relatedProductCard">
                                                <div 
                                                    className="relatedProductImageContainer"
                                                    onClick={() => handleRelatedProductClick(productoRel)}
                                                >
                                                    <img 
                                                        src={productoRel.imagenUrl || productoRel.imagenesUrl?.frente || '/imgs/producto-placeholder.jpg'}
                                                        alt={productoRel.nombre}
                                                        className="relatedProductImage"
                                                        onError={(e) => {
                                                            e.target.src = '/imgs/producto-placeholder.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="relatedProductInfo">
                                                    <h3 className="relatedProductTitle">{productoRel.nombre}</h3>
                                                    {productoRel.descripcion && (
                                                        <p className="relatedProductDescription">
                                                            {productoRel.descripcion.substring(0, 100)}...
                                                        </p>
                                                    )}
                                                    <div className="relatedProductPrice">
                                                        ${(productoRel.precioVentaSugerido || productoRel.precio || 0).toLocaleString()}
                                                    </div>
                                                    <button 
                                                        className="relatedWhatsappButton"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Implementar WhatsApp para producto relacionado
                                                        }}
                                                    >
                                                        <FaWhatsapp /> Consultar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Controles del carrusel de relacionados */}
                                {productosRelacionados.length > itemsPerSlide && (
                                    <>
                                        <button 
                                            onClick={prevSlide} 
                                            className="relatedCarouselArrow relatedCarouselArrowLeft"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button 
                                            onClick={nextSlide} 
                                            className="relatedCarouselArrow relatedCarouselArrowRight"
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </>
                                )}

                                {/* Indicadores del carrusel de relacionados */}
                                {productosRelacionados.length > itemsPerSlide && (
                                    <div className="relatedCarouselIndicators">
                                        {Array.from({ length: Math.ceil(productosRelacionados.length / itemsPerSlide) }).map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentSlide(index)}
                                                className={`relatedIndicator ${index === currentSlide ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
            <ScrollToTop />

            {/* Modal de imágenes */}
            {isModalOpen && (
                <ProductImageModal
                    images={imagenesProducto}
                    currentIndex={modalImageIndex}
                    onClose={closeImageModal}
                    productName={producto.nombre}
                />
            )}
        </div>
    );
}