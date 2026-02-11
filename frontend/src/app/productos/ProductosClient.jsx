'use client';
import './productos.css';
import { FaFilter, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp, FaTimes, FaEraser, FaChevronDown, FaShoppingCart } from "react-icons/fa";
import { useState, useEffect, useRef } from 'react';
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
import { useCart } from '../../hooks/useCart';
import { useWhatsAppContact } from '../../hooks/useWhatsAppContact';
import AdvisorPickerModal from '../components/AdvisorPickerModal/AdvisorPickerModal';
import './productos.overrides.css';
import './productos.fullbleed.css';
import './productos.featured.override.css';
import './productos.theme.overrides.css';
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
  const [advisorSelectionReminder, setAdvisorSelectionReminder] = useState(false);
  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);
  const [pendingAdvisorPrompt, setPendingAdvisorPrompt] = useState(false);
  const [pendingProductPath, setPendingProductPath] = useState(null);
  const { addItem } = useCart();

  const searchParams = useSearchParams();
  const busquedaParam = searchParams.get('busqueda');
  const marcaParam = searchParams.get('marca');

  // Al realizar una búsqueda, desplazar suavemente a "Todos los productos"
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!busquedaParam) return;

    let cancelled = false;
    let tries = 0;
    const tryScroll = () => {
      if (cancelled) return;
      const anchor = document.getElementById('todos-productos');
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const nav = document.querySelector('nav[role="navigation"]');
        const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
        // Ajuste afinado: dejar el banner más cerca del navbar
        const offset = Math.max(50, navHeight + 25); // px
        const targetY = currentY + rect.top - offset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else if (tries < 20) {
        tries += 1;
        setTimeout(tryScroll, 100);
      }
    };
    // Ejecutar en el siguiente tick para esperar al DOM
    setTimeout(tryScroll, 0);
    return () => { cancelled = true; };
  }, [busquedaParam, productos.length]);

  // Al llegar con una marca seleccionada (por ejemplo, desde "Marcas destacadas"),
  // desplazar suavemente a la secci?n de "Todos los productos"
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!marcaParam) return;

    let cancelled = false;
    let tries = 0;
    const tryScroll = () => {
      if (cancelled) return;
      const anchor = document.getElementById('todos-productos');
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const nav = document.querySelector('nav[role=\"navigation\"]');
        const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
        const offset = Math.max(50, navHeight + 25);
        const targetY = currentY + rect.top - offset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else if (tries < 20) {
        tries += 1;
        setTimeout(tryScroll, 100);
      }
    };

    setTimeout(tryScroll, 0);
    return () => { cancelled = true; };
  }, [marcaParam, productos.length]);

  // Hook SEO para página de productos
  const { seoData } = useSEO('productos', { path: '/productos' });

  console.log('ðŸ” Parámetro de búsqueda:', busquedaParam);
  console.log('ðŸ·ï¸ Parámetro de marca:', marcaParam);

  // Lista de marcas predefinidas
  const marcasPredefinidas = ["Cummins", "Navistar", "Volvo", "Mercedes Benz", "Detroit", "Caterpillar"];
  // Orden de prioridad para "Todos los productos"
  const PRIORIDAD_TIPOS = [
    'cabeza',
    'media reparacion',
    'arbol de levas',
    'turbo',
    'vgt',
    'modulo',
    'bomba',
    'anillos',
    'inyector',
    'junta'
  ];

  const normalizar = (s) => (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const obtenerIndicePrioridad = (producto) => {
    const texto = normalizar([
      producto?.tipoProducto,
      producto?.nombre,
      producto?.descripcion,
      producto?.numeroParte,
    ].filter(Boolean).join(' '));

    for (let i = 0; i < PRIORIDAD_TIPOS.length; i += 1) {
      const term = PRIORIDAD_TIPOS[i];
      if (texto.includes(term)) return i;

      // Variantes comunes por tildes/plurales
      if (term === 'media reparacion') {
        if (texto.includes('media reparaci')) return i; // reparación / reparaciones
      }
      if (term === 'arbol de levas') {
        if (texto.includes('arboles de levas') || texto.includes('arbol de leva')) return i;
      }
      if (term === 'modulo') {
        if (texto.includes('modulos')) return i;
      }
      if (term === 'turbo') {
        if (texto.includes('turbos')) return i;
      }
      if (term === 'bomba') {
        if (texto.includes('bombas')) return i;
      }
      if (term === 'anillos') {
        if (texto.includes('anillo')) return i;
      }
      if (term === 'inyector') {
        if (texto.includes('inyectores')) return i;
      }
      if (term === 'junta') {
        if (texto.includes('juntas')) return i;
        if (texto.includes('kit de juntas') || texto.includes('kit juntas')) return i;
      }
    }
    return PRIORIDAD_TIPOS.length + 1; // sin coincidencia => al final
  };

  const ordenarPorPrioridad = (items) => {
    return [...items].sort((a, b) => {
      const ai = obtenerIndicePrioridad(a);
      const bi = obtenerIndicePrioridad(b);
      if (ai !== bi) return ai - bi;
      // Desempatar por nombre A-Z para consistencia visual
      return normalizar(a?.nombre).localeCompare(normalizar(b?.nombre));
    });
  };

  // Mezcla aleatoria ponderada por prioridad (variedad por visita)
  const sessionSeedRef = useRef(null);
  useEffect(() => {
    if (sessionSeedRef.current == null) {
      sessionSeedRef.current = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    }
  }, []);

  const seededRandom = () => {
    // LCG 32-bit
    let seed = sessionSeedRef.current >>> 0;
    seed = (seed * 1664525 + 1013904223) >>> 0;
    sessionSeedRef.current = seed;
    return (seed & 0xffffffff) / 0x100000000;
  };

  const ordenarPorVariedad = (items) => {
    // Efraimidis-Spirakis: key = u^(1/w), sort desc
    return [...items]
      .map((item) => {
        const idx = obtenerIndicePrioridad(item);
        const w = idx <= PRIORIDAD_TIPOS.length ? (PRIORIDAD_TIPOS.length - idx + 1) : 1; // >=1
        const u = Math.max(1e-12, seededRandom());
        const key = Math.pow(u, 1 / w);
        return { item, key };
      })
      .sort((a, b) => b.key - a.key)
      .map(({ item }) => item);
  };
  const ordenarResultadosPorBusqueda = (items, termino) => {
    const query = termino?.trim().toLowerCase();
    if (!query) {
      return items;
    }

    const tokens = query.split(/\s+/).filter(Boolean);

    const calcularPuntaje = (producto) => {
      const nombre = (producto?.nombre || '').toLowerCase();
      const numeroParte = (producto?.numeroParte || '').toLowerCase();
      const descripcion = (producto?.descripcion || '').toLowerCase();
      const marca = (producto?.marca || '').toLowerCase();
      let puntaje = 0;

      if (nombre === query) puntaje += 200;
      if (nombre.startsWith(query)) puntaje += 140;
      if (nombre.includes(query)) puntaje += 90;

      tokens.forEach((token) => {
        if (nombre.startsWith(token)) puntaje += 50;
        if (nombre.includes(token)) puntaje += 30;
        if (numeroParte.includes(token)) puntaje += 25;
        if (marca.includes(token)) puntaje += 15;
        if (descripcion.includes(token)) puntaje += 10;
      });

      if (producto?.puntuacionRelevancia) {
        puntaje += Number(producto.puntuacionRelevancia);
      }

      return puntaje;
    };

    return [...items].sort((a, b) => calcularPuntaje(b) - calcularPuntaje(a));
  };

  const {
    selectedAdvisor,
    startContact: startAdvisorContact,
    isReady: isAdvisorReady,
  } = useWhatsAppContact({
    allowSelection: false,
    onRequireSelection: () => {
      setAdvisorSelectionReminder(true);
      setAdvisorModalOpen(true);
    },
    getMessage: ({ advisor, payload }) => {
      if (payload?.customMessage) {
        return payload.customMessage;
      }
      const productData = payload?.product;
      if (productData) {
        const price = productData.precioVentaSugerido || productData.precio || 0;
        return advisor.productMessage
          .replace('{producto}', productData.nombre)
          .replace('{precio}', formatearPrecioWhatsApp(price));
      }
      return advisor.generalMessage;
    },
  });
  useEffect(() => {
    if (selectedAdvisor) {
      setAdvisorSelectionReminder(false);
    }
  }, [selectedAdvisor]);


  // MODIFICADO: Efecto combinado para inicializar filtros y cargar productos
  useEffect(() => {
    const inicializarFiltrosYCargar = async () => {
      console.log('ðŸ”„ Inicializando filtros desde URL...');

      // Inicializar marca si viene desde URL
      let marcasIniciales = [];
      if (marcaParam && marcasPredefinidas.includes(marcaParam)) {
        console.log('ðŸ”„ Inicializando con marca desde URL:', marcaParam);
        marcasIniciales = [marcaParam];
        setSelectedMarcas([marcaParam]);
      }

      // Marcar como inicializados
      setFiltrosInicializados(true);

      // Cargar productos con los filtros iniciales
      await cargarProductosConFiltros(marcasIniciales, selectedOrden, busquedaParam);
    };

    inicializarFiltrosYCargar();
  }, [marcaParam, busquedaParam]); // Solo depende de los parÃ¡metros de URL

  // MODIFICADO: Efecto para cargar productos cuando cambian los filtros (despuÃ©s de la inicializaciÃ³n)
  useEffect(() => {
    if (filtrosInicializados) {
      console.log('ðŸ”„ Filtros cambiados, recargando productos...');
      cargarProductosConFiltros(selectedMarcas, selectedOrden, busquedaParam);
    }
  }, [selectedMarcas, selectedOrden, filtrosInicializados]);

  // Efecto para actualizar productos visibles cuando cambian los productos o la página
  useEffect(() => {
    actualizarProductosVisibles();
  }, [productos, paginaActual]);

  // FunciÃ³n para actualizar productos visibles basado en paginación
  const actualizarProductosVisibles = () => {
    const inicio = 0;
    const fin = paginaActual * PRODUCTOS_POR_PAGINA;
    const nuevosProductosVisibles = productos.slice(inicio, fin);

    setProductosVisibles(nuevosProductosVisibles);
    setHayMasProductos(fin < productos.length);

  };

  // REVERTIDO: FunciÃ³n principal para cargar productos con filtros (usando servicios originales)
  const cargarProductosConFiltros = async (marcas = selectedMarcas, orden = selectedOrden, busqueda = busquedaParam) => {
    try {
      setLoading(true);
      setError('');
      setPaginaActual(1);

      console.log('ðŸ”„ Cargando productos con filtros:', {
        marcas,
        orden,
        busqueda
      });

      let resultados;

      if (busqueda) {
        console.log('ðŸ” Buscando con tÃ©rmino y filtros:', {
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
        console.log('ðŸ“¦ Cargando productos con filtros:', {
          marcas: marcas,
          orden: orden
        });

        resultados = await obtenerProductos({
          marcas: marcas,
          orden: orden
        });
      }

      let productosProcesados = Array.isArray(resultados) ? resultados : resultados?.productos || [];

      if (busqueda) {
        productosProcesados = ordenarResultadosPorBusqueda(productosProcesados, busqueda);
      } else {
        // Sección "Todos los productos": mezclar aleatoriamente con ponderación por prioridad
        productosProcesados = ordenarPorVariedad(productosProcesados);
      }

      productosProcesados = priorizarConImagen(productosProcesados);

      setProductos(productosProcesados);

      // Extraer marcas Ãºnicas de los resultados para el filtro
      const marcasUnicas = [...new Set(productosProcesados.map(p => p.marca).filter(Boolean))];
      setMarcasDisponibles(marcasUnicas);

      console.log(`âœ… Cargados ${productosProcesados.length} productos con filtros del backend`);
    } catch (error) {
      console.error("âŒ Error al cargar productos:", error);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  // FunciÃ³n para cargar más productos
  const cargarMasProductos = async () => {
    setCargandoMas(true);

    // Simular pequeÃ±a carga para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));

    setPaginaActual(prev => prev + 1);
    setCargandoMas(false);

    console.log('ðŸ“„ Cargando página:', paginaActual + 1);
  };

  // FunciÃ³n para refrescar productos (llamada desde AdminButtons)
  const refetchProducts = () => {
    cargarProductosConFiltros();
  };

  const handleWhatsAppClick = (producto, e) => {
    startAdvisorContact({ product: producto }, e);
  };
  const handleAddToCart = (producto) => {
    if (!producto) {
      return;
    }

    // Requisito: solo agregar si ya hay asesor seleccionado previamente
    if (!isAdvisorReady) {
      // AÃºn no carga el estado de asesor; marcar para abrir modal al estar listo
      setPendingAdvisorPrompt(true);
      setAdvisorSelectionReminder(true);
      return;
    }

    if (!selectedAdvisor) {
      // No hay asesor, abrir modal y no agregar
      setAdvisorSelectionReminder(true);
      setAdvisorModalOpen(true);
      return;
    }

    // Hay asesor seleccionado: proceder a agregar
    const price = Number(producto.precioVentaSugerido || producto.precio || 0);
    const itemId = producto.id || producto.slug || producto.nombre;
    addItem({ id: itemId, name: producto.nombre || 'Producto', price });
  };
  const handleProductoClick = async (producto) => {
    const slug = getProductSlug(producto);
    const targetPath = `/productos/${slug}`;

    // Esperar a que el hook cargue la selecciÃ³n persistida antes de decidir
    if (!isAdvisorReady) {
      setPendingProductPath(targetPath);
      setAdvisorSelectionReminder(true);
      // No abrir modal todavÃ­a; se decidirÃ¡ cuando isAdvisorReady sea true
      return;
    }

    if (selectedAdvisor) {
      await registrarVista(producto.id);
      router.push(targetPath);
      return;
    }

    setPendingProductPath(targetPath);
    setAdvisorSelectionReminder(true);
    setAdvisorModalOpen(true);
  };

  // Si se selecciona asesor y hay un producto pendiente, navegar al detalle automÃ¡ticamente
  useEffect(() => {
    if (selectedAdvisor && pendingProductPath) {
      setAdvisorModalOpen(false);
      router.push(pendingProductPath);
      setPendingProductPath(null);
      setAdvisorSelectionReminder(false);
    }
  }, [selectedAdvisor, pendingProductPath]);

  // Abrir el modal solo cuando ya sabemos si hay asesor o no
  useEffect(() => {
    if (isAdvisorReady && !selectedAdvisor && pendingProductPath) {
      setAdvisorModalOpen(true);
    }
  }, [isAdvisorReady, selectedAdvisor, pendingProductPath]);

  // Si se agregÃ³ al carrito sin asesor cargado aÃºn, abrir modal cuando estÃ© listo
  useEffect(() => {
    if (pendingAdvisorPrompt && isAdvisorReady && !selectedAdvisor) {
      setAdvisorSelectionReminder(true);
      setAdvisorModalOpen(true);
      setPendingAdvisorPrompt(false);
    }
    if (selectedAdvisor && pendingAdvisorPrompt) {
      setPendingAdvisorPrompt(false);
    }
  }, [pendingAdvisorPrompt, isAdvisorReady, selectedAdvisor]);

  const obtenerPrimeraImagen = (producto) => {
    if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object' && producto.imagenesUrl.frente) {
      console.log('ðŸ–¼ï¸ Usando imagen frente:', producto.imagenesUrl.frente);
      return producto.imagenesUrl.frente;
    }

    if (producto.imagenUrl) {
      console.log('ðŸ–¼ï¸ Usando imagenUrl:', producto.imagenUrl);
      return producto.imagenUrl;
    }

    if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
      const imagenes = Object.values(producto.imagenesUrl).filter(img => img && img.trim() !== '');
      if (imagenes.length > 0) {
        console.log('ðŸ–¼ï¸ Usando primera imagen disponible:', imagenes[0]);
        return imagenes[0];
      }
    }

    if (producto.imagen) {
      console.log('ðŸ–¼ï¸ Usando imagen legacy:', producto.imagen);
      return producto.imagen;
    }

    console.log('ðŸš« No se encontrÃ³ imagen para el producto:', producto.nombre);
    return null;
  };

  const tieneImagen = (producto) => {
    if (!producto) return false;
    if (producto.imagenesUrl && typeof producto.imagenesUrl === 'object') {
      if (producto.imagenesUrl.frente) return true;
      const imagenes = Object.values(producto.imagenesUrl).filter(img => img && img.trim() !== '');
      if (imagenes.length > 0) return true;
    }
    if (producto.imagenUrl) return true;
    if (producto.imagen) return true;
    return false;
  };

  const priorizarConImagen = (items) => {
    const conImagen = [];
    const sinImagen = [];
    (items || []).forEach((item) => {
      if (tieneImagen(item)) {
        conImagen.push(item);
      } else {
        sinImagen.push(item);
      }
    });
    return [...conImagen, ...sinImagen];
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
      ? [] // Deseleccionar - array vacÃ­o
      : [marca]; // Seleccionar solo esta marca

    console.log('ðŸ”„ Cambiando filtro de marca (solo una):', { marca, nuevasMarcas });
    setSelectedMarcas(nuevasMarcas);
  };
  const handleOrdenChange = (nuevoOrden) => {
    console.log('ðŸ”„ Cambiando orden:', nuevoOrden);
    setSelectedOrden(nuevoOrden);
  };

  const clearAllFilters = () => {
    console.log('ðŸ§¹ Limpiando todos los filtros');
    setSelectedMarcas([]);
    setSelectedOrden('A-Z');
    setIsMobileFilterOpen(false);
  };

  const clearSearch = () => {
    console.log('ðŸ”„ Borrando bÃºsqueda y reseteando filtros');
    router.push('/productos');
  };

  // Schema.org para la página de productos
  
  // Categorías destacadas (Explora por tipo) - Nuevo diseño con imágenes provistas
  const featuredCategories = [
    { label: 'Cabeza de Motor', term: 'cabeza', image: 'https://i.postimg.cc/d1tTjPF5/Anadir-un-titulo.png' },
    { label: 'Árboles de levas', term: 'árbol de levas', image: 'https://i.postimg.cc/YSVT7kSL/Copia-de-Anadir-un-titulo-4.png' },
    { label: 'Turbos', term: 'turbo', image: 'https://i.postimg.cc/3w6zh7w2/Copia-de-Anadir-un-titulo-5.png' },
    { label: 'Bombas', term: 'bomba', image: 'https://i.postimg.cc/5tGDJ1tr/Copia-de-Anadir-un-titulo-6.png' },
    { label: 'VGT', term: 'vgt', image: 'https://i.postimg.cc/k5ZLC95K/Copia-de-Anadir-un-titulo-7.png' },
    { label: 'Inyectores', term: 'inyector', image: 'https://i.postimg.cc/zfM4N5fW/Copia-de-Anadir-un-titulo-8.png' },
    { label: 'Módulos', term: 'módulo', image: 'https://i.postimg.cc/QddQqTqV/Copia-de-Anadir-un-titulo.png' },
    { label: 'Medias Reparaciones', term: 'media reparación', image: 'https://i.postimg.cc/dVV29y9L/Copia-de-Anadir-un-titulo-1.png' },
    { label: 'Anillos', term: 'anillo', image: 'https://i.postimg.cc/T33VcDcK/Copia-de-Anadir-un-titulo-2.png' },
    { label: 'Kits de juntas', term: 'junta', image: 'https://i.postimg.cc/Df5cswF1/Kits-de-Juntas-4.png' }
  ];

  // Reordenar: colocar "Medias Reparaciones" en segunda posición para mobile layout
  const featuredCategoriesOrdered = (() => {
    const arr = [...featuredCategories];
    const idx = arr.findIndex((c) => (c.label || '').toLowerCase().includes('medias'));
    if (idx > -1) {
      const [item] = arr.splice(idx, 1);
      arr.splice(1, 0, item);
    }
    return arr;
  })();

  const handleFeaturedClick = (term) => {
    const current = (busquedaParam || '').toLowerCase();
    const next = (term || '').toLowerCase();

    if (current !== next) {
      router.push(`/productos?busqueda=${encodeURIComponent(term)}`);
    }

    if (typeof window !== 'undefined') {
      const anchor = document.getElementById('todos-productos');
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const nav = document.querySelector('nav[role="navigation"]');
      const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
      const offset = Math.max(50, navHeight + 25);
      const targetY = currentY + rect.top - offset;

      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };
  // Motores destacados (para quién compras) - Usar imágenes provistas y búsqueda por motor
  const engineBrands = [
    { label: 'ISX', search: 'ISX', image: 'https://i.postimg.cc/gjN7xykF/MOTOR-ISX.png' },
    { label: 'X-15', search: 'X-15', image: 'https://i.postimg.cc/J7qvY83g/MOTOR-X15.png' },
    { label: 'N14', search: 'N14', image: 'https://i.postimg.cc/XN8m1WcM/MOTOR-N14.png' },
    { label: 'PX8', search: 'PX8', image: 'https://i.postimg.cc/Wb1KQyXv/MOTOR-PX8.png' },
    { label: 'D13', search: 'D13', image: 'https://i.postimg.cc/j2Z1D6dq/MOTOR-VOLVO-D13.png' },
    { label: 'C15', search: 'C15', image: 'https://i.postimg.cc/8ctY7dPV/MOTOR-C15.png' },
    { label: 'DD5', search: 'DD5', image: 'https://i.postimg.cc/hvpYX84H/MOTOR-DD5.png' },
    { label: 'DD6', search: 'DD6', image: 'https://i.postimg.cc/MZDN3w0r/MOTOR-DD6.png' },
    { label: 'ISM', search: 'ISM', image: 'https://i.postimg.cc/MZDN3w0F/MOTOR-ISM.png' },
    { label: 'DT466', search: 'DT466', image: 'https://i.postimg.cc/GtPCqgJR/DT466.png' },
    { label: 'OM906', search: 'OM906', image: 'https://i.postimg.cc/qvvTxLNm/OM906.png' }
  ];

  const handleBrandClick = (query) => {
    const current = (busquedaParam || '').toLowerCase();
    const next = (query || '').toLowerCase();

    if (current !== next) {
      router.push(`/productos?busqueda=${encodeURIComponent(query)}`);
    }

    if (typeof window !== 'undefined') {
      const anchor = document.getElementById('todos-productos');
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const nav = document.querySelector('nav[role="navigation"]');
      const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
      const offset = Math.max(50, navHeight + 25);
      const targetY = currentY + rect.top - offset;

      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
  };

  
  const schemaProductCatalog = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Catálogo de Refacciones para Tractocamión",
    "description": "Amplio Catálogo de Refacciones para Tractocamión: turbos, cabezas de motor, árboles de levas y más",
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
          <main className="mainContent" aria-busy="true"></main>
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
              <button onClick={() => cargarProductosConFiltros()} className="retryButton">
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
                <h1>Nuestros Productos</h1>
                {/* Resultado de búsqueda movido a la sección de "Todos los productos" */}
                <div className="heroControls">
                  <div className="advisorQuick">
                    {selectedAdvisor ? (
                      <>
                        <span className="advisorQuickText">Te atenderá <strong>{selectedAdvisor.name}</strong></span>
                        <button
                          type="button"
                          className="advisorQuickButton"
                          onClick={() => { setAdvisorSelectionReminder(true); setAdvisorModalOpen(true); }}
                        >
                          <span className="buttonText">Cambiar asesor</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="advisorQuickText">Elige un asesor</span>
                        <button
                          type="button"
                          className="advisorQuickButton"
                          onClick={() => { setAdvisorSelectionReminder(true); setAdvisorModalOpen(true); }}
                        >
                          <span className="buttonText">Elegir asesor</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aviso retirado: ahora se abre el modal de asesores directamente */}

          {/* Botón Filtrar móvil */}
          

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
              {/* Botón Borrar búsqueda en móvil */}
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
                        onChange={() => {
                          handleMarcaChange(marca);
                          closeMobileFilter();
                        }}
                      />
                      <span className="mobileCheckmark"></span>
                      {marca}
                    </label>
                  ))}
                </div>
              </div>

              {/* Ordenamiento solo visible cuando NO hay bÃºsqueda */}
              {!busquedaParam && (
                <div className="mobileFilterGroup">
                  <h4>Variedad por visita</h4>
                  <div className="searchPriorityInfo">
                    <p>
                      Mezclamos los productos aleatoriamente, ponderando por prioridad para
                      mostrar primero: Cabeza, Media reparación, Árboles de levas, Turbos, VGT,
                      Módulos, Bombas, Anillos, Inyectores y Juntas.
                    </p>
                  </div>
                </div>
              )}

              {/* Mensaje explicativo cuando hay bÃºsqueda */}
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

          {/* SecciÃ³n principal de productos */}
          <section className="productosMainSection">
            <div className="productosContainer">


              {/* Sidebar - Filtros DESKTOP */}
              
              {/* Categorías destacadas */}
              <section className="featuredCategories">
                <div className="allProductsBanner">
                  <div className="allProductsBannerBox">Explora por tipo</div>
                </div>
                <div className="featuredGrid">
                  {featuredCategoriesOrdered.map(({ label, term, image }, i) => (
                    <button
                      key={label}
                      type="button"
                      className={`featuredCard ${i % 6 === 0 ? 'featuredCard--wide' : i % 6 === 1 ? 'featuredCard--tall' : i % 6 === 2 ? 'featuredCard--large' : ''}`}
                      data-term={term}
                      onClick={() => handleFeaturedClick(term)}
                      aria-label={`Explorar ${label}`}
                    >
                      <div
                        className="featuredCardBg"
                        data-term={term}
                        style={image ? { backgroundImage: `url('${image}')` } : undefined}
                        aria-hidden="true"
                      />
                      <div className="featuredCardOverlay">
                        <span className="featuredCardLabel">{label}</span>
                        <span className="featuredCardCTA">Ver {label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* ¿Para qué motor compras? */}
              <section className="shopByEngine">
                <div className="allProductsBanner">
                  <div className="allProductsBannerBox">¿Para qué motor compras?</div>
                </div>
                <div className="engineGrid">
                  {engineBrands.map(({ label, search, image }) => (
                    <button
                      key={label}
                      type="button"
                      className="engineCard"
                      onClick={() => handleBrandClick(search)}
                      aria-label={`Explorar ${label}`}
                    >
                      <div
                        className="engineCardBg"
                        data-engine={label}
                        style={image ? { backgroundImage: `url('${image}')` } : undefined}
                        aria-hidden="true"
                      />
                      <div className="engineCardOverlay">
                        <span className="engineCardLabel">{label}</span>
                        <span className="engineCardCTA">Ver {label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
              {/* Banner Todos los productos (solo informativo, sin acción) */}
              <div className="allProductsBanner" id="todos-productos">
                <div className="allProductsBannerBox">Todos los productos</div>
                <div className={`filterBannerRow ${(busquedaParam || (selectedMarcas && selectedMarcas.length > 0)) ? 'withResults' : ''}`}>
                  <button className="filterBannerBtn" onClick={toggleMobileFilter}>
                    <FaFilter /> Filtrar por
                  </button>
                  {(busquedaParam || (selectedMarcas && selectedMarcas.length > 0)) && (
                    <div className="searchResultsNotice" aria-live="polite">
                      {busquedaParam && (
                        <span className="resultsQuery searchIndicator searchIndicator--inline">
                          Resultados para: "{busquedaParam}" ({productos.length} productos encontrados)
                        </span>
                      )}
                      {selectedMarcas && selectedMarcas.length > 0 && (
                        <span className="brandFilterIndicator">
                          Marca seleccionada: {selectedMarcas.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

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

                {/* Botón Borrar búsqueda en desktop */}
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

                {/* Ordenamiento solo visible cuando NO hay bÃºsqueda */}
                {!busquedaParam && (
                  <div className="filtroGroup">
                    <h3>Variedad por visita</h3>
                    <div className="searchPriorityInfo">
                      <p>
                        La lista se mezcla en cada visita usando una recomendación dinámica
                        aleatoria ponderada por prioridad (los tipos clave aparecen antes).
                      </p>
                    </div>
                  </div>
                )}

                {/* InformaciÃ³n de prioridad de bÃºsqueda */}
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
                              
                              <p>Imagen no detectada</p>
                            </div>
                          </div>

                          <div className="productoInfo">
                            <h3 className="productoNombre">{producto.nombre}</h3>
                            <p className="productoDescripcion">
                              {getPreviewDescription(producto.descripcion, 120)}
                            </p>
                            <div className="productoPrecio">
                              {formatearPrecio(producto.precioVentaSugerido || 0)}
                            </div>
                            {/* Requerimiento: ocultar acciones en listado. 
                                Las acciones "Agregar al carrito" y "Compra por WhatsApp"
                                solo deben mostrarse en la página del producto individual. */}
                            {/* Aviso de asesor removido de cada tarjeta */}
                          </div>
                          <button
                            type="button"
                            className="cartButton cartButtonCompact"
                            aria-label={`Agregar ${producto.nombre} al carrito`}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(producto); }}
                            title="Agregar al carrito"
                          >
                            <FaShoppingCart />
                            <span className="cartButtonLabel">Agregar</span>
                          </button>
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
                              <span className="buttonText">Cargando...</span>
                            </>
                          ) : (
                            <>
                              <FaChevronDown className="buttonIcon" />
                              <span className="buttonText">Ver más productos</span>
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
        
        <AdvisorPickerModal isOpen={advisorModalOpen} onClose={() => setAdvisorModalOpen(false)} />
      </div>
    </>
  );
}



















