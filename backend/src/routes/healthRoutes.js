const express = require("express");
const router = express.Router();

// Ruta básica de health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend conectado correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    port: process.env.PORT || "3000",
    urls: {
      frontend: "https://tractodo-production-3e8e.up.railway.app",
      backend: "https://tractodo-production.up.railway.app"
    }
  });
});

// Ruta adicional para testing
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Tractodo Backend API - Railway Deployment",
    status: "RUNNING",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health/health",
      productos: "/api/productos",
      users: "/api/user",
      entretenimiento: "/api/entretenimiento"
    }
  });
});

module.exports = router;