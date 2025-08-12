// components/SEOManager/SEOManager.jsx
import { useState, useEffect } from 'react';
import { FaSearch, FaRocket, FaChartLine, FaSync, FaCog } from 'react-icons/fa';
import { 
  obtenerEstadisticasSEO, 
  generarSEOProductos, 
  regenerarSEOProducto 
} from '../../services/seoService';
import styles from './SEOManager.module.css';

export default function SEOManager() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [productoId, setProductoId] = useState('');

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const stats = await obtenerEstadisticasSEO();
      setEstadisticas(stats);
    } catch (error) {
      setMensaje('Error al cargar estadísticas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarSEO = async () => {
    try {
      setGenerando(true);
      setMensaje('Generando SEO para todos los productos...');
      
      const resultado = await generarSEOProductos();
      setMensaje(`SEO generado correctamente. ${resultado.productosActualizados} productos actualizados.`);
      
      // Recargar estadísticas
      await cargarEstadisticas();
    } catch (error) {
      setMensaje('Error al generar SEO: ' + error.message);
    } finally {
      setGenerando(false);
    }
  };

  const handleRegenerarProducto = async () => {
    if (!productoId.trim()) {
      setMensaje('Por favor ingresa un ID de producto válido');
      return;
    }

    try {
      setGenerando(true);
      setMensaje(`Regenerando SEO para producto ${productoId}...`);
      
      const resultado = await regenerarSEOProducto(productoId);
      setMensaje(`SEO regenerado para producto: ${resultado.producto.nombre}`);
      setProductoId('');
      
      // Recargar estadísticas
      await cargarEstadisticas();
    } catch (error) {
      setMensaje('Error al regenerar SEO: ' + error.message);
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className={styles.seoManager}>
      <div className={styles.header}>
        <h2>
          <FaCog className={styles.icon} />
          Gestión SEO
        </h2>
      </div>

      {/* Estadísticas */}
      <div className={styles.estadisticas}>
        <h3>
          <FaChartLine className={styles.icon} />
          Estadísticas SEO
        </h3>
        
        {loading ? (
          <div className={styles.loading}>Cargando estadísticas...</div>
        ) : estadisticas ? (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h4>Productos</h4>
              <p className={styles.statNumber}>{estadisticas.productos?.total || 0}</p>
              <span>Total en catálogo</span>
            </div>
            
            <div className={styles.statCard}>
              <h4>Con SEO</h4>
              <p className={styles.statNumber}>{estadisticas.productos?.conSEO || 0}</p>
              <span>{estadisticas.productos?.porcentajeOptimizado || 0}% optimizado</span>
            </div>
            
            <div className={styles.statCard}>
              <h4>Blog Posts</h4>
              <p className={styles.statNumber}>{estadisticas.blog?.totalPosts || 0}</p>
              <span>Artículos publicados</span>
            </div>
            
            <div className={styles.statCard}>
              <h4>Palabras Clave</h4>
              <p className={styles.statNumber}>{estadisticas.palabrasClave?.total || 0}</p>
              <span>Total disponibles</span>
            </div>
          </div>
        ) : (
          <div className={styles.error}>Error al cargar estadísticas</div>
        )}
      </div>

      {/* Acciones */}
      <div className={styles.acciones}>
        <h3>
          <FaRocket className={styles.icon} />
          Acciones SEO
        </h3>
        
        <div className={styles.accionCard}>
          <h4>Generar SEO para todos los productos</h4>
          <p>Genera o actualiza datos SEO para todo el catálogo de productos</p>
          <button 
            onClick={handleGenerarSEO}
            disabled={generando}
            className={styles.primaryButton}
          >
            {generando ? 'Generando...' : 'Generar SEO Global'}
            <FaRocket />
          </button>
        </div>

        <div className={styles.accionCard}>
          <h4>Regenerar SEO de producto específico</h4>
          <p>Regenera datos SEO para un producto individual</p>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="ID del producto"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              className={styles.input}
            />
            <button 
              onClick={handleRegenerarProducto}
              disabled={generando || !productoId.trim()}
              className={styles.secondaryButton}
            >
              <FaSync />
              Regenerar
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={styles.mensaje}>
          {mensaje}
        </div>
      )}
    </div>
  );
}