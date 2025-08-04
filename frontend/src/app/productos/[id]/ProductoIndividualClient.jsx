'use client';
import './producto-individual.css';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaWhatsapp, FaShare, FaCopy, FaCheckCircle, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaRedo } from "react-icons/fa";
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ScrollToTop from '../../components/ScrollToTop/ScrollToTop';
import ProductImageModal from '../../components/ProductImageModal/ProductImageModal';
import { obtenerProductoPorId } from '../../../services/productoService';
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

    // Efecto para cargar el producto
    useEffect(() => {
        const cargarProducto = async () => {
            try {
                setLoading(true);
                console.log('🔄 Cargando producto con ID:', params.id);
                
                const data = await obtenerProductoPorId(params.id);
                setProducto(data);

                // Preparar imágenes para el carrusel
                let imagenes = [];
                if (data.imagenes && Array.isArray(data.imagenes) && data.imagenes.length > 0) {
                    imagenes = data.imagenes;
                } else if (data.imagen) {
                    imagenes = [data.imagen];
                }
                setImagenesProducto(imagenes);

                // Registrar vista del producto
                await registrarVista(params.id, 'product_view');

                console.log('✅ Producto cargado:', data);
            } catch (error) {
                console.error('❌ Error al cargar producto:', error);
                setError('No se pudo cargar el producto');
            } finally {
                setLoading(false);
            }
        };

        if (params?.id) {
            cargarProducto();
        }
    }, [params?.id]);

    // Resto del código del componente permanece igual...
    // [Todo el código restante del componente actual]

    // Función para manejar clic en WhatsApp
    const handleWhatsAppClick = () => {
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

        registrarVista(producto.id, 'whatsapp_click');
        window.open(whatsappURL, '_blank');
    };

    // Resto de las funciones del componente...

    if (loading) {
        return (
            <div className="layout">
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
            <div className="layout">
                <Navbar />
                <main className="mainContent">
                    <div className="errorContainer">
                        <h2>Producto no encontrado</h2>
                        <p>{error || 'El producto que buscas no existe.'}</p>
                        <button 
                            className="backButton"
                            onClick={() => router.push('/productos')}
                        >
                            <FaArrowLeft />
                            Volver a productos
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // El JSX del return permanece igual que en el código original...
    return (
        <div className="layout">
            <Navbar />
            
            <main className="mainContent producto-individual-main">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <button 
                        className="breadcrumbLink"
                        onClick={() => router.push('/productos')}
                    >
                        Productos
                    </button>
                    <span className="breadcrumbSeparator"> / </span>
                    <span className="breadcrumbCurrent">{producto.nombre}</span>
                </div>

                {/* Contenido del producto */}
                <section className="productoSection">
                    <div className="productoContainer">
                        
                        {/* Columna izquierda - Imágenes */}
                        <div className="productoImagenes">
                            {imagenesProducto.length > 0 ? (
                                <div className="carouselContainer">
                                    <div className="carouselMain">
                                        <img
                                            ref={carouselImageRef}
                                            src={imagenesProducto[currentImageIndex]}
                                            alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                                            className="carouselImage"
                                            style={{
                                                transform: `scale(${carouselZoom / 100}) rotate(${carouselRotation}deg) translate(${carouselPanX}px, ${carouselPanY}px)`,
                                                cursor: carouselZoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                                            }}
                                            onMouseDown={handleCarouselMouseDown}
                                            onMouseMove={handleCarouselMouseMove}
                                            onMouseUp={handleCarouselMouseUp}
                                            onMouseLeave={handleCarouselMouseUp}
                                            onClick={() => setIsModalOpen(true)}
                                        />
                                        
                                        {/* Controles del carrusel */}
                                        {imagenesProducto.length > 1 && (
                                            <>
                                                <button
                                                    className="carouselButton carouselPrev"
                                                    onClick={prevImage}
                                                >
                                                    <FaChevronLeft />
                                                </button>
                                                <button
                                                    className="carouselButton carouselNext"
                                                    onClick={nextImage}
                                                >
                                                    <FaChevronRight />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Controles de zoom y rotación */}
                                    <div className="imageControls">
                                        <button className="controlButton" onClick={zoomIn}>
                                            <FaSearchPlus />
                                        </button>
                                        <span className="zoomIndicator">{carouselZoom}%</span>
                                        <button className="controlButton" onClick={zoomOut}>
                                            <FaSearchMinus />
                                        </button>
                                        <button className="controlButton" onClick={rotateImage}>
                                            <FaRedo />
                                        </button>
                                        <button className="controlButton" onClick={resetTransform}>
                                            Reset
                                        </button>
                                    </div>

                                    {/* Miniaturas */}
                                    {imagenesProducto.length > 1 && (
                                        <div className="thumbnailContainer">
                                            {imagenesProducto.map((imagen, index) => (
                                                <img
                                                    key={index}
                                                    src={imagen}
                                                    alt={`Miniatura ${index + 1}`}
                                                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="noImageContainer">
                                    <p>Sin imágenes disponibles</p>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha - Información */}
                        <div className="productoInfo">
                            <h1 className="productoTitulo">{producto.nombre}</h1>
                            
                            <div className="productoDetalles">
                                <div className="detalleItem">
                                    <strong>Marca:</strong> {producto.marca}
                                </div>
                                
                                {producto.precioVentaSugerido && (
                                    <div className="detalleItem precio">
                                        <strong>Precio:</strong> ${producto.precioVentaSugerido.toLocaleString()}
                                    </div>
                                )}

                                {producto.compatibilidad && (
                                    <div className="detalleItem">
                                        <strong>Compatible con:</strong> {producto.compatibilidad}
                                    </div>
                                )}

                                {producto.descripcion && (
                                    <div className="detalleItem descripcion">
                                        <strong>Descripción:</strong>
                                        <p>{producto.descripcion}</p>
                                    </div>
                                )}
                            </div>

                            <div className="productoAcciones">
                                <button
                                    className="whatsappBtn primary"
                                    onClick={handleWhatsAppClick}
                                >
                                    <FaWhatsapp />
                                    Consultar por WhatsApp
                                </button>
                                
                                <button
                                    className="shareBtn secondary"
                                    onClick={handleShare}
                                >
                                    <FaShare />
                                    Compartir
                                </button>

                                {copied && (
                                    <div className="copiedMessage">
                                        <FaCheckCircle />
                                        ¡Enlace copiado!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />

            {/* Modal de imágenes */}
            {isModalOpen && (
                <ProductImageModal
                    images={imagenesProducto}
                    currentIndex={modalImageIndex}
                    onClose={() => setIsModalOpen(false)}
                    onImageChange={setModalImageIndex}
                    productName={producto.nombre}
                />
            )}
        </div>
    );
}