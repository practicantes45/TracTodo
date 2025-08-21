const { db } = require("../config/firebase");
const { MARCAS_PREDEFINIDAS } = require("../utils/constantes");
const { guardarBackup } = require("./reversionController");

// ✅ FUNCIONES DE BÚSQUEDA INTELIGENTE CON FILTRADO MEJORADO

/**
 * Normalización avanzada de texto
 */
const normalizarTextoInteligente = (texto) => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^\w\s]/g, " ") // Caracteres especiales a espacios
    .replace(/\s+/g, " ") // Múltiples espacios a uno
    .trim();
};

/**
 * Corrección de errores tipográficos comunes (versión compacta)
 */
const corregirErroresComunes = (palabra) => {
  const correcciones = {
    // ========== CABEZAS DE MOTOR ==========
    "cabesa": "cabeza", "caveza": "cabeza", "kaveza": "cabeza", "caeza": "cabeza",
    "cabesa": "cabeza", "cavesa": "cabeza", "kabeza": "cabeza", "cabeza": "cabeza",
    "cabza": "cabeza", "cabea": "cabeza", "cabexa": "cabeza", "cebeza": "cabeza",
    "cavezas": "cabezas", "cabesas": "cabezas", "caezas": "cabezas",
    
    // Culata (sinónimo de cabeza)
    "culta": "culata", "cullata": "culata", "kulata": "culata", "culatta": "culata",
    "colata": "culata", "culada": "culata", "cutala": "culata",
    
    // Tapa (otro sinónimo)
    "tappa": "tapa", "tapa": "tapa", "taapa": "tapa",
    
    // Head (término en inglés)
    "hed": "head", "heade": "head", "heed": "head", "hade": "head",

    // ========== TURBOS ==========
    "turvo": "turbo", "trubo": "turbo", "tubro": "turbo", "turb": "turbo",
    "tubro": "turbo", "turboo": "turbo", "trbo": "turbo", "tubo": "turbo",
    "turo": "turbo", "turvo": "turbo", "turbu": "turbo", "turboe": "turbo",
    
    // Turbocargador
    "turbocargaor": "turbocargador", "turbocargadro": "turbocargador",
    "turbocargaador": "turbocargador", "turbocaargador": "turbocargador",
    "turbocarador": "turbocargador", "turbocar": "turbocargador",
    "turbocargador": "turbocargador", "turbocar": "turbocargador",
    
    // Compresor
    "conpresor": "compresor", "compresr": "compresor", "comprsor": "compresor",
    "compressor": "compresor", "compresosr": "compresor",
    
    // Soplador
    "soplador": "soplador", "sopladro": "soplador", "soplador": "soplador",

    // ========== ÁRBOLES DE LEVAS ==========
    // Árbol
    "arbo": "arbol", "arvol": "arbol", "harbol": "arbol", "arbool": "arbol",
    "arbl": "arbol", "abol": "arbol", "arbol": "arbol", "arbos": "arbol",
    "harvol": "arbol", "arvool": "arbol", "arvo": "arbol",
    
    // Levas
    "lebas": "levas", "lvas": "levas", "lebs": "levas", "leav": "levas",
    "leva": "levas", "lebva": "levas", "lebas": "levas", "leevas": "levas",
    "legas": "levas", "lemas": "levas", "lejvas": "levas",
    
    // Camshaft (inglés)
    "camshaf": "camshaft", "camshaft": "camshaft", "camchaft": "camshaft",
    "canshaft": "camshaft", "camshaftt": "camshaft", "camsheft": "camshaft",
    
    // Eje
    "ej": "eje", "ejee": "eje", "ehe": "eje", "exe": "eje",

    // ========== KITS DE REPARACIÓN ==========
    // Kit
    "kit": "kit", "kitt": "kit", "kits": "kit", "kiit": "kit", " kit": "kit",
    "qit": "kit", "kyt": "kit", "kiyt": "kit",
    
    // Juego
    "jugo": "juego", "jeugo": "juego", "jugo": "juego", "jiego": "juego",
    "jueego": "juego", "jueg": "juego",
    
    // Conjunto
    "conjnto": "conjunto", "conjuto": "conjunto", "conjnuto": "conjunto",
    "conjunto": "conjunto", "counjunto": "conjunto",
    
    // Reparación
    "reparacion": "reparacion", "reparasion": "reparacion", "reparaion": "reparacion",
    "reparacoin": "reparacion", "reparaciom": "reparacion", "repartion": "reparacion",
    "reparaciobn": "reparacion", "repaaracion": "reparacion", "reparacioon": "reparacion",
    
    // Overhaul (inglés)
    "overhaul": "overhaul", "overhoul": "overhaul", "overhall": "overhaul",
    "oberhaul": "overhaul", "overhau": "overhaul", "overhal": "overhaul",
    
    // Rebuild (inglés)
    "rebuild": "rebuild", "rebild": "rebuild", "rebiuld": "rebuild",
    "rebuld": "rebuild", "rebuil": "rebuild",
    
    // Media reparación
    "meia": "media", "medai": "media", "meida": "media", "median": "media",

    // ========== MARCAS AUTOMOTRICES ==========
    // Cummins
    "cumin": "cummins", "cummin": "cummins", "cuming": "cummins", "cummings": "cummins",
    "cumins": "cummins", "cummin": "cummins", "cuumins": "cummins", "cummis": "cummins",
    "cumin": "cummins", "cumming": "cummins", "cummin": "cummins", "cumis": "cummins",
    "cumins": "cummins", "cuming": "cummins", "cummins": "cummins",
    
    // Caterpillar
    "caterpillar": "caterpillar", "caterpiller": "caterpillar", "caterpilar": "caterpillar",
    "caterpillar": "caterpillar", "caterpiler": "caterpillar", "caterpilar": "caterpillar",
    "catepillar": "caterpillar", "caterpilaar": "caterpillar", "caterpillarr": "caterpillar",
    "cat": "caterpillar", "catt": "caterpillar", "caat": "caterpillar",
    "catepillar": "caterpillar", "caterpila": "caterpillar",
    
    // Detroit Diesel
    "detroit": "detroit", "detroid": "detroit", "detroyt": "detroit", "detrit": "detroit",
    "detriot": "detroit", "detrooit": "detroit", "detroiit": "detroit",
    "detroitt": "detroit", "deetroit": "detroit", "detrooit": "detroit",
    "dd": "detroit", "ddd": "detroit",
    
    // Navistar
    "navistar": "navistar", "nabistar": "navistar", "navistar": "navistar",
    "navstar": "navistar", "navistart": "navistar", "navistaar": "navistar",
    "international": "navistar", "internacinal": "navistar", "internacional": "navistar",
    
    // Maxxforce
    "maxforce": "maxxforce", "maxforse": "maxxforce", "maxxforse": "maxxforce",
    "maxforde": "maxxforce", "maxxforde": "maxxforce", "maxforze": "maxxforce",
    
    // Volvo
    "volvo": "volvo", "bolvo": "volvo", "volvoo": "volvo", "volbo": "volvo",
    "voolvo": "volvo", "vollvo": "volvo", "volvo": "volvo",
    
    // Mack
    "mack": "mack", "mac": "mack", "maack": "mack", "makc": "mack",
    
    // Mercedes Benz
    "mercedes": "mercedes", "mercede": "mercedes", "mercedez": "mercedes",
    "merced": "mercedes", "mercedees": "mercedes", "mercdes": "mercedes",
    "benz": "benz", "bens": "benz", "benss": "benz", "benz": "benz",
    "mb": "mercedes",

    // ========== MODELOS DE MOTORES ==========
    // ISX
    "isx": "isx", "ixs": "isx", "isc": "isx", "isxx": "isx", "ix": "isx",
    "isk": "isx", "isz": "isx", "isy": "isx",
    
    // M11
    "m11": "m11", "m1": "m11", "m111": "m11", "m11": "m11", "m1l": "m11",
    "ml1": "m11", "m1i": "m11",
    
    // N14
    "n14": "n14", "n4": "n14", "n144": "n14", "n1": "n14", "n41": "n14",
    "nl4": "n14", "ni4": "n14",
    
    // C15
    "c15": "c15", "c1": "c15", "c155": "c15", "c5": "c15", "c51": "c15",
    "cl5": "c15", "ci5": "c15",
    
    // C12
    "c12": "c12", "c2": "c12", "c122": "c12", "c21": "c12", "cl2": "c12",
    "ci2": "c12",
    
    // C13
    "c13": "c13", "c3": "c13", "c133": "c13", "c31": "c13", "cl3": "c13",
    "ci3": "c13",
    
    // DD4, DD5, DD13, DD15, DD16
    "dd4": "dd4", "dd": "dd4", "ddd4": "dd4", "d4": "dd4", "dd44": "dd4",
    "dd5": "dd5", "d5": "dd5", "dd55": "dd5", "ddd5": "dd5",
    "dd13": "dd13", "dd3": "dd13", "dd133": "dd13", "d13": "dd13",
    "dd15": "dd15", "dd5": "dd15", "dd155": "dd15", "d15": "dd15",
    "dd16": "dd16", "dd6": "dd16", "dd166": "dd16", "d16": "dd16",
    
    // Serie 60
    "serie60": "serie 60", "serie 60": "serie 60", "series60": "serie 60",
    "serie60": "serie 60", "seri60": "serie 60", "serie6": "serie 60",
    "serie600": "serie 60", "srie60": "serie 60",
    
    // PX8, PX6
    "px8": "px8", "px": "px8", "p8": "px8", "pxx8": "px8", "px88": "px8",
    "px6": "px6", "p6": "px6", "pxx6": "px6", "px66": "px6",
    
    // Big Cam
    "bigcam": "big cam", "big cam": "big cam", "bigkam": "big cam",
    "big kan": "big cam", "bigcam": "big cam", "big-cam": "big cam",

    // ========== TÉRMINOS TÉCNICOS GENERALES ==========
    // Motor
    "motor": "motor", "motr": "motor", "moto": "motor", "motro": "motor",
    "motor": "motor", "motoor": "motor", "moortor": "motor",
    
    // Engine (inglés)
    "engine": "engine", "engien": "engine", "engene": "engine", "enine": "engine",
    "engien": "engine", "engie": "engine", "enginee": "engine",
    
    // Diésel
    "diesel": "diesel", "diésel": "diesel", "deisel": "diesel", "diessel": "diesel",
    "diesl": "diesel", "dieseel": "diesel", "diezel": "diesel", "disel": "diesel",
    "gasoil": "diesel", "gasoleo": "diesel",
    
    // Tractocamión
    "tractocamion": "tractocamion", "tractor": "tractocamion", "tracto": "tractocamion",
    "tracktocamion": "tractocamion", "tractocamion": "tractocamion",
    "tractokamion": "tractocamion", "traktor": "tractocamion",
    "tractocamoin": "tractocamion", "tractocamio": "tractocamion",
    
    // Truck (inglés)
    "truck": "truck", "truk": "truck", "trock": "truck", "truuck": "truck",
    "truckk": "truck", "trcuk": "truck",
    
    // Camión
    "camion": "camion", "kamion": "camion", "camio": "camion", "camión": "camion",
    "camiom": "camion", "camioon": "camion", "caion": "camion",
    
    // Trailer
    "trailer": "trailer", "trailler": "trailer", "traile": "trailer",
    "triler": "trailer", "traylr": "trailer", "traeler": "trailer",
    
    // Refacción/Repuesto
    "refacion": "refaccion", "refaccio": "refaccion", "refaccione": "refaccion",
    "refacccion": "refaccion", "refacciom": "refaccion", "refaccioon": "refaccion",
    "refacciones": "refacciones", "refaciones": "refacciones", "refacciopnes": "refacciones",
    
    "repuesto": "repuesto", "repeusto": "repuesto", "repueto": "repuesto",
    "repuetos": "repuesto", "repuesot": "repuesto", "repuetos": "repuesto",
    
    // Parte/Pieza
    "parte": "parte", "partee": "parte", "paarte": "parte", "partes": "parte",
    "pieza": "pieza", "piesa": "pieza", "piez": "pieza", "piezas": "pieza",
    "piesas": "pieza", "piezaa": "pieza",
    
    // Componente
    "componente": "componente", "compomente": "componente", "componete": "componente",
    "componennte": "componente", "componnente": "componente",

    // ========== VÁLVULAS Y SISTEMA DE VÁLVULAS ==========
    "valvula": "valvula", "balbula": "valvula", "valvla": "valvula",
    "valvulla": "valvula", "valvola": "valvula", "valvuula": "valvula",
    "valvulas": "valvulas", "balbulas": "valvulas", "valvlas": "valvulas",
    
    // Resorte
    "resorte": "resorte", "resortte": "resorte", "resorte": "resorte",
    "resoorte": "resorte", "resoerte": "resorte",
    
    // Empujador
    "empujador": "empujador", "empujadro": "empujador", "empujadoor": "empujador",
    "empuhador": "empujador", "enpujador": "empujador",
    
    // Balancín
    "balancin": "balancin", "valancin": "balancin", "balacin": "balancin",
    "balannin": "balancin", "balanciin": "balancin",

    // ========== PISTONES Y BIELAS ==========
    "piston": "piston", "pistn": "piston", "pistoon": "piston",
    "pistom": "piston", "pistón": "piston", "pistoon": "piston",
    "pistones": "pistones", "pistns": "pistones", "pistoones": "pistones",
    
    "biela": "biela", "biella": "biela", "vbiela": "biela", "bieal": "biela",
    "bielas": "bielas", "biellas": "bielas", "vbielas": "bielas",

    // ========== FILTROS ==========
    "filtro": "filtro", "filro": "filtro", "filtero": "filtro",
    "filtros": "filtros", "filros": "filtros", "filteros": "filtros",
    "filter": "filtro", "filtr": "filtro",

    // ========== INYECTORES ==========
    "inyector": "inyector", "injector": "inyector", "inyetor": "inyector",
    "inyectro": "inyector", "inyektor": "inyector", "inyectoor": "inyector",
    "inyectores": "inyectores", "injectors": "inyectores", "inyetores": "inyectores",

    // ========== BOMBA ==========
    "bomba": "bomba", "bonba": "bomba", "bomva": "bomba", "boma": "bomba",
    "bombaa": "bomba", "bomaba": "bomba", "bomba": "bomba"
  };
  
  return correcciones[palabra] || palabra;
};

