const express = require("express");
const router = express.Router();

const { registrarVista, obtenerContador } = require("../controllers/contadorVistas.js");

// POST para registrar nueva vista (incrementa contador)
router.post("/registrar-vista", registrarVista);

// GET para solo obtener el contador actual (no incrementa)
router.get("/contador", obtenerContador);

module.exports = router;