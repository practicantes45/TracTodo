'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaPlus, FaTimes, FaPlay, FaTrash, FaVideo } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import {
  obtenerVideosSeleccionados,
  obtenerVideosDisponibles,
  agregarVideoAEntretenimiento,
  eliminarVideoDeEntretenimiento
} from '../../../services/entretenimientoVideoService';
import styles from './EntertainmentVideoManager.module.css';

export default function EntertainmentVideoManager({ onVideosUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videosSeleccionados, setVideosSeleccionados] = useState([]);
  const [videosDisponibles, setVideosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    if (isAdmin) {
      cargarVideos();
    }
  }, [isAdmin]);

  const cargarVideos = async () => {
    try {
      setLoading(true);
      const [seleccionados, disponibles] = await Promise.all([
        obtenerVideosSeleccionados(),
        obtenerVideosDisponibles()
      ]);
      setVideosSeleccionados(seleccionados);
      setVideosDisponibles(disponibles);
    } catch (error) {
      console.error('Error al cargar videos:', error);
      setError('Error al cargar videos');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarVideo = async (videoId) => {
    if (videosSeleccionados.length >= 5) {
      setError('Máximo 5 videos permitidos');
      return;
    }

    try {
      setLoading(true);
      await agregarVideoAEntretenimiento(videoId);
      await cargarVideos(); // Recargar listas
      if (onVideosUpdate) onVideosUpdate(); // Actualizar vista principal
      setError('');
    } catch (error) {
      setError(error.message || 'Error al agregar video');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarVideo = async (videoId) => {
    try {
      setLoading(true);
      await eliminarVideoDeEntretenimiento(videoId);
      await cargarVideos(); // Recargar listas
      if (onVideosUpdate) onVideosUpdate(); // Actualizar vista principal
      setError('');
    } catch (error) {
      setError(error.message || 'Error al eliminar video');
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];
    const normalMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (normalMatch) return normalMatch[1];
    return null;
  };

  const getYouTubeThumbnail = (youtubeLink) => {
    const videoId = extractYouTubeId(youtubeLink);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '/imgs/default-video-thumb.jpg';
  };

  if (!isAdmin || !isMounted) return null;

  const modal = (
    <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            <FaVideo className={styles.headerIcon} />
            Gestionar Videos de Entretenimiento
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={() => setIsModalOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Videos Seleccionados */}
          <div className={styles.section}>
            <h3>Videos en Entretenimiento ({videosSeleccionados.length}/5)</h3>
            {videosSeleccionados.length === 0 ? (
              <div className={styles.emptyState}>
                No hay videos seleccionados para entretenimiento
              </div>
            ) : (
              <div className={styles.videoGrid}>
                {videosSeleccionados.map((video) => (
                  <div key={video.id} className={styles.videoCard}>
                    <div className={styles.videoThumbnail}>
                      <img 
                        src={getYouTubeThumbnail(video.urlVideo)} 
                        alt={video.titulo}
                        className={styles.thumbnailImage}
                      />
                      <div className={styles.playOverlay}>
                        <FaPlay />
                      </div>
                    </div>
                    <div className={styles.videoInfo}>
                      <h4>{video.titulo}</h4>
                      <span className={styles.videoCategory}>{video.categoria}</span>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleEliminarVideo(video.id)}
                      disabled={loading}
                      title="Eliminar de entretenimiento"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos Disponibles */}
          {videosSeleccionados.length < 5 && (
            <div className={styles.section}>
              <h3>Videos Disponibles</h3>
              {videosDisponibles.length === 0 ? (
                <div className={styles.emptyState}>
                  No hay videos disponibles para agregar
                </div>
              ) : (
                <div className={styles.videoGrid}>
                  {videosDisponibles.map((video) => (
                    <div key={video.id} className={styles.videoCard}>
                      <div className={styles.videoThumbnail}>
                        <img 
                          src={getYouTubeThumbnail(video.urlVideo)} 
                          alt={video.titulo}
                          className={styles.thumbnailImage}
                        />
                        <div className={styles.playOverlay}>
                          <FaPlay />
                        </div>
                      </div>
                      <div className={styles.videoInfo}>
                        <h4>{video.titulo}</h4>
                        <span className={styles.videoCategory}>{video.categoria}</span>
                      </div>
                      <button
                        className={styles.addButton}
                        onClick={() => handleAgregarVideo(video.id)}
                        disabled={loading}
                        title="Agregar a entretenimiento"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button 
            className={styles.closeFooterButton}
            onClick={() => setIsModalOpen(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        className={styles.manageButton}
        onClick={() => setIsModalOpen(true)}
        title="Gestionar videos de entretenimiento"
      >
        <FaVideo className={styles.manageIcon} />
        Gestionar Videos
      </button>

      {isModalOpen && createPortal(modal, document.body)}
    </>
  );
}