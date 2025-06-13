// hooks/useProductNavigation.js
// Crea este archivo en una carpeta 'hooks' en tu proyecto

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const useProductNavigation = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigateToProduct = async (producto) => {
    try {
      setIsNavigating(true);
      
      // Guardar datos del producto en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('producto-seleccionado', JSON.stringify(producto));
      }
      
      // Pequeño delay para mostrar el efecto de loading
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Navegar a la página del producto
      router.push(`/productos/${producto.id}`);
      
    } catch (error) {
      console.error('Error al navegar al producto:', error);
      setIsNavigating(false);
    }
  };

  return {
    navigateToProduct,
    isNavigating
  };
};

// Componente mejorado de productos usando el hook
// Actualizar el archivo productos/page.jsx con este código:

'use client';
import './productos.css';
import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaSearch, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
// import { useProductNavigation } from '../hooks/useProductNavigation'; // Descomenta si creas el hook

// Simulando los datos de productos que tendrían en la base de datos
const productosData = [
  {
    id: 1,
    nombre: "Camisa Reforsada T-800",
    descripcion: "Camisa con aleación premium para modelo",
    precio: 2499.00,
    imagen: "/imgs/productos/camisa-t800.jpg",
    marca: "Cummins",
    categoria: "Camisas",
    numeroParte: "56859"
  },
  {
    id: 2,
    nombre: "Camisa de Motor XR-5",
    descripcion: "Camisa de alta resistencia, compatible, de tornillo esgado con modelo xx",
    precio: 1299.00,
    imagen: "/imgs/productos/camisa-xr5.jpg",
    marca: "Navistar",
    categoria: "Camisas",
    numeroParte: "XR500"
  },
  // Duplicamos para mostrar más productos
  ...Array.from({length: 10}, (_, i) => ({
    id: i + 3,
    nombre: `Camisa Reforsada T-800`,
    descripcion: "Camisa con aleación premium para modelo",
    precio: 2499.00,
    imagen: "/imgs/productos/camisa-t800.jpg",
    marca: ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Deutz"][i % 5],
    categoria: "Camisas",
    numeroParte: `56859-${i}`
  }))
];

const marcasDisponibles = ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Deutz", "Otros"];

