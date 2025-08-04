'use client';
import './productos.css';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser } from "react-icons/fa";
import { useState, useEffect, Suspense } from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
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

  // Función para obtener contacto aleatorio
  const getRandomContact = () => {
    return contactList[Math.floor(Math.random() * contactList.length)];
  };

  // Cargar productos al inicializar
  useEffect(() => {
    loadProducts();
  }, [busquedaParam, marcaParam]);

  // Efecto para aplicar filtros locales
  useEffect(() => {
    if (busquedaParam || marcaParam) {
      // Para búsqueda o marca del URL, no aplicar filtros locales adicionales
      return;
    }
    filterProducts();
  }, [selectedMarcas, selectedOrden]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      let result;
      if (busquedaParam) {
        console.log('🔍 Realizando búsqueda:', busquedaParam);
        result = await buscarProductos({ q: busquedaParam });
      } else {
        console.log('📦 Obteniendo productos con filtros:', { marcas: marcaParam ? [marcaParam] : [], orden: 'A-Z' });
        result = await obtenerProductos({
          marcas: marcaParam ? [marcaParam] : [],
          orden: 'A-Z'
        });
      }

      console.log('✅ Productos cargados:', result);
      setProductos(result);

      // Calcular marcas disponibles
      const marcasEncontradas = [...new Set(result.map(p => p.marca).filter(Boolean))];
      console.log('🏷️ Marcas encontradas:', marcasEncontradas);
      setMarcasDisponibles(marcasEncontradas);

      // Inicializar filtros si hay parámetro de marca en URL
      if (marcaParam && !selectedMarcas.includes(marcaParam)) {
        setSelectedMarcas([marcaParam]);
      }

    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError('Error al cargar productos. Inténtalo de nuevo.');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    console.log('🔧 Aplicando filtros locales:', { selectedMarcas, selectedOrden });
    // Este filtrado se aplica solo cuando no hay búsqueda activa
    // La lógica de filtrado la maneja el backend en loadProducts
  };

  // Función para obtener imagen del producto
  const getProductImage = (producto) => {
    // PRIORIDAD 1: Array de imágenes (nuevo formato)
    if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
      const primeraImagen = producto.imagenes[0];
      console.log('🖼️ Usando imagen del array:', primeraImagen);
      return primeraImagen;
    }

    // PRIORIDAD 2: imagenUrl (formato intermedio)
    if (producto.imagenUrl) {
      console.log('🖼️ Usando imagenUrl:', producto.imagenUrl);
      return producto.imagenUrl;
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

  // Función para manejar clic en WhatsApp
  const handleWhatsAppClick = async (producto, e) => {
    e.stopPropagation();
    
    try {
      // Registrar vista del producto
      await registrarVista(producto.id);
      console.log('📊 Vista registrada para producto:', producto.nombre);
    } catch (error) {
      console.error('❌ Error registrando vista:', error);
    }

    const contact = getRandomContact();
    const message = contact.message
      .replace('{producto}', producto.nombre)
      .replace('{precio}', (producto.precioVentaSugerido || producto.precio || 0).toLocaleString());
    
    const whatsappUrl = `https://wa.me/${contact.phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Función para manejar clic en producto
  const handleProductClick = (producto) => {
    router.push(`/productos/${producto.id}`);
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
          <div className="mobileFilterContent">
            <div className="mobileFilterHeader">
              <h3>Filtrar productos</h3>
              <button
                className="closeMobileFilter"
                onClick={closeMobileFilter}
              >
                <FaTimes />
              </button>
            </div>

            {/* Información de prioridad de búsqueda */}
            <div className="searchPriorityInfo">
              <h3>💡 Optimiza tu búsqueda</h3>
              <p>Para mejores resultados, busca por:</p>
              <ol>
                <li><strong>Número de parte:</strong> ej. "23532191"</li>
                <li><strong>Nombre específico:</strong> ej. "Bomba de agua"</li>
                <li><strong>Marca + modelo:</strong> ej. "Cummins ISX"</li>
                <li><strong>Palabras clave:</strong> ej. "filtro aceite"</li>
              </ol>
            </div>

            {/* Botón borrar búsqueda en móvil */}
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
              <h4>Marcas</h4>
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
                <h4>Ordenar Por</h4>
                <div className="ordenList">
                  <label className="ordenRadio">
                    <input
                      type="radio"
                      name="orden"
                      value="A-Z"
                      checked={selectedOrden === 'A-Z'}
                      onChange={() => handleOrdenChange('A-Z')}
                    />
                    <span className="radiomark"></span>
                    <FaSortAlphaDown />
                    A-Z
                  </label>
                  <label className="ordenRadio">
                    <input
                      type="radio"
                      name="orden"
                      value="Z-A"
                      checked={selectedOrden === 'Z-A'}
                      onChange={() => handleOrdenChange('Z-A')}
                    />
                    <span className="radiomark"></span>
                    <FaSortAlphaUp />
                    Z-A
                  </label>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="mobileFilterActions">
              <button
                className="clearMobileFilters"
                onClick={clearAllFilters}
              >
                Limpiar filtros
              </button>
              <button
                className="applyMobileFilters"
                onClick={closeMobileFilter}
              >
                Aplicar filtros
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

              {/* Información de prioridad de búsqueda en desktop */}
              <div className="searchPriorityInfo">
                <h3>💡 Optimiza tu búsqueda</h3>
                <p>Para mejores resultados, busca por:</p>
                <ol>
                  <li><strong>Número de parte:</strong> ej. "23532191"</li>
                  <li><strong>Nombre específico:</strong> ej. "Bomba de agua"</li>
                  <li><strong>Marca + modelo:</strong> ej. "Cummins ISX"</li>
                  <li><strong>Palabras clave:</strong> ej. "filtro aceite"</li>
                </ol>
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
                  <div className="ordenList">
                    <label className="ordenRadio">
                      <input
                        type="radio"
                        name="orden"
                        value="A-Z"
                        checked={selectedOrden === 'A-Z'}
                        onChange={() => handleOrdenChange('A-Z')}
                      />
                      <span className="radiomark"></span>
                      <FaSortAlphaDown />
                      A-Z
                    </label>
                    <label className="ordenRadio">
                      <input
                        type="radio"
                        name="orden"
                        value="Z-A"
                        checked={selectedOrden === 'Z-A'}
                        onChange={() => handleOrdenChange('Z-A')}
                      />
                      <span className="radiomark"></span>
                      <FaSortAlphaUp />
                      Z-A
                    </label>
                  </div>
                </div>
              )}
            </aside>

            {/* Grid de productos */}
            <div className="productosGrid">
              {error ? (
                <div className="errorMessage">
                  <p>⚠️ {error}</p>
                  <button onClick={loadProducts} className="retryButton">
                    Reintentar
                  </button>
                </div>
              ) : productos.length === 0 ? (
                <div className="noProducts">
                  <p>
                    {busquedaParam 
                      ? `No se encontraron productos para "${busquedaParam}"`
                      : 'No hay productos disponibles'
                    }
                  </p>
                  {busquedaParam && (
                    <button onClick={clearSearch} className="clearSearchButton">
                      <FaEraser />
                      Borrar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                productos.map((producto) => {
                  const imagenUrl = getProductImage(producto);

                  return (
                    <div
                      key={producto.id}
                      className="productoCard"
                      onClick={() => handleProductClick(producto)}
                    >
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
                          <div className="noImageIcon">🖼️</div>
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

        {/* Botones de administración */}
        <AdminButtons />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

// Componente de fallback para Suspense
function ProductosPageFallback() {
  return (
    <div className="layout productos-page">
      <Navbar />
      <main className="mainContent">
        <div className="heroSection">
          <div className="heroOverlay">
            <div className="heroContent">
              <h1>Nuestros Productos</h1>
            </div>
          </div>
        </div>
        <section className="productosMainSection">
          <div className="productosContainer">
            <div className="loadingContainer">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Componente principal con Suspense
export default function ProductosPage() {
  return (
    <Suspense fallback={<ProductosPageFallback />}>
      <ProductosContent />
    </Suspense>
  );
}