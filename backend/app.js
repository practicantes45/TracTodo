// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Routers
const healthRoutes = require('./src/routes/healthRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const entretenimientoRoutes = require('./src/routes/entretenimientoRoutes');
const seoRoutes = require('./src/routes/seoRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const reversionRoutes = require('./src/routes/reversionRoutes');
const vistasRoutes = require('./src/routes/vistasRoutes');
const userRoutes = require('./src/routes/userRoutes');

const {
  agregarSEOaProductos,
  generarSEOAutomatico,
  agregarHeadersSEO
} = require('./src/middlewares/seoMiddleware');

const app = express();

/* ===============================
   Configuración general
================================ */
app.set('trust proxy', true);

// CORS: SOLO frontend prod y localhost dev
const allowedOrigins = [
  process.env.FRONTEND_URL,      // ej: https://tractodo-production-3e8e.up.railway.app
  'http://localhost:3001'
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permitir herramientas sin origin (curl/postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true
}));

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(agregarHeadersSEO);

// Log útil al arrancar (aparece en Railway Logs)
console.log('Allowed CORS origins:', allowedOrigins);

/* ===============================
   Rutas
================================ */
// Importante: montamos health en /api y dentro del router la ruta es /health
// Resultado final: GET https://<backend>/api/health
app.use('/api', healthRoutes);

app.use('/api/productos', generarSEOAutomatico, agregarSEOaProductos, productoRoutes);
app.use('/api/entretenimiento', entretenimientoRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/reversiones', reversionRoutes);
app.use('/api/vistas', vistasRoutes);
app.use('/api/user', userRoutes);

// Raíz informativa
app.get('/', (req, res) => {
  res.json({
    message: 'Tractodo Backend API - Railway Deployment',
    status: 'RUNNING',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      productos: '/api/productos',
      users: '/api/user',
      entretenimiento: '/api/entretenimiento'
    }
  });
});

/* ===============================
   404
================================ */
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

/* ===============================
   Manejador de errores
================================ */
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

module.exports = app;
