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
          }
          /* Mantener visible el h2 fallback en móviles para evitar ocultarlo junto con el overlay */
          @media (min-width: 661px) {
            .${styles.withOverlay} > h2:not(.${styles.headlineItem}) { display: none !important; }
          }

          /* Arreglos móviles: asegurar visibilidad del overlay y priorizar la imagen */
          @media (max-width: 660px) {
            /* Mostrar explícitamente el h2 fallback en móviles */
            .${styles.withOverlay} > h2 { display: block !important; }
            /* Hacer el carrusel en columna para dar más espacio a la imagen */
            .${styles.slideContent} { flex-direction: column; }
            .${styles.mediaArea} { flex: 1 1 auto; width: 100%; height: auto; margin-bottom: 16px !important; }
            .${styles.productImage} { width: 100%; height: 100%; max-height: 70vh; object-fit: contain; }
            .${styles.productInfo} { flex: 0 0 auto; justify-content: flex-start !important; padding-top: 12px !important; }

            /* Bajar textos y evitar superposición sobre la imagen */
            .${styles.productName}, .${styles.productPrice} {
              position: static !important;
              transform: none !important;
            }
            .${styles.productName} { margin: 0 0 2px !important; }
            .${styles.productPrice} { margin: 4px 0 8px !important; }
            .${styles.mediaArea} img { margin-bottom: 0 !important; position: static !important; display: block !important; }
            .${styles.buttonsContainer} { margin-top: 6px !important; }
            .${styles.slideContent} { gap: 2px !important; }
          }
          @media (max-width: 360px) {
            .${styles.offerHeadline} .${styles.headlineItem} {
              font-size: clamp(1.02rem, 5.0vw, 1.38rem) !important;
            }
          }`,
        }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Móvil: pegar banner al Hero y subir puntos y CTA */
            @media (max-width: 768px) {
              .${styles.offerBanner} { margin-top: -18px !important; margin-bottom: 10px !important; }
              .${styles.carouselContainer} { margin-top: 4px !important; }
              .${styles.productInfo} { justify-content: flex-start !important; padding-top: 4px !important; padding-bottom: 4px !important; transform: translateY(-18px); }
              .${styles.productName} { margin-bottom: 4px !important; }
              .${styles.productPrice} { margin-bottom: 8px !important; }
              .${styles.buttonsContainer} { margin-top: 2px !important; }
              .${styles.indicatorsInline} { margin-top: 0 !important; }
              .${styles.slideContent} { padding-bottom: 0 !important; }
            }
            /* Desktop: evitar que el banner cubra la recomendación */
            @media (min-width: 769px) {
              .${styles.offerBanner} { margin-top: 0 !important; }
            }
          `,
        }}
      />
      <div
        className={
          isTinyMobile
            ? `${styles.offerBanner} ${styles.noMotion}`
            : `${styles.offerBanner} ${styles.withOverlay}`
        }
        style={{ marginBottom: isTinyMobile ? 12 : undefined, padding: isTinyMobile ? '12px 8px' : undefined }}
      >
        {isTinyMobile ? (
          // En móvil quitamos withOverlay y mostramos un solo h2 por encima del fondo
          <h2
            style={{
              display: 'block',
              position: 'relative',
              zIndex: 2,
              whiteSpace: 'nowrap',
              fontSize: 'clamp(1rem, 5vw, 1.25rem)',
              letterSpacing: '-0.2px'
            }}
          >
            {headlineIndex === 0 ? 'PRODUCTOS DEL MES' : secondHeadline}
          </h2>
        ) : (
          <>
            <div className={styles.offerHeadline} aria-live="polite" aria-atomic="true">
              <h2 className={styles.headlineItem}>PRODUCTOS DEL MES</h2>
              <h2 className={styles.headlineItem}>{secondHeadline}</h2>
            </div>
            {/* Fallback desktop oculto por CSS module */}
            <h2>{headlineIndex === 0 ? 'PRODUCTOS DEL MES' : secondHeadline}</h2>
          </>
        )}
      </div>

      <div
        className={`${styles.carouselContainer} ${isAdmin ? styles.adminMode : styles.userMode}`}
        style={{
          background: "transparent",
          height: isTinyMobile ? 'auto' : undefined,
          minHeight: isTinyMobile ? '520px' : undefined,
          marginBottom: isTinyMobile ? '16px' : undefined,
        }}
      >
        {products.length > 1 && (
          <button
            className={`${styles.carouselButton} ${styles.prev}`}
            onClick={prevSlide}
            aria-label="Producto anterior"
          >
            &#9664;
          </button>
        )}

        <div
          className={styles.carouselSlides}
          style={{ willChange: "transform", height: isTinyMobile ? '100%' : undefined }}
        >
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
                style={{
                  background: "transparent",
                  backdropFilter: "none",
                  WebkitBackdropFilter: "none",
                  gap: isTinyMobile ? '6px' : undefined,
                  padding: isTinyMobile ? '12px' : undefined,
                  alignItems: 'center',
                  justifyContent: isTinyMobile ? 'flex-start' : undefined,
                }}
              >
                <div
                  className={styles.mediaArea}
                  style={{
                    height: isTinyMobile ? 'auto' : undefined,
                    flex: isTinyMobile ? '0 0 auto' : undefined,
                    marginBottom: isTinyMobile ? '2px' : undefined,
                    alignSelf: 'stretch',
                  }}
                >
                  {product.image ? (
                    <>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                        style={{ display: 'block', width: '100%', height: 'auto', maxHeight: isTinyMobile ? '38svh' : '100%' }}
                        loading="lazy"
                        decoding="async"
                        width="1200"
                        height="900"
                        onError={(e) => {
                          const img = e.target;
                          if (img && img.style) img.style.display = "none";
                          const sib = img && img.nextElementSibling;
                          if (sib && sib.style) {
                            sib.style.display = "flex";
                          }
                        }}
                      />
                      {/* Fallback visible si la imagen falla */}
                      <div className={styles.imagePlaceholder} style={{ display: "none" }}>
                        <div className={styles.noImageIcon} />
                        <p>Imagen no disponible</p>
                      </div>
                    </>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <div className={styles.noImageIcon} />
                      <p>Imagen no disponible</p>
                    </div>
                  )}
                </div>

                <div
                  className={styles.productInfo}
                  style={{ background: "transparent", marginTop: isTinyMobile ? '0px' : undefined, paddingTop: isTinyMobile ? '0px' : undefined, justifyContent: isTinyMobile ? 'flex-start' : undefined }}
                >
                  <h2
                    className={styles.productName}
                    style={{ position: 'static', marginTop: isTinyMobile ? -14 : undefined, transform: 'none' }}
                  >
                    {product.name}
                  </h2>
                  <p
                    className={styles.productPrice}
                    style={{ position: 'static', marginTop: isTinyMobile ? '8px' : undefined, transform: 'none' }}
                  >
                    {product.price}
                  </p>

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
            &#9654;
          </button>
        )}
      </div>
    </section>
  );
}

