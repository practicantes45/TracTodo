const { login } = require("../db/usuariosDB");

// Inicio de sesión de administradores
async function iniciarSesionSeguro(req, res) {
  const { email, password } = req.body || {};

  console.log('=== INICIO DE SESION (SEGURO) ===');
  console.log('Email:', email);

  // Validaciones básicas
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email valido es requerido' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Contrasena es requerida' });
  }

  

  try {
    const respuesta = await login({ email, password });
    if (respuesta.status !== 200) {
      console.log('Error en login:', respuesta.mensajeUsuario);
      return res.status(respuesta.status).json({ error: respuesta.mensajeUsuario });
    }

    

    // IMPORTANT: Para permitir cookies en requests cross-site
    // (frontend en http://localhost:3001 y backend en http://localhost:8080)
    // necesitamos SameSite=None y Secure. Los navegadores modernos aceptan
    // Secure en localhost, por lo que lo activamos también en desarrollo.
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    };

    return res
      .cookie('token', respuesta.token, cookieOptions)
      .status(200)
      .json({ mensaje: respuesta.mensajeUsuario, email, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error inesperado en login:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { iniciarSesionSeguro };
