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
  console.log('🔍 === VERIFICACIÓN DE ADMIN ===');
  console.log('🍪 Cookies recibidas:', req.cookies);
  
  const token = req.cookies?.token;

  if (!token) {
    console.log('❌ No se encontró token en cookies');
    return mensajes(400, "Token no proporcionado");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log('🔍 Token decodificado exitosamente:', {
      username: decoded.username,
      tipoUsuario: decoded.tipoUsuario,
      id: decoded.id
    });

    // CAMBIO: Verificar tipoUsuario en lugar de username específico
    if (decoded.tipoUsuario !== "admin") {
      console.log('❌ Usuario no tiene tipoUsuario admin:', decoded.tipoUsuario);
      return mensajes(403, "Admin no autorizado");
    }

    console.log('✅ Admin autorizado exitosamente:', decoded.username);
    return mensajes(200, "Admin autorizado");
    
  } catch (error) {
    console.log('❌ Error al verificar token:', error.message);
    return mensajes(401, "Token inválido", error);
  }
}

module.exports = {
  encriptarPassword,
  validarPassword,
  adminAutorizado,
};