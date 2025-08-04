'use client';
import './productos.css';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser } from "react-icons/fa";
import { useState, useEffect, Suspense } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import { obtenerProductos, buscarProductos } from '../../services/productoService';
import { registrarVista } from '../../services/trackingService';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminButtons from '../components/AdminButtons/AdminButtons';

function ProductosContent() {
  // Estados
  const [productos, setProductos] = useState([]);
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
  const marcaParam = searchParams.get('marca');

  console.log('🔍 Parámetro de búsqueda:', busquedaParam);
  console.log('🏷️ Parámetro de marca:', marcaParam);

  // Lista de marcas predefinidas
  const marcasPredefinidas = ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Detroit", "Otros"];

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

  // Efecto para pre-seleccionar marca desde URL
  useEffect(() => {
    // Si hay un parámetro de marca en la URL, pre-seleccionarlo
    if (marcaParam && marcasPredefinidas.includes(marcaParam)) {
      console.log('🔄 Inicializando con marca desde URL:', marcaParam);
      setSelectedMarcas([marcaParam]);
    }
  }, [marcaParam]);

  // AGREGAR ESTE useEffect que faltaba:
  useEffect(() => {
    cargarProductosConFiltros();
  }, [selectedMarcas, selectedOrden, busquedaParam]);

  // Función principal para cargar productos con filtros
  const cargarProductosConFiltros = async () => {
    try {
      setLoading(true);
      setError('');

      let resultados;

      if (busquedaParam) {
        // Si hay búsqueda, usar buscarProductos con filtros
        console.log('🔍 Buscando con término y filtros:', {
          q: busquedaParam,
          marcas: selectedMarcas,
          orden: selectedOrden
        });

        resultados = await buscarProductos({
          q: busquedaParam,
          marcas: selectedMarcas,
          orden: selectedOrden
        });
      } else {
        // Si no hay búsqueda, usar obtenerProductos con filtros
        console.log('📦 Cargando productos con filtros:', {
          marcas: selectedMarcas,
          orden: selectedOrden
        });

        resultados = await obtenerProductos({
          marcas: selectedMarcas,
          orden: selectedOrden
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

    const whatsappURL = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(personalizedMessage)}`;

    // Registrar vista antes de abrir WhatsApp
    registrarVista(producto.id, 'whatsapp_click');

    window.open(whatsappURL, '_blank');
  };

  const handleProductClick = (producto) => {
    console.log('🔗 Navegando a producto:', producto.id);
    registrarVista(producto.id, 'product_view');
    router.push(`/productos/${producto.id}`);
  };

  // Función para obtener la imagen del producto
  const obtenerImagenProducto = (producto) => {
    console.log('🖼️ Obteniendo imagen para producto:', producto.nombre);

    // PREFERENCIA: Si tiene imágenes en array
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
      const primeraImagen = producto.imagenes[0];
      console.log('📸 Usando primera imagen del array:', primeraImagen);
      return primeraImagen;
    }

    // FALLBACK: Si tiene imagen antigua (string directo)
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
              <div className="clearSearchSectionMobile">
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

            {/* Marcas Móvil */}
            <div className="mobileFilterGroup">
              <h4>Marcas</h4>
              <div className="marcasListMobile">
                {marcasPredefinidas.map((marca) => (
                  <label key={marca} className="marcaCheckboxMobile">
                    <input
                      type="checkbox"
                      checked={selectedMarcas.includes(marca)}
                      onChange={() => handleMarcaChange(marca)}
                    />
                    <span className="checkmarkMobile"></span>
                    {marca}
                  </label>
                ))}
              </div>
            </div>

            {/* Ordenamiento Móvil solo cuando NO hay búsqueda */}
            {!busquedaParam && (
              <div className="mobileFilterGroup">
                <h4>Ordenar Por</h4>
                <div className="ordenRadioGroup">
                  <label className="ordenRadio">
                    <input
                      type="radio"
                      name="orden"
                      value="A-Z"
                      checked={selectedOrden === 'A-Z'}
                      onChange={() => handleOrdenChange('A-Z')}
                    />
                    <span className="radioMark"></span>
                    <FaSortAlphaDown />
                    A - Z
                  </label>
                  <label className="ordenRadio">
                    <input
                      type="radio"
                      name="orden"
                      value="Z-A"
                      checked={selectedOrden === 'Z-A'}
                      onChange={() => handleOrdenChange('Z-A')}
                    />
                    <span className="radioMark"></span>
                    <FaSortAlphaUp />
                    Z - A
                  </label>
                </div>
              </div>
            )}

            {/* Botón limpiar filtros móvil */}
            <button
              className="limpiarFiltrosBtnMobile"
              onClick={() => {
                clearAllFilters();
                closeMobileFilter();
              }}
            >
              Borrar todos los filtros
            </button>
          </div>
        </div>

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
                  <div className="ordenRadioGroup">
                    <label className="ordenRadio">
                      <input
                        type="radio"
                        name="orden"
                        value="A-Z"
                        checked={selectedOrden === 'A-Z'}
                        onChange={() => handleOrdenChange('A-Z')}
                      />
                      <span className="radioMark"></span>
                      <FaSortAlphaDown />
                      A - Z
                    </label>
                    <label className="ordenRadio">
                      <input
                        type="radio"
                        name="orden"
                        value="Z-A"
                        checked={selectedOrden === 'Z-A'}
                        onChange={() => handleOrdenChange('Z-A')}
                      />
                      <span className="radioMark"></span>
                      <FaSortAlphaUp />
                      Z - A
                    </label>
                  </div>
                </div>
              )}
            </aside>

            {/* Contenido principal - Lista de productos */}
            <div className="productosContent">
              {error && (
                <div className="errorMessage">
                  <p>❌ {error}</p>
                </div>
              )}

              {productos.length === 0 && !loading && (
                <div className="noProductsMessage">
                  <p>No se encontraron productos{busquedaParam ? ` para "${busquedaParam}"` : ''}.</p>
                  {busquedaParam && (
                    <button className="clearSearchButton" onClick={clearSearch}>
                      <FaEraser />
                      Borrar búsqueda
                    </button>
                  )}
                </div>
              )}

              <div className="productosGrid">
                {productos.map((producto) => {
                  const imagen = obtenerImagenProducto(producto);
                  
                  return (
                    <div 
                      key={producto.id} 
                      className="productoCard"
                      onClick={() => handleProductClick(producto)}
                    >
                      <div className="productoImageContainer">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt={producto.nombre}
                            className="productoImage"
                            onError={(e) => {
                              console.log('❌ Error cargando imagen:', imagen);
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="noImagePlaceholder">
                            <p>Sin imagen</p>
                          </div>
                        )}
                      </div>

                      <div className="productoInfo">
                        <h3 className="productoNombre">{producto.nombre}</h3>
                        
                        <div className="productoDetalles">
                          <p className="productoMarca">
                            <strong>Marca:</strong> {producto.marca}
                          </p>
                          
                          {producto.precioVentaSugerido && (
                            <p className="productoPrecio">
                              <strong>Precio:</strong> ${producto.precioVentaSugerido.toLocaleString()}
                            </p>
                          )}

                          {producto.compatibilidad && (
                            <p className="productoCompatibilidad">
                              <strong>Compatible con:</strong> {producto.compatibilidad}
                            </p>
                          )}
                        </div>

                        <div className="productoAcciones">
                          <button
                            className="whatsappBtn"
                            onClick={(e) => handleWhatsAppClick(producto, e)}
                          >
                            <FaWhatsapp />
                            Consultar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Números de contacto*/}
        <ContactNumbers pageContext="productos" />

        {/* Botones de Admin */}
        <AdminButtons onRefresh={refetchProducts} />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={
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
    }>
      <ProductosContent />
    </Suspense>
  );
}