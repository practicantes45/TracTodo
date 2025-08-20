'use client';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
    obtenerProductos,
    obtenerProductosDelMes,
    agregarProductosDelMes,
    eliminarProductoDelMes
} from '../../../services/productoService';
import { 
    FaSearch, 
    FaTimes, 
    FaPlus, 
    FaTrash, 
    FaEdit,
    FaDollarSign,
    FaBox,
    FaStar,
    FaRegStar,
    FaSpinner,
    FaExclamationTriangle,
    FaCheckCircle,
    FaBroom,
    FaInfoCircle
} from 'react-icons/fa';
import styles from './ProductOfTheMonthManager.module.css';

export default function ProductOfTheMonthManager({ isOpen, onClose }) {
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para productos
    const [todosLosProductos, setTodosLosProductos] = useState([]);
    const [productosDelMes, setProductosDelMes] = useState([]);

    // Estados del formulario
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [nuevoPrecio, setNuevoPrecio] = useState('');

    // Estado para verificar si estamos montados
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && isAdmin) {
            cargarDatos();
        }
    }, [isOpen, isAdmin]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('🔄 Cargando productos para gestión del mes...');

            const [productos, productosActuales] = await Promise.all([
                obtenerProductos(),
                obtenerProductosDelMes()
            ]);

            setTodosLosProductos(productos);
            setProductosDelMes(productosActuales);

            console.log(`✅ Cargados ${productos.length} productos totales y ${productosActuales.length} productos del mes`);

        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar productos según la búsqueda
    const productosFiltrados = useMemo(() => {
        if (!searchQuery.trim()) return todosLosProductos;

        const query = searchQuery.toLowerCase();
        return todosLosProductos.filter(producto =>
            producto.nombre?.toLowerCase().includes(query) ||
            producto.numeroParte?.toLowerCase().includes(query) ||
            producto.descripcion?.toLowerCase().includes(query)
        );
    }, [todosLosProductos, searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setSelectedProductId('');
    };

    const handleProductSelect = (e) => {
        const productId = e.target.value;
        setSelectedProductId(productId);

        // Usar el precio original como sugerencia
        const producto = todosLosProductos.find(p => p.id === productId);
        setNuevoPrecio(producto?.precioVentaSugerido || '');
    };

    const limpiarFormulario = () => {
        setSelectedProductId('');
        setNuevoPrecio('');
        setSearchQuery('');
        setError('');
        setSuccess('');
    };

    const handleAgregar = async () => {
        if (!selectedProductId || !nuevoPrecio) {
            setError('Selecciona un producto y especifica el precio');
            return;
        }

        const precio = parseFloat(nuevoPrecio);
        if (isNaN(precio) || precio <= 0) {
            setError('El precio debe ser un número válido mayor que 0');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            console.log('🔄 === FRONTEND: Iniciando proceso de agregar producto ===');
            console.log('📦 Producto seleccionado:', selectedProductId);
            console.log('💰 Nuevo precio:', precio);

            // CORREGIDO: Estructura correcta para el backend
            const productos = [{
                id: selectedProductId,
                nuevoPrecio: precio
            }];

            console.log('📤 Datos que se van a enviar al backend:', productos);

            const resultado = await agregarProductosDelMes(productos);
            console.log('✅ Respuesta del backend:', resultado);

            setSuccess('Producto agregado al carrusel exitosamente');

            setTimeout(async () => {
                await cargarDatos();
                limpiarFormulario();
            }, 1000);

        } catch (error) {
            console.error('❌ Error completo al agregar producto:', error);
            setError(`Error al agregar el producto: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleEliminarDirecto = async (productId, productName) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${productName}" del carrusel?`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await eliminarProductoDelMes(productId);
            setSuccess(`"${productName}" eliminado del carrusel exitosamente`);
            await cargarDatos();

        } catch (error) {
            console.error('❌ Error al eliminar producto:', error);
            setError('Error al eliminar el producto del carrusel');
        } finally {
            setLoading(false);
        }
    };

    const handleEliminar = async () => {
        if (!selectedProductId) {
            setError('Selecciona un producto para eliminar');
            return;
        }

        const estaEnCarrusel = productosDelMes.some(p => p.id === selectedProductId);
        if (!estaEnCarrusel) {
            setError('Este producto no está en el carrusel');
            return;
        }

        const productoNombre = todosLosProductos.find(p => p.id === selectedProductId)?.nombre || 'Producto';

        if (!confirm(`¿Estás seguro de que quieres eliminar "${productoNombre}" del carrusel?`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await eliminarProductoDelMes(selectedProductId);
            setSuccess(`"${productoNombre}" eliminado del carrusel exitosamente`);
            await cargarDatos();
            limpiarFormulario();

        } catch (error) {
            console.error('❌ Error al eliminar producto:', error);
            setError('Error al eliminar el producto del carrusel');
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el producto seleccionado está en el carrusel
    const productoSeleccionado = todosLosProductos.find(p => p.id === selectedProductId);
    const estaEnCarrusel = productosDelMes.some(p => p.id === selectedProductId);

    if (!isAdmin || !isMounted) return null;

    return createPortal(
        isOpen && (
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.header}>
                        <h2>
                            <FaStar className={styles.headerIcon} />
                            Gestión de Productos del Mes
                        </h2>
                        <button onClick={onClose} className={styles.closeButton}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className={styles.form}>
                        {/* Mensajes de estado */}
                        {error && (
                            <div className={styles.error}>
                                <FaExclamationTriangle />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className={styles.success}>
                                <FaCheckCircle />
                                {success}
                            </div>
                        )}

                        {loading && (
                            <div className={styles.loading}>
                                <FaSpinner className={styles.spinner} />
                                Procesando...
                            </div>
                        )}

                        {/* NUEVO: Mensaje informativo sobre precio */}
                        <div className={styles.priceWarning}>
                            <FaInfoCircle className={styles.warningIcon} />
                            <div className={styles.warningContent}>
                                <h4>Importante: Modificación del Precio Original</h4>
                                <p>
                                    Al agregar un producto al carrusel con un nuevo precio, 
                                    <strong> se modificará el precio original del producto</strong> en toda la tienda.
                                    Esta modificación será permanente y se conservará incluso si el producto 
                                    se elimina del carrusel.
                                </p>
                            </div>
                        </div>

                        {/* Sección de agregar/quitar productos */}
                        <div className={styles.section}>
                            <h3>
                                <FaPlus className={styles.sectionIcon} />
                                Agregar/Quitar Producto del Carrusel
                            </h3>

                            {/* Búsqueda de productos */}
                            <div className={styles.searchContainer}>
                                <label className={styles.label}>
                                    <FaSearch className={styles.labelIcon} />
                                    Buscar producto:
                                </label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Buscar por nombre, número de parte o descripción..."
                                    className={styles.searchInput}
                                />
                            </div>

                            {/* Selector de producto */}
                            <div className={styles.selectContainer}>
                                <label className={styles.label}>
                                    <FaBox className={styles.labelIcon} />
                                    Seleccionar producto:
                                </label>
                                <select
                                    value={selectedProductId}
                                    onChange={handleProductSelect}
                                    className={styles.productSelect}
                                >
                                    <option value="">-- Selecciona un producto --</option>
                                    {productosFiltrados.map(producto => (
                                        <option 
                                            key={producto.id} 
                                            value={producto.id}
                                        >
                                            {producto.nombre} | ${(producto.precioVentaSugerido || 0).toLocaleString()} | {producto.numeroParte}
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
                                        <p><strong>Precio Original:</strong> <FaDollarSign className={styles.priceIcon} />${(productoSeleccionado.precioVentaSugerido || 0).toLocaleString()}</p>
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

                                <button
                                    onClick={handleEliminar}
                                    disabled={!selectedProductId || !estaEnCarrusel || loading}
                                    className={styles.removeButton}
                                >
                                    <FaTrash className={styles.buttonIcon} />
                                    Quitar del Carrusel
                                </button>

                                <button
                                    onClick={limpiarFormulario}
                                    disabled={loading}
                                    className={styles.clearButton}
                                >
                                    <FaBroom className={styles.buttonIcon} />
                                    Limpiar
                                </button>
                            </div>
                        </div>

                        {/* Resumen de productos del mes */}
                        <div className={styles.summary}>
                            <h3>
                                <FaStar className={styles.sectionIcon} />
                                Productos Actuales en el Carrusel ({productosDelMes.length})
                            </h3>

                            {productosDelMes.length === 0 ? (
                                <p className={styles.noProducts}>
                                    <FaRegStar className={styles.emptyIcon} />
                                    No hay productos en el carrusel
                                </p>
                            ) : (
                                <div className={styles.productList}>
                                    {productosDelMes.map(producto => (
                                        <div key={producto.id} className={styles.productItem}>
                                            <div className={styles.productItemInfo}>
                                                <span className={styles.productName}>
                                                    <FaBox className={styles.productItemIcon} />
                                                    {producto.nombre}
                                                </span>
                                                <span className={styles.productPrice}>
                                                    <FaDollarSign />
                                                    ${(producto.precioVentaSugerido || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleEliminarDirecto(producto.id, producto.nombre)}
                                                className={styles.quickDeleteButton}
                                                disabled={loading}
                                                title={`Eliminar ${producto.nombre} del carrusel`}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ),
        document.body
    );
}