/**
 * Expansión de sinónimos específicos por producto
 */
const expandirTerminos = (palabra) => {
  const sinonimos = {
    // CABEZAS DE MOTOR Y RELACIONADOS
    "cabeza": ["cabeza", "culata", "tapa", "head", "cabezal", "testa"],
    "culata": ["culata", "cabeza", "tapa", "head"],
    "head": ["head", "cabeza", "culata", "tapa"],
    
    // TURBOS Y RELACIONADOS
    "turbo": ["turbo", "turbocargador", "compresor", "soplador", "turbocharger"],
    "turbocargador": ["turbocargador", "turbo", "compresor", "turbocharger"],
    "compresor": ["compresor", "turbo", "turbocargador", "soplador"],
    "soplador": ["soplador", "turbo", "compresor", "blower"],
    
    // ÁRBOLES DE LEVAS Y RELACIONADOS
    "arbol": ["arbol", "eje", "camshaft", "arbol de levas", "shaft"],
    "levas": ["levas", "cam", "leva", "cams"],
    "camshaft": ["camshaft", "arbol", "arbol de levas", "eje de levas"],
    "eje": ["eje", "arbol", "shaft", "camshaft"],
    
    // KITS Y REPARACIONES
    "kit": ["kit", "juego", "conjunto", "set", "paquete"],
    "juego": ["juego", "kit", "conjunto", "set"],
    "conjunto": ["conjunto", "kit", "juego", "set"],
    "reparacion": ["reparacion", "overhaul", "rebuild", "reconstruccion", "revision"],
    "overhaul": ["overhaul", "reparacion", "rebuild", "revision"],
    "rebuild": ["rebuild", "overhaul", "reparacion", "reconstruccion"],
    "media": ["media", "semi", "parcial", "half"],
    
    // MOTOR Y RELACIONADOS
    "motor": ["motor", "engine", "propulsor", "maquina"],
    "engine": ["engine", "motor", "propulsor"],
    "diesel": ["diesel", "diésel", "gasoil", "gasoleo"],
    
    // VEHÍCULOS
    "tractocamion": ["tractocamion", "truck", "camion", "tracto", "trailer", "semi"],
    "truck": ["truck", "tractocamion", "camion", "tracto"],
    "camion": ["camion", "truck", "tractocamion"],
    "tracto": ["tracto", "tractocamion", "truck", "tractor"],
    "trailer": ["trailer", "remolque", "semi"],
    
    // REFACCIONES
    "refaccion": ["refaccion", "repuesto", "parte", "pieza", "componente", "part"],
    "repuesto": ["repuesto", "refaccion", "parte", "spare", "part"],
    "parte": ["parte", "pieza", "refaccion", "repuesto", "part", "componente"],
    "pieza": ["pieza", "parte", "refaccion", "repuesto", "componente"],
    "componente": ["componente", "parte", "pieza", "refaccion", "element"],
    
    // MARCAS ESPECÍFICAS
    "cummins": ["cummins", "cumins", "cumin"],
    "caterpillar": ["caterpillar", "cat", "cater"],
    "detroit": ["detroit", "dd", "detroit diesel"],
    "navistar": ["navistar", "international", "maxxforce", "nav"],
    "volvo": ["volvo", "mack"],
    "mercedes": ["mercedes", "mercedes benz", "mb", "benz"],
    
    // VÁLVULAS Y SISTEMA
    "valvula": ["valvula", "valve", "valv"],
    "resorte": ["resorte", "spring", "muelle"],
    "empujador": ["empujador", "lifter", "pushrod"],
    "balancin": ["balancin", "rocker", "rocker arm"],
    
    // PISTONES Y BIELAS
    "piston": ["piston", "pist", "embolo"],
    "biela": ["biela", "connecting rod", "rod", "conrod"],
    
    // FILTROS E INYECTORES
    "filtro": ["filtro", "filter", "fil"],
    "inyector": ["inyector", "injector", "fuel injector"],
    "bomba": ["bomba", "pump", "bomba de combustible", "fuel pump"]
  };
  
  return sinonimos[palabra] || [palabra];
};