export default function ProductosPage() {
  // const { navigateToProduct, isNavigating } = useProductNavigation(); // Descomenta si usas el hook
  const [productos, setProductos] = useState(productosData);
  const [filtros, setFiltros] = useState({
    marcas: [],
    busqueda: "",
    ordenamiento: "A-Z"
  });
  const [productosFiltrados, setProductosFiltrados] = useState(productosData);
  const [productoNavegando, setProductoNavegando] = useState(null);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...productos];

    // Filtro por marcas
    if (filtros.marcas.length > 0) {
      resultado = resultado.filter(producto => 
        filtros.marcas.includes(producto.marca)
      );
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      resultado = resultado.filter(producto =>
        producto.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        producto.numeroParte.toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }

    // Ordenamiento
    if (filtros.ordenamiento === "A-Z") {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (filtros.ordenamiento === "Z-A") {
      resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    }

    setProductosFiltrados(resultado);
  }, [filtros, productos]);

  const handleMarcaChange = (marca) => {
    setFiltros(prev => ({
      ...prev,
      marcas: prev.marcas.includes(marca)
        ? prev.marcas.filter(m => m !== marca)
        : [...prev.marcas, marca]
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      marcas: [],
      busqueda: "",
      ordenamiento: "A-Z"
    });
  };

  // Función mejorada para navegar al producto individual
  const handleProductoClick = async (producto) => {
    try {
      setProductoNavegando(producto.id);
      
      // Guardar datos del producto en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('producto-seleccionado', JSON.stringify(producto));
      }
      
      // Pequeño delay para mostrar el efecto visual
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navegar a la página del producto
      window.location.href = `/productos/${producto.id}`;
      
    } catch (error) {
      console.error('Error al navegar al producto:', error);
      setProductoNavegando(null);
    }
  };

  const handleWhatsAppClick = (producto, e) => {
    // Prevenir que se abra la página del producto cuando se hace click en WhatsApp
    e.stopPropagation();
    
    const message = encodeURIComponent(
      `Hola, estoy interesado en ${producto.nombre} con precio de $${producto.precio.toLocaleString()}. ¿Podría proporcionarme más información?`
    );
    const phoneNumber = '524272245923';
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="layout productos-page">
      {/* Header con información de contacto y ubicación */}
      <header className="infoHeader">
        <div className="locationInfo">
          <span className="locationIcon"><FaMapMarkedAlt /></span>
          <span>Queretaro, San Juan del Río, San Cayetano, Río Extoras 56.</span>
        </div>
        <div className="line"></div>
        <div className="scheduleInfo">
          <span className="calendarIcon"><FaCalendarCheck /></span>
          <span>Lun - Vier. 9:00 am - 6:00 pm</span>
        </div>
      </header>

      {/* Navbar principal */}
      <Navbar />

      {/* Contenido principal */}
      <main className="mainContent">
        {/* Hero Section para productos */}
        <div className="heroSection">
          <div className="heroOverlay">
            <div className="heroContent">
              <h1>Nuestros Productos</h1>
              <p className="heroSubtitle">Encuentra las mejores refacciones para tu motor diésel</p>
            </div>
          </div>
        </div>

        {/* Números de contacto */}
        <ContactNumbers pageContext="productos" />

        {/* Sección principal de productos */}
        <section className="productosMainSection">
          <div className="productosContainer">
            
            {/* Sidebar - Filtros */}
            <aside className="filtrosSidebar">
              <div className="filtrosHeader">
                <h2>Filtros</h2>
                <button 
                  className="limpiarFiltrosBtn"
                  onClick={limpiarFiltros}
                >
                  Borrar filtros
                </button>
              </div>

              {/* Marcas */}
              <div className="filtroGroup">
                <h3>Marcas</h3>
                <div className="marcasList">
                  {marcasDisponibles.map((marca) => (
                    <label key={marca} className="marcaCheckbox">
                      <input
                        type="checkbox"
                        checked={filtros.marcas.includes(marca)}
                        onChange={() => handleMarcaChange(marca)}
                      />
                      <span className="checkmark"></span>
                      {marca}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ordenamiento */}
              <div className="filtroGroup">
                <h3>Ordenar Por</h3>
                <div className="ordenamientoList">
                  <label className="ordenamientoRadio">
                    <input
                      type="radio"
                      name="ordenamiento"
                      value="A-Z"
                      checked={filtros.ordenamiento === "A-Z"}
                      onChange={(e) => setFiltros(prev => ({...prev, ordenamiento: e.target.value}))}
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
                      checked={filtros.ordenamiento === "Z-A"}
                      onChange={(e) => setFiltros(prev => ({...prev, ordenamiento: e.target.value}))}
                    />
                    <span className="radiomark"></span>
                    <FaSortAlphaUp className="sortIcon" />
                    Alfabéticamente, Z-A
                  </label>
                </div>
              </div>
            </aside>

            {/* Grid de productos */}
            <div className="productosGrid">
              {productosFiltrados.map((producto) => (
                <div 
                  key={producto.id} 
                  className={`productoCard ${productoNavegando === producto.id ? 'navigating' : ''}`}
                  onClick={() => handleProductoClick(producto)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleProductoClick(producto);
                    }
                  }}
                  aria-label={`Ver detalles de ${producto.nombre}`}
                >
                  
                  {/* Imagen del producto */}
                  <div className="productoImageContainer">
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="productoImage"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="productoInfo">
                    <h3 className="productoNombre">{producto.nombre}</h3>
                    <p className="productoDescripcion">{producto.descripcion}</p>
                    <div className="productoPrecio">
                      ${producto.precio.toLocaleString()}
                    </div>
                    <button
                      className="whatsappBtn"
                      onClick={(e) => handleWhatsAppClick(producto, e)}
                      aria-label={`Contactar por WhatsApp sobre ${producto.nombre}`}
                    >
                      <FaWhatsapp />
                      Compra por WhatsApp
                    </button>
                  </div>

                  {/* Indicador de carga */}
                  {productoNavegando === producto.id && (
                    <div className="loadingOverlay">
                      <div className="loadingSpinner"></div>
                    </div>
                  )}
                </div>
              ))}

              {/* Mensaje si no hay productos */}
              {productosFiltrados.length === 0 && (
                <div className="noProductsMessage">
                  <h3>No se encontraron productos</h3>
                  <p>Intenta ajustar tus filtros de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Botón ScrollToTop */}
      <ScrollToTop />
    </div>
  );
}