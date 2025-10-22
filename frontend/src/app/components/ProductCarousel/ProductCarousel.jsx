'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { obtenerProductosDelMes } from '../../../services/productoService';
import { registrarVista } from '../../../services/trackingService';
import { getProductSlug } from '../../../utils/slugUtils';
import styles from './ProductCarousel.module.css';
import { formatearPrecio } from '../../../utils/priceUtils';

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isTinyMobile, setIsTinyMobile] = useState(false);
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Cargar productos del mes al montar el componente
  useEffect(() => {
    cargarProductosDelMes();
  }, []);

  // Detectar pantallas muy pequeñas (<=360px) y actualizar en cambios
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 360px)');
    const update = () => setIsTinyMobile(!!mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else if (mq.addListener) {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  // Ajustar titular largo en pantallas muy pequeñas (<=360px)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const tiny = typeof window !== 'undefined' && window.matchMedia('(max-width: 360px)').matches;
    const container = document.querySelector(`.${styles.offerHeadline}`);
    if (container) {
      const heads = container.querySelectorAll('h2');
      if (heads[1]) heads[1].textContent = tiny ? '¡Vuelan! Aprovecha ahora 🔥' : '¡Vuelan! Aprovecha antes de que se agoten 🔥';
    }
    const fallback = document.querySelector(`.${styles.withOverlay} > h2`);
    if (fallback) fallback.textContent = tiny ? '¡Vuelan! Aprovecha ahora 🔥' : '¡Vuelan! Aprovecha antes de que se agoten 🔥';
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
    productoCompleto: { id: 'ejemplo-1', nombre: 'CABEZA DE MOTOR' }
  },
  {
    id: 'ejemplo-2',
    name: "SISTEMA DE INYECCIÓN",
    price: formatearPrecio(2499),
    image: null,
    productoCompleto: { id: 'ejemplo-2', nombre: 'SISTEMA DE INYECCIÓN' }
  },
  {
    id: 'ejemplo-3',
    name: "PISTONES HD",
    price: formatearPrecio(1899),
    image: null,
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

  // Alternar el encabezado del banner cada ~4 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setHeadlineIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Sincronizar el texto del segundo titular según el tamaño de pantalla
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const container = document.querySelector(`.${styles.offerHeadline}`);
    const shortText = '¡Vuelan! Aprovecha ahora 🔥';
    const longText = '¡Vuelan! Aprovecha antes de que se agoten 🔥';
    if (container) {
      const heads = container.querySelectorAll('h2');
      if (heads[1]) heads[1].textContent = isTinyMobile ? shortText : longText;
    }
    const fallback = document.querySelector(`.${styles.withOverlay} > h2`);
    if (fallback) fallback.textContent = isTinyMobile ? shortText : longText;
  }, [headlineIndex, isTinyMobile]);

  // Ya no se manipula el DOM del h2; el cambio se hace via JSX (crossfade)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const container = document.querySelector(`.${styles.offerHeadline}`);
    if (!container) return;
    const heads = container.querySelectorAll('h2');
    if (heads[0]) heads[0].textContent = 'PRODUCTOS DEL MES';
    if (heads[1]) heads[1].textContent = '¡Vuelan! Aprovecha antes de que se agoten 🔥';
  }, []);

  // Función para ir a una diapositiva específica
  const goToSlide = (index) => {
    setCurrentSlide(index);
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

  // Forzar titular corto en pantallas muy pequeñas (<=360px) después de montar todos los efectos
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const tiny = typeof window !== 'undefined' && window.matchMedia('(max-width: 360px)').matches;
    const container = document.querySelector(`.${styles.offerHeadline}`);
    if (container) {
      const heads = container.querySelectorAll('h2');
      if (heads[1]) heads[1].textContent = tiny ? '¡Vuelan! Aprovecha ahora 🔥' : '¡Vuelan! Aprovecha antes de que se agoten 🔥';
    }
    const fallback = document.querySelector(`.${styles.withOverlay} > h2`);
    if (fallback) fallback.textContent = tiny ? '¡Vuelan! Aprovecha ahora 🔥' : '¡Vuelan! Aprovecha antes de que se agoten 🔥';
  }, []);

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
      <div className={`${styles.offerBanner} ${styles.withOverlay}`}>
        <div className={styles.offerHeadline} aria-live="polite" aria-atomic="true">
          <h2 className={`${styles.headlineItem} ${headlineIndex === 0 ? styles.headlineVisible : styles.headlineHidden}`}>PRODUCTOS DEL MES</h2>
          <h2 className={`${styles.headlineItem} ${headlineIndex === 1 ? styles.headlineVisible : styles.headlineHidden}`}>¡Vuelan! Aprovecha antes de que se agoten 🔥</h2>
        </div>
        
        <h2>¡Vuelan! Aprovecha antes de que se agoten 🔥</h2>
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
                <div className={styles.mediaArea}>
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

                  {/* Acciones disponibles */}
                  <div className={styles.buttonsContainer}>
                    <button
                      className={styles.viewProductButton}
                      onClick={() => handleGoToProduct(product)}
                      disabled={product.id.startsWith('ejemplo')}
                    >
                      Ir al producto
                    </button>
                  </div>
                  {products.length > 1 && index === currentSlide && (
                    <div className={styles.indicatorsInline}>
                      {products.map((_, i) => (
                        <button
                          key={i}
                          className={`${styles.indicator} ${i === currentSlide ? styles.active : ''}`}
                          onClick={() => goToSlide(i)}
                          aria-label={`Ir a producto ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
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

        {/* Indicadores se muestran dentro de productInfo para evitar solaparse con el botón */}
      </div>

    </section>
  );
};