/**
 * Cálculo de similitud entre strings (versión mejorada)
 */
const calcularSimilitud = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = normalizarTextoInteligente(str1);
  const s2 = normalizarTextoInteligente(str2);
  
  // Coincidencia exacta
  if (s1 === s2) return 100;
  
  // Una contiene a la otra
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  
  // Similitud por palabras en común
  const palabras1 = s1.split(' ').filter(p => p.length > 2);
  const palabras2 = s2.split(' ').filter(p => p.length > 2);
  
  if (palabras1.length > 0 && palabras2.length > 0) {
    const palabrasComunes = palabras1.filter(p1 => 
      palabras2.some(p2 => p1.includes(p2) || p2.includes(p1))
    ).length;
    
    const totalPalabras = Math.max(palabras1.length, palabras2.length);
    const similitudPalabras = (palabrasComunes / totalPalabras) * 70;
    
    if (similitudPalabras > 20) return Math.floor(similitudPalabras);
  }
  
  // Similitud por caracteres comunes
  const chars1 = s1.split('');
  const chars2 = s2.split('');
  const common = chars1.filter(char => chars2.includes(char)).length;
  const maxLength = Math.max(s1.length, s2.length);
  
  return Math.floor((common / maxLength) * 60);
};

/**
 * ✅ SISTEMA DE BÚSQUEDA INTELIGENTE CON FILTRADO ESTRICTO
 */
