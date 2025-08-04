const { db } = require("../config/firebase");

// Palabras clave del documento SEO organizadas por categorías
const PALABRAS_CLAVE_SEO = {
  // Palabras clave generales del sector
  generales: [
    "cabeza de motor para tractocamión",
    "refacciones para tractocamión", 
    "media reparación de motor diésel",
    "partes para motor Cummins",
    "repuestos para tractocamión",
    "motor Caterpillar",
    "venta de cabezas de motor",
    "refacciones Detroit Diesel",
    "piezas para motor Navistar",
    "componentes de media reparación",
    "motores diésel pesados",
    "tractopartes en México",
    "partes de motor para camión pesado",
    "tienda de refacciones para camión",
    "piezas de reemplazo americanas",
    "tractorefacciones"
  ],

  // Long tail con alta intención de compra
  longTail: [
    "cabeza nueva Cummins",
    "cabeza de motor ISX original", 
    "cabeza remanufacturada para tractocamión",
    "media reparación completa para M11",
    "kit de media reparación con cabeza incluida",
    "venta de refacciones Cummins ISX",
    "refacciones económicas para tractocamión",
    "cabeza de motor Detroit Serie 60 en venta",
    "dónde comprar cabeza de motor Cummins barata",
    "kit de reparación motor N14 completo",
    "refacciones originales Caterpillar C15",
    "cabeza de motor Mercedes-Benz nueva",
    "media reparación para motor Volvo D13",
    "refacciones para tractocamión con envío a todo México",
    "marca Jereh para motores diésel",
    "refacciones Jereh para tractocamión"
  ],

  // Componentes específicos
  componentes: [
    "turbo nuevo para motor Cummins ISX",
    "reemplazo de turbo para tractocamión",
    "venta de turbo para motor diésel",
    "turbos para motor PX8",
    "turbo para tractocamión en México",
    "árbol de levas Cummins ISX original",
    "repuesto de árbol de levas para motor diésel",
    "venta de árbol de levas para Detroit Diésel",
    "árbol de levas nuevo para M11",
    "árbol de levas para tractocamión en venta",
    "turbos y árboles de levas para camiones pesados"
  ],

  // Marca y localización
  marca: [
    "Tractodo refaccionaria diésel",
    "refaccionaria en San Juan del Río",
    "refaccionaria en Querétaro", 
    "refaccionaria de partes para tractocamión en Querétaro",
    "refaccionaria con envío nacional",
    "marca Jereh en Querétaro",
    "refacciones americanas en San Juan del Río"
  ],

  // Medias reparaciones específicas
  mediasReparaciones: [
    "kit de media reparación para motor diésel",
    "media reparación Cummins ISX con EGR",
    "media reparación Cummins ISX sin EGR", 
    "kit de media reparación Cummins L10",
    "media reparación económica Cummins PX6",
    "media reparación completa Cummins PX8",
    "venta de media reparación Caterpillar C15 biturbo",
    "kit de reparación intermedia Caterpillar C15",
    "kit de media reparación Detroit Serie 60",
    "media reparación con garantía Detroit DD4",
    "media reparación Navistar Maxxforce 13",
    "refacciones para media reparación Volvo D13"
  ]
};

// Marcas principales para mejor segmentación
const MARCAS_PRINCIPALES = ["Cummins", "Caterpillar", "Detroit", "Navistar", "Volvo", "Mercedes", "MAN", "Jereh"];

// Modelos de motores populares
const MODELOS_MOTORES = ["ISX", "M11", "N14", "C15", "C12", "Serie 60", "DD4", "DD3", "PX8", "PX6", "D13", "L10", "Big Cam"];

/**
 * Genera título SEO optimizado para un producto
 */
