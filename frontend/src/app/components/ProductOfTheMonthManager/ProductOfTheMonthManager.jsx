'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  obtenerProductos, 
  obtenerProductosDelMes, 
  agregarProductoDelMes, 
  eliminarProductoDelMes,
  actualizarPrecioProductoDelMes 
} from '../../../services/productoService';
import { FaBox, FaStar, FaRegStar, FaDollarSign, FaPlus, FaTrash, FaEdit, FaSearch, FaTimes } from 'react-icons/fa';
import styles from './ProductOfTheMonthManager.module.css';
import { formatearPrecio } from '../../../utils/priceUtils';

export default function ProductOfTheMonthManager() {
    const [productos, setProductos] = useState([]);
    const [productosDelMes, setProductosDelMes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');
    const [filtroNombre, setFiltroNombre] = useState('');
    const { isAdmin } = useAuth();

    // Estados derivados
    const productoSeleccionado = productos.find(p => p.id === selectedProductId);
    const estaEnCarrusel = productosDelMes.some(p => p.id === selectedProductId);
    const productosFiltrados = productos.filter(producto => 
        producto.nombre && producto.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
    );

    useEffect(() => {
        if (isAdmin) {
            cargarDatos();
        }
    }, [isAdmin]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [productosData, productosDelMesData] = await Promise.all([
                obtenerProductos(),
                obtenerProductosDelMes()
            ]);
            
            setProductos(productosData);
            setProductosDelMes(productosDelMesData);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleAgregar = async () => {
        if (!selectedProductId || !nuevoPrecio) {
            setError('Selecciona un producto y establece un precio');
            return;
        }

        try {
            setLoading(true);
            await agregarProductoDelMes([{
                id: selectedProductId,
                nuevoPrecio: parseFloat(nuevoPrecio)
            }]);
            
            setSelectedProductId('');
            setNuevoPrecio('');
            await cargarDatos();
        } catch (error) {
            console.error('Error al agregar producto:', error);
            setError(error.message || 'Error al agregar producto al carrusel');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async (productId) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto del carrusel?')) {
            return;
        }

        try {
            setLoading(true);
            await eliminarProductoDelMes(productId);
            await cargarDatos();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            setError(error.message || 'Error al eliminar producto');
        } finally {
            setLoading(false);
        }
    };

    const handleActualizarPrecio = async (productId, precio) => {
        try {
            setLoading(true);
            await actualizarPrecioProductoDelMes(productId, parseFloat(precio));
            await cargarDatos();
        } catch (error) {
            console.error('Error al actualizar precio:', error);
            setError(error.message || 'Error al actualizar precio');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return <div>Acceso denegado</div>;
    }

    if (loading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>
                    <FaStar className={styles.headerIcon} />
                    Gestión Productos del Mes
                </h1>
                <p>Administra los productos destacados en el carrusel principal</p>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                    <button onClick={() => setError('')} className={styles.closeError}>
                        <FaTimes />
                    </button>
                </div>
            )}

            <div className={styles.content}>
                {/* Panel de agregar producto */}
                <div className={styles.addSection}>
                    <h2>
                        <FaPlus className={styles.sectionIcon} />
                        Agregar Producto al Carrusel
                    </h2>

                    {/* Filtro de búsqueda */}
                    <div className={styles.searchSection}>
                        <label className={styles.label}>
                            <FaSearch className={styles.labelIcon} />
                            Buscar producto:
                        </label>
                        <div className={styles.searchContainer}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                placeholder="Buscar por nombre del producto..."
                                className={styles.searchInput}
                            />
                            {filtroNombre && (
                                <button 
                                    onClick={() => setFiltroNombre('')}
                                    className={styles.clearSearch}
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Selector de producto */}
                    <div className={styles.selectSection}>
                        <label className={styles.label}>
                            <FaBox className={styles.labelIcon} />
                            Seleccionar producto:
                        </label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className={styles.productSelect}
                        >
                            <option value="">Selecciona un producto...</option>
                            {productosFiltrados.map(producto => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.nombre} - {producto.numeroParte || 'Sin número de parte'}
                                    {productosDelMes.some(p => p.id === producto.id) ? ' ⭐ (En carrusel)' : ''}
                                </option>
                            ))}
                        </select>
                        <p className={styles.resultCount}>
                            <FaBox className={styles.countIcon} />
                            {productosFiltrados.length} productos encontrados
                        </p>
                    </div>

                    {/* Información del producto seleccionado */}
                    {productoSeleccionado && (
                        <div className={styles.productInfo}>
                            <h3>
                                <FaBox className={styles.sectionIcon} />
                                Producto Seleccionado:
                            </h3>
                            <div className={styles.productDetails}>
                                <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                                <p><strong>Número de Parte:</strong> {productoSeleccionado.numeroParte || 'No disponible'}</p>
                                <p><strong>Precio Original:</strong> <FaDollarSign className={styles.priceIcon} />{formatearPrecio(productoSeleccionado.precioVentaSugerido || 0)}</p>
                                <p><strong>Estado:</strong>
                                    <span className={estaEnCarrusel ? styles.enCarrusel : styles.noEnCarrusel}>
                                        {estaEnCarrusel ? (
                                            <>
                                                <FaStar className={styles.statusIcon} />
                                                En el carrusel
                                            </>
                                        ) : (
                                            <>
                                                <FaRegStar className={styles.statusIcon} />
                                                No está en el carrusel
                                            </>
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Campo de precio */}
                    <div className={styles.priceSection}>
                        <label className={styles.label}>
                            <FaDollarSign className={styles.labelIcon} />
                            Precio para el carrusel:
                            <span className={styles.priceNote}>
                                (Este será el nuevo precio original del producto)
                            </span>
                        </label>
                        <div className={styles.priceInputContainer}>
                            <FaDollarSign className={styles.priceInputIcon} />
                            <input
                                type="number"
                                value={nuevoPrecio}
                                onChange={(e) => setNuevoPrecio(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className={styles.priceInput}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className={styles.actions}>
                        <button
                            onClick={handleAgregar}
                            disabled={!selectedProductId || !nuevoPrecio || loading}
                            className={styles.addButton}
                        >
                            <FaPlus className={styles.buttonIcon} />
                            Agregar al Carrusel
                        </button>
                    </div>
                </div>

                {/* Lista de productos del mes */}
                <div className={styles.listSection}>
                    <h2>
                        <FaStar className={styles.sectionIcon} />
                        Productos Actuales en el Carrusel ({productosDelMes.length})
                    </h2>

                    {productosDelMes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <FaRegStar className={styles.emptyIcon} />
                            <p>No hay productos en el carrusel actualmente</p>
                        </div>
                    ) : (
                        <div className={styles.productsList}>
                            {productosDelMes.map(producto => (
                                <div key={producto.id} className={styles.productCard}>
                                    <div className={styles.productCardHeader}>
                                        <h3>{producto.nombre}</h3>
                                        <div className={styles.cardActions}>
                                            <button
                                                onClick={() => handleEliminar(producto.id)}
                                                className={styles.deleteButton}
                                                title="Eliminar del carrusel"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.productCardContent}>
                                        <p><strong>Número de Parte:</strong> {producto.numeroParte || 'No disponible'}</p>
                                        <p><strong>Precio Actual:</strong> <FaDollarSign className={styles.priceIcon} />{formatearPrecio(producto.precioVentaSugerido || 0)}</p>
                                        <p><strong>Fecha Agregado:</strong> {new Date(producto.fechaAgregado).toLocaleDateString('es-MX')}</p>
                                        
                                        <div className={styles.priceUpdate}>
                                            <label>Actualizar precio:</label>
                                            <div className={styles.priceUpdateContainer}>
                                                <input
                                                    type="number"
                                                    placeholder="Nuevo precio"
                                                    min="0"
                                                    step="0.01"
                                                    className={styles.priceUpdateInput}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleActualizarPrecio(producto.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        const input = e.target.previousElementSibling;
                                                        if (input.value) {
                                                            handleActualizarPrecio(producto.id, input.value);
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className={styles.updatePriceButton}
                                                >
                                                    <FaEdit />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}