'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaTrash, FaPlus, FaBook, FaExternalLinkAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { 
  obtenerArticulosSeleccionados, 
  obtenerArticulosDisponibles,
  agregarArticuloAEntretenimiento,
  eliminarArticuloDeEntretenimiento 
} from '../../../services/entretenimientoBlogService';
import styles from './EntertainmentBlogManager.module.css';

export default function EntertainmentBlogManager({ onArticulosUpdate }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState([]);
  const [articulosDisponibles, setArticulosDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
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

      console.log('✅ Datos recibidos:', { 
        seleccionados: seleccionados.length, 
        disponibles: disponibles.length 
      });

      setArticulosSeleccionados(seleccionados || []);
      setArticulosDisponibles(disponibles || []);
      setInitialSelectionCount(seleccionados ? seleccionados.length : 0);

      console.log('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError(`Error al cargar los artículos: ${error.message || 'Error desconocido'}`);
      setArticulosSeleccionados([]);
      setArticulosDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsOpen(true);
    setError('');
    await cargarDatos();
  };

  const handleClose = () => {
    // Solo validar si hay artículos disponibles en total
    const totalArticulos = articulosSeleccionados.length + articulosDisponibles.length;
    
    if (totalArticulos > 0 && articulosSeleccionados.length < 2) {
      setError('Debes seleccionar al menos 2 artículos antes de cerrar');
      return;
    }

    setIsOpen(false);
    setError('');
    
    // Notificar cambios si hubo modificaciones
    const huboModificaciones = articulosSeleccionados.length !== initialSelectionCount;
    if (huboModificaciones && onArticulosUpdate) {
      console.log('🔄 Notificando cambios al componente padre...');
      onArticulosUpdate();
    }
  };

  const handleAgregarArticulo = async (articulo) => {
    // Verificar límite antes de procesar
    if (articulosSeleccionados.length >= 3) {
      setError('Máximo 3 artículos permitidos en entretenimiento');
      return;
    }

    // Verificar que no esté ya seleccionado
    const yaSeleccionado = articulosSeleccionados.some(a => a.id === articulo.id);
    if (yaSeleccionado) {
      setError('Este artículo ya está seleccionado');
      return;
    }

    setProcessingAction(true);
    setError('');

    try {
      console.log('📚 Agregando artículo a entretenimiento:', articulo.id);
      
      await agregarArticuloAEntretenimiento(articulo.id);
      
      // Actualizar listas localmente
      const nuevosSeleccionados = [...articulosSeleccionados, articulo];
      const nuevosDisponibles = articulosDisponibles.filter(a => a.id !== articulo.id);
      
      setArticulosSeleccionados(nuevosSeleccionados);
      setArticulosDisponibles(nuevosDisponibles);
      
      console.log('✅ Artículo agregado exitosamente');
      
      // Limpiar error previo si todo salió bien
      setError('');
    } catch (error) {
      console.error('❌ Error al agregar artículo:', error);
      setError(`Error al agregar el artículo: ${error.message || 'Error desconocido'}`);
      
      // Recargar datos en caso de error para mantener sincronización
      await cargarDatos();
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEliminarArticulo = async (articulo) => {
    // Verificar que no baje del mínimo
    if (articulosSeleccionados.length <= 2) {
      setError('No puedes eliminar más artículos. Mínimo 2 requeridos.');
      return;
    }

    setProcessingAction(true);
    setError('');

    try {
      console.log('📚 Eliminando artículo de entretenimiento:', articulo.id);
      
      await eliminarArticuloDeEntretenimiento(articulo.id);
      
      // Actualizar listas localmente
      const nuevosSeleccionados = articulosSeleccionados.filter(a => a.id !== articulo.id);
      const nuevosDisponibles = [...articulosDisponibles, articulo];
      
      setArticulosSeleccionados(nuevosSeleccionados);
      setArticulosDisponibles(nuevosDisponibles);
      
      console.log('✅ Artículo eliminado exitosamente');
      
      // Limpiar error previo si todo salió bien
      setError('');
    } catch (error) {
      console.error('❌ Error al eliminar artículo:', error);
      setError(`Error al eliminar el artículo: ${error.message || 'Error desconocido'}`);
      
      // Recargar datos en caso de error para mantener sincronización
      await cargarDatos();
    } finally {
      setProcessingAction(false);
    }
  };

  const handleGoToBlog = () => {
    setIsOpen(false);
    router.push('/blog');
  };

  const totalArticulos = articulosSeleccionados.length + articulosDisponibles.length;
  const canClose = totalArticulos === 0 || articulosSeleccionados.length >= 2;
  const isMaxReached = articulosSeleccionados.length >= 3;
  const isProcessing = loading || processingAction;
  const noHayArticulos = !loading && totalArticulos === 0;

  if (!isMounted) return null;

  return (
    <>
      <button
        className={styles.manageButton}
        onClick={handleOpen}
        disabled={isProcessing}
        title="Gestionar artículos de entretenimiento"
      >
        <FaBook className={styles.manageIcon} />
        Gestionar Artículos
      </button>

      {isOpen && createPortal(
        <div className={styles.overlay} onClick={(e) => {
          if (e.target === e.currentTarget && canClose && !isProcessing) {
            handleClose();
          }
        }}>
          <div className={styles.modal}>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <FaBook className={styles.headerIcon} />
                <h2>Gestionar Artículos de Entretenimiento</h2>
              </div>
              <button 
                className={`${styles.closeButton} ${!canClose || isProcessing ? styles.closeButtonDisabled : ''}`}
                onClick={handleClose}
                disabled={!canClose || isProcessing}
                title={canClose ? "Cerrar" : "Selecciona al menos 2 artículos para cerrar"}
              >
                <FaTimes />
              </button>
            </div>

            <div className={styles.content}>
              {/* Mensaje cuando no hay artículos en la base de datos */}
              {noHayArticulos ? (
                <div className={styles.noArticlesInDatabase}>
                  <div className={styles.noArticlesIcon}>📚</div>
                  <h3>No hay artículos disponibles</h3>
                  <p>Agrega artículos para poder seleccionarlos en entretenimiento.</p>
                  <button 
                    onClick={handleGoToBlog}
                    className={styles.goToBlogButton}
                  >
                    <FaExternalLinkAlt />
                    Ver más artículos
                  </button>
                </div>
              ) : (
                <>
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
                                disabled={isProcessing || articulosSeleccionados.length <= 2}
                                title={articulosSeleccionados.length <= 2 ? "Mínimo 2 artículos requeridos" : "Eliminar de entretenimiento"}
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

                    {articulosSeleccionados.length < 2 && totalArticulos > 0 && (
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
                                  disabled={isProcessing || articulosSeleccionados.length >= 3}
                                  title={articulosSeleccionados.length >= 3 ? "Máximo 3 artículos permitidos" : "Agregar a entretenimiento"}
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
                </>
              )}

              {error && (
                <div className={styles.error}>{error}</div>
              )}

              {processingAction && (
                <div className={styles.processing}>
                  Procesando... Por favor espera.
                </div>
              )}

              {/* Botón "Ver más artículos" siempre visible */}
              <div className={styles.blogLinkSection}>
                <button 
                  onClick={handleGoToBlog}
                  className={styles.viewMoreArticlesButton}
                  disabled={isProcessing}
                >
                  <FaExternalLinkAlt />
                  Ver más artículos
                </button>
              </div>

              <div className={styles.footer}>
                <button 
                  onClick={handleClose}
                  className={`${styles.closeFooterButton} ${!canClose || isProcessing ? styles.closeFooterButtonDisabled : ''}`}
                  disabled={!canClose || isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 
                   noHayArticulos ? 'Cerrar' : 
                   canClose ? 'Cerrar' : 
                   `Selecciona ${2 - articulosSeleccionados.length} artículo${2 - articulosSeleccionados.length > 1 ? 's' : ''} más`}
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