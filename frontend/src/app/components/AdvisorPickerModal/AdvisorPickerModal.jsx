'use client';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdvisorPickerModal.module.css';
import ContactNumbers from '../ContactNumbers/ContactNumbers';
import { useAdvisorSelection } from '../../../hooks/useAdvisorSelection';

export default function AdvisorPickerModal({ isOpen, onClose }) {
  const { selectedAdvisor } = useAdvisorSelection();
  const initialSelectedIdRef = useRef(null);

  // Track the selection present when the modal opens so we only auto-close after a change
  useEffect(() => {
    if (isOpen) {
      initialSelectedIdRef.current = selectedAdvisor?.id || null;
    }
  }, [isOpen, selectedAdvisor]);

  useEffect(() => {
    if (!isOpen) return;
    // Cerrar al seleccionar un asesor
    const initialId = initialSelectedIdRef.current;
    const currentId = selectedAdvisor?.id || null;

    if (currentId && currentId !== initialId) {
      onClose?.();
    }
  }, [selectedAdvisor, isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} role="dialog" aria-modal>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3 className={styles.title}>Elige a tu asesor</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        <div className={styles.content}>
          <p className={styles.hint}>Selecciona un asesor para continuar con tu compra y agregar productos al carrito.</p>
          <ContactNumbers pageContext="home" onSelected={() => onClose?.()} />
        </div>
      </div>
    </div>,
    document.body
  );
}
