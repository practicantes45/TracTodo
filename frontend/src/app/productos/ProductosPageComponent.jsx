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

export default function ProductosPageComponent() {
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

    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(personalizedMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getImagenProducto = (producto) => {
    // 1. PRIORIDAD ALTA: Imagen "frente" de las nuevas estructuras
    if (producto.imagenes?.frente) {
      console.log('🖼️ Usando imagen frente:', producto.imagenes.frente);
      return producto.imagenes.frente;
    }

    // 2. SEGUNDA PRIORIDAD: Primera imagen del array de imágenes
    if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
      console.log('🖼️ Usando primera imagen del array:', producto.imagenes[0]);
      return producto.imagenes[0];
    }

    // 3. TERCERA PRIORIDAD: Imagen principal o cualquier imagen disponible
    if (producto.imagenes && typeof producto.imagenes === 'object') {
      const primeraImagen = Object.values(producto.imagenes)[0];
      if (primeraImagen) {
        console.log('🖼️ Usando primera imagen del objeto:', primeraImagen);
        return primeraImagen;
      }
    }

    // 4. FALLBACK: Si tiene imagen antigua (string directo)
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

        {/* Resto del componente continúa igual... */}
        {/* Por espacio no incluyo todo, pero es el mismo código que tenías */}
        
      </main>
      
      <Footer />
      <ScrollToTop />
      <ContactNumbers />
    </div>
  );
}