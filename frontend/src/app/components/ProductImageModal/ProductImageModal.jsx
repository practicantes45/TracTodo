'use client';
import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaSearchPlus, FaSearchMinus, FaRedo } from 'react-icons/fa';
import styles from './ProductImageModal.module.css';

const ProductImageModal = ({ images, isOpen, onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageOrientation, setImageOrientation] = useState('landscape');
  const [modalZoom, setModalZoom] = useState(100);
  const [modalRotation, setModalRotation] = useState(0);
  const [modalPanX, setModalPanX] = useState(0);
  const [modalPanY, setModalPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const modalImageRef = useRef(null);

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

  // Resetear zoom, rotación y pan cuando cambia la imagen
  useEffect(() => {
    setModalZoom(100);
    setModalRotation(0);
    setModalPanX(0);
    setModalPanY(0);
  }, [currentIndex]);

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
      case '+':
      case '=':
        handleModalZoomIn();
        break;
      case '-':
        handleModalZoomOut();
        break;
      case 'r':
      case 'R':
        handleModalRotate();
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

  // Funciones de zoom y rotación para el modal
  const handleModalZoomIn = () => {
    setModalZoom(prev => Math.min(prev + 25, 300));
  };

  const handleModalZoomOut = () => {
    setModalZoom(prev => {
      const newZoom = Math.max(prev - 25, 25);
      // Si volvemos a zoom normal, resetear el pan
      if (newZoom <= 100) {
        setModalPanX(0);
        setModalPanY(0);
      }
      return newZoom;
    });
  };

  const handleModalRotate = () => {
    setModalRotation(prev => (prev + 90) % 360);
  };

  const handleModalResetTransform = () => {
    setModalZoom(100);
    setModalRotation(0);
    setModalPanX(0);
    setModalPanY(0);
  };

  // Funciones para el pan/drag del modal
  const handleModalMouseDown = (e) => {
    if (modalZoom > 100) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - modalPanX,
        y: e.clientY - modalPanY
      });
    }
  };

  const handleModalMouseMove = (e) => {
    if (isDragging && modalZoom > 100) {
      e.preventDefault();
      const newPanX = e.clientX - dragStart.x;
      const newPanY = e.clientY - dragStart.y;
      
      // Limitar el movimiento para que no se salga demasiado
      const maxPan = (modalZoom - 100) * 3;
      setModalPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
      setModalPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
    }
  };

  const handleModalMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events para móvil
  const handleModalTouchStart = (e) => {
    if (modalZoom > 100) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - modalPanX,
        y: touch.clientY - modalPanY
      });
    }
  };

  const handleModalTouchMove = (e) => {
    if (isDragging && modalZoom > 100) {
      e.preventDefault();
      const touch = e.touches[0];
      const newPanX = touch.clientX - dragStart.x;
      const newPanY = touch.clientY - dragStart.y;
      
      const maxPan = (modalZoom - 100) * 3;
      setModalPanX(Math.max(-maxPan, Math.min(maxPan, newPanX)));
      setModalPanY(Math.max(-maxPan, Math.min(maxPan, newPanY)));
    }
  };

  const handleModalTouchEnd = () => {
    setIsDragging(false);
  };

  // Event listeners globales para el mouse del modal
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleModalMouseMove(e);
    const handleGlobalMouseUp = () => handleModalMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, modalZoom]);

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <div 
          className={styles.imageContainer}
          data-orientation={imageOrientation}
          style={{
            cursor: modalZoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onMouseDown={handleModalMouseDown}
          onTouchStart={handleModalTouchStart}
          onTouchMove={handleModalTouchMove}
          onTouchEnd={handleModalTouchEnd}
        >
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>

          <img
            ref={modalImageRef}
            src={images[currentIndex]}
            alt={`Imagen ${currentIndex + 1}`}
            className={`${styles.modalImage} ${styles.horizontalImage}`}
            style={{
              transform: `translate(${modalPanX}px, ${modalPanY}px) scale(${modalZoom / 100}) rotate(${modalRotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
              cursor: modalZoom > 100 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onLoad={handleImageLoad}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
            draggable={false}
          />
          
          <div className={styles.imageNotFound} style={{ display: 'none' }}>
            <div className={styles.noImageIcon}>📷</div>
            <p>Imagen no disponible</p>
          </div>

          {/* Controles de zoom y rotación en el modal */}
          <div className={styles.modalImageControls}>
            <button
              className={`${styles.modalControlButton} ${styles.zoomInButton}`}
              onClick={handleModalZoomIn}
              title="Acercar (tecla +)"
            >
              <FaSearchPlus />
            </button>
            <button
              className={`${styles.modalControlButton} ${styles.zoomOutButton}`}
              onClick={handleModalZoomOut}
              title="Alejar (tecla -)"
            >
              <FaSearchMinus />
            </button>
            <button
              className={`${styles.modalControlButton} ${styles.rotateButton}`}
              onClick={handleModalRotate}
              title="Rotar (tecla R)"
            >
              <FaRedo />
            </button>
            <button
              className={`${styles.modalControlButton} ${styles.resetButton}`}
              onClick={handleModalResetTransform}
              title="Restablecer"
            >
              ↺
            </button>
            <div className={styles.zoomIndicator}>
              {modalZoom}%
            </div>
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

        {/* Instrucciones de teclado */}
        <div className={styles.keyboardInstructions}>
          <span>Usa las teclas:</span>
          <span>←→ Navegar</span>
          <span>+/- Zoom</span>
          <span>R Rotar</span>
          <span>ESC Cerrar</span>
          {modalZoom > 100 && <span>🖱️ Arrastra para mover</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductImageModal;