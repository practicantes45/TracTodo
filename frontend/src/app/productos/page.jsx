'use client';
import './productos.css';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser } from "react-icons/fa";
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import { obtenerProductos, buscarProductos } from '../../services/productoService';
import { registrarVista } from '../../services/trackingService';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminButtons from '../components/AdminButtons/AdminButtons';

export default function ProductosPage() {
  // Estados
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Estados para filtros
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState('A-Z');
  const [marcasDisponibles, setMarcasDisponibles] = useState([]);

  const searchParams = useSearchParams();
  const busquedaParam = searchParams.get('busqueda');

  console.log('🔍 Parámetro de búsqueda:', busquedaParam);

  // Lista de marcas predefinidas
  const marcasPredefinidas = ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Deutz", "Otros"];

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

  // Efecto para resetear búsqueda cuando se navega directamente a /productos
  useEffect(() => {
    // Si no hay parámetro de búsqueda en la URL, resetear y cargar todos los productos
    if (!busquedaParam) {
      console.log('🔄 Reseteando búsqueda - cargando todos los productos');
      cargarProductos();
    }
  }, []);

  // Cargar productos del backend
  useEffect(() => {
    if (busquedaParam) {
      buscarProductosConTermino(busquedaParam);
    } else {
      // Si no hay búsqueda, cargar todos los productos
      cargarProductos();
    }
  }, [busquedaParam]);

  const buscarProductosConTermino = async (termino) => {
    try {
      setLoading(true);
      console.log('🔍 Buscando productos con término (prioridades):', termino);
      const resultados = await buscarProductos({ q: termino });
      setProductos(resultados);

      const marcasUnicas = [...new Set(resultados.map(p => p.marca).filter(Boolean))];
      setMarcasDisponibles(marcasUnicas);

      console.log(`✅ Encontrados ${resultados.length} productos con búsqueda priorizada`);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      setError('No se pudieron buscar los productos');
    } finally {
      setLoading(false);
    }
  };

  // MODIFICADO: Aplicar filtros manteniendo prioridad de búsqueda
  useEffect(() => {
    aplicarFiltros();
  }, [productos, selectedMarcas, selectedOrden, busquedaParam]); // Agregado busquedaParam como dependencia

  const cargarProductos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando todos los productos...');
      const data = await obtenerProductos();
      setProductos(data);

      // Extraer marcas únicas de los productos  
      const marcasUnicas = [...new Set(data.map(p => p.marca).filter(Boolean))];
      setMarcasDisponibles(marcasUnicas);

      console.log(`✅ Cargados ${data.length} productos totales`);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const refetchProducts = () => {
    if (busquedaParam) {
      buscarProductosConTermino(busquedaParam);
    } else {
      cargarProductos();
    }
  };

  // MODIFICADO: Nueva lógica de filtros que respeta la priorización de búsqueda
  const aplicarFiltros = () => {
    let filtrados = [...productos];

    // 1. PRIMERO: Filtrar por marcas
    if (selectedMarcas.length > 0) {
      filtrados = filtrados.filter(p => selectedMarcas.includes(p.marca));
    }

    // 2. SEGUNDO: Aplicar ordenamiento SOLO si NO hay búsqueda activa
    // Si hay búsqueda, mantener el orden de prioridad del backend
    if (!busquedaParam) {
      console.log('📋 Aplicando ordenamiento alfabético (sin búsqueda activa)');
      if (selectedOrden === 'A-Z') {
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
      } else if (selectedOrden === 'Z-A') {
        filtrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
      }
    } else {
      console.log('🔍 Manteniendo orden de prioridad de búsqueda - NO aplicando ordenamiento alfabético');
    }

    setProductosFiltrados(filtrados);
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
    // Registrar vista
    await registrarVista(producto.id);

    // Navegar al detalle
    console.log('Producto seleccionado:', producto);
    router.push(`/productos/${producto.id}`);
  };

  // Función para obtener la primera imagen disponible
  const obtenerPrimeraImagen = (producto) => {
    // Si tiene imagenUrl directa, usarla
    if (producto.imagenUrl) {
      return producto.imagenUrl;
    }

    // Si tiene imagenesUrl (objeto con múltiples imágenes)
    if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
      const imagenes = Object.values(producto.imagenesUrl);
      if (imagenes.length > 0) {
        return imagenes[0];
      }
    }

    // Si tiene imagen antigua (string directo)
    if (producto.imagen) {
      return producto.imagen;
    }

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
    setSelectedMarcas(prev =>
      prev.includes(marca)
        ? prev.filter(m => m !== marca)
        : [...prev, marca]
    );
  };

  const clearAllFilters = () => {
    setSelectedMarcas([]);
    setSelectedOrden('A-Z');
  };

  // función para borrar búsqueda
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
                  Resultados para: "{busquedaParam}" ({productosFiltrados.length} productos encontrados)
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

            {/* MODIFICADO: Ordenamiento solo visible cuando NO hay búsqueda */}
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
                      onChange={(e) => setSelectedOrden(e.target.value)}
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
                      onChange={(e) => setSelectedOrden(e.target.value)}
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

              {/* MODIFICADO: Ordenamiento solo visible cuando NO hay búsqueda */}
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
                        onChange={(e) => setSelectedOrden(e.target.value)}
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
                        onChange={(e) => setSelectedOrden(e.target.value)}
                      />
                      <span className="radiomark"></span>
                      <FaSortAlphaUp className="sortIcon" />
                      Alfabéticamente, Z-A
                    </label>
                  </div>
                </div>
              )}

              {/* NUEVO: Información de prioridad de búsqueda */}
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
              ) : productosFiltrados.length === 0 ? (
                <div className="noProducts">
                  {busquedaParam ?
                    `No se encontraron productos para "${busquedaParam}"` :
                    'No se encontraron productos'
                  }
                </div>
              ) : (
                productosFiltrados.map((producto) => {
                  const imagenUrl = obtenerPrimeraImagen(producto);

                  return (
                    <div
                      key={producto.id}
                      className="productoCard"
                      onClick={() => handleProductoClick(producto)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {/* SOLO botón de editar - NO botón de agregar aquí */}
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
                          ${(producto.precioVentaSugerido || producto.precio || 0).toLocaleString()}
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
                })
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