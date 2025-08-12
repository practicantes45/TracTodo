'use client';
import './productos.css';
import { FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser, FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { obtenerProductos, buscarProductos } from '../../services/productoService';
import { registrarVista } from '../../services/trackingService';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminButtons from '../components/AdminButtons/AdminButtons';
import { getProductSlug } from '../../utils/slugUtils';

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
  const [filtrosInicializados, setFiltrosInicializados] = useState(false); // NUEVO estado

  // Estados para paginación
  const [productosVisibles, setProductosVisibles] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMasProductos, setHayMasProductos] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);

  const searchParams = useSearchParams();
  const busquedaParam = searchParams.get('busqueda');
  const marcaParam = searchParams.get('marca');

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
  }, [marcaParam, busquedaParam]); // Solo depende de los parámetros de URL

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
    const inicio = 0;
    const fin = paginaActual * PRODUCTOS_POR_PAGINA;
    const nuevosProductosVisibles = productos.slice(inicio, fin);

    setProductosVisibles(nuevosProductosVisibles);
    setHayMasProductos(fin < productos.length);

    console.log(`📦 Mostrando ${nuevosProductosVisibles.length} de ${productos.length} productos (página ${paginaActual})`);
  };

  // MODIFICADO: Función principal para cargar productos con filtros (acepta parámetros directos)
  const cargarProductosConFiltros = async (marcas = selectedMarcas, orden = selectedOrden, busqueda = busquedaParam) => {
    try {
      setLoading(true);
      setError('');
      setPaginaActual(1);

      console.log('🔄 Cargando productos con filtros:', {
        marcas,
        orden,
        busqueda
      });

      let resultados;

      if (busqueda) {
        console.log('🔍 Buscando con término y filtros:', {
          q: busqueda,
          marcas: marcas,
          orden: orden
        });

        resultados = await buscarProductos({
          q: busqueda,
          marcas: marcas,
          orden: orden
        });
      } else {
        console.log('📦 Cargando productos con filtros:', {
          marcas: marcas,
          orden: orden
        });

        resultados = await obtenerProductos({
          marcas: marcas,
          orden: orden
        });
      }

      setProductos(resultados);

      // Extraer marcas únicas de los resultados para el filtro
      const marcasUnicas = [...new Set(resultados.map(p => p.marca).filter(Boolean))];
      setMarcasDisponibles(marcasUnicas);

      console.log(`✅ Cargados ${resultados.length} productos con filtros del backend`);
    } catch (error) {
      console.error("❌ Error al cargar productos:", error);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar más productos
  const cargarMasProductos = async () => {
    setCargandoMas(true);

    // Simular pequeña carga para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setPaginaActual(prev => prev + 1);
    setCargandoMas(false);

    console.log('📄 Cargando página:', paginaActual + 1);
  };

  // Función para refrescar productos (llamada desde AdminButtons)
  const refetchProducts = () => {
    cargarProductosConFiltros();
  };

  const handleWhatsAppClick = (producto, e) => {
    e.preventDefault();
    e.stopPropagation();

    const randomContact = contactList[Math.floor(Math.random() * contactList.length)];
    const precio = producto.precioVentaSugerido || producto.precio || 0;
    const personalizedMessage = randomContact.message
      .replace('{producto}', producto.nombre)
      .replace('{precio}', precio.toLocaleString());

    const cleanPhoneNumber = randomContact.phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('52')
      ? cleanPhoneNumber
      : `52${cleanPhoneNumber}`;

    const encodedMessage = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleProductoClick = async (producto) => {
    await registrarVista(producto.id);
    const slug = getProductSlug(producto);
    console.log('🔗 Navegando a producto:', { nombre: producto.nombre, slug });
    router.push(`/productos/${slug}`);
  };

  const obtenerPrimeraImagen = (producto) => {
    if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object' && producto.imagenesUrl.frente) {
      console.log('🖼️ Usando imagen frente:', producto.imagenesUrl.frente);
      return producto.imagenesUrl.frente;
    }

    if (producto.imagenUrl) {
      console.log('🖼️ Usando imagenUrl:', producto.imagenUrl);
      return producto.imagenUrl;
    }

    if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
      const imagenes = Object.values(producto.imagenesUrl).filter(img => img && img.trim() !== '');
      if (imagenes.length > 0) {
        console.log('🖼️ Usando primera imagen disponible:', imagenes[0]);
        return imagenes[0];
      }
    }

    if (producto.imagen) {
      console.log('🖼️ Usando imagen legacy:', producto.imagen);
      return producto.imagen;
    }

    console.log('🚫 No se encontró imagen para el producto:', producto.nombre);
    return null;
  };

  // Funciones para filtros móviles
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const closeMobileFilter = () => {
    setIsMobileFilterOpen(false);
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

  if (loading) {
    return (
      <div className="layout productos-page">
        <Navbar />
        <main className="mainContent">
          <div className="loadingContainer">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="layout productos-page">
      <Navbar />

      <main className="mainContent">
        {/* Hero Section */}
        <div className="heroSection">
          <div className="heroOverlay">
            <div className="heroContent">
              <h1>Nuestros Productos</h1>
              {busquedaParam && (
                <p className="searchIndicator">
                  Resultados para: "{busquedaParam}" ({productos.length} productos encontrados)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botón Filtrar móvil */}
        <div className="mobileFilterToggle">
          <button
            className="mobileFilterButton"
            onClick={toggleMobileFilter}
          >
            <FaFilter />
            Filtrar por
          </button>
        </div>

        {/* Overlay para filtro móvil */}
        <div
          className={`mobileFilterOverlay ${isMobileFilterOpen ? 'overlayOpen' : ''}`}
          onClick={closeMobileFilter}
        ></div>

        {/* Menú de filtros móvil */}
        <div className={`mobileFilterMenu ${isMobileFilterOpen ? 'menuOpen' : ''}`}>
          <div className="mobileFilterHeader">
            <h3>Filtros</h3>
            <button
              className="closeMobileFilter"
              onClick={closeMobileFilter}
            >
              <FaTimes />
            </button>
          </div>

          <div className="mobileFilterContent">
            {/* Botón borrar búsqueda en móvil */}
            {busquedaParam && (
              <div className="mobileFilterGroup">
                <button
                  className="clearSearchButtonMobile"
                  onClick={clearSearch}
                >
                  <FaEraser />
                  Borrar búsqueda "{busquedaParam}"
                </button>
              </div>
            )}

            {/* Marcas */}
            <div className="mobileFilterGroup">
              <h4>Marcas</h4>
              <div className="mobileMarcasList">
                {marcasPredefinidas.map((marca) => (
                  <label key={marca} className="mobileMarcaCheckbox">
                    <input
                      type="checkbox"
                      checked={selectedMarcas.includes(marca)}
                      onChange={() => handleMarcaChange(marca)}
                    />
                    <span className="mobileCheckmark"></span>
                    {marca}
                  </label>
                ))}
              </div>
            </div>

            {/* Ordenamiento solo visible cuando NO hay búsqueda */}
            {!busquedaParam && (
              <div className="mobileFilterGroup">
                <h4>Ordenar Por</h4>
                <div className="mobileOrdenamientoList">
                  <label className="mobileOrdenamientoRadio">
                    <input
                      type="radio"
                      name="orden"
                      value="A-Z"
                      checked={selectedOrden === 'A-Z'}
                      onChange={(e) => handleOrdenChange(e.target.value)}
                    />
                    <span className="mobileRadiomark"></span>
                    <FaSortAlphaDown className="sortIcon" />
                    Alfabéticamente, A-Z
                  </label>
                  <label className="mobileOrdenamientoRadio">
                    <input
                      type="radio"
                      name="orden"
                      value="Z-A"
                      checked={selectedOrden === 'Z-A'}
                      onChange={(e) => handleOrdenChange(e.target.value)}
                    />
                    <span className="mobileRadiomark"></span>
                    <FaSortAlphaUp className="sortIcon" />
                    Alfabéticamente, Z-A
                  </label>
                </div>
              </div>
            )}

            {/* Mensaje explicativo cuando hay búsqueda */}
            {busquedaParam && (
              <div className="searchPriorityInfo">
                <h3>Orden de Relevancia</h3>
                <p>Los resultados se muestran por prioridad:</p>
                <ol>
                  <li><strong>Número de parte</strong></li>
                  <li><strong>Nombre del producto</strong></li>
                  <li><strong>Descripción</strong></li>
                </ol>
              </div>
            )}

            {/* Botón limpiar filtros */}
            <div className="mobileFilterActions">
              <button
                className="clearMobileFilters"
                onClick={clearAllFilters}
              >
                Borrar filtros
              </button>
              <button
                className="applyMobileFilters"
                onClick={closeMobileFilter}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {/* Sección principal de productos */}
        <section className="productosMainSection">
          <div className="productosContainer">

            {/* Sidebar - Filtros DESKTOP */}
            <aside className="filtrosSidebar">
              <div className="filtrosHeader">
                <h2>Filtros</h2>
                <button
                  className="limpiarFiltrosBtn"
                  onClick={clearAllFilters}
                >
                  Borrar filtros
                </button>
              </div>

              {/* Botón borrar búsqueda en desktop */}
              {busquedaParam && (
                <div className="clearSearchSection">
                  <button
                    className="clearSearchButton"
                    onClick={clearSearch}
                  >
                    <FaEraser />
                    Borrar búsqueda
                  </button>
                  <p className="searchTermDisplay">
                    Buscando: "{busquedaParam}"
                  </p>
                </div>
              )}

              {/* Marcas */}
              <div className="filtroGroup">
                <h3>Marcas</h3>
                <div className="marcasList">
                  {marcasPredefinidas.map((marca) => (
                    <label key={marca} className="marcaCheckbox">
                      <input
                        type="checkbox"
                        checked={selectedMarcas.includes(marca)}
                        onChange={() => handleMarcaChange(marca)}
                      />
                      <span className="checkmark"></span>
                      {marca}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ordenamiento solo visible cuando NO hay búsqueda */}
              {!busquedaParam && (
                <div className="filtroGroup">
                  <h3>Ordenar Por</h3>
                  <div className="ordenamientoList">
                    <label className="ordenamientoRadio">
                      <input
                        type="radio"
                        name="ordenamiento"
                        value="A-Z"
                        checked={selectedOrden === 'A-Z'}
                        onChange={(e) => handleOrdenChange(e.target.value)}
                      />
                      <span className="radiomark"></span>
                      <FaSortAlphaDown className="sortIcon" />
                      Alfabéticamente, A-Z
                    </label>
                    <label className="ordenamientoRadio">
                      <input
                        type="radio"
                        name="ordenamiento"
                        value="Z-A"
                        checked={selectedOrden === 'Z-A'}
                        onChange={(e) => handleOrdenChange(e.target.value)}
                      />
                      <span className="radiomark"></span>
                      <FaSortAlphaUp className="sortIcon" />
                      Alfabéticamente, Z-A
                    </label>
                  </div>
                </div>
              )}

              {/* Información de prioridad de búsqueda */}
              {busquedaParam && (
                <div className="searchPriorityInfo">
                  <h3>Orden de Relevancia</h3>
                  <p>Los resultados se muestran por prioridad:</p>
                  <ol>
                    <li><strong>Número de parte</strong></li>
                    <li><strong>Nombre del producto</strong></li>
                    <li><strong>Descripción</strong></li>
                  </ol>
                </div>
              )}
            </aside>

            {/* Grid de productos */}
            <div className="productosGrid">
              <AdminButtons onProductUpdate={refetchProducts} />

              {error ? (
                <div className="errorMessage">{error}</div>
              ) : productosVisibles.length === 0 ? (
                <div className="noProducts">
                  {busquedaParam ?
                    `No se encontraron productos para "${busquedaParam}"` :
                    'No se encontraron productos'
                  }
                </div>
              ) : (
                <>
                  {productosVisibles.map((producto) => {
                    const imagenUrl = obtenerPrimeraImagen(producto);

                    return (
                      <div
                        key={producto.id}
                        className="productoCard"
                        onClick={() => handleProductoClick(producto)}
                        style={{ cursor: 'pointer', position: 'relative' }}
                      >
                        <AdminButtons
                          producto={producto}
                          onProductUpdate={refetchProducts}
                        />
                        <div className="productoImageContainer">
                          {imagenUrl ? (
                            <img
                              src={imagenUrl}
                              alt={producto.nombre}
                              className="productoImage"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="imageNotFound"
                            style={{ display: imagenUrl ? 'none' : 'flex' }}
                          >
                            <div className="noImageIcon">📷</div>
                            <p>Imagen no detectada</p>
                          </div>
                        </div>

                        <div className="productoInfo">
                          <h3 className="productoNombre">{producto.nombre}</h3>
                          <p className="productoDescripcion">{producto.descripcion}</p>
                          <div className="productoPrecio">
                            ${parseFloat(producto.precioVentaSugerido || 0).toLocaleString()}
                          </div>
                          <button
                            className="whatsappBtn"
                            onClick={(e) => handleWhatsAppClick(producto, e)}
                          >
                            <FaWhatsapp />
                            Compra por WhatsApp
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Botón Ver más productos */}
                  {hayMasProductos && (
                    <div className="verMasContainer">
                      <button
                        className="verMasBtn"
                        onClick={cargarMasProductos}
                        disabled={cargandoMas}
                      >
                        {cargandoMas ? (
                          <>
                            <div className="verMasSpinner"></div>
                            Cargando...
                          </>
                        ) : (
                          <>
                            <FaChevronDown />
                            Ver más productos
                          </>
                        )}
                      </button>
                      <div className="paginacionInfo">
                        Mostrando {productosVisibles.length} de {productos.length} productos
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}