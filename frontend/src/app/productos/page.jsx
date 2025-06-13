'use client';
import './productos.css';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

// Datos de muestra solo para diseño
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
  {
    id: 3,
    nombre: "Pistón Heavy Duty P-450",
    descripcion: "Pistón reforzado para trabajo pesado",
    precio: 3299.00,
    imagen: "/imgs/productos/camisa-t800.jpg",
    marca: "Volvo",
    categoria: "Pistones",
    numeroParte: "P450"
  },
  {
    id: 4,
    nombre: "Biela Forjada BF-200",
    descripcion: "Biela de acero forjado de alta resistencia",
    precio: 1899.00,
    imagen: "/imgs/productos/camisa-xr5.jpg",
    marca: "Mercedes Benz",
    categoria: "Bielas",
    numeroParte: "BF200"
  },
  {
    id: 5,
    nombre: "Camisa Reforsada T-900",
    descripcion: "Camisa premium con tecnología avanzada",
    precio: 2799.00,
    imagen: "/imgs/productos/camisa-t800.jpg",
    marca: "Deutz",
    categoria: "Camisas",
    numeroParte: "T900"
  },
  {
    id: 6,
    nombre: "Kit de Anillos AR-350",
    descripcion: "Set completo de anillos para motor",
    precio: 899.00,
    imagen: "/imgs/productos/camisa-xr5.jpg",
    marca: "Cummins",
    categoria: "Anillos",
    numeroParte: "AR350"
  },
  {
    id: 7,
    nombre: "Válvula de Escape VE-125",
    descripcion: "Válvula de escape de alta temperatura",
    precio: 1599.00,
    imagen: "/imgs/productos/camisa-t800.jpg",
    marca: "Navistar",
    categoria: "Válvulas",
    numeroParte: "VE125"
  },
  {
    id: 8,
    nombre: "Culata Completa CC-800",
    descripcion: "Culata completa para motor diésel",
    precio: 8999.00,
    imagen: "/imgs/productos/camisa-xr5.jpg",
    marca: "Volvo",
    categoria: "Culatas",
    numeroParte: "CC800"
  }
];

const marcasDisponibles = ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Deutz", "Otros"];

export default function ProductosPage() {

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

  const handleProductoClick = (producto) => {
    // Por ahora solo un console.log, después conectaremos con el backend
    console.log('Producto seleccionado:', producto);
    // En el futuro: router.push(`/productos/${producto.id}`);
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
            </div>
          </div>
        </div>

        {/* Números de contacto */}
        <ContactNumbers pageContext="productos" />

        {/* Sección principal de productos */}
        <section className="productosMainSection">
          <div className="productosContainer">
            
            {/* Sidebar - Filtros (Solo diseño) */}
            <aside className="filtrosSidebar">
              <div className="filtrosHeader">
                <h2>Filtros</h2>
                <button className="limpiarFiltrosBtn">
                  Borrar filtros
                </button>
              </div>

              {/* Marcas */}
              <div className="filtroGroup">
                <h3>Marcas</h3>
                <div className="marcasList">
                  {marcasDisponibles.map((marca) => (
                    <label key={marca} className="marcaCheckbox">
                      <input type="checkbox" />
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
                    <input type="radio" name="ordenamiento" value="A-Z" defaultChecked />
                    <span className="radiomark"></span>
                    <FaSortAlphaDown className="sortIcon" />
                    Alfabéticamente, A-Z
                  </label>
                  <label className="ordenamientoRadio">
                    <input type="radio" name="ordenamiento" value="Z-A" />
                    <span className="radiomark"></span>
                    <FaSortAlphaUp className="sortIcon" />
                    Alfabéticamente, Z-A
                  </label>
                </div>
              </div>
            </aside>

            {/* Grid de productos */}
            <div className="productosGrid">
              {productosData.map((producto) => (
                <div 
                  key={producto.id} 
                  className="productoCard"
                  onClick={() => handleProductoClick(producto)}
                  style={{ cursor: 'pointer' }}
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
                    >
                      <FaWhatsapp />
                      Compra por WhatsApp
                    </button>
                  </div>
                </div>
              ))}
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