const { register, login } = require("../db/usuariosDB");

const registrarUsuario = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const respuesta = await register({ username, email, password });
  if (respuesta.status !== 201) {
    return res.status(respuesta.status).json({ error: respuesta.mensajeUsuario });
  }

  res.status(201).json({ mensaje: respuesta.mensajeUsuario, token: respuesta.token });
};

const iniciarSesion = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const respuesta = await login({ username, password });
  if (respuesta.status !== 200) {
    return res.status(respuesta.status).json({ error: respuesta.mensajeUsuario });
  }

  console.log('🍪 Configurando cookie para usuario:', username);

  // CONFIGURACIÓN MEJORADA DE COOKIES
  res
    .cookie("token", respuesta.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/', // Asegurar que esté disponible en toda la app
    })
    .status(200)
    .json({ 
      mensaje: respuesta.mensajeUsuario,
      user: username 
    });

  console.log('✅ Cookie configurada exitosamente');
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};