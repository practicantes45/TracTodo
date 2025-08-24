const { db } = require("../config/firebase");

// Cache en memoria
const seoCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

// ✅ BASE DE DATOS ESPECÍFICA basada en tus documentos
const PRODUCTOS_ESPECIFICOS = {
  "4037050": {
    tipo: "TURBO",
    titulo: "Turbo PX8 para Motor Cummins | Número de Parte 4037050",
    descripcion: "Turbo nuevo para motor Cummins PX8, número de parte 4037050. Mejora la potencia, eficiencia y reduce el consumo de combustible.",
    palabrasClave: ["Cummins", "Turbo", "PX8", "turbo para tractocamión", "reemplazo de turbo", "venta de turbo para motor diésel"],
    marca: "Cummins",
    modelo: "PX8",
    categoria: "turbo"
  },
  "3529040": {
    tipo: "TURBO", 
    titulo: "Turbo Big Cam 350/400 para Motor Cummins | Número de Parte 3529040",
    descripcion: "Turbo nuevo para motor Cummins Big Cam 350/400, número de parte 3529040. Mejora la potencia, eficiencia y reduce el consumo de combustible.",
    palabrasClave: ["Cummins", "Turbo", "Big Cam", "350/400", "turbo para tractocamión", "venta de turbo para motor diésel"],
    marca: "Cummins",
    modelo: "Big Cam 350/400",
    categoria: "turbo"
  },
  "4036892": {
    tipo: "TURBO",
    titulo: "Turbo ISX para Motor Cummins | Número de Parte 4036892", 
    descripcion: "Turbo nuevo para motor Cummins ISX, número de parte 4036892. Mejora la potencia, eficiencia y vida útil del motor en condiciones exigentes.",
    palabrasClave: ["Cummins", "Turbo", "ISX", "turbo para tractocamión", "reemplazo de turbo"],
    marca: "Cummins",
    modelo: "ISX",
    categoria: "turbo"
  },
  "3590044": {
    tipo: "TURBO",
    titulo: "Turbo ISM para Motor Cummins | Números de Parte 3590044, 3590045, 3800471",
    descripcion: "Turbo nuevo para motor Cummins ISM, disponible en números de parte 3590044, 3590045 y 3800471. Mejora el rendimiento, potencia y eficiencia del motor.",
    palabrasClave: ["Cummins", "Turbo", "ISM", "turbo para tractocamión"],
    marca: "Cummins", 
    modelo: "ISM",
    categoria: "turbo"
  },
  "23513563": {
    tipo: "TURBO",
    titulo: "Turbo PX8 Importado para Motor Cummins | Número de Parte 23513563",
    descripcion: "Turbo PX8 de importación americana para motor Cummins, número de parte 23513563. Mejora el desempeño del motor con mayor potencia y eficiencia.",
    palabrasClave: ["Cummins", "Turbo", "PX8", "turbo para tractocamión", "importación americana"],
    marca: "Cummins",
    modelo: "PX8", 
    categoria: "turbo"
  },
  "714788-5001S": {
    tipo: "TURBO",
    titulo: "Turbo DD4 para Motor Detroit Diésel | Número de Parte 714788-5001S",
    descripcion: "Turbo nuevo para motor Detroit Diésel DD4, número de parte 714788-5001S. Mejora la eficiencia, potencia y rendimiento del motor.",
    palabrasClave: ["Detroit Diésel", "Turbo", "DD4", "turbo para tractocamión"],
    marca: "Detroit Diesel",
    modelo: "DD4",
    categoria: "turbo"
  },
  "23534360": {
    tipo: "TURBO",
    titulo: "Turbo DD5 para Motor Detroit Diésel | Número de Parte 23534360", 
    descripcion: "Turbo nuevo para motor Detroit Diésel DD5, número de parte 23534360. Incrementa la potencia, mejora la eficiencia y reduce el consumo de combustible.",
    palabrasClave: ["Detroit Diésel", "Turbo", "DD5", "turbo para tractocamión"],
    marca: "Detroit Diesel",
    modelo: "DD5",
    categoria: "turbo"
  },

  // ÁRBOLES DE LEVAS - Basados en "Archivo Descripciones SEO (Arboles de Levas) (Terminado).docx"
  "4059893": {
    tipo: "ARBOL_LEVAS",
    titulo: "Árbol de Levas Cummins M11 | Número de parte 4059893",
    descripcion: "Compra árbol de levas Cummins M11, número de parte 4059893. Refacción esencial para el correcto tiempo y rendimiento del motor.",
    palabrasClave: ["Cummins", "Árbol de Levas", "M11", "árbol de levas para tractocamión", "repuesto de árbol de levas"],
    marca: "Cummins",
    modelo: "M11", 
    categoria: "arbol_levas"
  },
  "138-2012": {
    tipo: "ARBOL_LEVAS",
    titulo: "Árbol de Levas Caterpillar C12 | Número de parte 138-2012",
    descripcion: "Adquiere el árbol de levas Caterpillar C12, parte 138-2012. Mejora la sincronización del motor y extiende su vida útil con refacción original.",
    palabrasClave: ["Caterpillar", "Árbol de levas", "C12", "árbol de levas para tractocamión"],
    marca: "Caterpillar",
    modelo: "C12",
    categoria: "arbol_levas"
  },
  "23532935": {
    tipo: "ARBOL_LEVAS", 
    titulo: "Árbol de Levas DD14 L Detroit Diésel | Refacción Motor 23532935",
    descripcion: "Compra árbol de levas DD14 L para motor Detroit Diésel. Parte 23532935. Mejora la sincronización del motor y el rendimiento general del sistema.",
    palabrasClave: ["Detroit Diésel", "Árbol de Levas", "DD14 L", "árbol de levas para tractocamión"],
    marca: "Detroit Diesel",
    modelo: "DD14 L",
    categoria: "arbol_levas"
  },
  "23524912": {
    tipo: "ARBOL_LEVAS",
    titulo: "Árbol de Levas DD4 Detroit Diésel | Refacción Motor 23524912", 
    descripcion: "Compra árbol de levas DD4 para motor Detroit Diésel. Parte 23524912. Sincroniza válvulas y mejora el rendimiento de tu tractocamión.",
    palabrasClave: ["Detroit Diésel", "Árbol de Levas", "DD4", "árbol de levas para tractocamión"],
    marca: "Detroit Diesel",
    modelo: "DD4",
    categoria: "arbol_levas"
  },
  "260-1814": {
    tipo: "ARBOL_LEVAS",
    titulo: "Árbol de Levas Caterpillar C13 | Refacción Motor 260-1814",
    descripcion: "Compra árbol de levas C13 Caterpillar. Parte 260-1814. Mejora el control de válvulas y el rendimiento del motor de tu tractocamión.",
    palabrasClave: ["Caterpillar", "Árbol de Levas", "C13", "árbol de levas para tractocamión"],
    marca: "Caterpillar",
    modelo: "C13", 
    categoria: "arbol_levas"
  },

  // CABEZAS DE MOTOR - Basados en "Fichas SEO (Cabezas).docx" (primeras 10 para no hacer el objeto demasiado largo)
  "M5011241R91": {
    tipo: "CABEZA",
    titulo: "Cabeza de motor Navistar Maxxforce 13 | Refacción de alto rendimiento",
    descripcion: "Encuentra cabeza de motor para Navistar Maxxforce 13. Compatible con sistemas EGR. Alto desempeño, ideal para flotas de carga y motores industriales.",
    palabrasClave: ["Navistar", "Cabeza de Motor", "Maxxforce 13", "cabeza de motor para tractocamión", "venta de cabezas de motor"],
    marca: "Navistar",
    modelo: "Maxxforce 13",
    categoria: "cabeza"
  },
  "M7W2203": {
    tipo: "CABEZA", 
    titulo: "Cabeza de motor Caterpillar 3406 mecánico | Alta durabilidad",
    descripcion: "Reemplaza tu cabeza de motor Caterpillar 3406 mecánico con esta pieza de alta resistencia. Ideal para motores de carga pesada y condiciones extremas.",
    palabrasClave: ["Caterpillar", "Cabeza de Motor", "3406", "Mecánico", "cabeza de motor para tractocamión"],
    marca: "Caterpillar",
    modelo: "3406",
    categoria: "cabeza"
  },
  "5307154": {
    tipo: "CABEZA",
    titulo: "Cabeza de motor Cummins ISF | Alta eficiencia en combustión", 
    descripcion: "Compra cabeza de motor para Cummins ISF. Diseño reforzado y compatible con múltiples versiones. Ideal para flotas que buscan eficiencia y durabilidad.",
    palabrasClave: ["Cummins", "Cabeza de Motor", "ISF", "cabeza de motor para tractocamión"],
    marca: "Cummins",
    modelo: "ISF",
    categoria: "cabeza"
  },
  "J5413782": {
    tipo: "CABEZA",
    titulo: "Cabeza de motor Cummins ISX | Potencia y resistencia",
    descripcion: "Reemplaza tu cabeza de motor Cummins ISX. Alto rendimiento, sellado preciso y gran durabilidad para uso pesado.",
    palabrasClave: ["Cummins", "Cabeza de Motor", "ISX", "cabeza de motor para tractocamión", "venta de cabezas de motor"],
    marca: "Cummins", 
    modelo: "ISX",
    categoria: "cabeza"
  }
};

