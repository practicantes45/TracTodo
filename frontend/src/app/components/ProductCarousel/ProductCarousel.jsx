// components/ProductCarousel/ProductCarousel.jsx
import React, { useState, useEffect } from 'react';
import styles from './ProductCarousel.module.css';

const ProductCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Datos de ejemplo para el carrusel
  const products = [
    {
      id: 1,
      name: "CABEZA DE MOTOR",
      price: "$3,999",
      image: "/imgs/pieza1.jpg", // Asegúrate de tener estas imágenes o usa placeholders
      ctaText: "COMPRA AHORA"
    },
    {
      id: 2,
      name: "SISTEMA DE INYECCIÓN",
      price: "$2,499",
      image: "/imgs/sistema-inyeccion.jpg",
      ctaText: "COMPRA AHORA"
    },
    {
      id: 3,
      name: "PISTONES HD",
      price: "$1,899",
      image: "/imgs/pistones.jpg",
      ctaText: "COMPRA AHORA"
    },
    {
      id: 4,
      name: "FILTRO DIESEL",
      price: "$899",
      image: "/imgs/filtro-diesel.jpg",
      ctaText: "COMPRA AHORA"
    },
  ];

  // Función para pasar a la siguiente diapositiva
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === products.length - 1 ? 0 : prev + 1));
  };

  // Función para volver a la diapositiva anterior
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? products.length - 1 : prev - 1));
  };

  // Cambiar automáticamente cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Función para ir a una diapositiva específica
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleWhatsAppClick = (product) => {
    // Mensaje predefinido para WhatsApp
    const message = encodeURIComponent(`Hola, estoy interesado en ${product.name} con precio de ${product.price}. ¿Podría proporcionarme más información?`);
    // Número de teléfono - usar el primero de ContactNumbers como ejemplo
    const phoneNumber = '524272245923'; // Alan - ajustar según necesites
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    
    // Abrir en nueva ventana/pestaña
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={styles.carouselContainer}>
      <button 
        className={`${styles.carouselButton} ${styles.prev}`} 
        onClick={prevSlide}
        aria-label="Producto anterior"
      >
        &lt;
      </button>
      
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
                {/* Si no tienes imágenes, puedes usar un div con fondo de color como placeholder */}
                {product.image ? (
                  <img src={product.image} alt={product.name} className={styles.productImage} />
                ) : (
                  <div className={styles.imagePlaceholder}></div>
                )}
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
      
      <button 
        className={`${styles.carouselButton} ${styles.next}`} 
        onClick={nextSlide}
        aria-label="Siguiente producto"
      >
        &gt;
      </button>
      
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
    </div>
  );
};

export default ProductCarousel;