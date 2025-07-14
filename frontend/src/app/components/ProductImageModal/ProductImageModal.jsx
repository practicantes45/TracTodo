'use client';
import { useState, useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './ProductImageModal.module.css';

const ProductImageModal = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageOrientation, setImageOrientation] = useState('landscape');

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setImageOrientation(aspectRatio > 1 ? 'landscape' : 'portrait');
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div 
          className={styles.imageContainer}
          data-orientation={imageOrientation}
        >
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>

          <img
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className={styles.modalImage}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          
          <div className={styles.imageNotFound} style={{ display: 'none' }}>
            <div className={styles.noImageIcon}>📷</div>
            <p>Imagen no disponible</p>
          </div>
          
          {images.length > 1 && (
            <>
              <button 
                className={styles.arrowLeft} 
                onClick={prevImage}
                title="Imagen anterior"
              >
                <FaChevronLeft />
              </button>
              <button 
                className={styles.arrowRight} 
                onClick={nextImage}
                title="Imagen siguiente"
              >
                <FaChevronRight />
              </button>
            </>
          )}
        </div>
        
        {images.length > 1 && (
          <div className={styles.navigationContainer}>
            <div className={styles.indicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${currentIndex === index ? styles.active : ''}`}
                  onClick={() => goToImage(index)}
                  title={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>
            
            <div className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageModal;