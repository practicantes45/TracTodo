
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

  const origin = req.get('origin') || '';
  const host = req.get('host') || '';
  
  console.log('🍪 Configurando cookie para usuario:', username);
  console.log('🌐 Origin:', origin);
  console.log('🏠 Host:', host);

  // Detectar si es cross-domain
  const esTractodoCom = origin.includes('tractodo.com');
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('🔍 Es tractodo.com:', esTractodoCom);
  console.log('🔍 Es producción:', isProduction);

  // Configuración de cookie optimizada
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: esTractodoCom ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  };

  console.log('⚙️ Configuración de cookie:', cookieOptions);

  // Headers para cross-domain
  if (esTractodoCom) {
    res.set({
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': origin
    });
  }

  res
    .cookie("token", respuesta.token, cookieOptions)
    .status(200)
    .json({ 
      mensaje: respuesta.mensajeUsuario,
      user: username,
      debug: {
        cookieSet: true,
        crossDomain: esTractodoCom,
        cookieConfig: cookieOptions
      }
    });

  console.log('✅ Cookie configurada exitosamente');
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};