const buscarProductosInteligente = (productos, consulta) => {
  if (!consulta || consulta.trim() === "") return productos;
  
  console.log(`🔍 Búsqueda inteligente: "${consulta}"`);
  
  const consultaNormalizada = normalizarTextoInteligente(consulta);
  const palabrasConsulta = consultaNormalizada.split(' ').filter(p => p.length > 1);
  
  // Expandir términos con correcciones y sinónimos
  const terminosExpandidos = new Set();
  palabrasConsulta.forEach(palabra => {
    // Agregar palabra original
    terminosExpandidos.add(palabra);
    
    // Agregar corrección tipográfica
    const palabraCorregida = corregirErroresComunes(palabra);
    terminosExpandidos.add(palabraCorregida);
    
    // Agregar sinónimos de la palabra original
    expandirTerminos(palabra).forEach(sinonimo => {
      terminosExpandidos.add(sinonimo);
    });
    
    // Agregar sinónimos de la palabra corregida
    expandirTerminos(palabraCorregida).forEach(sinonimo => {
      terminosExpandidos.add(sinonimo);
    });
  });
  
  console.log(`📝 Términos expandidos (${terminosExpandidos.size}):`, Array.from(terminosExpandidos).slice(0, 10), "...");
  
  // Calcular puntuación para cada producto
  const productosConPuntuacion = productos.map(producto => {
    let puntuacion = 0;
    
    const numeroParte = normalizarTextoInteligente(producto.numeroParte || "");
    const nombre = normalizarTextoInteligente(producto.nombre || "");
    const descripcion = normalizarTextoInteligente(producto.descripcion || "");
    const marca = normalizarTextoInteligente(producto.marca || "");
    const textoCompleto = `${numeroParte} ${nombre} ${descripcion} ${marca}`;
    
    // PUNTUACIÓN MÁXIMA: Coincidencia exacta en número de parte
    if (numeroParte.includes(consultaNormalizada)) {
      puntuacion += 1000;
    }
    
    // PUNTUACIÓN ALTA: Coincidencia exacta en nombre
    if (nombre.includes(consultaNormalizada)) {
      puntuacion += 800;
    }
    
    // PUNTUACIÓN ALTA: Coincidencia exacta en consulta completa
    if (textoCompleto.includes(consultaNormalizada)) {
      puntuacion += 600;
    }
    
    // PUNTUACIÓN MEDIA-ALTA: Términos expandidos
    Array.from(terminosExpandidos).forEach(termino => {
      if (numeroParte.includes(termino)) puntuacion += 400;
      if (nombre.includes(termino)) puntuacion += 250;
      if (marca.includes(termino)) puntuacion += 150;
      if (descripcion.includes(termino)) puntuacion += 80;
    });
    
    // BONIFICACIÓN ESPECÍFICA: Productos relacionados
    const esCabeza = ["cabeza", "culata", "head", "tapa"].some(term => 
      terminosExpandidos.has(term)
    );
    const esTurbo = ["turbo", "turbocargador", "compresor"].some(term => 
      terminosExpandidos.has(term)
    );
    const esArbolLevas = ["arbol", "levas", "camshaft"].some(term => 
      terminosExpandidos.has(term)
    );
    
    if (esCabeza && (nombre.includes("cabeza") || nombre.includes("culata") || nombre.includes("head"))) {
      puntuacion += 200;
    }
    if (esTurbo && (nombre.includes("turbo") || nombre.includes("compresor"))) {
      puntuacion += 200;
    }
    if (esArbolLevas && (nombre.includes("arbol") || nombre.includes("levas") || nombre.includes("camshaft"))) {
      puntuacion += 200;
    }
    
    // BONIFICACIÓN: Múltiples palabras encontradas
    let palabrasEncontradas = 0;
    palabrasConsulta.forEach(palabra => {
      const palabraCorregida = corregirErroresComunes(palabra);
      if (textoCompleto.includes(palabra) || textoCompleto.includes(palabraCorregida)) {
        palabrasEncontradas++;
      }
    });
    
    if (palabrasEncontradas > 1) {
      puntuacion += palabrasEncontradas * 50;
    }
    
    // BONIFICACIÓN: Marcas específicas
    const marcasEnConsulta = ["cummins", "caterpillar", "detroit", "navistar", "volvo", "mercedes"];
    marcasEnConsulta.forEach(marcaNombre => {
      if (terminosExpandidos.has(marcaNombre) && marca.includes(marcaNombre)) {
        puntuacion += 100;
      }
    });
    
    // ✅ RESTRICCIÓN: Solo similitud si no hay puntuación directa mayor a 50
    if (puntuacion < 50) {
      const similitudNombre = calcularSimilitud(nombre, consultaNormalizada);
      const similitudDescripcion = calcularSimilitud(descripcion, consultaNormalizada);
      const similitudNumero = calcularSimilitud(numeroParte, consultaNormalizada);
      const maxSimilitud = Math.max(similitudNombre, similitudDescripcion, similitudNumero);
      
      // ✅ UMBRAL MÁS ALTO: Solo agregar similitud si es muy alta
      if (maxSimilitud >= 60) {
        puntuacion += maxSimilitud;
      }
    }
    
    return { ...producto, puntuacionRelevancia: puntuacion };
  });
  
  // ✅ FILTRADO ESTRICTO: Umbral mínimo más alto
  const UMBRAL_MINIMO = 80; // Aumentado de 0 a 80
  
  const resultados = productosConPuntuacion
    .filter(producto => {
      // ✅ FILTRADO ESTRICTO: Solo productos con puntuación significativa
      if (producto.puntuacionRelevancia < UMBRAL_MINIMO) {
        return false;
      }
      
      // ✅ VERIFICACIÓN ADICIONAL: Al menos un término de búsqueda debe estar presente
      const textoCompleto = normalizarTextoInteligente(
        `${producto.nombre || ''} ${producto.descripcion || ''} ${producto.numeroParte || ''} ${producto.marca || ''}`
      );
      
      const tieneTerminoRelevante = Array.from(terminosExpandidos).some(termino => 
        textoCompleto.includes(termino)
      ) || palabrasConsulta.some(palabra => {
        const palabraCorregida = corregirErroresComunes(palabra);
        return textoCompleto.includes(palabra) || textoCompleto.includes(palabraCorregida);
      });
      
      return tieneTerminoRelevante;
    })
    .sort((a, b) => b.puntuacionRelevancia - a.puntuacionRelevancia);
  
  console.log(`✅ Encontrados ${resultados.length} productos relevantes (umbral mínimo: ${UMBRAL_MINIMO})`);
  
  if (resultados.length > 0) {
    console.log(`🥇 Top 5 resultados:`);
    resultados.slice(0, 5).forEach((prod, index) => {
      console.log(`   ${index + 1}. ${prod.nombre} (${prod.puntuacionRelevancia} pts)`);
    });
  }
  
  return resultados;
};

