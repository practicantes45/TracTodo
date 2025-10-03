const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./src/routes/healthRoutes');
const productoRoutes = require('./src/routes/productoRoutes');
const entretenimientoRoutes = require('./src/routes/entretenimientoRoutes');
const seoRoutes = require('./src/routes/seoRoutes');
const trackingRoutes = require('./src/routes/trackingRoutes');
const reversionRoutes = require('./src/routes/reversionRoutes');
const vistasRoutes = require('./src/routes/vistasRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { agregarSEOaProductos, generarSEOAutomatico, agregarHeadersSEO } = require('./src/middlewares/seoMiddleware');

const app = express();

// ===============================
// Configuración general
// ===============================
app.set('trust proxy', true);

const rawOrigins = [
  process.env.CORS_ORIGINS,
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
]
  .filter(Boolean)
  .join(',');

const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin && origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
}));

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(agregarHeadersSEO);

// ===============================
// Rutas
// ===============================
app.use('/api/health', healthRoutes);
app.use('/api/productos', generarSEOAutomatico, agregarSEOaProductos, productoRoutes);
app.use('/api/entretenimiento', entretenimientoRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/reversiones', reversionRoutes);
app.use('/api/vistas', vistasRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'TracTodo Backend API',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// Manejo de rutas no encontradas
// ===============================
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
  });
});

// ===============================
// Manejador de errores
// ===============================
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
});

module.exports = app;