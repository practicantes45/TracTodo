const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { mensajes } = require("../libs/mensajes");

function encriptarPassword(password) {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64, "sha512").toString("hex");
  return { salt, hash };
}

function validarPassword(password, salt, hash) {
  const hashEvaluar = crypto.scryptSync(password, salt, 64, "sha512").toString("hex");
  return hashEvaluar === hash;
}

function adminAutorizado(req) {
  console.log('🔍 === VERIFICACIÓN DE ADMIN DETALLADA ===');
  console.log('🌍 Entorno:', process.env.NODE_ENV);
  console.log('🏠 Host:', req.get('host'));
  console.log('🔗 Origin:', req.get('origin'));
  console.log('🍪 Headers de cookies:', req.get('cookie'));
  console.log('📋 Todas las cookies:', req.cookies);
  console.log('🎯 Valor específico token:', req.cookies?.token);
  
  const token = req.cookies?.token;

  if (!token) {
    console.log('❌ No se encontró token en cookies');
    console.log('🔍 Headers completos:', JSON.stringify(req.headers, null, 2));
    return mensajes(400, "Token no proporcionado");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log('🔍 Token decodificado exitosamente:', {
      username: decoded.username,
      tipoUsuario: decoded.tipoUsuario,
      id: decoded.id,
      exp: new Date(decoded.exp * 1000)
    });

    // Verificar tipoUsuario
    if (decoded.tipoUsuario !== "admin") {
      console.log('❌ Usuario no tiene tipoUsuario admin:', decoded.tipoUsuario);
      console.log('📝 Usuarios con tipo admin requerido, actual:', decoded.tipoUsuario);
      return mensajes(403, "Admin no autorizado");
    }

    console.log('✅ Admin autorizado exitosamente:', decoded.username);
    return mensajes(200, "Admin autorizado");
    
  } catch (error) {
    console.log('❌ Error al verificar token:', error.message);
    if (error.name === 'TokenExpiredError') {
      console.log('⏰ Token expirado:', error.expiredAt);
    }
    return mensajes(401, "Token inválido", error);
  }
}

module.exports = {
  encriptarPassword,
  validarPassword,
  adminAutorizado,
};