// ✅ FUNCIÓN PRINCIPAL: getAllProductos con filtrado mejorado
exports.getAllProductos = async (req, res) => {
  const { q, marca, orden } = req.query;

  try {
    const snapshot = await db.ref("/").once("value");
    const data = snapshot.val();

    if (!data) return res.json([]);

    const productos = Object.entries(data)
      .filter(([id, prod]) => prod?.nombre)
      .map(([id, prod]) => ({ id, ...prod }));

    let filtrados = productos;

    // ✅ BÚSQUEDA INTELIGENTE CON FILTRADO ESTRICTO
    if (q) {
      console.log(`🔍 BÚSQUEDA INTELIGENTE INICIADA`);
      console.log(`Query original: "${q}"`);
      console.log(`Total productos disponibles: ${productos.length}`);
      
      // Usar búsqueda inteligente con filtrado estricto
      filtrados = buscarProductosInteligente(productos, q);
      
      console.log(`✅ Búsqueda completada: ${filtrados.length} productos encontrados`);
      
      // ✅ BÚSQUEDA PERMISIVA SOLO SI NO HAY RESULTADOS
      if (filtrados.length === 0) {
        console.log(`⚠️ Sin resultados con filtro estricto, intentando búsqueda permisiva...`);
        
        const queryNormalizado = normalizarTextoInteligente(q);
        const palabrasQuery = queryNormalizado.split(' ').filter(p => p.length > 2);
        
        filtrados = productos.filter(producto => {
          const textoCompleto = normalizarTextoInteligente(
            `${producto.nombre || ''} ${producto.descripcion || ''} ${producto.numeroParte || ''} ${producto.marca || ''}`
          );
          
          // ✅ PERMISIVO: Al menos el 50% de las palabras deben estar presentes
          const palabrasEncontradas = palabrasQuery.filter(palabra => {
            const palabraCorregida = corregirErroresComunes(palabra);
            return textoCompleto.includes(palabra) || textoCompleto.includes(palabraCorregida);
          });
          
          const porcentajeCoincidencia = palabrasEncontradas.length / palabrasQuery.length;
          return porcentajeCoincidencia >= 0.5; // Al menos 50% de coincidencia
        });
        
        console.log(`🔄 Búsqueda permisiva encontró: ${filtrados.length} productos`);
      }
    }

    // FILTRO POR MARCA MEJORADO
    if (marca) {
      const marcaBuscada = normalizarTextoInteligente(marca);
      console.log(`🏷️ Filtrando por marca: "${marca}"`);
      
      filtrados = filtrados.filter(p => {
        const marcaProducto = normalizarTextoInteligente(p.marca || "");
        
        if (marca === "Otros") {
          return !MARCAS_PREDEFINIDAS.some(m =>
            marcaProducto.includes(normalizarTextoInteligente(m))
          );
        }
        
        // Búsqueda flexible de marca con correcciones
        const marcaCorregida = corregirErroresComunes(marcaBuscada);
        return marcaProducto.includes(marcaBuscada) || 
               marcaProducto.includes(marcaCorregida) ||
               marcaBuscada.includes(marcaProducto) ||
               normalizarTextoInteligente(p.nombre || '').includes(marcaBuscada) ||
               normalizarTextoInteligente(p.descripcion || '').includes(marcaBuscada);
      });
      
      console.log(`📊 Productos después de filtro de marca: ${filtrados.length}`);
    }

    // ORDENAMIENTO INTELIGENTE
    if (!q || filtrados.length === 0) {
      if (orden === "asc") {
        filtrados.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
      } else if (orden === "desc") {
        filtrados.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || ''));
      }
    } else {
      console.log(`🎯 Manteniendo orden por relevancia`);
    }

    res.json(filtrados);

  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ 
      error: "Error al obtener productos", 
      detalles: error.message 
    });
  }
};

