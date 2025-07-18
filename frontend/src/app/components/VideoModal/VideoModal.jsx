'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './VideoModal.module.css';

export default function VideoModal({ isOpen, mode, video, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    title: '',
    youtubeLink: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && video) {
      setFormData({
        title: video.title || '',
        youtubeLink: video.youtubeLink || '',
        category: video.category || ''
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        youtubeLink: '',
        category: ''
      });
    }
  }, [mode, video]);

  const categories = [
    'Cargas Promocionales',
    'Descargas de Risa',
    'Entregas Festivas',
    'Tutoriales',
    'Productos'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]+/,
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
      /^https?:\/\/youtu\.be\/[a-zA-Z0-9_-]+/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.title.trim()) {
      setError('El título es requerido');
      setLoading(false);
      return;
    }

    if (!formData.youtubeLink.trim()) {
      setError('El enlace de YouTube es requerido');
      setLoading(false);
      return;
    }

    if (!validateYouTubeUrl(formData.youtubeLink)) {
      setError('El enlace de YouTube no es válido');
      setLoading(false);
      return;
    }

    if (!formData.category.trim()) {
      setError('La categoría es requerida');
      setLoading(false);
      return;
    }

    try {
      const videoData = {
        ...formData,
        id: mode === 'edit' ? video.id : Date.now() // Generar ID simple para nuevos videos
      };

      const action = mode === 'edit' ? 'edit' : 'create';
      onSaved(action, videoData);
    } catch (error) {
      setError(error.message || 'Error al guardar el video');
    } finally {
      setLoading(false);
    }
  };

  // Si no está montado o no está abierto, no renderizar nada
  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{mode === 'create' ? 'Agregar Video' : 'Editar Video'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Título *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ej: Cabeza Para Motor Volvo D13 Nueva"
            />
          </div>

          <div className={styles.field}>
            <label>Enlace de YouTube *</label>
            <input
              type="url"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleChange}
              required
              placeholder="https://youtube.com/shorts/..."
            />
            <small className={styles.fieldHint}>
              Acepta enlaces de YouTube Shorts, videos normales o enlaces cortos (youtu.be)
            </small>
          </div>

          <div className={styles.field}>
            <label>Categoría *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}