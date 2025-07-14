'use client';
import './producto-individual.css';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaWhatsapp, FaShare, FaCopy, FaCheckCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import ProductImageModal from '../../components/ProductImageModal/ProductImageModal';
import { obtenerProductoPorId } from '../../../services/productoService';
import { registrarVista } from '../../../services/trackingService';

export default function ProductoIndividualPage() {
    const params = useParams();
    const router = useRouter();
    const [producto, setProducto] = useState(null);
    const [productosRelacionados, setProductosRelacionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Estados para el carrusel de imágenes del producto principal
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imagenesProducto, setImagenesProducto] = useState([]);

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
                setItemsPerSlide(1); // Móvil: 1 producto
            } else if (window.innerWidth <= 1024) {
                setItemsPerSlide(2); // Tablet: 2 productos
            } else {
                setItemsPerSlide(3); // Desktop: 3 productos
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Resetear carrusel cuando cambien los productos relacionados o items per slide
    useEffect(() => {
        setCurrentSlide(0);
    }, [productosRelacionados, itemsPerSlide]);

    useEffect(() => {
        if (params.id) {
            cargarProducto();
        }
    }, [params.id]);

    const cargarProducto = async () => {
        try {
            setLoading(true);
            console.log('🔄 Cargando producto ID:', params.id);

            const data = await obtenerProductoPorId(params.id);
            console.log('📦 Datos del producto:', data);

            setProducto(data.producto);
            setProductosRelacionados(data.recomendados || []);

            // Procesar imágenes del producto
            const imagenes = procesarImagenesProducto(data.producto);
            setImagenesProducto(imagenes);
            setCurrentImageIndex(0);

            console.log('🖼️ Imágenes procesadas:', imagenes);
            console.log('🔗 Productos relacionados encontrados:', data.recomendados?.length || 0);

            // Registrar vista del producto
            await registrarVista(params.id);
        } catch (error) {
            console.error("❌ Error al cargar producto:", error);
            setError('No se pudo cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    // Función para procesar las imágenes del producto
    const procesarImagenesProducto = (producto) => {
        const imagenes = [];

        // Si tiene imagenesUrl (objeto con múltiples imágenes)
        if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
            const imagenesObj = Object.values(producto.imagenesUrl);
            imagenes.push(...imagenesObj);
        }

        // Si tiene imagenUrl directa
        if (producto.imagenUrl && !imagenes.includes(producto.imagenUrl)) {
            imagenes.push(producto.imagenUrl);
        }

        // Si tiene imagen antigua (string directo)
        if (producto.imagen && !imagenes.includes(producto.imagen)) {
            imagenes.push(producto.imagen);
        }

        return imagenes;
    };

    // Función para obtener la primera imagen disponible (para productos relacionados)
    const obtenerPrimeraImagen = (producto) => {
        if (producto.imagenUrl) {
            return producto.imagenUrl;
        }

        if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
            const imagenes = Object.values(producto.imagenesUrl);
            if (imagenes.length > 0) {
                return imagenes[0];
            }
        }

        if (producto.imagen) {
            return producto.imagen;
        }

        return null;
    };

    const handleWhatsAppClick = () => {
        const randomContact = contactList[Math.floor(Math.random() * contactList.length)];
        const precio = producto.precioVentaSugerido || 0;
        const personalizedMessage = randomContact.message
            .replace('{producto}', producto.nombre)
            .replace('{precio}', precio.toLocaleString());

        const cleanPhoneNumber = randomContact.phoneNumber.replace(/\D/g, '');
        const formattedNumber = cleanPhoneNumber.startsWith('52')
            ? cleanPhoneNumber
            : `52${cleanPhoneNumber}`;

        const encodedMessage = encodeURIComponent(personalizedMessage);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    const handleRelatedWhatsAppClick = (relatedProduct, e) => {
        e.preventDefault();
        e.stopPropagation();

        const randomContact = contactList[Math.floor(Math.random() * contactList.length)];
        const precio = relatedProduct.precioVentaSugerido || 0;
        const personalizedMessage = randomContact.message
            .replace('{producto}', relatedProduct.nombre)
            .replace('{precio}', precio.toLocaleString());

        const cleanPhoneNumber = randomContact.phoneNumber.replace(/\D/g, '');
        const formattedNumber = cleanPhoneNumber.startsWith('52')
            ? cleanPhoneNumber
            : `52${cleanPhoneNumber}`;

        const encodedMessage = encodeURIComponent(personalizedMessage);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    const handleShareProduct = async () => {
        const shareData = {
            title: producto.nombre,
            text: `Mira este producto de TRACTODO: ${producto.nombre}`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                handleCopyLink();
            }
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error al copiar enlace:', error);
        }
    };

    const handleBackClick = () => {
        router.push('/productos');
    };

    const handleRelatedProductClick = (relatedProduct) => {
        router.push(`/productos/${relatedProduct.id}`);
    };

    // Funciones del carrusel de imágenes del producto principal
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % imagenesProducto.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + imagenesProducto.length) % imagenesProducto.length);
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    // Funciones del modal
    const openModal = (index = 0) => {
        if (imagenesProducto.length > 0) {
            setModalImageIndex(index);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // Productos de ejemplo si no hay recomendaciones (para testing)
    const productosEjemplo = [
        {
            id: 'ejemplo-1',
            nombre: 'Producto Relacionado 1',
            descripcion: 'Descripción del producto relacionado de ejemplo para mostrar el carrusel',
            precioVentaSugerido: 15000,
            imagenUrl: null
        },
        {
            id: 'ejemplo-2',
            nombre: 'Producto Relacionado 2',
            descripcion: 'Otro producto de ejemplo para demostrar la funcionalidad del carrusel',
            precioVentaSugerido: 20000,
            imagenUrl: null
        },
        {
            id: 'ejemplo-3',
            nombre: 'Producto Relacionado 3',
            descripcion: 'Tercer producto de ejemplo para completar el carrusel de demostración',
            precioVentaSugerido: 25000,
            imagenUrl: null
        },
        {
            id: 'ejemplo-4',
            nombre: 'Producto Relacionado 4',
            descripcion: 'Cuarto producto de ejemplo para mostrar navegación',
            precioVentaSugerido: 30000,
            imagenUrl: null
        },
        {
            id: 'ejemplo-5',
            nombre: 'Producto Relacionado 5',
            descripcion: 'Quinto producto de ejemplo para demostrar el carrusel',
            precioVentaSugerido: 35000,
            imagenUrl: null
        },
        {
            id: 'ejemplo-6',
            nombre: 'Producto Relacionado 6',
            descripcion: 'Sexto producto de ejemplo para completar el carrusel',
            precioVentaSugerido: 40000,
            imagenUrl: null
        }
    ];

    // Usar productos de ejemplo si no hay productos relacionados reales
    const productosParaMostrar = productosRelacionados.length > 0 ? productosRelacionados : productosEjemplo;

    // Funciones del carrusel de productos relacionados CORREGIDAS
    const totalSlides = Math.ceil(productosParaMostrar.length / itemsPerSlide);

    const nextSlide = () => {
        setCurrentSlide(prev => {
            const nextSlide = prev + 1;
            return nextSlide >= totalSlides ? 0 : nextSlide; // Volver al inicio
        });
    };

    const prevSlide = () => {
        setCurrentSlide(prev => {
            const prevSlide = prev - 1;
            return prevSlide < 0 ? totalSlides - 1 : prevSlide; // Ir al final
        });
    };

    const goToSlide = (slideIndex) => {
        setCurrentSlide(slideIndex);
    };

    // Obtener productos visibles en el slide actual
    const getVisibleProducts = () => {
        const startIndex = currentSlide * itemsPerSlide;
        const endIndex = startIndex + itemsPerSlide;
        return productosParaMostrar.slice(startIndex, endIndex);
    };

    if (loading) {
        return (
            <div className="layout producto-individual-page">
                <Navbar />
                <main className="mainContent">
                    <div className="loadingContainer">
                        <div className="spinner"></div>
                        <p>Cargando producto...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !producto) {
        return (
            <div className="layout producto-individual-page">
                <Navbar />
                <main className="mainContent">
                    <div className="errorContainer">
                        <h2>Producto no encontrado</h2>
                        <p>{error || 'El producto que buscas no existe'}</p>
                        <button className="backButton" onClick={handleBackClick}>
                            <FaArrowLeft />
                            Volver a productos
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="layout producto-individual-page">
            <Navbar />

            <main className="mainContent">
                {/* Botón de regreso */}
                <div className="backButtonContainer">
                    <button className="backButton" onClick={handleBackClick}>
                        <FaArrowLeft />
                        Volver a productos
                    </button>
                </div>

                {/* Sección principal del producto */}
                <section className="productDetailSection">
                    <div className="productDetailContainer">

                        {/* Carrusel de imágenes del producto */}
                        <div className="productImageSection">
                            <div className="productImageCarousel">
                                <div
                                    className="productImageContainer"
                                    onClick={() => openModal(currentImageIndex)}
                                    style={{ cursor: imagenesProducto.length > 0 ? 'pointer' : 'default' }}
                                >
                                    {imagenesProducto.length > 0 ? (
                                        <img
                                            src={imagenesProducto[currentImageIndex]}
                                            alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                                            className="productImage"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="imageNotFound"
                                        style={{ display: imagenesProducto.length > 0 ? 'none' : 'flex' }}
                                    >
                                        <div className="noImageIcon">📷</div>
                                        <p>Imagen no detectada</p>
                                    </div>

                                    {/* Controles del carrusel - solo si hay más de una imagen */}
                                    {imagenesProducto.length > 1 && (
                                        <>
                                            <button
                                                className="carouselArrow carouselArrowLeft"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    prevImage();
                                                }}
                                            >
                                                <FaChevronLeft />
                                            </button>
                                            <button
                                                className="carouselArrow carouselArrowRight"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    nextImage();
                                                }}
                                            >
                                                <FaChevronRight />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Indicadores de imagen - solo si hay más de una imagen */}
                                {imagenesProducto.length > 1 && (
                                    <div className="imageIndicators">
                                        {imagenesProducto.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`imageIndicator ${currentImageIndex === index ? 'active' : ''}`}
                                                onClick={() => goToImage(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Información del producto */}
                        <div className="productInfoSection">
                            <div className="productHeader">
                                <h1 className="productTitle">{producto.nombre}</h1>
                                <div className="productActions">
                                    <button
                                        className="shareButton"
                                        onClick={handleShareProduct}
                                        title="Compartir producto"
                                    >
                                        <FaShare />
                                    </button>
                                    <button
                                        className="copyButton"
                                        onClick={handleCopyLink}
                                        title="Copiar enlace"
                                    >
                                        {copied ? <FaCheckCircle /> : <FaCopy />}
                                        {copied && <span className="copiedText">¡Copiado!</span>}
                                    </button>
                                </div>
                            </div>

                            <div className="productPrice">
                                ${(producto.precioVentaSugerido || 0).toLocaleString()}
                            </div>

                            <div className="productMeta">
                                {producto.numeroParte && (
                                    <div className="metaItem">
                                        <span className="metaLabel">Número de Parte:</span>
                                        <span className="metaValue">{producto.numeroParte}</span>
                                    </div>
                                )}
                                <div className="metaItem">
                                    <span className="metaLabel">Marca:</span>
                                    <span className="metaValue">
                                        {producto.marca || 'Cummins'}
                                    </span>
                                </div>
                                <div className="shippingInfo">
                                    <span>Envíos a toda la república mexicana.</span>
                                </div>
                            </div>

                            <button
                                className="whatsappButton"
                                onClick={handleWhatsAppClick}
                            >
                                <FaWhatsapp />
                                Compra por WhatsApp
                            </button>
                        </div>
                    </div>
                </section>

                {/* Sección de descripción */}
                <section className="descriptionSection">
                    <div className="descriptionContainer">
                        <h2>Descripción</h2>
                        <div className="descriptionContent">
                            <p>{producto.descripcion}</p>
                        </div>
                    </div>
                </section>

                {/* Productos relacionados con carrusel CORREGIDO */}
                <section className="relatedProductsSection">
                    <div className="relatedProductsContainer">
                        <h2>PRODUCTOS RELACIONADOS</h2>

                        {productosParaMostrar.length > 0 && (
                            <div className="relatedCarouselWrapper">
                                {/* Flechas de navegación - solo si hay más productos que los que se muestran */}
                                {productosParaMostrar.length > itemsPerSlide && (
                                    <>
                                        <button
                                            className="relatedCarouselArrow relatedCarouselArrowLeft"
                                            onClick={prevSlide}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            className="relatedCarouselArrow relatedCarouselArrowRight"
                                            onClick={nextSlide}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </>
                                )}

                                <div className="relatedCarouselContainer">
                                    <div className="relatedProductsGrid">
                                        {getVisibleProducts().map((relatedProduct) => {
                                            const imagenUrl = obtenerPrimeraImagen(relatedProduct);

                                            return (
                                                <div
                                                    key={relatedProduct.id}
                                                    className="relatedProductCard"
                                                    onClick={() => relatedProduct.id.startsWith('ejemplo') ? null : handleRelatedProductClick(relatedProduct)}
                                                    style={{ cursor: relatedProduct.id.startsWith('ejemplo') ? 'default' : 'pointer' }}
                                                >
                                                    <div className="relatedProductImageContainer">
                                                        {imagenUrl ? (
                                                            <img
                                                                src={imagenUrl}
                                                                alt={relatedProduct.nombre}
                                                                className="relatedProductImage"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextElementSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div
                                                            className="relatedImageNotFound"
                                                            style={{ display: imagenUrl ? 'none' : 'flex' }}
                                                        >
                                                            <div className="noImageIcon">📷</div>
                                                            <p>Imagen no detectada</p>
                                                        </div>
                                                    </div>
                                                    <div className="relatedProductInfo">
                                                        <h3 className="relatedProductTitle">{relatedProduct.nombre}</h3>
                                                        <p className="relatedProductDescription">
                                                            {relatedProduct.descripcion?.substring(0, 80)}...
                                                        </p>
                                                        <div className="relatedProductPrice">
                                                            ${(relatedProduct.precioVentaSugerido || 0).toLocaleString()}
                                                        </div>
                                                        <button
                                                            className="relatedWhatsappButton"
                                                            onClick={(e) => relatedProduct.id.startsWith('ejemplo') ? e.preventDefault() : handleRelatedWhatsAppClick(relatedProduct, e)}
                                                        >
                                                            <FaWhatsapp />
                                                            {relatedProduct.id.startsWith('ejemplo') ? 'Producto de Ejemplo' : 'Compra por WhatsApp'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Indicadores - solo si hay más de un slide */}
                                {totalSlides > 1 && (
                                    <div className="relatedCarouselIndicators">
                                        {Array.from({ length: totalSlides }, (_, index) => (
                                            <button
                                                key={index}
                                                className={`relatedCarouselDot ${currentSlide === index ? 'active' : ''}`}
                                                onClick={() => goToSlide(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

            </main>

            {/* Modal de imágenes */}
            <ProductImageModal
                images={imagenesProducto}
                isOpen={isModalOpen}
                onClose={closeModal}
                initialIndex={modalImageIndex}
            />

            <Footer />
            <ScrollToTop />
        </div>
    );
}