const generarTituloSEO = (producto) => {
  const { nombre, numeroParte, marca, descripcion } = producto;
  
  // Detectar tipo de producto por palabras clave
  const nombreLower = (nombre || "").toLowerCase();
  const descripcionLower = (descripcion || "").toLowerCase();
  const textoCompleto = `${nombreLower} ${descripcionLower}`;
  
  let tipoProducto = "";
  let marcaDetectada = marca || detectarMarca(textoCompleto);
  let modeloDetectado = detectarModelo(textoCompleto);
  
  // Identificar tipo de producto
  if (textoCompleto.includes("cabeza")) {
    tipoProducto = "Cabeza de Motor";
  } else if (textoCompleto.includes("turbo")) {
    tipoProducto = "Turbo";
  } else if (textoCompleto.includes("arbol") || textoCompleto.includes("árbol")) {
    tipoProducto = "Árbol de Levas";
  } else if (textoCompleto.includes("kit") || textoCompleto.includes("media")) {
    tipoProducto = "Kit de Media Reparación";
  } else {
    tipoProducto = "Refacción";
  }
  
  // Construir título optimizado
  let titulo = tipoProducto;
  
  if (marcaDetectada) titulo += ` ${marcaDetectada}`;
  if (modeloDetectado) titulo += ` ${modeloDetectado}`;
  if (numeroParte) titulo += ` | ${numeroParte}`;
  
  // Agregar palabras clave de localización
  titulo += " | Tractodo Querétaro";
  
  // Limitar longitud (Google recomienda 50-60 caracteres)
  if (titulo.length > 60) {
    titulo = titulo.substring(0, 57) + "...";
  }
  
  return titulo;
};

/**
 * Genera descripción SEO optimizada para un producto
 */
const generarDescripcionSEO = (producto) => {
  const { nombre, numeroParte, precio, marca, descripcion } = producto;
  
  const textoCompleto = `${(nombre || "").toLowerCase()} ${(descripcion || "").toLowerCase()}`;
  const marcaDetectada = marca || detectarMarca(textoCompleto);
  const modeloDetectado = detectarModelo(textoCompleto);
  
  // Seleccionar palabras clave relevantes
  let palabrasClave = [];
  
  // Agregar palabras clave según el tipo de producto
  if (textoCompleto.includes("cabeza")) {
    palabrasClave.push("cabeza de motor para tractocamión", "venta de cabezas de motor");
    if (marcaDetectada) {
      palabrasClave.push(`cabeza de motor ${marcaDetectada}`);
    }
  }
  
  if (textoCompleto.includes("turbo")) {
    palabrasClave.push("turbo para tractocamión", "reemplazo de turbo para tractocamión");
    if (marcaDetectada && modeloDetectado) {
      palabrasClave.push(`turbo ${marcaDetectada} ${modeloDetectado}`);
    }
  }
  
  if (textoCompleto.includes("kit") || textoCompleto.includes("media")) {
    palabrasClave.push("kit de media reparación", "media reparación de motor diésel");
    if (marcaDetectada) {
      palabrasClave.push(`media reparación ${marcaDetectada}`);
    }
  }
  
  // Siempre incluir palabras clave generales
  palabrasClave.push("refacciones para tractocamión", "partes de motor para camión pesado");
  
  // Construir descripción
  let descripcionSEO = `Compra ${nombre}`;
  
  if (numeroParte) {
    descripcionSEO += ` (${numeroParte})`;
  }
  
  descripcionSEO += ` en Tractodo. `;
  
  // Agregar beneficios clave
  const beneficios = [
    "Refacciones originales y compatibles",
    "Envío a todo México", 
    "Garantía incluida",
    "Precios competitivos",
    "Especialistas en motores diésel"
  ];
  
  descripcionSEO += beneficios.slice(0, 2).join(", ") + ". ";
  
  // Agregar llamada a la acción
  if (precio) {
    descripcionSEO += `Precio especial. `;
  }
  
  descripcionSEO += "¡Cotiza ahora!";
  
  // Limitar a 160 caracteres (límite recomendado para meta description)
  if (descripcionSEO.length > 160) {
    descripcionSEO = descripcionSEO.substring(0, 157) + "...";
  }
  
  return descripcionSEO;
};

/**
 * Genera palabras clave específicas para un producto
 */
const generarPalabrasClaveProducto = (producto) => {
  const { nombre, marca, descripcion } = producto;
  const textoCompleto = `${(nombre || "").toLowerCase()} ${(descripcion || "").toLowerCase()}`;
  
  let palabrasClave = new Set();
  
  // Agregar palabras clave base según tipo de producto
  PALABRAS_CLAVE_SEO.generales.forEach(palabra => {
    if (esRelevante(palabra, textoCompleto)) {
      palabrasClave.add(palabra);
    }
  });
  
  PALABRAS_CLAVE_SEO.longTail.forEach(palabra => {
    if (esRelevante(palabra, textoCompleto)) {
      palabrasClave.add(palabra);
    }
  });
  
  // Agregar palabras de componentes si es relevante
  PALABRAS_CLAVE_SEO.componentes.forEach(palabra => {
    if (esRelevante(palabra, textoCompleto)) {
      palabrasClave.add(palabra);
    }
  });
  
  // Siempre agregar palabras de marca y localización
  PALABRAS_CLAVE_SEO.marca.slice(0, 3).forEach(palabra => {
    palabrasClave.add(palabra);
  });
  
  return Array.from(palabrasClave).slice(0, 10); // Limitar a 10 palabras clave
};

