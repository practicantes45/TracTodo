'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { crearProducto, actualizarProducto } from '../../../services/productoService';
import styles from './ProductModal.module.css';

export default function ProductModal({ isOpen, mode, producto, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    descripcion: '',
    marca: '',
    nombre: '',
    numeroParte: '',
    precioCompra: 0,
    precioVentaSugerido: 0,
    tipoProducto: '',
    ubicacion: '',
    existencias: 0,
    esMediaReparacion: false,
    imagenesUrl: {
      arriba: '',
      atras: '',
      frente: '',
      ladod: '',
      ladoi: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && producto) {
      setFormData({
        descripcion: producto.descripcion || '',
        marca: producto.marca || '',
        nombre: producto.nombre || '',
        numeroParte: producto.numeroParte || '',
        precioCompra: producto.precioCompra || 0,
        precioVentaSugerido: producto.precioVentaSugerido || 0,
        tipoProducto: producto.tipoProducto || '',
        ubicacion: producto.ubicacion || '',
        existencias: producto.existencias || 0,
        esMediaReparacion: producto.esMediaReparacion || false,
        imagenesUrl: {
          arriba: producto.imagenesUrl?.arriba || '',
          atras: producto.imagenesUrl?.atras || '',
          frente: producto.imagenesUrl?.frente || '',
          ladod: producto.imagenesUrl?.ladod || '',
          ladoi: producto.imagenesUrl?.ladoi || ''
        }
      });
    }
  }, [mode, producto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('imagen_')) {
      const imageType = name.replace('imagen_', '');
      setFormData(prev => ({
        ...prev,
        imagenesUrl: {
          ...prev.imagenesUrl,
          [imageType]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'create') {
        await crearProducto(formData);
      } else {
        await actualizarProducto(producto.id, formData);
      }
      onSaved();
    } catch (error) {
      setError(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Si no está montado o no está abierto, no renderizar nada
  if (!isMounted || !isOpen) return null;

  // RENDERIZAR CON PORTAL - igual que CookieConsent
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{mode === 'create' ? 'Agregar Producto' : 'Editar Producto'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Marca *</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Número de Parte *</label>
              <input
                type="text"
                name="numeroParte"
                value={formData.numeroParte}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Tipo de Producto *</label>
              <input
                type="text"
                name="tipoProducto"
                value={formData.tipoProducto}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Precio de Compra</label>
              <input
                type="number"
                name="precioCompra"
                value={formData.precioCompra}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className={styles.field}>
              <label>Precio de Venta Sugerido</label>
              <input
                type="number"
                name="precioVentaSugerido"
                value={formData.precioVentaSugerido}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className={styles.field}>
              <label>Existencias</label>
              <input
                type="number"
                name="existencias"
                value={formData.existencias}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className={styles.field}>
              <label>Ubicación</label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fullWidth}>
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className={styles.checkboxField}>
            <label>
              <input
                type="checkbox"
                name="esMediaReparacion"
                checked={formData.esMediaReparacion}
                onChange={handleChange}
              />
              Es media reparación
            </label>
          </div>

          <div className={styles.imagesSection}>
            <h3>Imágenes del Producto</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Imagen Frontal</label>
                <input
                  type="url"
                  name="imagen_frente"
                  value={formData.imagenesUrl.frente}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.field}>
                <label>Imagen Trasera</label>
                <input
                  type="url"
                  name="imagen_atras"
                  value={formData.imagenesUrl.atras}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.field}>
                <label>Imagen Superior</label>
                <input
                  type="url"
                  name="imagen_arriba"
                  value={formData.imagenesUrl.arriba}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.field}>
                <label>Imagen Lateral Izquierda</label>
                <input
                  type="url"
                  name="imagen_ladoi"
                  value={formData.imagenesUrl.ladoi}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className={styles.field}>
                <label>Imagen Lateral Derecha</label>
                <input
                  type="url"
                  name="imagen_ladod"
                  value={formData.imagenesUrl.ladod}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>
            </div>
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
    document.body // RENDERIZAR DIRECTAMENTE EN EL BODY - igual que CookieConsent
  );
}