'use client';
import './productos.css';
import { FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser, FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import SEOHead from '../components/SEOHead/SEOHead';
import { obtenerProductosConSEO, buscarProductos } from '../../services/productoService';
import { registrarVista } from '../../services/trackingService';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminButtons from '../components/AdminButtons/AdminButtons';
import { getProductSlug } from '../../utils/slugUtils';
import { useSEO } from '../hooks/useSEO';

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
      message: "Hola Alan, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
    },
    {
      name: "Laura",
      phoneNumber: "+524272033515",
      message: "Hola Laura, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
    },
    {
      name: "Oscar",
      phoneNumber: "+524272032672",
      message: "Hola Oscar, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
    },
    {
      name: "Hugo",
      phoneNumber: "+524424128926",
      message: "Hola Hugo, estoy interesado en {producto} con precio de ${precio}. ¿Podría proporcionarme más información?"
    }
  ];

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  // Inicializar filtros cuando se detectan parámetros URL
  useEffect(() => {
    if (!filtrosInicializados && (busquedaParam || marcaParam)) {
      console.log('🔧 Inicializando filtros desde URL...');
      
      if (marcaParam && marcasPredefinidas.includes(marcaParam)) {
        setSelectedMarcas([marcaParam]);
        console.log('🏷️ Marca aplicada desde URL:', marcaParam);
      }
      
      setFiltrosInicializados(true);
    }
  }, [busquedaParam, marcaParam, filtrosInicializados]);

  // Aplicar filtros cuando cambien las marcas seleccionadas
  useEffect(() => {
    if (filtrosInicializados) {
      console.log('🔍 Aplicando filtros automaticamente...');
      aplicarFiltros();
    }
  }, [selectedMarcas, selectedOrden, filtrosInicializados]);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError('');
      
      let data;
      
      if (busquedaParam) {
        // Si hay búsqueda, usar el endpoint de búsqueda con SEO
        data = await buscarProductos({ 
          q: busquedaParam,
          incluirSEO: true 
        });
        console.log('🔍 Resultados de búsqueda cargados:', data?.length || 0);
      } else {
        // Cargar productos normales con SEO
        data = await obtenerProductosConSEO();
        console.log('📦 Productos con SEO cargados:', data?.length || 0);
      }
      
      if (Array.isArray(data)) {
        setProductos(data);
        
        // Extraer marcas disponibles
        const marcas = [...new Set(data.map(p => p.marca).filter(Boolean))];
        setMarcasDisponibles(marcas);
        console.log('🏷️ Marcas disponibles encontradas:', marcas);
        
        // Configurar paginación inicial
        configurarPaginacion(data);
      } else {
        console.error('❌ Formato de datos inesperado:', data);
        setError('Formato de datos inesperado del servidor');
      }
    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      setError(`Error al cargar productos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    if (!productos.length) return;
    
    console.log('🔍 Aplicando filtros:', { marcas: selectedMarcas, orden: selectedOrden });
    
    let productosFiltrados = [...productos];
    
    // Filtrar por marcas
    if (selectedMarcas.length > 0) {
      productosFiltrados = productosFiltrados.filter(producto => 
        selectedMarcas.includes(producto.marca)
      );
      console.log('🏷️ Después de filtrar por marca:', productosFiltrados.length);
    }
    
    // Aplicar ordenamiento
    productosFiltrados.sort((a, b) => {
      const nombreA = (a.nombre || '').toLowerCase();
      const nombreB = (b.nombre || '').toLowerCase();
      
      if (selectedOrden === 'A-Z') {
        return nombreA.localeCompare(nombreB);
      } else {
        return nombreB.localeCompare(nombreA);
      }
    });
    
    console.log('✅ Productos después de filtros y orden:', productosFiltrados.length);
    
    // Configurar paginación con productos filtrados
    configurarPaginacion(productosFiltrados);
  };

  const configurarPaginacion = (productosParaPaginar) => {
    const primeraPagina = productosParaPaginar.slice(0, PRODUCTOS_POR_PAGINA);
    setProductosVisibles(primeraPagina);
    setPaginaActual(1);
    setHayMasProductos(productosParaPaginar.length > PRODUCTOS_POR_PAGINA);
    
    console.log('📄 Paginación configurada:', {
      total: productosParaPaginar.length,
      primeraPagina: primeraPagina.length,
      hayMas: productosParaPaginar.length > PRODUCTOS_POR_PAGINA
    });
  };

  const cargarMasProductos = () => {
    if (cargandoMas || !hayMasProductos) return;
    
    setCargandoMas(true);
    
    setTimeout(() => {
      // Obtener productos filtrados actuales
      let productosFiltrados = [...productos];
      
      if (selectedMarcas.length > 0) {
        productosFiltrados = productosFiltrados.filter(producto => 
          selectedMarcas.includes(producto.marca)
        );
      }
      
      // Aplicar ordenamiento
      productosFiltrados.sort((a, b) => {
        const nombreA = (a.nombre || '').toLowerCase();
        const nombreB = (b.nombre || '').toLowerCase();
        return selectedOrden === 'A-Z' ? 
          nombreA.localeCompare(nombreB) : 
          nombreB.localeCompare(nombreA);
      });
      
      const siguientePagina = paginaActual + 1;
      const inicio = 0;
      const fin = siguientePagina * PRODUCTOS_POR_PAGINA;
      
      const nuevosProductosVisibles = productosFiltrados.slice(inicio, fin);
      
      setProductosVisibles(nuevosProductosVisibles);
      setPaginaActual(siguientePagina);
      setHayMasProductos(fin < productosFiltrados.length);
      setCargandoMas(false);
      
      console.log('📄 Más productos cargados:', {
        pagina: siguientePagina,
        visibles: nuevosProductosVisibles.length,
        hayMas: fin < productosFiltrados.length
      });
    }, 500);
  };

  const toggleMarcaFiltro = (marca) => {
    setSelectedMarcas(prev => {
      const nuevasMarcas = prev.includes(marca)
        ? prev.filter(m => m !== marca)
        : [...prev, marca];
      
      console.log('🏷️ Marcas seleccionadas actualizadas:', nuevasMarcas);
      return nuevasMarcas;
    });
  };

  const limpiarFiltros = () => {
    console.log('🧹 Limpiando todos los filtros...');
    setSelectedMarcas([]);
    setSelectedOrden('A-Z');
  };

  const handleProductClick = async (producto) => {
    try {
      // Registrar vista
      await registrarVista(producto.id, 'producto');
      
      // Generar slug para URL amigable
      const slug = getProductSlug(producto);
      
      // Navegar a la página del producto
      router.push(`/productos/${slug}`);
    } catch (error) {
      console.error('Error al registrar vista:', error);
      // Continuar con la navegación aunque falle el registro
      const slug = getProductSlug(producto);
      router.push(`/productos/${slug}`);
    }
  };

  const getRandomContact = () => {
    return contactList[Math.floor(Math.random() * contactList.length)];
  };

  const handleWhatsAppClick = (producto) => {
    const contact = getRandomContact();
    const message = contact.message
      .replace('{producto}', producto.nombre || 'este producto')
      .replace('{precio}', producto.precio || 'consultar');
    
    const whatsappUrl = `https://wa.me/${contact.phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price) => {
    if (!price) return 'Consultar precio';
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Consultar precio';
    
    return `$${numPrice.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Schema.org para la página de productos
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
          "name": producto.marca
        },
        "offers": {
          "@type": "Offer",
          "price": producto.precio || "0",
          "priceCurrency": "MXN",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  if (loading) {
    return (
      <>
        {seoData && (
          <SEOHead
            title={seoData.title}
            description={seoData.description}
            keywords={seoData.keywords}
            ogTitle={seoData.ogTitle}
            ogDescription={seoData.ogDescription}
            ogImage={seoData.ogImage}
            ogUrl={seoData.ogUrl}
            canonicalUrl={seoData.canonicalUrl}
          />
        )}
        <div className="layout productos-page">
          <Navbar />
          <main className="mainContent">
            <div className="loadingContainer">
              <div className="loadingSpinner"></div>
              <p>Cargando productos...</p>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {seoData && (
          <SEOHead
            title={seoData.title}
            description={seoData.description}
            keywords={seoData.keywords}
            canonicalUrl={seoData.canonicalUrl}
          />
        )}
        <div className="layout productos-page">
          <Navbar />
          <main className="mainContent">
            <div className="errorContainer">
              <h2>Error al cargar productos</h2>
              <p>{error}</p>
              <button onClick={cargarProductos} className="retryButton">
                Intentar de nuevo
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO Head */}
      {seoData && (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          ogTitle={seoData.ogTitle}
          ogDescription={seoData.ogDescription}
          ogImage={seoData.ogImage}
          ogUrl={seoData.ogUrl}
          canonicalUrl={seoData.canonicalUrl}
          schema={schemaProductCatalog}
        />
      )}

      <div className="layout productos-page">
        <Navbar />

        <main className="mainContent">
          {/* Hero Section */}
          <div className="heroSection">
            <div className="heroOverlay">
              <div className="heroContent">
                <h1>
                  {busquedaParam 
                    ? `Resultados para "${busquedaParam}"` 
                    : marcaParam 
                      ? `Productos ${marcaParam}`
                      : 'Nuestros Productos'
                  }
                </h1>
                <p>
                  {busquedaParam 
                    ? `Encontramos ${productosVisibles.length} productos relacionados`
                    : 'Refacciones de calidad para tu tractocamión'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Sección principal de productos */}
          <section className="productosMainSection">
            <div className="productosContainer">
              
              {/* Filtros móviles */}
              <div className="mobileFiltersContainer">
                <button 
                  className="mobileFilterButton"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                >
                  <FaFilter />
                  Filtros
                  {(selectedMarcas.length > 0) && (
                    <span className="filterBadge">{selectedMarcas.length}</span>
                  )}
                </button>
              </div>

              <div className="productosLayout">
                
                {/* Sidebar de filtros */}
                <aside className={`filtersSidebar ${isMobileFilterOpen ? 'open' : ''}`}>
                  <div className="filtersHeader">
                    <h3>Filtros</h3>
                    <button 
                      className="closeFiltersButton"
                      onClick={() => setIsMobileFilterOpen(false)}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Filtro por marca */}
                  <div className="filterGroup">
                    <h4>Marca</h4>
                    <div className="marcasList">
                      {marcasPredefinidas.map(marca => {
                        const count = productos.filter(p => p.marca === marca).length;
                        if (count === 0) return null;
                        
                        return (
                          <label key={marca} className="marcaCheckbox">
                            <input
                              type="checkbox"
                              checked={selectedMarcas.includes(marca)}
                              onChange={() => toggleMarcaFiltro(marca)}
                            />
                            <span className="checkmark"></span>
                            <span className="marcaLabel">
                              {marca} ({count})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtro de orden */}
                  <div className="filterGroup">
                    <h4>Ordenar por</h4>
                    <div className="ordenButtons">
                      <button
                        className={`ordenButton ${selectedOrden === 'A-Z' ? 'active' : ''}`}
                        onClick={() => setSelectedOrden('A-Z')}
                      >
                        <FaSortAlphaDown />
                        A-Z
                      </button>
                      <button
                        className={`ordenButton ${selectedOrden === 'Z-A' ? 'active' : ''}`}
                        onClick={() => setSelectedOrden('Z-A')}
                      >
                        <FaSortAlphaUp />
                        Z-A
                      </button>
                    </div>
                  </div>

                  {/* Botón limpiar filtros */}
                  {(selectedMarcas.length > 0 || selectedOrden !== 'A-Z') && (
                    <button 
                      className="clearFiltersButton"
                      onClick={limpiarFiltros}
                    >
                      <FaEraser />
                      Limpiar filtros
                    </button>
                  )}
                </aside>

                {/* Contenido principal */}
                <div className="productosContent">
                  
                  {/* Resumen de filtros activos */}
                  {(selectedMarcas.length > 0) && (
                    <div className="activeFilters">
                      <span>Filtros activos:</span>
                      {selectedMarcas.map(marca => (
                        <span key={marca} className="activeFilter">
                          {marca}
                          <button onClick={() => toggleMarcaFiltro(marca)}>
                            <FaTimes />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contador de resultados */}
                  <div className="resultsHeader">
                    <p>
                      Mostrando {productosVisibles.length} de {
                        selectedMarcas.length > 0 
                          ? productos.filter(p => selectedMarcas.includes(p.marca)).length
                          : productos.length
                      } productos
                    </p>
                  </div>

                  {/* Grid de productos */}
                  {productosVisibles.length > 0 ? (
                    <>
                      <div className="productosGrid">
                        {productosVisibles.map((producto) => (
                          <div key={producto.id} className="productoCard">
                            <div className="productoImageContainer">
                              <img 
                                src={producto.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                                alt={`${producto.nombre} - ${producto.marca} ${producto.numeroParte}`}
                                className="productoImage"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                                }}
                              />
                              
                              {/* Badge de marca */}
                              {producto.marca && (
                                <div className="marcaBadge">
                                  {producto.marca}
                                </div>
                              )}
                            </div>
                            
                            <div className="productoInfo">
                              <h3 
                                className="productoNombre"
                                onClick={() => handleProductClick(producto)}
                              >
                                {producto.nombre}
                              </h3>
                              
                              {producto.numeroParte && (
                                <p className="productoNumero">
                                  Parte: {producto.numeroParte}
                                </p>
                              )}
                              
                              {producto.descripcion && (
                                <p className="productoDescripcion">
                                  {producto.descripcion.length > 100 
                                    ? `${producto.descripcion.substring(0, 100)}...`
                                    : producto.descripcion
                                  }
                                </p>
                              )}
                              
                              <div className="productoPrecio">
                                {formatPrice(producto.precio)}
                              </div>
                              
                              {/* Mostrar datos SEO si están disponibles */}
                              {producto.seo && (
                                <div className="seoIndicator" title="Producto optimizado para SEO">
                                  ⭐ SEO
                                </div>
                              )}
                            </div>
                            
                            <div className="productoActions">
                              <button
                                className="verDetallesButton"
                                onClick={() => handleProductClick(producto)}
                              >
                                Ver detalles
                              </button>
                              
                              <button
                                className="whatsappButton"
                                onClick={() => handleWhatsAppClick(producto)}
                                title="Consultar por WhatsApp"
                              >
                                <FaWhatsapp />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Botón cargar más */}
                      {hayMasProductos && (
                        <div className="loadMoreContainer">
                          <button
                            className="loadMoreButton"
                            onClick={cargarMasProductos}
                            disabled={cargandoMas}
                          >
                            {cargandoMas ? (
                              <>
                                <div className="loadingSpinner small"></div>
                                Cargando...
                              </>
                            ) : (
                              <>
                                <FaChevronDown />
                                Cargar más productos
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="noResults">
                      <h3>No se encontraron productos</h3>
                      <p>
                        {selectedMarcas.length > 0 
                          ? 'Intenta ajustar los filtros para ver más resultados.'
                          : 'No hay productos disponibles en este momento.'
                        }
                      </p>
                      {selectedMarcas.length > 0 && (
                        <button 
                          className="clearFiltersButton"
                          onClick={limpiarFiltros}
                        >
                          <FaEraser />
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Panel de administración */}
          <AdminButtons />
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}