// Mapeo adicional por nombre/descripción para productos no identificados por número de parte
const MAPEO_POR_TEXTO = {
  // Patrones para detectar productos específicos por texto
  "turbo px8": "4037050",
  "turbo big cam": "3529040", 
  "turbo isx": "4036892",
  "turbo ism": "3590044",
  "turbo dd4": "714788-5001S",
  "turbo dd5": "23534360",
  "arbol levas m11": "4059893",
  "árbol levas m11": "4059893",
  "arbol levas c12": "138-2012",
  "árbol levas c12": "138-2012",
  "cabeza navistar maxxforce": "M5011241R91",
  "cabeza caterpillar 3406": "M7W2203",
  "cabeza cummins isf": "5307154",
  "cabeza cummins isx": "J5413782"
};

// Patrones dinámicos para productos no específicos (como respaldo)
const TIPOS_PRODUCTO_DINAMICOS = {
  CABEZA: {
    keywords: ['cabeza', 'head', 'culata'],
    patron_titulo: "{marca} {modelo} Cabeza Motor | {numeroParte} | Tractodo",
    patron_descripcion: "Cabeza motor {marca} {modelo} {numeroParte}. Refacción original tractocamión. Envío nacional, garantía incluida. ¡Cotiza ahora!",
    palabras_clave: ['cabeza de motor para tractocamión', 'venta de cabezas de motor', 'refacciones para tractocamión']
  },
  TURBO: {
    keywords: ['turbo', 'turbocargador'],
    patron_titulo: "Turbo {marca} {modelo} | {numeroParte} | Tractodo Querétaro",
    patron_descripcion: "Turbo {marca} {modelo} {numeroParte}. Mejora potencia y eficiencia. Refacciones tractocamión con garantía. ¡Cotiza ahora!",
    palabras_clave: ['turbo para tractocamión', 'reemplazo de turbo', 'venta de turbo para motor diésel']
  },
  ARBOL_LEVAS: {
    keywords: ['árbol', 'arbol', 'levas', 'camshaft'],
    patron_titulo: "Árbol Levas {marca} {modelo} | {numeroParte} | Tractodo",
    patron_descripcion: "Árbol levas {marca} {modelo} {numeroParte}. Refacción original motor diésel. Envío nacional, garantía incluida.",
    palabras_clave: ['árbol de levas para tractocamión', 'repuesto de árbol de levas', 'venta de árbol de levas']
  },
  GENERICO: {
    keywords: [],
    patron_titulo: "{nombre} | {numeroParte} | Tractodo Refacciones",
    patron_descripcion: "Refacciones {marca} para tractocamión. {nombre}. Partes originales, envío nacional, garantía incluida.",
    palabras_clave: ['refacciones para tractocamión', 'partes de motor para camión pesado', 'tractopartes en México']
  }
};

