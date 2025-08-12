
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const productoRoutes = require("./src/routes/productoRoutes.js"); 
const trackingRoutes = require("./src/routes/trackingRoutes");
const userRoutes = require("./src/routes/userRoutes.js");
const entretenimientoRoutes = require("./src/routes/entretenimientoRoutes.js");
const { generarRecomendaciones } = require("./src/services/productoRecomendado");
const reversionRoutes = require("./src/routes/reversionRoutes.js");
const { limpiarBackupsAntiguos } = require("./src/controllers/limpiarBackupsAntiguos.js");
const vistasRoutes = require("./src/routes/vistasRoutes.js");
const healthRoutes = require("./src/routes/healthRoutes.js");
const seoRoutes = require("./src/routes/seoRoutes.js");
const cookieParser = require("cookie-parser");

const app = express();

// Middleware para log de conexiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin')} - IP: ${req.ip}`);
  next();
});

// CONFIGURACIÓN CORREGIDA PARA TRACTODO.COM
const allowedOrigins = [
  "http://localhost:3001", 
  "http://127.0.0.1:3001",
  "https://tractodo-production-3e8e.up.railway.app",
  "https://tractodo-production.up.railway.app",
  "https://tractodo.com",
  "https://www.tractodo.com"
];

console.log('🔒 CORS configurado para origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log(`🔍 CORS - Origin recibido: "${origin}"`);
    
    // Permitir requests sin origin
    if (!origin) {
      console.log('✅ CORS - Sin origin, permitido');
      return callback(null, true);
    }
    
    // Verificar si el origin está permitido
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS - Origin permitido:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS - Origin NO permitido:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cookie', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(cookieParser()); 

// MIDDLEWARE PARA DEBUGGING DE COOKIES
app.use((req, res, next) => {
  if (req.path.includes('/user/administradores')) {
    console.log('🔍 === DEBUGGING ADMIN REQUEST ===');
    console.log('🌐 Origin:', req.get('origin'));
    console.log('🏠 Host:', req.get('host'));
    console.log('🍪 Cookie Header:', req.get('cookie'));
    console.log('📋 Parsed Cookies:', req.cookies);
    console.log('🔐 Token específico:', req.cookies?.token);
    console.log('========================================');
  }
  next();
});

// Rutas
app.use("/api/health", healthRoutes);
app.use("/api/productos", productoRoutes); 
app.use("/api/tracking", trackingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/entretenimiento", entretenimientoRoutes);
app.use("/api/reversion", reversionRoutes);
app.use("/api/vistas", vistasRoutes);
app.use("/api/seo", seoRoutes);

console.log("✅ Backend iniciado correctamente");
console.log("🌐 Environment:", process.env.NODE_ENV || 'development');
console.log("🔗 Frontend: https://tractodo.com");
console.log("📡 Backend: https://tractodo-production.up.railway.app");

// Programar tareas...
cron.schedule("0 3 * * *", async () => {
  console.log("Ejecutando limpieza de backups antiguos...");
  await limpiarBackupsAntiguos();
});

cron.schedule("*/10 * * * *", async () => {
  console.log("Generando recomendaciones automáticamente...");
  await generarRecomendaciones();
});

module.exports = app;