'use client';
import { useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import ProductModal from '../ProductModal/ProductModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import { eliminarProducto } from '../../../services/productoService';
import styles from './AdminButtons.module.css';

export default function AdminButtons({ producto, onProductUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!producto || !producto.id) return;

    setIsDeleting(true);
    try {
      await eliminarProducto(producto.id);
      console.log('✅ Producto eliminado correctamente');
      
      setIsDeleteModalOpen(false);
      
      // Actualizar la lista de productos
      if (onProductUpdate) {
        onProductUpdate();
      }
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      alert('Error al eliminar el producto. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
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
        <>
          {/* Botón de eliminar - lado izquierdo */}
          <button 
            className={`${styles.adminButton} ${styles.deleteButton}`}
            onClick={handleDelete}
            title="Eliminar producto"
          >
            <FaTrash />
          </button>

          {/* Botón de editar - lado derecho */}
          <button 
            className={`${styles.adminButton} ${styles.editButton}`}
            onClick={handleEdit}
            title="Editar producto"
          >
            <FaEdit />
          </button>
        </>
      )}

      {!producto && (
        <button 
          className={`${styles.adminButton} ${styles.addButton}`}
          onClick={handleAdd}
          title="Agregar producto"
        >
          <FaPlus />
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

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          productName={producto?.nombre || 'este producto'}
        />
      )}
    </>
  );
}