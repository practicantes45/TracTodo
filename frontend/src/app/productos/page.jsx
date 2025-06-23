'use client';
import './productos.css';
import { FaCalendarCheck, FaMapMarkedAlt, FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes } from "react-icons/fa";
import { useState } from 'react';
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

// Lista de contactos (misma que en ContactNumbers)
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

export default function ProductosPage() {
  // Estados para el filtro móvil
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState('A-Z');

  const handleWhatsAppClick = (producto, e) => {
    // Prevenir que se abra la página del producto cuando se hace click en WhatsApp
    e.stopPropagation();

    // Seleccionar un contacto aleatorio
    const randomContact = contactList[Math.floor(Math.random() * contactList.length)];

    // Personalizar el mensaje con los datos del producto
    const personalizedMessage = randomContact.message
      .replace('{producto}', producto.nombre)
      .replace('{precio}', producto.precio.toLocaleString());

    // Limpiar el número de teléfono
    const cleanPhoneNumber = randomContact.phoneNumber.replace(/\D/g, '');
    const formattedNumber = cleanPhoneNumber.startsWith('52')
      ? cleanPhoneNumber
      : `52${cleanPhoneNumber}`;

    // Codificar el mensaje
    const encodedMessage = encodeURIComponent(personalizedMessage);

    // Crear la URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  const handleProductoClick = (producto) => {
    // Por ahora solo un console.log, después conectaremos con el backend
    console.log('Producto seleccionado:', producto);
    // En el futuro: router.push(`/productos/${producto.id}`);
  };

  // Funciones para manejar filtros móviles
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

  return (
    <div className="layout productos-page">

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

        {/* Botón Filtrar móvil - NUEVO */}
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

        {/* Menú de filtros móvil - NUEVO */}
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
            {/* Marcas */}
            <div className="mobileFilterGroup">
              <h4>Marcas</h4>
              <div className="mobileMarcasList">
                {marcasDisponibles.map((marca) => (
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

            {/* Ordenamiento */}
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

            {/* Sidebar - Filtros (Solo diseño DESKTOP) */}
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