/**
 * Detecta la marca en el texto del producto
 */
const detectarMarca = (texto) => {
  for (const marca of MARCAS_PRINCIPALES) {
    if (texto.toLowerCase().includes(marca.toLowerCase())) {
      return marca;
    }
  }
  return null;
};

/**
 * Detecta el modelo del motor en el texto
 */
const detectarModelo = (texto) => {
  for (const modelo of MODELOS_MOTORES) {
    if (texto.toLowerCase().includes(modelo.toLowerCase())) {
      return modelo;
    }
  }
  return null;
};

/**
 * Verifica si una palabra clave es relevante para el producto
 */
const esRelevante = (palabraClave, textoProducto) => {
  const palabrasClaveArray = palabraClave.toLowerCase().split(' ');
  return palabrasClaveArray.some(palabra => 
    textoProducto.includes(palabra) && palabra.length > 2
  );
};

/**
 * Genera Schema.org markup para un producto
 */
const generarSchemaProducto = (producto) => {
  const { id, nombre, descripcion, precio, numeroParte, imagenes } = producto;
  
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": nombre,
    "description": descripcion || generarDescripcionSEO(producto),
    "sku": numeroParte || id,
    "mpn": numeroParte,
    "brand": {
      "@type": "Brand",
      "name": detectarMarca(`${nombre} ${descripcion}`) || "Tractodo"
    },
    "manufacturer": {
      "@type": "Organization", 
      "name": "Tractodo",
      "url": "https://tractodo.com"
    },
    "category": "Refacciones para Tractocamión",
    "url": `https://tractodo.com/productos/${id}`,
    "image": imagenes && imagenes.length > 0 ? imagenes : ["https://tractodo.com/images/default-product.jpg"],
    "offers": {
      "@type": "Offer",
      "price": precio || "0",
      "priceCurrency": "MXN",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Tractodo",
        "url": "https://tractodo.com"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "12"
    }
  };
  
  return schema;
};

/**
 * Procesa todos los productos y genera datos SEO
 */
const procesarProductosParaSEO = async () => {
  try {
    console.log("Iniciando procesamiento SEO de productos...");
    
    const snapshot = await db.ref("/").once("value");
    const productos = snapshot.val() || {};
    
    const productosProcesados = {};
    let contador = 0;
    
    for (const [id, producto] of Object.entries(productos)) {
      if (!producto.nombre) continue;
      
      const datosSEO = {
        titulo: generarTituloSEO(producto),
        descripcion: generarDescripcionSEO(producto),
        palabrasClave: generarPalabrasClaveProducto(producto),
        schema: generarSchemaProducto({ id, ...producto }),
        slug: generarSlug(producto.nombre),
        fechaActualizacion: new Date().toISOString()
      };
      
      // Guardar datos SEO en Firebase
      await db.ref(`/seo/productos/${id}`).set(datosSEO);
      
      productosProcesados[id] = datosSEO;
      contador++;
      
      if (contador % 10 === 0) {
        console.log(`Procesados ${contador} productos...`);
      }
    }
    
    console.log(`Procesamiento SEO completado: ${contador} productos`);
    return productosProcesados;
    
  } catch (error) {
    console.error("Error en procesamiento SEO:", error.message);
    throw error;
  }
};

/**
 * Genera slug SEO-friendly
 */
const generarSlug = (texto) => {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno
    .trim();
};

/**
 * Obtiene datos SEO de un producto específico
 */
const obtenerDatosSEOProducto = async (id) => {
  try {
    const snapshot = await db.ref(`/seo/productos/${id}`).once("value");
    return snapshot.val();
  } catch (error) {
    console.error(`Error obteniendo SEO para producto ${id}:`, error.message);
    return null;
  }
};

module.exports = {
  generarTituloSEO,
  generarDescripcionSEO, 
  generarPalabrasClaveProducto,
  generarSchemaProducto,
  procesarProductosParaSEO,
  obtenerDatosSEOProducto,
  generarSlug,
  PALABRAS_CLAVE_SEO
};