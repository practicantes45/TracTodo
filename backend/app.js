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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// CONFIGURACIÓN MEJORADA DE CORS PARA RAILWAY
const corsOrigins = [
  "http://localhost:3001", 
  "http://127.0.0.1:3001",
  "https://tractodo-production-3e8e.up.railway.app", // Frontend Railway
  "https://tractodo-production.up.railway.app",
  "https://tractodo.com" // Backend Railway (para health checks)
];

// Agregar dinámicamente el dominio de Railway si existe
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  corsOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

console.log('🔒 CORS configurado para:', corsOrigins);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

app.use(express.json());
app.use(cookieParser()); 

// MIDDLEWARE PARA DEBUGGING DE COOKIES
app.use((req, res, next) => {
  if (req.path.includes('/user/administradores')) {
    console.log(' === DEBUGGING ADMIN REQUEST ===');
    console.log('Ruta:', req.path);
    console.log('Cookies parseadas:', req.cookies);
    console.log('Headers:', req.headers.cookie);
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

// Log de inicio actualizado para Railway
console.log("✅ Backend iniciado correctamente");
console.log("🌐 Environment:", process.env.NODE_ENV || 'development');
console.log("🔗 Frontend URL: https://tractodo-production-3e8e.up.railway.app");
console.log("📡 Backend URL: https://tractodo-production.up.railway.app");
console.log("📦 Esperando conexiones...");

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