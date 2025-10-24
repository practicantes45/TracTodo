"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { obtenerProductosDelMes } from "../../../services/productoService";
import { registrarVista } from "../../../services/trackingService";
import { getProductSlug } from "../../../utils/slugUtils";
import { formatearPrecio } from "../../../utils/priceUtils";
import styles from "./ProductCarousel.module.css";

export default function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isTinyMobile, setIsTinyMobile] = useState(false);

  const { isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    cargarProductosDelMes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detectar pantallas muy pequeñas (<=360px) y actualizar en cambios
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 480px)");
    const update = () => setIsTinyMobile(!!mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    } else if (mq.addListener) {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  // Cambiar automáticamente cada 15s si hay varias diapositivas
  useEffect(() => {
    if (products.length > 1) {
      const interval = setInterval(() => {
        nextSlide();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  // Alternar el texto del banner cada 4s
  useEffect(() => {
    const id = setInterval(() => {
      setHeadlineIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const cargarProductosDelMes = async () => {
    try {
      setLoading(true);
      const productosDelMes = await obtenerProductosDelMes();
      const productosFormateados = productosDelMes.map((producto) => ({
        id: producto.id,
        name: producto.nombre,
        price: formatearPrecio(producto.precioVentaSugerido || 0),
        image: obtenerImagenFrente(producto),
        ctaText: "COMPRA AHORA",
        precioNumerico: parseFloat(producto.precioVentaSugerido || 0),
        productoCompleto: producto,
      }));
      setProducts(productosFormateados);
    } catch (e) {
      setError("No se pudieron cargar los productos del mes");
      setProducts(obtenerProductosEjemplo());
    } finally {
      setLoading(false);
    }
  };

  // Obtener imagen frente con retrocompatibilidad
  const obtenerImagenFrente = (producto) => {
    if (producto?.imagenesUrl?.frente) return producto.imagenesUrl.frente;
    if (producto?.imagenUrl) return producto.imagenUrl;
    if (producto?.imagen) return producto.imagen;
    return null;
  };

  // Productos de ejemplo como fallback
  const obtenerProductosEjemplo = () => [
    {
      id: "ejemplo-1",
      name: "CABEZA DE MOTOR",
      price: formatearPrecio(3999),
      image: null,
      productoCompleto: { id: "ejemplo-1", nombre: "CABEZA DE MOTOR" },
    },
    {
      id: "ejemplo-2",
      name: "SISTEMA DE INYECCIÓN",
      price: formatearPrecio(2499),
      image: null,
      productoCompleto: { id: "ejemplo-2", nombre: "SISTEMA DE INYECCIÓN" },
    },
    {
      id: "ejemplo-3",
      name: "PISTONES HD",
      price: formatearPrecio(1899),
      image: null,
      productoCompleto: { id: "ejemplo-3", nombre: "PISTONES HD" },
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  const goToSlide = (index) => setCurrentSlide(index);

  const handleGoToProduct = async (product) => {
    if (product.id.startsWith("ejemplo")) return; // no navegar para ejemplos
    try {
      await registrarVista(product.id);
      const slug = getProductSlug(product.productoCompleto);
      router.push(`/productos/${slug}`);
    } catch (e) {
      // no-op
    }
  };

  const secondHeadline = isTinyMobile
    ? "¡Vuelan! Aprovecha ahora 🔥 "
    : "¡Vuelan! Aprovecha antes de que se agoten 🔥 ";

  if (loading) {
    return (
      <section className={styles.productSection}>
        <div className={styles.offerBanner}>
          <h2>PRODUCTOS DEL MES</h2>
        </div>
        <div
          className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}
        >
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Cargando productos del mes...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && products.length === 0) {
    return (
      <section className={styles.productSection}>
        <div className={styles.offerBanner}>
          <h2>PRODUCTOS DEL MES</h2>
        </div>
        <div
          className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}
        >
          <div className={styles.errorContainer}>
            <p>Error al cargar productos. Mostrando productos de ejemplo.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productSection}>
      {/* CSS override: disable ::after headline content on small screens to allow dynamic text */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media (max-width: 768px) {
            .${styles.withOverlay} > h2::after { content: none !important; }
            .${styles.offerHeadline} .${styles.headlineItem}:nth-child(2)::after { content: none !important; }
            .${styles.offerHeadline} .${styles.headlineItem} {
              font-size: clamp(1.15rem, 5.6vw, 1.6rem) !important;
              white-space: nowrap !important;
              letter-spacing: -0.18px;
            }
            .${styles.withOverlay} > h2:not(.${styles.headlineItem}) { display: none !important; }
          }
          @media (max-width: 360px) {
            .${styles.offerHeadline} .${styles.headlineItem} {
              font-size: clamp(1.02rem, 5.0vw, 1.38rem) !important;
            }
          }`,
        }}
      />
      <div
        className={`${styles.offerBanner} ${styles.withOverlay} ${isTinyMobile ? styles.noMotion : ""}`}
        style={{ marginBottom: isTinyMobile ? 0 : undefined }}
      >
        <div className={styles.offerHeadline} aria-live="polite" aria-atomic="true">
          <h2 className={styles.headlineItem}>PRODUCTOS DEL MES</h2>
          <h2 className={styles.headlineItem}>{secondHeadline}</h2>
        </div>
        <h2>{secondHeadline}</h2>
      </div>

      <div
        className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}
        style={{ background: "transparent" }}
      >
        {products.length > 1 && (
          <button
            className={`${styles.carouselButton} ${styles.prev}`}
            onClick={prevSlide}
            aria-label="Producto anterior"
          >
            &lt;
          </button>
        )}

        <div className={styles.carouselSlides} style={{ willChange: "transform" }}>
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`${styles.slide} ${index === currentSlide ? styles.active : ""}`}
              style={{
                transform: `translate3d(${100 * (index - currentSlide)}%, 0, 0)`,
                willChange: "transform",
              }}
            >
              <div
                className={styles.slideContent}
                style={{ background: "transparent", backdropFilter: "none", WebkitBackdropFilter: "none" }}
              >
                <div className={styles.mediaArea}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                      loading="lazy"
                      decoding="async"
                      width="1200"
                      height="900"
                      onError={(e) => {
                        const img = e.target;
                        if (img && img.style) img.style.display = "none";
                        if (img && img.nextElementSibling) {
                          img.nextElementSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <div className={styles.noImageIcon} />
                      <p>Imagen no disponible</p>
                    </div>
                  )}
                </div>

                <div className={styles.productInfo} style={{ background: "transparent" }}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.productPrice}>{product.price}</p>

                  <div className={styles.buttonsContainer}>
                    <button
                      className={styles.viewProductButton}
                      onClick={() => handleGoToProduct(product)}
                      disabled={product.id.startsWith("ejemplo")}
                    >
                      Ir al producto
                    </button>
                  </div>

                  {products.length > 1 && index === currentSlide && (
                    <div className={styles.indicatorsInline}>
                      {products.map((_, i) => (
                        <button
                          key={i}
                          className={`${styles.indicator} ${i === currentSlide ? styles.active : ""}`}
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
      </div>
    </section>
  );
}

