'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ProductModal from '../ProductModal/ProductModal';
import styles from './AdminButtons.module.css';

export default function AdminButtons({ producto, onProductUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleProductSaved = () => {
    setIsModalOpen(false);
    if (onProductUpdate) {
      onProductUpdate();
    }
  };

  return (
    <>
      {producto && (
        <button 
          className={`${styles.adminButton} ${styles.editButton}`}
          onClick={handleEdit}
          title="Editar producto"
        >
          ✏️
        </button>
      )}

      {!producto && (
        <button 
          className={`${styles.adminButton} ${styles.addButton}`}
          onClick={handleAdd}
          title="Agregar producto"
        >
          +
        </button>
      )}

      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          mode={modalMode}
          producto={modalMode === 'edit' ? producto : null}
          onClose={handleCloseModal}
          onSaved={handleProductSaved}
        />
      )}
    </>
  );
}