/**
 * ✅ FUNCIÓN PRINCIPAL: Busca producto específico primero, luego usa lógica dinámica
 */
const obtenerDatosSEOProducto = async (id, producto = null) => {
  const cacheKey = `seo_${id}`;
  const cached = seoCache.get(cacheKey);
  
  // Verificar caché
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  // Si no hay producto, obtenerlo
  if (!producto) {
    try {
      const snapshot = await db.ref(`/${id}`).once("value");
      if (!snapshot.exists()) return null;
      producto = snapshot.val();
    } catch (error) {
      console.error(`Error obteniendo producto ${id}:`, error.message);
      return null;
    }
  }

  // PASO 1: Buscar por número de parte específico
  const numeroParte = producto.numeroParte?.trim();
  if (numeroParte && PRODUCTOS_ESPECIFICOS[numeroParte]) {
    const seoEspecifico = PRODUCTOS_ESPECIFICOS[numeroParte];
    const datosSEO = {
      titulo: seoEspecifico.titulo,
      descripcion: seoEspecifico.descripcion,
      palabrasClave: seoEspecifico.palabrasClave,
      schema: generarSchemaProducto(producto, id, seoEspecifico),
      slug: generarSlug(producto.nombre),
      tipo: seoEspecifico.tipo,
      fuente: "especifico_numero_parte",
      fechaGeneracion: new Date().toISOString()
    };
    
    // Guardar en caché
    seoCache.set(cacheKey, { data: datosSEO, timestamp: Date.now() });
    console.log(`SEO específico encontrado por número de parte: ${numeroParte}`);
    return datosSEO;
  }

  // PASO 2: Buscar por texto en nombre/descripción
  const textoCompleto = `${producto.nombre || ''} ${producto.descripcion || ''}`.toLowerCase();
  
  for (const [patron, numeroParteEspecifico] of Object.entries(MAPEO_POR_TEXTO)) {
    if (textoCompleto.includes(patron)) {
      const seoEspecifico = PRODUCTOS_ESPECIFICOS[numeroParteEspecifico];
      if (seoEspecifico) {
        // Personalizar título con el número de parte real del producto
        const tituloPersonalizado = numeroParte ? 
          seoEspecifico.titulo.replace(/\|.*$/, `| ${numeroParte} | Tractodo`) : 
          seoEspecifico.titulo;
          
        const datosSEO = {
          titulo: tituloPersonalizado,
          descripcion: seoEspecifico.descripcion,
          palabrasClave: seoEspecifico.palabrasClave,
          schema: generarSchemaProducto(producto, id, seoEspecifico),
          slug: generarSlug(producto.nombre),
          tipo: seoEspecifico.tipo,
          fuente: "especifico_texto",
          fechaGeneracion: new Date().toISOString()
        };
        
        seoCache.set(cacheKey, { data: datosSEO, timestamp: Date.now() });
        console.log(`SEO específico encontrado por texto: ${patron}`);
        return datosSEO;
      }
    }
  }

  // PASO 3: Usar sistema dinámico como respaldo
  console.log(`ℹUsando SEO dinámico para producto: ${id}`);
  const datosSEO = generarSEODinamico(producto, id);
  seoCache.set(cacheKey, { data: datosSEO, timestamp: Date.now() });
  return datosSEO;
};

