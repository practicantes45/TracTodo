'use client';
import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import VideoModal from '../VideoModal/VideoModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import styles from './AdminVideoButtons.module.css';

export default function AdminVideoButtons({ video, onVideoUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = useAuth();

  if (!isAdmin || !video) return null;

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (!video?.id) return;

    setIsDeleting(true);
    try {
      await onVideoUpdate('delete', video.id);
      console.log('✅ Video eliminado correctamente');
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('❌ Error al eliminar video:', error);
      alert('Error al eliminar el video. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVideoSaved = async (action, videoData) => {
    setIsModalOpen(false);
    if (onVideoUpdate) {
      await onVideoUpdate(action, videoData);
    }
  };

  return (
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

      {isModalOpen && (
        <VideoModal
          isOpen={isModalOpen}
          mode="edit"
          video={video}
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