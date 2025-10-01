'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { obtenerProductosDelMes } from '../../../services/productoService';
import { registrarVista } from '../../../services/trackingService';
import { getProductSlug } from '../../../utils/slugUtils';
import styles from './ProductCarousel.module.css';
import { formatearPrecio, formatearPrecioWhatsApp } from '../../../utils/priceUtils';
import { useWhatsAppContact } from '../../../hooks/useWhatsAppContact';
import { useCart } from '../../../hooks/useCart';

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [advisorSelectionReminder, setAdvisorSelectionReminder] = useState(false);
  const { isAdmin } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();

  const {
    selectedAdvisor,
    startContact: startAdvisorContact,
    isReady: isAdvisorReady,
  } = useWhatsAppContact({
    allowSelection: false,
    onRequireSelection: () => {
      setAdvisorSelectionReminder(true);
      router.push('/#asesores');
    },
    getMessage: ({ advisor, payload }) => {
      const productData = payload?.product;
      if (productData) {
        const price = payload?.price ?? productData.precioVentaSugerido ?? productData.precio ?? 0;
        const name = productData.nombre || productData.name || "este producto";
        return advisor.productMessage
          .replace('{producto}', name)
          .replace('{precio}', formatearPrecioWhatsApp(price));
      }
      return advisor.generalMessage;
    },
  });
  useEffect(() => {
    if (selectedAdvisor) {
      setAdvisorSelectionReminder(false);
    }
  }, [selectedAdvisor]);


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

      const productosFormateados = productosDelMes.map(producto => ({
        id: producto.id,
        name: producto.nombre,
        price: formatearPrecio(producto.precioVentaSugerido || 0),
        image: obtenerImagenFrente(producto),
        ctaText: "COMPRA AHORA",
        precioNumerico: parseFloat(producto.precioVentaSugerido || 0),
        productoCompleto: producto
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
    price: formatearPrecio(3999),
    image: null,
    ctaText: "COMPRA AHORA",
    precioNumerico: 3999,
    productoCompleto: { id: 'ejemplo-1', nombre: 'CABEZA DE MOTOR' }
  },
  {
    id: 'ejemplo-2',
    name: "SISTEMA DE INYECCIÓN",
    price: formatearPrecio(2499),
    image: null,
    ctaText: "COMPRA AHORA",
    precioNumerico: 2499,
    productoCompleto: { id: 'ejemplo-2', nombre: 'SISTEMA DE INYECCIÓN' }
  },
  {
    id: 'ejemplo-3',
    name: "PISTONES HD",
    price: formatearPrecio(1899),
    image: null,
    ctaText: "COMPRA AHORA",
    precioNumerico: 1899,
    productoCompleto: { id: 'ejemplo-3', nombre: 'PISTONES HD' }
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
  const payload = {
    product: product?.productoCompleto || product,
    price: product?.precioNumerico,
  };
  startAdvisorContact(payload);
};

const handleAddToCart = (product) => {
  if (!product) {
    return;
  }
  const payload = product?.productoCompleto || product;
  const price = Number(product?.precioNumerico || payload?.precioVentaSugerido || payload?.precio || 0);
  const itemId = payload?.id || product?.id || product?.name;
  addItem({ id: itemId, name: product?.name || payload?.nombre || 'Producto', price });
};

  // Nueva función para ir al producto individual
  const handleGoToProduct = async (product) => {
    // Evitar navegación si es un producto de ejemplo
    if (product.id.startsWith('ejemplo')) {
      console.log('🚫 Producto de ejemplo, no se puede navegar');
      return;
    }

    try {
      // Registrar vista del producto
      await registrarVista(product.id);

      // Obtener slug del producto
      const slug = getProductSlug(product.productoCompleto);

      console.log('🔗 Navegando a producto desde carrusel:', {
        nombre: product.name,
        slug,
        id: product.id
      });

      // Navegar a la pagina del producto
      router.push(`/productos/${slug}`);
    } catch (error) {
      console.error('❌ Error al navegar al producto:', error);
    }
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
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <div className={styles.noImageIcon}>📷</div>
                      <p>Imagen no disponible</p>
                    </div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.productPrice}>{product.price}</p>

                  {/* Contenedor de botones */}
                  <div className={styles.buttonsContainer}>
                    <button
                      type="button"
                      className={styles.cartButton}
                      onClick={() => handleAddToCart(product)}
                    >
                      Agregar al carrito
                    </button>
                    <button
                      className={styles.ctaButton}
                      onClick={() => handleWhatsAppClick(product)}
                    >
                      {product.ctaText}
                    </button>

                    {selectedAdvisor && (
                      <div className={styles.advisorSummary}>
                        <span className={styles.advisorSummaryLabel}>Te atendera {selectedAdvisor.name}</span>
                      </div>
                    )}
                    {!selectedAdvisor && isAdvisorReady && (
                      <div className={`${styles.advisorSummary} ${styles.advisorSummaryNotice}`}>
                        <span className={styles.advisorSummaryLabel}>Selecciona tu asesor en la pagina de inicio para continuar por WhatsApp.</span>
                      </div>
                    )}
                    {advisorSelectionReminder && (
                      <div className={styles.advisorReminder}>
                        Elige o cambia asesor desde la pagina principal de TracTodo para finalizar tu compra.
                      </div>
                    )}

                    <button
                      className={styles.viewProductButton}
                      onClick={() => handleGoToProduct(product)}
                      disabled={product.id.startsWith('ejemplo')}
                    >
                      IR AL PRODUCTO
                    </button>
                  </div>
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
