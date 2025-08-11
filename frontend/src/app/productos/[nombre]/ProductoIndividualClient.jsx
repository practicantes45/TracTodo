'use client';
import './producto-individual.css';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaWhatsapp, FaShare, FaCopy, FaCheckCircle, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaRedo } from "react-icons/fa";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import ProductImageModal from '../../components/ProductImageModal/ProductImageModal';
import { obtenerProductoPorNombre } from '@/services/productoService';
import { registrarVista } from '../../../services/trackingService';
import { getProductSlug } from '../../../utils/slugUtils';
import SEOHead from '../../components/SEOHead/SEOHead';

export default function ProductoIndividualPage({ params }) { // CAMBIADO: recibir params como prop
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

    // EFECTO MODIFICADO: Usar params prop
    useEffect(() => {
        if (params?.nombre) {
            cargarProducto();
        }
    }, [params?.nombre]);

    // Resetear zoom, rotación y pan cuando cambia la imagen
    useEffect(() => {
        setCarouselZoom(100);
        setCarouselRotation(0);
        setCarouselPanX(0);
        setCarouselPanY(0);
    }, [currentImageIndex]);

    // FUNCIÓN MODIFICADA: Convertir slug de vuelta a nombre para búsqueda
    const cargarProducto = async () => {
        try {
            setLoading(true);
            console.log('🔄 Cargando producto por slug:', params.nombre);

            // Convertir el slug de vuelta a formato de búsqueda
            const nombreParaBusqueda = params.nombre
                .replace(/-/g, ' ') // Reemplazar guiones con espacios
                .toLowerCase();

            console.log('🔍 Buscando producto con nombre:', nombreParaBusqueda);

            const data = await obtenerProductoPorNombre(nombreParaBusqueda);
            console.log('📦 Datos del producto:', data);

            setProducto(data.producto);
            setProductosRelacionados(data.recomendados || []);

            const imagenes = procesarImagenesProducto(data.producto);
            setImagenesProducto(imagenes);
            setCurrentImageIndex(0);

            console.log('🖼️ Imágenes procesadas:', imagenes);
            console.log('🔗 Productos relacionados encontrados:', data.recomendados?.length || 0);

            // Registrar vista usando el ID del producto
            await registrarVista(data.producto.id);
        } catch (error) {
            console.error("❌ Error al cargar producto:", error);
            setError('No se pudo cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN MODIFICADA: Priorizar imagen "frente" en el procesamiento de imágenes
    const procesarImagenesProducto = (producto) => {
        const imagenes = [];

        // 1. PRIORIDAD: Agregar imagen "frente" primero si existe
        if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object' && producto.imagenesUrl.frente) {
            console.log('🖼️ Agregando imagen frente como primera:', producto.imagenesUrl.frente);
            imagenes.push(producto.imagenesUrl.frente);
        }

        // 2. Agregar el resto de imágenes de imagenesUrl (excluyendo "frente" que ya se agregó)
        if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
            const otrasImagenes = Object.entries(producto.imagenesUrl)
                .filter(([key, url]) => key !== 'frente' && url && url.trim() !== '')
                .map(([key, url]) => url);

            imagenes.push(...otrasImagenes);
            console.log('🖼️ Agregando otras imágenes:', otrasImagenes);
        }

        // 3. FALLBACK: Agregar imagenUrl si no está ya incluida
        if (producto.imagenUrl && !imagenes.includes(producto.imagenUrl)) {
            console.log('🖼️ Agregando imagenUrl como fallback:', producto.imagenUrl);
            imagenes.push(producto.imagenUrl);
        }

        // 4. FALLBACK: Agregar imagen legacy si no está ya incluida
        if (producto.imagen && !imagenes.includes(producto.imagen)) {
            console.log('🖼️ Agregando imagen legacy como fallback:', producto.imagen);
            imagenes.push(producto.imagen);
        }

        console.log('🖼️ Total de imágenes procesadas:', imagenes.length);
        return imagenes;
    };

    // FUNCIÓN MODIFICADA: Priorizar imagen "frente" para productos relacionados
    const obtenerPrimeraImagen = (producto) => {
        // 1. PRIORIDAD: Buscar imagen "frente" en imagenesUrl
        if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object' && producto.imagenesUrl.frente) {
            console.log('🖼️ Usando imagen frente para producto relacionado:', producto.imagenesUrl.frente);
            return producto.imagenesUrl.frente;
        }

        // 2. FALLBACK: Si tiene imagenUrl directa, usarla
        if (producto.imagenUrl) {
            console.log('🖼️ Usando imagenUrl para producto relacionado:', producto.imagenUrl);
            return producto.imagenUrl;
        }

        // 3. FALLBACK: Si tiene imagenesUrl (objeto con múltiples imágenes), usar la primera disponible
        if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
            const imagenes = Object.values(producto.imagenesUrl).filter(img => img && img.trim() !== '');
            if (imagenes.length > 0) {
                console.log('🖼️ Usando primera imagen disponible para producto relacionado:', imagenes[0]);
                return imagenes[0];
            }
        }

        // 4. FALLBACK: Si tiene imagen antigua (string directo)
        if (producto.imagen) {
            console.log('🖼️ Usando imagen legacy para producto relacionado:', producto.imagen);
            return producto.imagen;
        }

        console.log('🚫 No se encontró imagen para el producto relacionado:', producto.nombre);
        return null;
    };

    // Funciones de zoom y rotación para el carrusel
    const handleCarouselZoomIn = () => {
        setCarouselZoom(prev => Math.min(prev + 25, 200));
    };

    const handleCarouselZoomOut = () => {
        setCarouselZoom(prev => {
            const newZoom = Math.max(prev - 25, 50);
            // Si volvemos a zoom normal, resetear el pan
            if (newZoom <= 100) {
                setCarouselPanX(0);
                setCarouselPanY(0);
            }
            return newZoom;
        });
    };

    const handleCarouselRotate = () => {
        setCarouselRotation(prev => (prev + 90) % 360);
    };

    const handleCarouselResetTransform = () => {
        setCarouselZoom(100);
        setCarouselRotation(0);
        setCarouselPanX(0);
        setCarouselPanY(0);
    };

    // Funciones para el pan/drag del carrusel
    const handleCarouselMouseDown = (e) => {
        if (carouselZoom > 100) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({
                x: e.clientX - carouselPanX,
                y: e.clientY - carouselPanY
            });
        }
    };

    const handleCarouselMouseMove = (e) => {
        if (isDragging && carouselZoom > 100) {
            e.preventDefault();
            const newPanX = e.clientX - dragStart.x;
            const newPanY = e.clientY - dragStart.y;

            // Limitar el movimiento para que no se salga demasiado
            const maxPan = (carouselZoom - 100) * 2;
            setCarouselPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
            setCarouselPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
        }
    };

    const handleCarouselMouseUp = () => {
        setIsDragging(false);
    };

    // Touch events para móvil
    const handleCarouselTouchStart = (e) => {
        if (carouselZoom > 100) {
            const touch = e.touches[0];
            setIsDragging(true);
            setDragStart({
                x: touch.clientX - carouselPanX,
                y: touch.clientY - carouselPanY
            });
        }
    };

    const handleCarouselTouchMove = (e) => {
        if (isDragging && carouselZoom > 100) {
            e.preventDefault();
            const touch = e.touches[0];
            const newPanX = touch.clientX - dragStart.x;
            const newPanY = touch.clientY - dragStart.y;

            const maxPan = (carouselZoom - 100) * 2;
            setCarouselPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
            setCarouselPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
        }
    };

    const handleCarouselTouchEnd = () => {
        setIsDragging(false);
    };

    // Event listeners globales para el mouse
    useEffect(() => {
        const handleGlobalMouseMove = (e) => handleCarouselMouseMove(e);
        const handleGlobalMouseUp = () => handleCarouselMouseUp();

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart, carouselZoom]);

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

    // FUNCIÓN MODIFICADA: Navegar usando slug
    const handleRelatedProductClick = (relatedProduct) => {
        const slug = getProductSlug(relatedProduct);
        console.log('🔗 Navegando a producto relacionado:', { nombre: relatedProduct.nombre, slug });
        router.push(`/productos/${slug}`);
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % imagenesProducto.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + imagenesProducto.length) % imagenesProducto.length);
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    const openModal = (index = 0) => {
        if (imagenesProducto.length > 0) {
            setModalImageIndex(index);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

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

    const productosParaMostrar = productosRelacionados.length > 0 ? productosRelacionados : productosEjemplo;

    const totalSlides = Math.ceil(productosParaMostrar.length / itemsPerSlide);

    const nextSlide = () => {
        setCurrentSlide(prev => {
            const nextSlide = prev + 1;
            return nextSlide >= totalSlides ? 0 : nextSlide;
        });
    };

    const prevSlide = () => {
        setCurrentSlide(prev => {
            const prevSlide = prev - 1;
            return prevSlide < 0 ? totalSlides - 1 : prevSlide;
        });
    };

    const goToSlide = (slideIndex) => {
        setCurrentSlide(slideIndex);
    };

    const getVisibleProducts = () => {
        const startIndex = currentSlide * itemsPerSlide;
        const endIndex = startIndex + itemsPerSlide;
        return productosParaMostrar.slice(startIndex, endIndex);
    };

    if (loading) {
        return (
            <div className="layout producto-individual-page">
                <SEOHead pagina="productos" />
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
                <div className="backButtonContainer">
                    <button className="backButton" onClick={handleBackClick}>
                        <FaArrowLeft />
                        Volver a productos
                    </button>
                </div>

                <section className="productDetailSection">
                    <div className="productDetailContainer">

                        <div className="productImageSection">
                            <div className="productImageCarousel">
                                <div
                                    className="productImageContainer"
                                    onClick={() => openModal(currentImageIndex)}
                                    style={{
                                        cursor: imagenesProducto.length > 0 ? (carouselZoom > 100 ? 'grab' : 'pointer') : 'default',
                                        overflow: 'hidden'
                                    }}
                                    onMouseDown={handleCarouselMouseDown}
                                    onTouchStart={handleCarouselTouchStart}
                                    onTouchMove={handleCarouselTouchMove}
                                    onTouchEnd={handleCarouselTouchEnd}
                                >
                                    {imagenesProducto.length > 0 ? (
                                        <img
                                            ref={carouselImageRef}
                                            src={imagenesProducto[currentImageIndex]}
                                            alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                                            className="productImage horizontalImage"
                                            style={{
                                                transform: `translate(${carouselPanX}px, ${carouselPanY}px) scale(${carouselZoom / 100}) rotate(${carouselRotation}deg)`,
                                                transition: isDragging ? 'none' : 'transform 0.3s ease',
                                                cursor: carouselZoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                            draggable={false}
                                        />
                                    ) : null}
                                    <div
                                        className="imageNotFound"
                                        style={{ display: imagenesProducto.length > 0 ? 'none' : 'flex' }}
                                    >
                                        <div className="noImageIcon">📷</div>
                                        <p>Imagen no detectada</p>
                                    </div>

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

                                    {/* Controles de zoom y rotación */}
                                    {imagenesProducto.length > 0 && (
                                        <div className="imageControls">
                                            <button
                                                className="imageControlButton zoomInButton"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCarouselZoomIn();
                                                }}
                                                title="Acercar"
                                            >
                                                <FaSearchPlus />
                                            </button>
                                            <button
                                                className="imageControlButton zoomOutButton"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCarouselZoomOut();
                                                }}
                                                title="Alejar"
                                            >
                                                <FaSearchMinus />
                                            </button>
                                            <button
                                                className="imageControlButton rotateButton"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCarouselRotate();
                                                }}
                                                title="Rotar"
                                            >
                                                <FaRedo />
                                            </button>
                                            <button
                                                className="imageControlButton resetButton"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCarouselResetTransform();
                                                }}
                                                title="Restablecer"
                                            >
                                                ↺
                                            </button>
                                            <div className="zoomIndicator">
                                                {carouselZoom}%
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                                ${parseFloat(producto.precioVentaSugerido || 0).toLocaleString()}
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

                <section className="descriptionSection">
                    <div className="descriptionContainer">
                        <h2>Descripción</h2>
                        <div className="descriptionContent">
                            <p>{producto.descripcion}</p>
                        </div>
                    </div>
                </section>

                <section className="relatedProductsSection">
                    <div className="relatedProductsContainer">
                        <h2>PRODUCTOS RELACIONADOS</h2>

                        {productosParaMostrar.length > 0 && (
                            <div className="relatedCarouselWrapper">
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
                                                                className="relatedProductImage horizontalImage"
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