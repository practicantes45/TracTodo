const express = require("express");
const router = express.Router();
const { restaurarBackup } = require("../controllers/reversionController");

// Ruta para restaurar productos/videos/blogs/producto del mes
router.post("/:tipo/:id", restaurarBackup);

module.exports = router;
