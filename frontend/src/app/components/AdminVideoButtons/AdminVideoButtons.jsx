'use client';
import { useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import VideoModal from '../VideoModal/VideoModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import styles from './AdminVideoButtons.module.css';

export default function AdminVideoButtons({ video, onVideoUpdate, isAddButton = false }) {
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
    if (!video || !video.id) return;

    setIsDeleting(true);
    try {
      // Llamar función para eliminar del archivo
      if (onVideoUpdate) {
        await onVideoUpdate('delete', video.id);
      }
      
      console.log('✅ Video eliminado correctamente');
      setIsDeleteModalOpen(false);
      
    } catch (error) {
      console.error('❌ Error al eliminar video:', error);
      alert('Error al eliminar el video. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVideoSaved = (action, videoData) => {
    setIsModalOpen(false);
    if (onVideoUpdate) {
      onVideoUpdate(action, videoData);
    }
  };

  if (isAddButton) {
    return (
      <>
        <button 
          className={`${styles.adminButton} ${styles.addButton}`}
          onClick={handleAdd}
          title="Agregar video"
        >
          <FaPlus />
        </button>

        {isModalOpen && (
          <VideoModal
            isOpen={isModalOpen}
            mode={modalMode}
            video={null}
            onClose={handleCloseModal}
            onSaved={handleVideoSaved}
          />
        )}
      </>
    );
  }

  return (
    <>
      {video && (
        <>
          {/* Botón de eliminar - lado izquierdo */}
          <button 
            className={`${styles.adminButton} ${styles.deleteButton}`}
            onClick={handleDelete}
            title="Eliminar video"
          >
            <FaTrash />
          </button>

          {/* Botón de editar - lado derecho */}
          <button 
            className={`${styles.adminButton} ${styles.editButton}`}
            onClick={handleEdit}
            title="Editar video"
          >
            <FaEdit />
          </button>
        </>
      )}

      {isModalOpen && (
        <VideoModal
          isOpen={isModalOpen}
          mode={modalMode}
          video={modalMode === 'edit' ? video : null}
          onClose={handleCloseModal}
          onSaved={handleVideoSaved}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          productName={video?.title || 'este video'}
        />
      )}
    </>
  );
}