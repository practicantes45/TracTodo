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
  console.log('🌍 Entorno:', process.env.NODE_ENV);
  console.log('🔒 Host:', req.get('host'));

  // CONFIGURACIÓN MEJORADA DE COOKIES PARA PRODUCCIÓN
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // HTTPS en producción
    sameSite: isProduction ? 'None' : 'Lax', // None para cross-origin en producción
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/', // Disponible en toda la app
  };

  console.log('⚙️ Configuración de cookie:', cookieOptions);

  res
    .cookie("token", respuesta.token, cookieOptions)
    .status(200)
    .json({ 
      mensaje: respuesta.mensajeUsuario,
      user: username,
      // AGREGAR INFO DE DEBUG
      debug: {
        cookieSet: true,
        environment: process.env.NODE_ENV,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite
      }
    });

  console.log('✅ Cookie configurada exitosamente');
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};