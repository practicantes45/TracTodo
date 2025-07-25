'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaTrash, FaPlus, FaBook } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { 
  obtenerArticulosSeleccionados, 
  obtenerArticulosDisponibles,
  agregarArticuloAEntretenimiento,
  eliminarArticuloDeEntretenimiento 
} from '../../../services/entretenimientoBlogService';
import styles from './EntertainmentBlogManager.module.css';

export default function EntertainmentBlogManager({ onArticulosUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [initialSelectionCount, setInitialSelectionCount] = useState(0);
  const { isAdmin } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // No mostrar si no es admin
  if (!isAdmin) return null;

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📚 Cargando datos de artículos para gestión...');

      const [seleccionados, disponibles] = await Promise.all([
        obtenerArticulosSeleccionados(),
        obtenerArticulosDisponibles()
      ]);

      setArticulosSeleccionados(seleccionados);
      setArticulosDisponibles(disponibles);
      setInitialSelectionCount(seleccionados.length);

      console.log('✅ Datos cargados:', {
        seleccionados: seleccionados.length,
        disponibles: disponibles.length
      });
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError('Error al cargar los artículos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    await cargarDatos();
  };

  const handleClose = () => {
    // Validar que tenga mínimo 2 artículos antes de cerrar
    if (articulosSeleccionados.length < 2) {
      setError('Debes seleccionar al menos 2 artículos antes de cerrar');
      return;
    }

    setIsOpen(false);
    setError('');
    
    // Notificar cambios si hubo modificaciones
    if (articulosSeleccionados.length !== initialSelectionCount) {
      if (onArticulosUpdate) {
        onArticulosUpdate();
      }
    }
  };

  const handleAgregarArticulo = async (articulo) => {
    if (articulosSeleccionados.length >= 3) {
      setError('Máximo 3 artículos permitidos en entretenimiento');
      return;
    }

    try {
      setError('');
      console.log('📚 Agregando artículo a entretenimiento:', articulo.id);
      
      await agregarArticuloAEntretenimiento(articulo.id);
      
      // Actualizar listas localmente
      setArticulosSeleccionados(prev => [...prev, articulo]);
      setArticulosDisponibles(prev => prev.filter(a => a.id !== articulo.id));
      
      console.log('✅ Artículo agregado exitosamente');
    } catch (error) {
      console.error('❌ Error al agregar artículo:', error);
      setError('Error al agregar el artículo');
    }
  };

  const handleEliminarArticulo = async (articulo) => {
    try {
      setError('');
      console.log('📚 Eliminando artículo de entretenimiento:', articulo.id);
      
      await eliminarArticuloDeEntretenimiento(articulo.id);
      
      // Actualizar listas localmente
      setArticulosSeleccionados(prev => prev.filter(a => a.id !== articulo.id));
      setArticulosDisponibles(prev => [...prev, articulo]);
      
      console.log('✅ Artículo eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar artículo:', error);
      setError('Error al eliminar el artículo');
    }
  };

  const canClose = articulosSeleccionados.length >= 2;
  const isMaxReached = articulosSeleccionados.length >= 3;

  if (!isMounted) return null;

  return (
    <>
      <button
        className={styles.manageButton}
        onClick={handleOpen}
        title="Gestionar artículos de entretenimiento"
      >
        <FaBook className={styles.manageIcon} />
        Gestionar Artículos
      </button>

      {isOpen && createPortal(
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && canClose && handleClose()}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <FaBook className={styles.headerIcon} />
                <h2>Gestionar Artículos de Entretenimiento</h2>
              </div>
              <button 
                className={`${styles.closeButton} ${!canClose ? styles.closeButtonDisabled : ''}`}
                onClick={handleClose}
                disabled={!canClose}
                title={canClose ? "Cerrar" : "Selecciona al menos 2 artículos para cerrar"}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.content}>
              {/* Sección de artículos seleccionados */}
              <div className={styles.section}>
                <h3>Artículos en Entretenimiento ({articulosSeleccionados.length}/3)</h3>
                
                {loading ? (
                  <div className={styles.loading}>Cargando artículos...</div>
                ) : (
                  <div className={styles.articlesGrid}>
                    {articulosSeleccionados.map((articulo) => (
                      <div key={`selected-${articulo.id}`} className={styles.articleCard}>
                        <div className={styles.articleImage}>
                          <img
                            src={(articulo.imagenes && articulo.imagenes[0]) || (articulo.bloques && articulo.bloques[0]?.imagen) || '/imgs/default-blog.jpg'}
                            alt={articulo.titulo}
                            onError={(e) => {
                              e.target.src = '/imgs/default-blog.jpg';
                            }}
                          />
                          <button
                            className={styles.removeButton}
                            onClick={() => handleEliminarArticulo(articulo)}
                            title="Eliminar de entretenimiento"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className={styles.articleInfo}>
                          <h4>{articulo.titulo}</h4>
                          <span className={styles.articleCategory}>
                            {articulo.categoria || 'Sin categoría'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {articulosSeleccionados.length < 2 && (
                  <div className={styles.warning}>
                    ⚠️ Selecciona al menos 2 artículos para continuar
                  </div>
                )}

                {/* Mensaje cuando se alcanza el máximo */}
                {isMaxReached && (
                  <div className={styles.maxReached}>
                    ✅ Has alcanzado el máximo de 3 artículos en entretenimiento
                  </div>
                )}
              </div>

              {/* Sección de artículos disponibles - SOLO SI NO SE HA ALCANZADO EL MÁXIMO */}
              {!isMaxReached && (
                <div className={styles.section}>
                  <h3>Artículos Disponibles</h3>
                  
                  {loading ? (
                    <div className={styles.loading}>Cargando artículos disponibles...</div>
                  ) : articulosDisponibles.length > 0 ? (
                    <div className={styles.articlesGrid}>
                      {articulosDisponibles.map((articulo) => (
                        <div key={`available-${articulo.id}`} className={styles.articleCard}>
                          <div className={styles.articleImage}>
                            <img
                              src={(articulo.imagenes && articulo.imagenes[0]) || (articulo.bloques && articulo.bloques[0]?.imagen) || '/imgs/default-blog.jpg'}
                              alt={articulo.titulo}
                              onError={(e) => {
                                e.target.src = '/imgs/default-blog.jpg';
                              }}
                            />
                            <button
                              className={styles.addButton}
                              onClick={() => handleAgregarArticulo(articulo)}
                              title="Agregar a entretenimiento"
                            >
                              <FaPlus />
                            </button>
                          </div>
                          <div className={styles.articleInfo}>
                            <h4>{articulo.titulo}</h4>
                            <span className={styles.articleCategory}>
                              {articulo.categoria || 'Sin categoría'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noArticles}>
                      No hay más artículos disponibles
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className={styles.error}>{error}</div>
              )}

              <div className={styles.footer}>
                <button 
                  onClick={handleClose}
                  className={`${styles.closeFooterButton} ${!canClose ? styles.closeFooterButtonDisabled : ''}`}
                  disabled={!canClose}
                >
                  {canClose ? 'Cerrar' : `Selecciona ${2 - articulosSeleccionados.length} artículo${2 - articulosSeleccionados.length > 1 ? 's' : ''} más`}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}