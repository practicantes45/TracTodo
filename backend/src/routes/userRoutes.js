const express = require("express");
const { registrarUsuario, iniciarSesion, obtenerPerfilUsuario } = require("../controllers/userController.js");
const { adminAutorizado, usuarioAutenticado } = require("../middlewares/funcionesPassword.js");

const router = express.Router();

/**
 * ACTUALIZADO: Registro de usuario (ahora con email)
 * POST /api/user/registro
 * Body: { email, password, username? }
 */
router.post("/registro", registrarUsuario);

/**
 * ACTUALIZADO: Login del usuario (ahora con email)
 * POST /api/user/inicioSesion  
 * Body: { email, password }
 */
router.post("/inicioSesion", iniciarSesion);

/**
 *  MANTENIDO: Verificación de admin (actualizada internamente)
 * GET /api/user/administradores
 */
router.get("/administradores", async (req, res) => {
  try {
    console.log('=== VERIFICACIÓN DE ADMINISTRADOR ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('IP:', req.ip);
    
    const respuesta = await adminAutorizado(req);
    
    console.log('Resultado verificación:', {
      status: respuesta.status,
      mensaje: respuesta.mensajeUsuario
    });
    
    res.status(respuesta.status).json(respuesta.mensajeUsuario);
    
  } catch (error) {
    console.error('Error en verificación de admin:', error.message);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

/**
 * MANTENIDO: Cerrar sesión
 * GET /api/user/cerrarSesion
 */
router.get("/cerrarSesion", (req, res) => {
  console.log('=== CERRANDO SESIÓN ===');
  console.log('Timestamp:', new Date().toISOString());
  
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/'
    })
    .status(200)
    .json({ 
      mensaje: "Sesión cerrada correctamente",
      timestamp: new Date().toISOString()
    });
    
  console.log('Sesión cerrada exitosamente');
});

/**
 * MANTENIDO: Limpiar sesión (función de emergencia)
 * POST /api/user/limpiar-sesion
 */
router.post("/limpiar-sesion", (req, res) => {
  console.log('=== LIMPIANDO TODAS LAS COOKIES ===');
  
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      path: '/'
    })
    .status(200)
    .json({ 
      mensaje: "Todas las cookies limpiadas",
      timestamp: new Date().toISOString()
    });
    
  console.log('Cookies limpiadas exitosamente');
});

/**
 * NUEVO: Obtener perfil del usuario actual
 * GET /api/user/perfil
 */
router.get("/perfil", obtenerPerfilUsuario);

/**
 * NUEVO: Verificar si el usuario está autenticado
 * GET /api/user/verificar-sesion
 */
router.get("/verificar-sesion", async (req, res) => {
  try {
    const respuesta = await usuarioAutenticado(req);
    
    if (respuesta.status === 200) {
      res.status(200).json({
        autenticado: true,
        usuario: respuesta.token, // Los datos del usuario están en el campo token
        mensaje: "Sesión válida"
      });
    } else {
      res.status(respuesta.status).json({
        autenticado: false,
        mensaje: respuesta.mensajeUsuario
      });
    }
    
  } catch (error) {
    console.error('Error verificando sesión:', error.message);
    res.status(500).json({
      autenticado: false,
      mensaje: "Error verificando sesión"
    });
  }
});

/**
 * NUEVO: Ruta de información sobre el sistema de autenticación
 * GET /api/user/info-auth
 */
router.get("/info-auth", (req, res) => {
  res.json({
    sistema: "Firebase Authentication",
    version: "2.0",
    cambios: [
      "Migrado de username a email",
      "Usa Firebase Authentication en lugar de Realtime Database",
      "Passwords manejados por Firebase (más seguro)",
      "Tokens JWT con UID de Firebase",
      "Verificación de admin mejorada"
    ],
    endpoints: {
      registro: "POST /api/user/registro - { email, password, username? }",
      login: "POST /api/user/inicioSesion - { email, password }",
      verificarAdmin: "GET /api/user/administradores",
      verificarSesion: "GET /api/user/verificar-sesion",
      cerrarSesion: "GET /api/user/cerrarSesion",
      perfil: "GET /api/user/perfil"
    },
    migracion: {
      completada: true,
      fecha: new Date().toISOString(),
      notas: "Los usuarios existentes en Realtime Database deben re-registrarse"
    }
  });
});

module.exports = router;