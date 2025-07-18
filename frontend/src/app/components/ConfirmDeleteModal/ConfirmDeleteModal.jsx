'use client';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { FaTrash, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import styles from './ConfirmDeleteModal.module.css';

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName = "este producto",
  loading = false 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <FaExclamationTriangle className={styles.warningIcon} />
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>¿Eliminar producto?</h2>
          <p className={styles.message}>
            ¿Estás seguro de que deseas eliminar <strong>"{productName}"</strong>?
          </p>
          <p className={styles.warning}>
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className={styles.deleteButton}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner} />
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Portal: Renderizar directamente en document.body
  return createPortal(modalContent, document.body);
}