'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IoMdSave } from 'react-icons/io';
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
    setError(''); // Limpiar errores al cambiar modo
  }, [mode, video, isOpen]);

  const categories = [
    'Cargas Promocionales',
    'Descargas de Risa',
    'Entregas Festivas'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
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

    if (!validateYouTubeUrl(formData.youtubeLink.trim())) {
      setError('El enlace de YouTube no es válido. Debe ser un enlace de YouTube o YouTube Shorts.');
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
        title: formData.title.trim(),
        youtubeLink: formData.youtubeLink.trim(),
        category: formData.category.trim(),
        id: mode === 'edit' ? video.id : undefined
      };

      const action = mode === 'edit' ? 'edit' : 'create';
      
      console.log('🎬 Enviando datos del video:', action, videoData);
      
      // Llamar la función onSaved que maneja la comunicación con el backend
      await onSaved(action, videoData);
      
      console.log('✅ Video guardado exitosamente');
      
      // Cerrar modal después de guardar exitosamente
      onClose();
      
    } catch (error) {
      console.error('❌ Error al guardar video:', error);
      setError(error.message || 'Error al guardar el video. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setFormData({
        title: '',
        youtubeLink: '',
        category: ''
      });
      onClose();
    }
  };

  // Si no está montado o no está abierto, no renderizar nada
  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{mode === 'create' ? 'Agregar Video' : 'Editar Video'}</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            ×
          </button>
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
              disabled={loading}
              placeholder="Ej: Cabeza Para Motor Volvo D13 Nueva"
              maxLength={200}
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
              disabled={loading}
              placeholder="https://youtube.com/shorts/... o https://youtu.be/..."
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
              disabled={loading}
            >
              <option value="">Seleccionar categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttons}>
            <button 
              type="button" 
              onClick={handleClose} 
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className={styles.saveButton}
            >
              <IoMdSave style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {loading ? 'Guardando...' : (mode === 'create' ? 'Crear Video' : 'Actualizar Video')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}