// ✅ FUNCIÓN MEJORADA: getProductoByNombre con filtrado estricto
exports.getProductoByNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    console.log(`🔍 Búsqueda de producto por nombre: "${nombre}"`);
    
    const snapshot = await db.ref("/").once("value");
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ error: "No hay productos en la base de datos" });
    }

    const productos = Object.entries(data)
      .filter(([id, producto]) => producto?.nombre)
      .map(([id, producto]) => ({ id, ...producto }));

    // ✅ USAR BÚSQUEDA INTELIGENTE CON FILTRADO ESTRICTO
    const resultados = buscarProductosInteligente(productos, nombre);

    if (resultados.length === 0) {
      console.log(`❌ Producto no encontrado para: "${nombre}"`);
      
      // Generar sugerencia inteligente
      const palabraCorregida = corregirErroresComunes(normalizarTextoInteligente(nombre));
      const sugerencia = palabraCorregida !== normalizarTextoInteligente(nombre) ? palabraCorregida : null;
      
      return res.status(404).json({ 
        error: "Producto no encontrado",
        consulta: nombre,
        sugerencia: sugerencia ? `¿Quisiste decir "${sugerencia}"?` : "Verifica la escritura o intenta con sinónimos"
      });
    }

    // Tomar el producto con mayor puntuación
    const productoEncontrado = resultados[0];
    const idProducto = productoEncontrado.id;

    console.log(`✅ Producto encontrado: "${productoEncontrado.nombre}" (${productoEncontrado.puntuacionRelevancia} pts)`);

    // SEO híbrido optimizado
    const { obtenerDatosSEOProducto } = require("../services/seoService");
    const datosSEO = await obtenerDatosSEOProducto(idProducto, productoEncontrado);

    // Obtener recomendaciones
    const recoSnapshot = await db.ref(`/recomendaciones/${idProducto}`).once("value");
    let idsRecomendados = recoSnapshot.val() || [];

    if (idsRecomendados.length === 0) {
      const allSnapshot = await db.ref("/").limitToFirst(50).once("value");
      const allData = allSnapshot.val() || {};
      
      const productosDisponibles = Object.entries(allData)
        .filter(([pid, prod]) => pid !== idProducto && prod?.nombre)
        .slice(0, 10);

      idsRecomendados = productosDisponibles.slice(0, 6).map(([pid]) => pid);
    }

    // Obtener datos de recomendados
    const recomendados = [];
    for (const pid of idsRecomendados.slice(0, 6)) {
      try {
        const recSnapshot = await db.ref(`/${pid}`).once("value");
        if (recSnapshot.exists()) {
          recomendados.push({ id: pid, ...recSnapshot.val() });
        }
      } catch (error) {
        console.warn(`⚠️ Error obteniendo recomendado ${pid}:`, error.message);
      }
    }

    res.json({
      producto: { 
        id: idProducto, 
        ...productoEncontrado,
        seo: datosSEO
      },
      recomendados
    });
  } catch (error) {
    console.error("❌ Error obteniendo producto por nombre:", error.message);
    res.status(500).json({ 
      error: "Error obteniendo producto", 
      detalles: error.message 
    });
  }
};

