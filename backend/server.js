require("dotenv").config();
const app = require("./app");

// Railway usa diferentes puertos, pero Railway asigna automáticamente
const PORT = process.env.PORT || 8080;

// CRÍTICO: Escuchar en todas las interfaces para Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Railway Mode: ${process.env.RAILWAY_ENVIRONMENT ? 'ACTIVO' : 'LOCAL'}`);
  console.log(`🔗 Backend URL: https://tractodo-production.up.railway.app`);
  console.log(`🔗 Frontend URL: https://tractodo-production-3e8e.up.railway.app`);
  
  // Log de configuración para debugging
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log(`🚂 Listening on: 0.0.0.0:${PORT}`);
  }
});