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
  console.log('🔗 Origin:', req.get('origin'));

  // CONFIGURACIÓN OPTIMIZADA PARA RAILWAY
  const isProduction = process.env.NODE_ENV === 'production';
  const origin = req.get('origin') || '';
  
  // Detectar si es Railway
  const isRailway = req.get('host')?.includes('railway.app') || 
                   origin.includes('railway.app') || 
                   process.env.RAILWAY_ENVIRONMENT;

  console.log('🚂 Es Railway:', isRailway);

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? (isRailway ? 'Lax' : 'None') : 'Lax', // LAX para Railway
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    path: '/',
    // AGREGAR DOMAIN ESPECÍFICO PARA RAILWAY
    ...(isRailway && { domain: '.railway.app' })
  };

  console.log('⚙️ Configuración de cookie optimizada:', cookieOptions);

  // CONFIGURAR HEADERS ADICIONALES PARA RAILWAY
  res.set({
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'Set-Cookie',
    // AGREGAR CACHE CONTROL PARA EVITAR PROBLEMAS DE CACHE
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res
    .cookie("token", respuesta.token, cookieOptions)
    .status(200)
    .json({ 
      mensaje: respuesta.mensajeUsuario,
      user: username,
      debug: {
        cookieSet: true,
        environment: process.env.NODE_ENV,
        isRailway,
        cookieConfig: cookieOptions
      }
    });

  console.log('✅ Cookie configurada exitosamente para Railway');
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
};