
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
  
  console.log('🍪 === CONFIGURACIÓN DE COOKIE CROSS-DOMAIN ===');
  console.log('🌐 Origin:', origin);
  console.log('🏠 Host:', host);
  console.log('👤 Usuario:', username);

  // DETECTAR SI ES TRACTODO.COM
  const esTractodoCom = origin.includes('tractodo.com');
  const esRailway = host.includes('railway.app');
  const isProduction = process.env.NODE_ENV === 'production';

  console.log('🔍 Análisis de dominio:');
  console.log('- Es tractodo.com:', esTractodoCom);
  console.log('- Es Railway:', esRailway);
  console.log('- Es producción:', isProduction);

  // CONFIGURACIÓN ESPECÍFICA PARA CROSS-DOMAIN
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // HTTPS obligatorio en producción
    sameSite: esTractodoCom ? 'None' : 'Lax', // None para cross-domain
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/',
    // NO ESPECIFICAR DOMAIN PARA CROSS-DOMAIN - dejar que el browser lo maneje
  };

  console.log('⚙️ Configuración final de cookie:', cookieOptions);

  // HEADERS ESPECÍFICOS PARA CROSS-DOMAIN
  res.set({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': origin, // Específico para el origin actual
    'Access-Control-Expose-Headers': 'Set-Cookie',
    'Vary': 'Origin', // Importante para caching
    // HEADERS ADICIONALES PARA CROSS-DOMAIN COOKIES
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  });

  res
    .cookie("token", respuesta.token, cookieOptions)
    .status(200)
    .json({ 
      mensaje: respuesta.mensajeUsuario,
      user: username,
      debug: {
        cookieSet: true,
        crossDomain: esTractodoCom,
        origin,
        host,
        cookieConfig: cookieOptions
      }
    });

  console.log('✅ Cookie cross-domain configurada exitosamente');
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};