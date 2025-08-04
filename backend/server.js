require("dotenv").config();
const app = require("./app");

// Railway usa 8080, pero permitimos configuración dinámica
const PORT = process.env.PORT || 8080;

// CRÍTICO: Escuchar en todas las interfaces para Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Railway Mode: ${process.env.RAILWAY_ENVIRONMENT ? 'ACTIVO' : 'LOCAL'}`);
  
  // Log de configuración para debugging
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log(`🚂 Railway Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'No configurado'}`);
    console.log(`🔗 Listening on: 0.0.0.0:${PORT}`);
  }
});