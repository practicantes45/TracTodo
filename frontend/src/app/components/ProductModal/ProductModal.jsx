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
    precioVentaSugerido: 0,
    tipoProducto: '',
    imagenesUrl: {}
  });
  const [imagenesFormulario, setImagenesFormulario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && producto) {
      // Datos básicos del producto
      setFormData({
        descripcion: producto.descripcion || '',
        marca: producto.marca || '',
        nombre: producto.nombre || '',
        numeroParte: producto.numeroParte || '',
        precioVentaSugerido: producto.precioVentaSugerido || 0,
        tipoProducto: producto.tipoProducto || '',
        imagenesUrl: producto.imagenesUrl || {}
      });

      // Procesar imágenes dinámicamente
      if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
        const imagenesArray = Object.entries(producto.imagenesUrl)
          .filter(([key, url]) => url && url.trim() !== '')
          .map(([key, url]) => ({ clave: key, url: url }));
        
        // Asegurar que siempre haya una imagen "frente"
        const tieneFrente = imagenesArray.some(img => img.clave === 'frente');
        if (!tieneFrente) {
          imagenesArray.unshift({ clave: 'frente', url: '' });
        }
        
        setImagenesFormulario(imagenesArray);
      } else {
        setImagenesFormulario([{ clave: 'frente', url: '' }]);
      }
    } else {
      // Modo crear - inicializar con imagen frente por defecto
      setFormData({
        descripcion: '',
        marca: '',
        nombre: '',
        numeroParte: '',
        precioVentaSugerido: 0,
        tipoProducto: '',
        imagenesUrl: {}
      });
      setImagenesFormulario([{ clave: 'frente', url: '' }]);
    }
  }, [mode, producto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagenChange = (index, field, value) => {
    const nuevasImagenes = [...imagenesFormulario];
    nuevasImagenes[index][field] = value;
    setImagenesFormulario(nuevasImagenes);

    // Actualizar formData.imagenesUrl
    const imagenesObj = {};
    nuevasImagenes.forEach(img => {
      if (img.clave && img.url) {
        imagenesObj[img.clave] = img.url;
      }
    });
    
    setFormData(prev => ({
      ...prev,
      imagenesUrl: imagenesObj
    }));
  };

  const agregarCampoImagen = () => {
    setImagenesFormulario(prev => [...prev, { clave: '', url: '' }]);
  };

  const eliminarCampoImagen = (index) => {
    const imagenAEliminar = imagenesFormulario[index];
    
    // No permitir eliminar si es la imagen "frente" 
    if (imagenAEliminar.clave === 'frente') {
      return;
    }
    
    // No permitir eliminar si solo queda una imagen
    if (imagenesFormulario.length > 1) {
      const nuevasImagenes = imagenesFormulario.filter((_, i) => i !== index);
      setImagenesFormulario(nuevasImagenes);

      // Actualizar formData.imagenesUrl
      const imagenesObj = {};
      nuevasImagenes.forEach(img => {
        if (img.clave && img.url) {
          imagenesObj[img.clave] = img.url;
        }
      });
      
      setFormData(prev => ({
        ...prev,
        imagenesUrl: imagenesObj
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar que todas las imágenes tengan clave y URL
      const imagenesValidas = {};
      imagenesFormulario.forEach(img => {
        if (img.clave && img.clave.trim() !== '' && img.url && img.url.trim() !== '') {
          imagenesValidas[img.clave.trim()] = img.url.trim();
        }
      });

      const datosFinales = {
        ...formData,
        imagenesUrl: imagenesValidas
      };

      if (mode === 'create') {
        await crearProducto(datosFinales);
      } else {
        await actualizarProducto(producto.id, datosFinales);
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
          </div>

          <div className={styles.fullWidth}>
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="8"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className={styles.imagesSection}>
            <div className={styles.imagesSectionHeader}>
              <h3>Imágenes del Producto</h3>
              <button 
                type="button" 
                className={styles.addImageButton}
                onClick={agregarCampoImagen}
              >
                + Agregar Imagen
              </button>
            </div>

            <div className={styles.imageFields}>
              {imagenesFormulario.map((imagen, index) => (
                <div key={index} className={styles.imageField}>
                  <div className={styles.imageFieldInputs}>
                    <div className={styles.field}>
                      <label>Nombre de la imagen</label>
                      <input
                        type="text"
                        value={imagen.clave}
                        onChange={(e) => handleImagenChange(index, 'clave', e.target.value)}
                        placeholder="ej: frente, atras, lado..."
                        disabled={imagen.clave === 'frente'}
                      />
                    </div>
                    <div className={styles.field}>
                      <label>URL de la imagen</label>
                      <input
                        type="url"
                        value={imagen.url}
                        onChange={(e) => handleImagenChange(index, 'url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  {(imagenesFormulario.length > 1 && imagen.clave !== 'frente') && (
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => eliminarCampoImagen(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.imageHelp}>
              <p><strong>Advertencia:</strong> Siempre se incluye una imagen con el nombre "frente" para que aparezca primero en la vista de productos.</p>
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
    document.body
  );
}