/**
 * Genera SEO dinámico (sistema de respaldo)
 */
const generarSEODinamico = (producto, id) => {
  const tipo = detectarTipoProductoDinamico(producto);
  const config = TIPOS_PRODUCTO_DINAMICOS[tipo];
  
  const variables = {
    marca: detectarMarca(`${producto.nombre || ''} ${producto.descripcion || ''}`) || producto.marca || '',
    modelo: detectarModelo(`${producto.nombre || ''} ${producto.descripcion || ''}`),
    numeroParte: producto.numeroParte || '',
    nombre: producto.nombre || ''
  };

  let titulo = config.patron_titulo;
  let descripcion = config.patron_descripcion;
  
  Object.entries(variables).forEach(([key, value]) => {
    titulo = titulo.replace(new RegExp(`{${key}}`, 'g'), value);
    descripcion = descripcion.replace(new RegExp(`{${key}}`, 'g'), value);
  });

  // Limpiar y limitar longitud
  titulo = titulo.replace(/\s+/g, ' ').trim();
  descripcion = descripcion.replace(/\s+/g, ' ').trim();
  
  if (titulo.length > 60) titulo = titulo.substring(0, 57) + '...';
  if (descripcion.length > 160) descripcion = descripcion.substring(0, 157) + '...';

  const palabrasClave = [...config.palabras_clave];
  if (variables.marca) {
    palabrasClave.push(`refacciones ${variables.marca}`, `partes ${variables.marca}`);
  }
  palabrasClave.push('Tractodo Querétaro', 'refaccionaria diésel');

  return {
    titulo,
    descripcion,
    palabrasClave: palabrasClave.slice(0, 8),
    schema: generarSchemaProducto(producto, id),
    slug: generarSlug(producto.nombre),
    tipo,
    fuente: "dinamico",
    fechaGeneracion: new Date().toISOString()
  };
};

