'use client';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth';
import {
    obtenerProductos,
    obtenerProductosDelMes,
    agregarProductosDelMes,
    eliminarProductoDelMes,
    actualizarPrecioProductoDelMes
} from '../../../services/productoService';
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

    // Estado para verificar si estamos montados (evitar hidration mismatch)
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
                    <h2>Gestión de Productos del Mes</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    {loading && (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Cargando...</p>
                        </div>
                    )}

                    {/* Barra de búsqueda */}
                    <div className={styles.searchSection}>
                        <label className={styles.label}>Buscar Producto:</label>
                        <div className={styles.searchContainer}>
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
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Lista desplegable de productos */}
                    <div className={styles.selectSection}>
                        <label className={styles.label}>Seleccionar Producto:</label>
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
                            {productosFiltrados.length} productos encontrados
                        </p>
                    </div>

                    {/* Información del producto seleccionado */}
                    {productoSeleccionado && (
                        <div className={styles.productInfo}>
                            <h3>Producto Seleccionado:</h3>
                            <div className={styles.productDetails}>
                                <p><strong>Nombre:</strong> {productoSeleccionado.nombre}</p>
                                <p><strong>Número de Parte:</strong> {productoSeleccionado.numeroParte || 'No disponible'}</p>
                                <p><strong>Precio Original:</strong> ${(productoSeleccionado.precioVentaSugerido || 0).toLocaleString()}</p>
                                <p><strong>Estado:</strong>
                                    <span className={estaEnCarrusel ? styles.enCarrusel : styles.noEnCarrusel}>
                                        {estaEnCarrusel ? ' ⭐ En carrusel' : ' No está en carrusel'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Campo de precio temporal */}
                    <div className={styles.priceSection}>
                        <label className={styles.label}>Precio Temporal para el Carrusel:</label>
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

                    {/* Mensajes de estado */}
                    {error && <div className={styles.error}>{error}</div>}
                    {success && <div className={styles.success}>{success}</div>}

                    {/* Botones de acción */}
                    <div className={styles.actions}>
                        <button
                            onClick={handleAgregar}
                            disabled={loading || !selectedProductId || !precioTemporal}
                            className={styles.addButton}
                        >
                            {estaEnCarrusel ? 'Actualizar Precio' : 'Añadir al Carrusel'}
                        </button>

                        <button
                            onClick={handleEliminar}
                            disabled={loading || !selectedProductId || !estaEnCarrusel}
                            className={styles.removeButton}
                        >
                            Eliminar del Carrusel
                        </button>

                        <button
                            onClick={limpiarFormulario}
                            disabled={loading}
                            className={styles.clearButton}
                        >
                            Limpiar Formulario
                        </button>
                    </div>

                    {/* Resumen de productos del mes */}
                    <div className={styles.summary}>
                        <h3>Productos Actuales en el Carrusel ({productosDelMes.length}):</h3>
                        {productosDelMes.length === 0 ? (
                            <p className={styles.noProducts}>No hay productos en el carrusel actualmente</p>
                        ) : (
                            <div className={styles.productList}>
                                {productosDelMes.map(producto => (
                                    <div key={producto.id} className={styles.productItem}>
                                        <span className={styles.productName}>{producto.nombre}</span>
                                        <span className={styles.productPrice}>${producto.precioMes?.toLocaleString()}</span>
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