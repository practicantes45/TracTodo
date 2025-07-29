const express = require("express");
const { registrarUsuario, iniciarSesion } = require("../controllers/userController.js");
const { adminAutorizado } = require("../middlewares/funcionesPassword.js");

const router = express.Router();

// Registro de usuario
router.post("/registro", registrarUsuario);

// Login del usuario
router.post("/inicioSesion", iniciarSesion); 

// Verificación de admin
router.get("/administradores", async (req, res) => {
  const respuesta = await adminAutorizado(req);
  res.status(respuesta.status).json(respuesta.mensajeUsuario);
});

// Cerrar sesión
router.get("/cerrarSesion", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    })
    .status(200)
    .json({ mensaje: "Sesión cerrada correctamente" });
});

// NUEVA RUTA TEMPORAL para limpiar todo
router.post("/limpiar-sesion", (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    })
    .status(200)
    .json({ mensaje: "Todas las cookies limpiadas" });
});

module.exports = router;