/**
 * Funciones auxiliares
 */
const detectarTipoProductoDinamico = (producto) => {
  const textoCompleto = `${producto.nombre || ''} ${producto.descripcion || ''}`.toLowerCase();
  
  for (const [tipo, config] of Object.entries(TIPOS_PRODUCTO_DINAMICOS)) {
    if (config.keywords.some(keyword => textoCompleto.includes(keyword))) {
      return tipo;
    }
  }
  return 'GENERICO';
};

const detectarMarca = (texto) => {
  const marcas = ["Cummins", "Caterpillar", "Detroit", "Navistar", "Volvo", "Mercedes", "MAN", "Jereh"];
  const textoLower = texto.toLowerCase();
  return marcas.find(marca => textoLower.includes(marca.toLowerCase())) || '';
};

const detectarModelo = (texto) => {
  const modelos = ["ISX", "M11", "N14", "C15", "C12", "Serie 60", "DD4", "DD3", "DD5", "DD6", "PX8", "PX6", "D13", "L10", "Big Cam"];
  const textoLower = texto.toLowerCase();
  return modelos.find(modelo => textoLower.includes(modelo.toLowerCase())) || '';
};

const generarSchemaProducto = (producto, id, seoEspecifico = null) => {
  const marca = seoEspecifico?.marca || detectarMarca(`${producto.nombre || ''} ${producto.descripcion || ''}`) || "Tractodo";
  
  // ✅ CORRECCIÓN: Usar precioVentaSugerido (campo correcto) en lugar de precio
  const precioFinal = (producto.precioVentaSugerido || producto.precio || 0).toString();
  
  console.log(`💰 Generando Schema.org para ${producto.nombre}: MXN ${precioFinal}`);
  
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": producto.nombre,
    "description": seoEspecifico?.descripcion || producto.descripcion || `Refacción ${producto.nombre} para tractocamión`,
    "sku": producto.numeroParte || id,
    "brand": { "@type": "Brand", "name": marca },
    "offers": {
      "@type": "Offer",
      "price": precioFinal,
      "priceCurrency": "MXN", // ✅ Esto está correcto
      "availability": "https://schema.org/InStock"
    },
    // ✅ REFORZAR ubicación en México
    "seller": {
      "@type": "Organization", 
      "name": "Tractodo",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "MX",
        "addressRegion": "Querétaro"
      }
    }
  };
};

const generarSlug = (texto, numeroParte = '') => {
  if (!texto) return '';
  
  // Incluir número de parte para hacer el slug más único
  let textoCompleto = texto;
  if (numeroParte && numeroParte.trim()) {
    textoCompleto = `${texto} ${numeroParte}`;
  }
  
  return textoCompleto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^\w\s-]/g, ' ') // Reemplazar caracteres especiales por espacios
    .replace(/\s+/g, "-") // Espacios múltiples a un solo guión
    .replace(/-+/g, "-") // Múltiples guiones a uno solo
    .replace(/^-|-$/g, '') // Remover guiones al inicio/final
    .trim();
};
/**
 * Función para obtener estadísticas del sistema
 */
const obtenerEstadisticasSistema = () => {
  return {
    productosEspecificos: Object.keys(PRODUCTOS_ESPECIFICOS).length,
    patronesTexto: Object.keys(MAPEO_POR_TEXTO).length,
    tiposSoportados: Object.keys(TIPOS_PRODUCTO_DINAMICOS).length,
    cacheActual: seoCache.size,
    categorias: {
      turbos: Object.values(PRODUCTOS_ESPECIFICOS).filter(p => p.categoria === 'turbo').length,
      arboles: Object.values(PRODUCTOS_ESPECIFICOS).filter(p => p.categoria === 'arbol_levas').length,
      cabezas: Object.values(PRODUCTOS_ESPECIFICOS).filter(p => p.categoria === 'cabeza').length
    }
  };
};

module.exports = {
  obtenerDatosSEOProducto,
  obtenerEstadisticasSistema,
  generarSlug,
};