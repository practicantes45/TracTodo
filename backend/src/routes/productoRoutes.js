const express = require("express");
const router = express.Router();

const { getAllProductos, getProductoById, borrarProductoPorId,actualizarProductoPorId,insertarProducto,getProductosDelMes,actualizarProductosDelMes,insertarProductosDelMes, eliminarProductoDelMes, actualizarPrecioProductoDelMes} = require("../controllers/productoController");

const { generarRecomendaciones } = require("../services/productoRecomendado");

// Obtener todos los productos
router.get("/", getAllProductos);

// Obtener un producto por ID (con recomendaciones)
router.get("/:id", getProductoById);

//Crear un nuevo producto
router.post("/", insertarProducto);

// Actualizar un producto por ID
router.put("/:id", actualizarProductoPorId);

// Eliminar un producto por ID
router.delete("/:id", borrarProductoPorId);

// NUEVA RUTA PARA TESTING DE RECOMENDACIONES
router.post("/generar-recomendaciones", async (req, res) => {
  try {
    console.log("🔧 Generación manual de recomendaciones solicitada");
    await generarRecomendaciones();
    res.json({ mensaje: "Recomendaciones generadas exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al generar recomendaciones", detalles: error.message });
  }
});

// ============================================================ PRODUCTOS DEL MES ====================================================================
router.get("/mes/destacados", getProductosDelMes);
router.put("/mes/actualizar", actualizarProductosDelMes);
router.put("/mes/agregar", insertarProductosDelMes);
router.put("/mes/eliminar", eliminarProductoDelMes);
router.put("/mes/precio/:id", actualizarPrecioProductoDelMes); // NUEVA RUTA

module.exports = router;