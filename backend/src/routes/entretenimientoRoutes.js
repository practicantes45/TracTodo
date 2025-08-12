const express = require("express");
const router = express.Router();
const { adminAutorizado } = require("../middlewares/funcionesPassword");
const {
  getVideos, agregarVideo, actualizarVideo, eliminarVideo,
  obtenerPostsBlog, obtenerPostPorId, agregarPostBlog, actualizarPostBlog, eliminarPostBlog,
  getVideosSeleccionados, agregarVideoSeleccionado, eliminarVideoSeleccionado, getVideosDisponibles,
  getArticulosSeleccionados, agregarArticuloSeleccionado, eliminarArticuloSeleccionado, getArticulosDisponibles
} = require("../controllers/entretenimientoController");

// MIDDLEWARE PARA VERIFICAR ADMIN - CORREGIDO
const verificarAdmin = async (req, res, next) => {
  try {
    const resultado = await adminAutorizado(req);
    if (resultado.status !== 200) {
      return res.status(resultado.status).json({ mensaje: resultado.mensajeUsuario.mensaje });
    }
    next();
  } catch (error) {
    console.error('❌ Error en verificarAdmin:', error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// VIDEOS - Rutas públicas y privadas
router.get("/videos", getVideos);
router.post("/videos", verificarAdmin, agregarVideo);
router.put("/videos/:id", verificarAdmin, actualizarVideo);
router.delete("/videos/:id", verificarAdmin, eliminarVideo);

// VIDEOS SELECCIONADOS PARA ENTRETENIMIENTO - Solo admin puede modificar
router.get("/videos-seleccionados", getVideosSeleccionados);
router.get("/videos-disponibles", verificarAdmin, getVideosDisponibles);
router.post("/videos-seleccionados", verificarAdmin, agregarVideoSeleccionado);
router.delete("/videos-seleccionados", verificarAdmin, eliminarVideoSeleccionado);

// BLOGS - Lectura pública, escritura solo admin
router.get("/blogs", obtenerPostsBlog);  // Público
router.get("/blogs/:id", obtenerPostPorId);  // Público - AGREGADA RUTA FALTANTE
router.post("/blogs", verificarAdmin, agregarPostBlog);  // Solo admin
router.put("/blogs/:id", verificarAdmin, actualizarPostBlog);  // Solo admin
router.delete("/blogs/:id", verificarAdmin, eliminarPostBlog);  // Solo admin

// ARTÍCULOS SELECCIONADOS PARA ENTRETENIMIENTO - Solo admin puede modificar
router.get("/articulos-seleccionados", getArticulosSeleccionados);
router.get("/articulos-disponibles", verificarAdmin, getArticulosDisponibles);
router.post("/articulos-seleccionados", verificarAdmin, agregarArticuloSeleccionado);
router.delete("/articulos-seleccionados", verificarAdmin, eliminarArticuloSeleccionado);
module.exports = router;
