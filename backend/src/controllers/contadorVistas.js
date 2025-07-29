const fs = require("fs");
const path = require("path");

const rutaArchivoContador = path.join(__dirname, "../contador.json");

let contadorVistas = 0;
let ultimaVista = null; // Para evitar registros duplicados
let fechaUltimoReinicio = null; // NUEVO: Controlar reinicio diario

// NUEVO: Función para obtener fecha actual (solo día)
const obtenerFechaActual = () => {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, '0')}-${ahora.getDate().toString().padStart(2, '0')}`;
};

// NUEVO: Función para verificar si debe reiniciarse el contador
const debeReiniciar = () => {
  const fechaActual = obtenerFechaActual();
  return fechaUltimoReinicio !== fechaActual;
};

// Leer contador al iniciar el servidor
const cargarContador = () => {
  if (fs.existsSync(rutaArchivoContador)) {
    try {
      const datos = fs.readFileSync(rutaArchivoContador, "utf8");
      const json = JSON.parse(datos);
      
      contadorVistas = json.vistas || 0;
      fechaUltimoReinicio = json.fechaUltimoReinicio || null;
      
      // NUEVO: Verificar si debe reiniciarse por nuevo día
      if (debeReiniciar()) {
        console.log(`🔄 Nuevo día detectado - Reiniciando contador desde ${contadorVistas} a 0`);
        contadorVistas = 0;
        fechaUltimoReinicio = obtenerFechaActual();
        guardarContador();
      } else {
        console.log(`📊 Contador cargado: ${contadorVistas} vistas (fecha: ${fechaUltimoReinicio})`);
      }
    } catch (e) {
      console.error("Error al leer contador:", e);
      contadorVistas = 0;
      fechaUltimoReinicio = obtenerFechaActual();
    }
  } else {
    console.log("📄 Archivo contador no existe, iniciando en 0");
    contadorVistas = 0;
    fechaUltimoReinicio = obtenerFechaActual();
  }
};

// Guardar contador en archivo
const guardarContador = () => {
  try {
    const data = { 
      vistas: contadorVistas,
      fechaUltimoReinicio: fechaUltimoReinicio,
      ultimaActualizacion: new Date().toISOString()
    };
    fs.writeFileSync(rutaArchivoContador, JSON.stringify(data, null, 2));
    console.log(`💾 Contador guardado: ${contadorVistas} (fecha: ${fechaUltimoReinicio})`);
  } catch (e) {
    console.error("Error al guardar contador:", e);
  }
};

// Cargar contador al iniciar
cargarContador();

// Registrar nueva vista (incrementa en 1) CON PROTECCIÓN ANTI-DUPLICADOS Y REINICIO DIARIO
exports.registrarVista = (req, res) => {
  // NUEVO: Verificar reinicio diario antes de procesar
  if (debeReiniciar()) {
    console.log(`🔄 Nuevo día detectado durante registro - Reiniciando contador desde ${contadorVistas} a 0`);
    contadorVistas = 0;
    fechaUltimoReinicio = obtenerFechaActual();
  }

  const ahora = Date.now();
  const tiempoMinimo = 5000; // 5 segundos entre registros

  // Evitar registros duplicados muy rápidos
  if (ultimaVista && (ahora - ultimaVista) < tiempoMinimo) {
    console.log(`🚫 Vista ignorada - muy rápida (${ahora - ultimaVista}ms)`);
    return res.status(200).json({
      mensaje: "Vista ya registrada recientemente",
      vistasTotales: contadorVistas,
    });
  }

  contadorVistas++;
  ultimaVista = ahora;
  guardarContador();
  
  console.log(`✅ Vista registrada #${contadorVistas} (fecha: ${fechaUltimoReinicio})`);

  res.status(200).json({
    mensaje: "Vista registrada correctamente",
    vistasTotales: contadorVistas,
  });
};

// Obtener contador actual sin incrementar
exports.obtenerContador = (req, res) => {
  // NUEVO: Verificar reinicio diario antes de devolver contador
  if (debeReiniciar()) {
    console.log(`🔄 Nuevo día detectado durante consulta - Reiniciando contador desde ${contadorVistas} a 0`);
    contadorVistas = 0;
    fechaUltimoReinicio = obtenerFechaActual();
    guardarContador();
  }

  console.log(`📈 Contador consultado: ${contadorVistas} (fecha: ${fechaUltimoReinicio})`);
  res.status(200).json({
    vistasTotales: contadorVistas,
    fechaReinicio: fechaUltimoReinicio
  });
};