const express = require("express");
const router = express.Router();
const { adminAutorizado } = require("../middlewares/funcionesPassword");
const { adminWriteLimiter, adminReadLimiter } = require("../middlewares/rateLimit");
const {
  getVideos, agregarVideo, actualizarVideo, eliminarVideo,
  obtenerPostsBlog, obtenerPostPorId, obtenerPostPorSlug, agregarPostBlog, actualizarPostBlog, eliminarPostBlog,
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
router.post("/videos", adminWriteLimiter, verificarAdmin, agregarVideo);
router.put("/videos/:id", adminWriteLimiter, verificarAdmin, actualizarVideo);
router.delete("/videos/:id", adminWriteLimiter, verificarAdmin, eliminarVideo);

// VIDEOS SELECCIONADOS PARA ENTRETENIMIENTO - Solo admin puede modificar
router.get("/videos-seleccionados", getVideosSeleccionados);
router.get("/videos-disponibles", adminReadLimiter, verificarAdmin, getVideosDisponibles);
router.post("/videos-seleccionados", adminWriteLimiter, verificarAdmin, agregarVideoSeleccionado);
router.delete("/videos-seleccionados", adminWriteLimiter, verificarAdmin, eliminarVideoSeleccionado);

// BLOGS - Lectura pública, escritura solo admin
router.get("/blogs", obtenerPostsBlog);  // Público - obtener todos
router.get("/blogs/:id", obtenerPostPorId);  // Público - obtener por ID específico de Firebase
router.get("/blogs/por-nombre/:slug", obtenerPostPorSlug);  // NUEVA RUTA - obtener por slug/nombre
router.post("/blogs", adminWriteLimiter, verificarAdmin, agregarPostBlog);  // Solo admin
router.put("/blogs/:id", adminWriteLimiter, verificarAdmin, actualizarPostBlog);  // Solo admin
router.delete("/blogs/:id", adminWriteLimiter, verificarAdmin, eliminarPostBlog);  // Solo admin

// ARTÍCULOS SELECCIONADOS PARA ENTRETENIMIENTO - Solo admin puede modificar
router.get("/articulos-seleccionados", getArticulosSeleccionados);
router.get("/articulos-disponibles", adminReadLimiter, verificarAdmin, getArticulosDisponibles);
router.post("/articulos-seleccionados", adminWriteLimiter, verificarAdmin, agregarArticuloSeleccionado);
router.delete("/articulos-seleccionados", adminWriteLimiter, verificarAdmin, eliminarArticuloSeleccionado);

module.exports = router;
