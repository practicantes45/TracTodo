'use client';
import './productos.css';
import { FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser, FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import SEOHead from '../components/SEOHead/SEOHead';
import { obtenerProductos, buscarProductos } from '../../services/productoService';
import { registrarVista } from '../../services/trackingService';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminButtons from '../components/AdminButtons/AdminButtons';
import { getProductSlug } from '../../utils/slugUtils';
import { useSEO } from '../../hooks/useSEO';
import { getPreviewDescription, getShortPreviewDescription } from '../../utils/textUtils';
import { formatearPrecio, formatearPrecioWhatsApp } from '../../utils/priceUtils';

// Constante para productos por página
const PRODUCTOS_POR_PAGINA = 15;

export default function ProductosPage() {
  // Estados existentes
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Estados para filtros
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState('A-Z');
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);
  const [filtrosInicializados, setFiltrosInicializados] = useState(false);

  // Estados para paginación
  const [productosVisibles, setProductosVisibles] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMasProductos, setHayMasProductos] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);

  const searchParams = useSearchParams();
  const busquedaParam = searchParams.get('busqueda');
  const marcaParam = searchParams.get('marca');

  // Hook SEO para página de productos
  const { seoData } = useSEO('productos', { path: '/productos' });

  console.log('🔍 Parámetro de búsqueda:', busquedaParam);
  console.log('🏷️ Parámetro de marca:', marcaParam);

  // Lista de marcas predefinidas
  const marcasPredefinidas = ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Detroit", "Caterpillar", "Otros"];

  // Lista de contactos
  const contactList = [
    {
      name: "Alan",
      phoneNumber: "+524272245923",
      message: "Hola Alan, estoy interesado en {producto} con precio de ${precio}. ¿Podrías proporcionarme más información?"
    },
    {
      name: "Laura",
      phoneNumber: "+524272033515",
      message: "Hola Laura, estoy interesado en {producto} con precio de ${precio}. ¿Podrías proporcionarme más información?"
    },
    {
      name: "Oscar",
      phoneNumber: "+524272032672",
      message: "Hola Oscar, estoy interesado en {producto} con precio de ${precio}. ¿Podrías proporcionarme más información?"
    },
    {
      name: "Hugo",
      phoneNumber: "+524424128926",
      message: "Hola Hugo, estoy interesado en {producto} con precio de ${precio}. ¿Podrías proporcionarme más información?"
    }
  ];

  // MODIFICADO: Efecto combinado para inicializar filtros y cargar productos
  useEffect(() => {
    const inicializarFiltrosYCargar = async () => {
      console.log('🔄 Inicializando filtros desde URL...');

      // Inicializar marca si viene desde URL
      let marcasIniciales = [];
      if (marcaParam && marcasPredefinidas.includes(marcaParam)) {
        console.log('🔄 Inicializando con marca desde URL:', marcaParam);
        marcasIniciales = [marcaParam];
        setSelectedMarcas([marcaParam]);
      }

      // Marcar como inicializados
      setFiltrosInicializados(true);

      // Cargar productos con los filtros iniciales
      await cargarProductosConFiltros(marcasIniciales, selectedOrden, busquedaParam);
    };

    inicializarFiltrosYCargar();
  }, [marcaParam, busquedaParam]);

  // MODIFICADO: Efecto para cargar productos cuando cambian los filtros (después de la inicialización)
  useEffect(() => {
    if (filtrosInicializados) {
      console.log('🔄 Filtros cambiados, recargando productos...');
      cargarProductosConFiltros(selectedMarcas, selectedOrden, busquedaParam);
    }
  }, [selectedMarcas, selectedOrden, filtrosInicializados]);

  // Efecto para actualizar productos visibles cuando cambian los productos o la página
  useEffect(() => {
    actualizarProductosVisibles();
  }, [productos, paginaActual]);

  // Función para actualizar productos visibles basado en paginación
  const actualizarProductosVisibles = () => {
    const startIndex = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const endIndex = startIndex + PRODUCTOS_POR_PAGINA;
    const nuevosProductosVisibles = productos.slice(0, endIndex);
    
    setProductosVisibles(nuevosProductosVisibles);
    setHayMasProductos(endIndex < productos.length);
    
    console.log(`📄 Página ${paginaActual}: Mostrando ${nuevosProductosVisibles.length} de ${productos.length} productos`);
  };

  const cargarMasProductos = async () => {
    if (cargandoMas || !hayMasProductos) return;
    
    setCargandoMas(true);
    setPaginaActual(prev => prev + 1);
    setCargandoMas(false);
  };

  // Función para cargar productos con filtros
  const cargarProductosConFiltros = async (marcas = [], orden = 'A-Z', busqueda = '') => {
    try {
      setLoading(true);
      setError('');
      setPaginaActual(1);

      let productosData = [];

      if (busqueda) {
        console.log('🔍 Realizando búsqueda:', busqueda);
        productosData = await buscarProductos(busqueda);
        console.log('📊 Resultados de búsqueda:', productosData.length);
      } else {
        console.log('📦 Cargando todos los productos');
        productosData = await obtenerProductos();
        console.log('📊 Total de productos cargados:', productosData.length);
      }

      // Aplicar filtros de marca
      if (marcas.length > 0) {
        const productosFiltradosPorMarca = productosData.filter(producto => {
          const marcaProducto = producto.marca || 'Otros';
          return marcas.includes(marcaProducto);
        });
        console.log(`🏷️ Filtrado por marcas [${marcas.join(', ')}]:`, productosFiltradosPorMarca.length);
        productosData = productosFiltradosPorMarca;
      }

      // Aplicar ordenamiento
      const productosOrdenados = ordenarProductos(productosData, orden);
      setProductos(productosOrdenados);

      // Extraer marcas únicas disponibles
      const marcasUnicas = [...new Set(productosData.map(p => p.marca || 'Otros'))];
      setMarcasDisponibles(marcasUnicas.sort());

    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      setError('Error al cargar productos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const ordenarProductos = (productosArray, orden) => {
    const productosOrdenados = [...productosArray];
    
    switch (orden) {
      case 'A-Z':
        return productosOrdenados.sort((a, b) => 
          (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' })
        );
      case 'Z-A':
        return productosOrdenados.sort((a, b) => 
          (b.nombre || '').localeCompare(a.nombre || '', 'es', { sensitivity: 'base' })
        );
      case 'precio-bajo':
        return productosOrdenados.sort((a, b) => 
          (a.precioVentaSugerido || 0) - (b.precioVentaSugerido || 0)
        );
      case 'precio-alto':
        return productosOrdenados.sort((a, b) => 
          (b.precioVentaSugerido || 0) - (a.precioVentaSugerido || 0)
        );
      default:
        return productosOrdenados;
    }
  };

  const handleWhatsAppClick = (producto, e) => {
    e.preventDefault();
    e.stopPropagation();

    const randomContact = contactList[Math.floor(Math.random() * contactList.length)];
    const precio = producto.precioVentaSugerido || 0;
    const personalizedMessage = randomContact.message
      .replace('{producto}', producto.nombre)
      .replace('{precio}', formatearPrecioWhatsApp(precio));

    const cleanPhoneNumber = randomContact.phoneNumber.replace(/\\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('52')
      ? cleanPhoneNumber
      : `52${cleanPhoneNumber}`;

    const encodedMessage = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleProductClick = async (producto) => {
    try {
      await registrarVista(producto.id, 'producto');
      console.log('👀 Vista registrada para producto:', producto.id);
    } catch (error) {
      console.warn('⚠️ Error registrando vista:', error);
    }

    const slug = getProductSlug(producto.nombre);
    const currentParams = new URLSearchParams();
    
    if (busquedaParam) currentParams.set('busqueda', busquedaParam);
    if (marcaParam) currentParams.set('marca', marcaParam);
    
    const queryString = currentParams.toString();
    const targetUrl = queryString 
      ? `/productos/${slug}?${queryString}`
      : `/productos/${slug}`;
    
    router.push(targetUrl);
  };

  const handleMarcaChange = (marca) => {
    const nuevasMarcas = selectedMarcas.includes(marca)
      ? selectedMarcas.filter(m => m !== marca)
      : [...selectedMarcas, marca];

    console.log('🔄 Cambiando filtro de marca:', { marca, nuevasMarcas });
    setSelectedMarcas(nuevasMarcas);
  };

  const handleOrdenChange = (nuevoOrden) => {
    console.log('🔄 Cambiando orden:', nuevoOrden);
    setSelectedOrden(nuevoOrden);
  };

  const clearAllFilters = () => {
    console.log('🧹 Limpiando todos los filtros');
    setSelectedMarcas([]);
    setSelectedOrden('A-Z');
  };

  const clearSearch = () => {
    console.log('🔄 Borrando búsqueda y reseteando filtros');
    router.push('/productos');
  };

  // CORREGIDO: Schema.org para la página de productos con MXN
  const schemaProductCatalog = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de Refacciones para Tractocamión",
    "description": "Amplio catálogo de refacciones para tractocamión: turbos, cabezas de motor, árboles de levas y más",
    "numberOfItems": productos.length,
    "itemListElement": productosVisibles.slice(0, 10).map((producto, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": producto.nombre,
        "description": producto.descripcion,
        "sku": producto.numeroParte,
        "brand": {
          "@type": "Brand",
          "name": producto.marca || "Cummins"
        },
        "offers": {
          "@type": "Offer",
          "price": (producto.precioVentaSugerido || 0).toString(),
          "priceCurrency": "MXN",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        data={seoData}
        structuredData={schemaProductCatalog}
      />
      <Navbar />
      <div className="main-content">
        <div className="productos-container">
          
          {/* Header de productos */}
          <div className="productos-header">
            <div className="header-content">
              <h1 className="productos-title">
                {busquedaParam 
                  ? `Resultados para "${busquedaParam}"` 
                  : marcaParam 
                    ? `Productos ${marcaParam}`
                    : 'Catálogo de Productos'
                }
              </h1>
              <p className="productos-subtitle">
                {busquedaParam || marcaParam 
                  ? `Encontramos ${productos.length} productos` 
                  : 'Refacciones de calidad para tu tractocamión'
                }
              </p>
              
              {(busquedaParam || marcaParam) && (
                <button 
                  onClick={clearSearch}
                  className="clear-search-btn"
                >
                  <FaTimes /> Ver todos los productos
                </button>
              )}
            </div>
          </div>

          {/* Controles de filtro y ordenamiento */}
          <div className="controles-container">
            <div className="controles-content">
              
              {/* Botón de filtros móvil */}
              <button 
                className="mobile-filter-toggle"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <FaFilter />
                Filtros {selectedMarcas.length > 0 && `(${selectedMarcas.length})`}
                <FaChevronDown className={isMobileFilterOpen ? 'rotated' : ''} />
              </button>

              {/* Panel de filtros */}
              <div className={`filtros-panel ${isMobileFilterOpen ? 'mobile-open' : ''}`}>
                <div className="filtros-header">
                  <h3><FaFilter /> Filtros</h3>
                  {selectedMarcas.length > 0 && (
                    <button onClick={clearAllFilters} className="clear-filters">
                      <FaEraser /> Limpiar
                    </button>
                  )}
                </div>

                <div className="filtros-content">
                  <div className="filtro-grupo">
                    <h4>Marcas</h4>
                    <div className="marcas-grid">
                      {marcasPredefinidas.map(marca => (
                        <label key={marca} className="marca-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedMarcas.includes(marca)}
                            onChange={() => handleMarcaChange(marca)}
                          />
                          <span>{marca}</span>
                          <span className="marca-count">
                            ({productos.filter(p => (p.marca || 'Otros') === marca).length})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botón cerrar en móvil */}
                <button 
                  className="mobile-filter-close"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  <FaTimes /> Cerrar
                </button>
              </div>

              {/* Selector de ordenamiento */}
              <div className="orden-selector">
                <FaSortAlphaDown className="orden-icon" />
                <select 
                  value={selectedOrden} 
                  onChange={(e) => handleOrdenChange(e.target.value)}
                  className="orden-select"
                >
                  <option value="A-Z">A-Z</option>
                  <option value="Z-A">Z-A</option>
                  <option value="precio-bajo">Precio: Menor a Mayor</option>
                  <option value="precio-alto">Precio: Mayor a Menor</option>
                </select>
              </div>

              {/* Resultados counter */}
              <div className="resultados-info">
                <span className="resultados-count">
                  {productosVisibles.length} de {productos.length} productos
                </span>
              </div>
            </div>
          </div>

          {/* Grid de productos */}
          {error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
            </div>
          ) : productos.length === 0 ? (
            <div className="no-products">
              <h3>No se encontraron productos</h3>
              <p>Intenta con diferentes filtros o términos de búsqueda</p>
              {(busquedaParam || selectedMarcas.length > 0) && (
                <button onClick={clearAllFilters} className="reset-button">
                  Ver todos los productos
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="productos-grid">
                {productosVisibles.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="productoCard"
                    onClick={() => handleProductClick(producto)}
                  >
                    <div className="productoImageContainer">
                      {producto.imagenesUrl?.frente || producto.imagenUrl || producto.imagen ? (
                        <img 
                          src={producto.imagenesUrl?.frente || producto.imagenUrl || producto.imagen}
                          alt={producto.nombre}
                          className="productoImage"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      <div className="imagePlaceholder" style={{ 
                        display: (producto.imagenesUrl?.frente || producto.imagenUrl || producto.imagen) ? 'none' : 'flex' 
                      }}>
                        <span>📦</span>
                        <p>Imagen no disponible</p>
                      </div>
                    </div>

                    <div className="productoInfo">
                      <h3 className="productoNombre">{producto.nombre}</h3>
                      
                      <p className="productoDescripcion">
                        {getShortPreviewDescription(producto.descripcion, 80)}
                      </p>

                      <div className="productoPrecio">
                        {formatearPrecio(producto.precioVentaSugerido || 0)}
                      </div>

                      <button 
                        className="whatsappBtn"
                        onClick={(e) => handleWhatsAppClick(producto, e)}
                      >
                        <FaWhatsapp />
                        Consultar por WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón cargar más */}
              {hayMasProductos && (
                <div className="cargar-mas-container">
                  <button 
                    onClick={cargarMasProductos}
                    disabled={cargandoMas}
                    className="cargar-mas-btn"
                  >
                    {cargandoMas ? 'Cargando...' : 'Cargar más productos'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <AdminButtons />
      <ScrollToTop />
      <Footer />
    </>
  );
}