// ✅ RESTO DE FUNCIONES SIN CAMBIOS (getProductoById, insertarProducto, etc.)
exports.getProductoById = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const producto = snapshot.val();

    // SEO híbrido optimizado
    const { obtenerDatosSEOProducto } = require("../services/seoService");
    const datosSEO = await obtenerDatosSEOProducto(id, producto);

    // Obtener recomendaciones
    const recoSnapshot = await db.ref(`/recomendaciones/${id}`).once("value");
    let idsRecomendados = recoSnapshot.val() || [];

    if (idsRecomendados.length === 0) {
      const allSnapshot = await db.ref("/").limitToFirst(50).once("value");
      const allData = allSnapshot.val() || {};
      
      const productosDisponibles = Object.entries(allData)
        .filter(([pid, prod]) => pid !== id && prod?.nombre)
        .slice(0, 10);

      idsRecomendados = productosDisponibles.slice(0, 6).map(([pid]) => pid);
    }

    // Obtener datos de recomendados
    const recomendados = [];
    for (const pid of idsRecomendados.slice(0, 6)) {
      try {
        const recSnapshot = await db.ref(`/${pid}`).once("value");
        if (recSnapshot.exists()) {
          recomendados.push({ id: pid, ...recSnapshot.val() });
        }
      } catch (error) {
        console.warn(`Error obteniendo recomendado ${pid}:`, error.message);
      }
    }

    res.json({
      producto: { 
        id, 
        ...producto,
        seo: datosSEO
      },
      recomendados
    });
  } catch (error) {
    console.error("Error obteniendo producto:", error.message);
    res.status(500).json({ error: "Error obteniendo producto", detalles: error.message });
  }
};

// Resto de funciones sin cambios...
exports.insertarProducto = async (req, res) => {
  const datos = req.body;

  try {
    if (!datos.nombre || !datos.numeroParte || !datos.descripcion) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    const nuevoRef = db.ref("/").push();
    await nuevoRef.set(datos);
    const nuevoId = nuevoRef.key;

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: { id: nuevoId, ...datos }
    });
  } catch (error) {
    console.error("Error al insertar producto:", error.message);
    res.status(500).json({ mensaje: "Error al insertar producto", detalles: error.message });
  }
};

exports.borrarProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const datosProducto = snapshot.val();
    await guardarBackup("productos", id, datosProducto);
    await db.ref(`/${id}`).remove();
    res.status(200).json({ mensaje: "Producto borrado correctamente" });
  } catch (error) {
    console.error("Error al borrar producto:", error.message);
    res.status(400).json({ mensaje: "Error al borrar producto", detalles: error.message });
  }
};

exports.actualizarProductoPorId = async (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const datosProducto = snapshot.val();
    await guardarBackup("productos", id, datosProducto);
    await db.ref(`/${id}`).update(datos);
    const actualizadoSnapshot = await db.ref(`/${id}`).once("value");
    const productoActualizado = actualizadoSnapshot.val();

    res.status(200).json({ 
      mensaje: "Producto actualizado correctamente", 
      producto: { id, ...productoActualizado } 
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    res.status(400).json({ mensaje: "Error al actualizar producto", detalles: error.message });
  }
};

// =============== PRODUCTOS DEL MES ===============
exports.insertarProductosDelMes = async (req, res) => {
  const { productos } = req.body;

  console.log('=== INSERTANDO PRODUCTOS DEL MES ===');
  console.log('Productos recibidos:', productos);

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debes enviar un arreglo válido de productos" });
  }

  for (const producto of productos) {
    if (!producto.id) {
      return res.status(400).json({ error: "Cada producto debe tener un ID válido" });
    }
    
    if (producto.nuevoPrecio !== undefined) {
      const precio = parseFloat(producto.nuevoPrecio);
      if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: `El precio del producto ${producto.id} debe ser mayor que 0` });
      }
    }
  }

  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const actuales = snapshot.val() || {};
    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    for (const producto of productos) {
      if (!todosProductos[producto.id]) {
        return res.status(404).json({ error: `Producto con ID ${producto.id} no encontrado` });
      }

      if (producto.nuevoPrecio !== undefined) {
        const nuevoPrecio = parseFloat(producto.nuevoPrecio);
        await guardarBackup("productos", producto.id, todosProductos[producto.id]);
        await db.ref(`/${producto.id}/precioVentaSugerido`).set(nuevoPrecio);
      }

      actuales[producto.id] = {
        id: producto.id,
        fechaAgregado: new Date().toISOString()
      };
    }

    await db.ref("/productosDelMes").set(actuales);
    const updatedSnapshot = await db.ref("/").once("value");
    const productosActualizados = updatedSnapshot.val() || {};

    const productosCompletos = Object.values(actuales).map(prodMes => ({
      ...productosActualizados[prodMes.id],
      id: prodMes.id,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p && p.nombre);

    res.status(200).json({
      mensaje: "Productos del mes agregados correctamente",
      productos: productosCompletos
    });
    
  } catch (error) {
    console.error("Error al insertar productos del mes:", error.message);
    res.status(500).json({ error: "Error al insertar productos del mes", detalles: error.message });
  }
};

