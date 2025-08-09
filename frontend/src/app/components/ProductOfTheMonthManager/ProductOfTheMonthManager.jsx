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
    FaBroom
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
    const [precioTemporal, setPrecioTemporal] = useState('');

    // Estado para verificar si estamos montados (evitar hydration mismatch)
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

            // Cargar todos los productos y productos del mes en paralelo
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
        setSelectedProductId(''); // Limpiar selección al buscar
    };

    const handleProductSelect = (e) => {
        const productId = e.target.value;
        setSelectedProductId(productId);

        // Si el producto ya está en el mes, prellenar su precio
        const productoEnMes = productosDelMes.find(p => p.id === productId);
        if (productoEnMes) {
            setPrecioTemporal(productoEnMes.precioMes || '');
        } else {
            // Si no está, usar el precio original como sugerencia
            const producto = todosLosProductos.find(p => p.id === productId);
            setPrecioTemporal(producto?.precioVentaSugerido || '');
        }
    };

    const limpiarFormulario = () => {
        setSelectedProductId('');
        setPrecioTemporal('');
        setSearchQuery('');
        setError('');
        setSuccess('');
    };

    const handleAgregar = async () => {
        if (!selectedProductId || !precioTemporal) {
            setError('Selecciona un producto y especifica el precio');
            return;
        }

        const precio = parseFloat(precioTemporal);
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
            console.log('💰 Precio temporal:', precio);

            // Crear el array con la estructura correcta
            const productos = [{
                id: selectedProductId,
                precioMes: precio
            }];

            console.log('📤 Datos que se van a enviar al backend:', productos);

            const resultado = await agregarProductosDelMes(productos);

            console.log('✅ Respuesta del backend:', resultado);

            setSuccess('Producto agregado al carrusel exitosamente');

            // Esperar un poco antes de recargar para que se procese en el backend
            console.log('🔄 Recargando datos...');
            setTimeout(async () => {
                await cargarDatos();
                limpiarFormulario();
            }, 1000); // Aumentado a 1 segundo

        } catch (error) {
            console.error('❌ Error completo al agregar producto:', error);
            setError(`Error al agregar el producto: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // NUEVA FUNCIÓN: Eliminar producto directamente desde la lista
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
            await cargarDatos(); // Recargar datos

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

        // Verificar si el producto está en el carrusel
        const estaEnCarrusel = productosDelMes.some(p => p.id === selectedProductId);
        if (!estaEnCarrusel) {
            setError('Este producto no está en el carrusel');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await eliminarProductoDelMes(selectedProductId);

            setSuccess('Producto eliminado del carrusel exitosamente');
            await cargarDatos(); // Recargar datos
            limpiarFormulario();

        } catch (error) {
            console.error('❌ Error al eliminar producto:', error);
            setError('Error al eliminar el producto del carrusel');
        } finally {
            setLoading(false);
        }
    };

    const productoSeleccionado = todosLosProductos.find(p => p.id === selectedProductId);
    const estaEnCarrusel = productosDelMes.some(p => p.id === selectedProductId);

    // Limpiar mensajes después de unos segundos
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // No renderizar si no está montado o no está abierto o no es admin
    if (!isMounted || !isOpen || !isAdmin) return null;

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2><FaBox className={styles.headerIcon} /> Gestión de Productos del Mes</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.content}>
                    {loading && (
                        <div className={styles.loading}>
                            <FaSpinner className={styles.spinner} />
                            <p>Cargando...</p>
                        </div>
                    )}

                    {/* Barra de búsqueda */}
                    <div className={styles.searchSection}>
                        <label className={styles.label}>
                            <FaSearch className={styles.labelIcon} />
                            Buscar Producto:
                        </label>
                        <div className={styles.searchContainer}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Buscar por nombre, número de parte o descripción..."
                                className={styles.searchInput}
                            />
                            <button
                                type="button"
                                className={styles.clearSearch}
                                onClick={() => setSearchQuery('')}
                                title="Limpiar búsqueda"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Lista desplegable de productos */}
                    <div className={styles.selectSection}>
                        <label className={styles.label}>
                            <FaBox className={styles.labelIcon} />
                            Seleccionar Producto:
                        </label>
                        <select
                            value={selectedProductId}
                            onChange={handleProductSelect}
                            className={styles.productSelect}
                            disabled={loading}
                        >
                            <option value="">-- Selecciona un producto --</option>
                            {productosFiltrados.map(producto => (
                                <option key={producto.id} value={producto.id}>
                                    {producto.nombre} - {producto.numeroParte || 'Sin número'}
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
                                        {estaEnCarrusel ? <><FaStar className={styles.statusIcon} /> En carrusel</> : <><FaRegStar className={styles.statusIcon} /> No está en carrusel</>}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Campo de precio temporal */}
                    <div className={styles.priceSection}>
                        <label className={styles.label}>
                            <FaDollarSign className={styles.labelIcon} />
                            Precio Temporal para el Carrusel:
                        </label>
                        <div className={styles.priceInputContainer}>
                            <FaDollarSign className={styles.priceInputIcon} />
                            <input
                                type="number"
                                value={precioTemporal}
                                onChange={(e) => setPrecioTemporal(e.target.value)}
                                placeholder="Precio en pesos mexicanos"
                                className={styles.priceInput}
                                min="0"
                                step="0.01"
                                disabled={loading}
                            />
                        </div>
                    </div>

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

                    {/* Botones de acción */}
                    <div className={styles.actions}>
                        <button
                            onClick={handleAgregar}
                            disabled={loading || !selectedProductId || !precioTemporal}
                            className={styles.addButton}
                        >
                            <FaPlus className={styles.buttonIcon} />
                            {estaEnCarrusel ? 'Actualizar Precio' : 'Añadir al Carrusel'}
                        </button>

                        <button
                            onClick={handleEliminar}
                            disabled={loading || !selectedProductId || !estaEnCarrusel}
                            className={styles.removeButton}
                        >
                            <FaTrash className={styles.buttonIcon} />
                            Eliminar del Carrusel
                        </button>

                        <button
                            onClick={limpiarFormulario}
                            disabled={loading}
                            className={styles.clearButton}
                        >
                            <FaBroom className={styles.buttonIcon} />
                            Limpiar Formulario
                        </button>
                    </div>

                    {/* Resumen de productos del mes con botones de eliminación */}
                    <div className={styles.summary}>
                        <h3>
                            <FaStar className={styles.sectionIcon} />
                            Productos Actuales en el Carrusel ({productosDelMes.length}):
                        </h3>
                        {productosDelMes.length === 0 ? (
                            <p className={styles.noProducts}>
                                <FaRegStar className={styles.emptyIcon} />
                                No hay productos en el carrusel actualmente
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
                                                <FaDollarSign className={styles.priceIcon} />
                                                ${producto.precioMes?.toLocaleString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleEliminarDirecto(producto.id, producto.nombre)}
                                            className={styles.quickDeleteButton}
                                            title={`Eliminar ${producto.nombre} del carrusel`}
                                            disabled={loading}
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
        </div>,
        document.body
    );
}