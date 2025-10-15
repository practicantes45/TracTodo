const { register, login } = require("../db/usuariosDB");
const jwt = require("jsonwebtoken");

/**
 * ACTUALIZADO: Registro con email como identificador principal
 * Cambios: email requerido, username opcional
 */
const registrarUsuario = async (req, res) => {
  const { email, password, username } = req.body;

  console.log('=== REGISTRO DE USUARIO (EMAIL) ===');
  console.log('Email:', email);
  console.log('Username:', username || 'No proporcionado');

  // NUEVO: Validación de email (ahora es obligatorio)
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Email válido es requerido" });
  }

  if (!password) {
    return res.status(400).json({ error: "Contraseña es requerida" });
  }

  // Username es opcional, se generará automáticamente si no se proporciona
  try {
    const respuesta = await register({ email, password, username });
    
    if (respuesta.status !== 201) {
      console.log('Error en registro:', respuesta.mensajeUsuario);
      return res.status(respuesta.status).json({ error: respuesta.mensajeUsuario });
    }

    console.log('Usuario registrado exitosamente:', email);
    res.status(201).json({ 
      mensaje: respuesta.mensajeUsuario, 
      token: respuesta.token,
      email: email 
    });
    
  } catch (error) {
    console.error('Error inesperado en registro:', error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * ACTUALIZADO: Inicio de sesión con email
 * Cambios: Ahora usa email en lugar de username
 */
const iniciarSesion = async (req, res) => {
  const { email, password } = req.body;

  console.log('=== INICIO DE SESIÓN (EMAIL) ===');
  console.log('Email:', email);
  console.log('Timestamp:', new Date().toISOString());

  // NUEVO: Validación actualizada para email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Email válido es requerido" });
  }

  if (!password) {
    return res.status(400).json({ error: "Contraseña es requerida" });
  }

  try {
    const respuesta = await login({ email, password }); // CAMBIO: pasar email
    
    if (respuesta.status !== 200) {
      console.log('Error en login:', respuesta.mensajeUsuario);
      return res.status(respuesta.status).json({ error: respuesta.mensajeUsuario });
    }

    console.log('Configurando cookie para usuario:', email);

    // MEJORADO: Configuración de cookies para producción
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/',
    };

    res
      .cookie("token", respuesta.token, cookieOptions)
      .status(200)
      .json({ 
        mensaje: respuesta.mensajeUsuario,
        email: email, // CAMBIO: devolver email en lugar de username
        timestamp: new Date().toISOString()
      });

    console.log('Cookie configurada exitosamente para:', email);
    
  } catch (error) {
    console.error('Error inesperado en login:', error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/**
 * NUEVO: Obtener información del usuario actual (opcional)
 */
const obtenerPerfilUsuario = async (req, res) => {
  try {
    // Esta función podría implementarse para obtener el perfil del usuario logueado
    // usando el token JWT para extraer el UID y consultar Firebase Auth
    
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Aquí podrías decodificar el JWT y obtener datos del usuario
    // Por ahora, solo indicamos que está implementado para futuro uso
    
    res.status(501).json({ 
      mensaje: "Función de perfil disponible para implementación futura",
      implementado: false 
    });
    
  } catch (error) {
    console.error('Error obteniendo perfil:', error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  obtenerPerfilUsuario // NUEVO: Función adicional
};