exports.getProductosDelMes = async (req, res) => {
  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productosDelMes = snapshot.val() || {};

    if (Object.keys(productosDelMes).length === 0) {
      return res.json([]);
    }

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const destacados = Object.values(productosDelMes)
      .map(prodMes => ({
        ...todosProductos[prodMes.id],
        id: prodMes.id,
        fechaAgregado: prodMes.fechaAgregado
      }))
      .filter(p => p && p.nombre);

    res.json(destacados);
  } catch (error) {
    console.error("Error al obtener productos del mes:", error.message);
    res.status(500).json({ mensaje: "Error al obtener productos del mes", detalles: error.message });
  }
};

exports.actualizarProductosDelMes = async (req, res) => {
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Se requiere una lista válida de productos" });
  }

  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productosAntes = snapshot.val() || {};
    await guardarBackup("productosDelMes", "listaCompleta", productosAntes);

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const nuevosProductos = {};
    for (const producto of productos) {
      if (producto.id) {
        if (!todosProductos[producto.id]) {
          return res.status(404).json({ error: `Producto con ID ${producto.id} no encontrado` });
        }

        if (producto.nuevoPrecio !== undefined) {
          const nuevoPrecio = parseFloat(producto.nuevoPrecio);
          if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            return res.status(400).json({ error: `El precio para el producto ${producto.id} debe ser válido` });
          }

          await guardarBackup("productos", producto.id, todosProductos[producto.id]);
          await db.ref(`/${producto.id}/precioVentaSugerido`).set(nuevoPrecio);
        }

        nuevosProductos[producto.id] = {
          id: producto.id,
          fechaAgregado: productosAntes[producto.id]?.fechaAgregado || new Date().toISOString()
        };
      }
    }

    await db.ref("/productosDelMes").set(nuevosProductos);
    const updatedSnapshot = await db.ref("/").once("value");
    const productosActualizados = updatedSnapshot.val() || {};

    const productosCompletos = Object.values(nuevosProductos).map(prodMes => ({
      ...productosActualizados[prodMes.id],
      id: prodMes.id,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p && p.nombre);

    res.status(200).json({
      mensaje: "Lista de productos del mes actualizada correctamente",
      productos: productosCompletos,
    });
  } catch (error) {
    console.error("Error al actualizar productos del mes:", error.message);
    res.status(500).json({ error: "Error al actualizar productos del mes", detalles: error.message });
  }
};

exports.eliminarProductoDelMes = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto a eliminar" });
  }

  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productos = snapshot.val() || {};

    if (!productos[id]) {
      return res.status(404).json({ error: "El producto no está en la lista de productos del mes" });
    }

    await guardarBackup("productosDelMes", id, productos[id]);
    delete productos[id];
    await db.ref("/productosDelMes").set(productos);

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const productosRestantes = Object.values(productos).map(prodMes => ({
      ...todosProductos[prodMes.id],
      id: prodMes.id,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p && p.nombre);

    res.status(200).json({
      mensaje: "Producto eliminado de productos del mes",
      productos: productosRestantes,
    });
  } catch (error) {
    console.error("Error al eliminar producto del mes:", error.message);
    res.status(500).json({ error: "Error al eliminar producto del mes", detalles: error.message });
  }
};

exports.actualizarPrecioProductoDelMes = async (req, res) => {
  const { id } = req.params;
  const { nuevoPrecio } = req.body;

  if (!id || nuevoPrecio === undefined) {
    return res.status(400).json({ error: "Faltan datos: ID del producto y nuevo precio" });
  }

  const precio = parseFloat(nuevoPrecio);
  if (isNaN(precio) || precio <= 0) {
    return res.status(400).json({ error: "El precio debe ser un número válido mayor que 0" });
  }

  try {
    const snapshot = await db.ref(`/${id}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoActual = snapshot.val();
    await guardarBackup("productos", id, productoActual);
    await db.ref(`/${id}/precioVentaSugerido`).set(precio);

    const mesSnapshot = await db.ref(`/productosDelMes/${id}`).once("value");
    if (!mesSnapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado en productos del mes" });
    }

    res.status(200).json({
      mensaje: "Precio del producto actualizado correctamente",
      precio: precio
    });
  } catch (error) {
    console.error("Error al actualizar precio:", error.message);
    res.status(500).json({ error: "Error al actualizar precio", detalles: error.message });
  }
};