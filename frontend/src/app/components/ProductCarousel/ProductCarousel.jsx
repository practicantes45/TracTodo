// components/ProductCarousel/ProductCarousel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth'; // IMPORTAR useAuth
import styles from './ProductCarousel.module.css';
import { obtenerProductosDelMes } from '../../../services/productoService';

const ProductCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth(); // OBTENER ESTADO DE ADMIN
  
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

  // Cargar productos del mes al montar el componente
  useEffect(() => {
    cargarProductosDelMes();
  }, []);

  const cargarProductosDelMes = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando productos del mes...');
      
      const productosDelMes = await obtenerProductosDelMes();
      console.log('📦 Productos del mes recibidos:', productosDelMes);
      
      // Transformar los datos para el formato del carrusel
      const productosFormateados = productosDelMes.map(producto => ({
        id: producto.id,
        name: producto.nombre,
        price: `$${(producto.precioMes || producto.precioVentaSugerido || 0).toLocaleString()}`,
        // Buscar imagen "frente" específicamente
        image: obtenerImagenFrente(producto),
        ctaText: "COMPRA AHORA",
        // Datos adicionales para WhatsApp
        precioNumerico: producto.precioMes || producto.precioVentaSugerido || 0
      }));

      setProducts(productosFormateados);
      console.log('✅ Productos formateados para carrusel:', productosFormateados.length);
      
    } catch (error) {
      console.error('❌ Error al cargar productos del mes:', error);
      setError('No se pudieron cargar los productos del mes');
      // Fallback a productos de ejemplo si hay error
      setProducts(obtenerProductosEjemplo());
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener la imagen "frente" específicamente
  const obtenerImagenFrente = (producto) => {
    // Buscar imagen "frente" en imagenesUrl
    if (producto.imagenesUrl && producto.imagenesUrl.frente) {
      return producto.imagenesUrl.frente;
    }
    
    // Fallback a imagenUrl si existe
    if (producto.imagenUrl) {
      return producto.imagenUrl;
    }
    
    // Fallback a imagen antigua si existe
    if (producto.imagen) {
      return producto.imagen;
    }
    
    // Sin imagen
    return null;
  };

  // Productos de ejemplo como fallback
  const obtenerProductosEjemplo = () => [
    {
      id: 'ejemplo-1',
      name: "CABEZA DE MOTOR",
      price: "$3,999",
      image: null,
      ctaText: "COMPRA AHORA",
      precioNumerico: 3999
    },
    {
      id: 'ejemplo-2',
      name: "SISTEMA DE INYECCIÓN",
      price: "$2,499",
      image: null,
      ctaText: "COMPRA AHORA",
      precioNumerico: 2499
    },
    {
      id: 'ejemplo-3',
      name: "PISTONES HD",
      price: "$1,899",
      image: null,
      ctaText: "COMPRA AHORA",
      precioNumerico: 1899
    }
  ];

  // Función para pasar a la siguiente diapositiva
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  // Función para volver a la diapositiva anterior
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  // Cambiar automáticamente cada 15 segundos - solo si hay productos
  useEffect(() => {
    if (products.length > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, 15000); // 15000 milisegundos = 15 segundos
      return () => clearInterval(interval);
    }
  }, [products.length]);

  // Función para ir a una diapositiva específica
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleWhatsAppClick = (product) => {
    // Seleccionar contacto aleatorio
    const randomContact = contactList[Math.floor(Math.random() * contactList.length)];
    
    // Crear mensaje personalizado
    const message = randomContact.message
      .replace('{producto}', product.name)
      .replace('{precio}', product.precioNumerico.toLocaleString());
    
    const encodedMessage = encodeURIComponent(message);
    
    // Formatear número de teléfono
    const cleanPhoneNumber = randomContact.phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('52') 
      ? cleanPhoneNumber 
      : `52${cleanPhoneNumber}`;
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
    
    // Abrir en nueva ventana/pestaña
    window.open(whatsappUrl, '_blank');
  };

  // Mostrar loading
  if (loading) {
    return (
      <section className={styles.productSection}>
        <div className={styles.offerBanner}>
          <h2>PRODUCTOS DEL MES</h2>
        </div>
        <div className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando productos del mes...</p>
          </div>
        </div>
      </section>
    );
  }

  // Mostrar error con fallback
  if (error && products.length === 0) {
    return (
      <section className={styles.productSection}>
        <div className={styles.offerBanner}>
          <h2>PRODUCTOS DEL MES</h2>
        </div>
        <div className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}>
          <div className={styles.errorContainer}>
            <p>Error al cargar productos. Mostrando productos de ejemplo.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productSection}>
      {/* Banner de PRODUCTOS DEL MES */}
      <div className={styles.offerBanner}>
        <h2>PRODUCTOS DEL MES</h2>
      </div>

      {/* Carrusel de productos con clase condicional */}
      <div className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}>
        {products.length > 1 && (
          <button 
            className={`${styles.carouselButton} ${styles.prev}`} 
            onClick={prevSlide}
            aria-label="Producto anterior"
          >
            &lt;
          </button>
        )}
        
        <div className={styles.carouselSlides}>
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
              style={{
                transform: `translateX(${100 * (index - currentSlide)}%)`,
              }}
            >
              <div className={styles.slideContent}>
                <div className={styles.imageContainer}>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={styles.productImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={styles.imagePlaceholder}
                    style={{ display: product.image ? 'none' : 'flex' }}
                  >
                    <div className={styles.noImageIcon}>📷</div>
                    <p>Imagen no disponible</p>
                  </div>
                </div>
                <div className={styles.productInfo}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.productPrice}>{product.price}</p>
                  <button 
                    className={styles.ctaButton}
                    onClick={() => handleWhatsAppClick(product)}
                  >
                    {product.ctaText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {products.length > 1 && (
          <button 
            className={`${styles.carouselButton} ${styles.next}`} 
            onClick={nextSlide}
            aria-label="Siguiente producto"
          >
            &gt;
          </button>
        )}
        
        {products.length > 1 && (
          <div className={styles.indicators}>
            {products.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a producto ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCarousel;