const jwt = require("jsonwebtoken");
const { auth, db } = require("../config/firebase"); // NUEVO: Importar auth
require("dotenv").config();
const { mensajes } = require("../libs/mensajes");

/**
 * ACTUALIZADO: Verificación de admin usando Firebase Authentication
 * Cambios principales:
 * - Ahora usa UID de Firebase Auth en lugar de username
 * - Verifica tipoUsuario desde Realtime Database
 * - Mantiene compatibilidad con el sistema de tokens JWT
 */
function adminAutorizado(req) {
  console.log('=== VERIFICACIÓN DE ADMIN (FIREBASE AUTH) ===');
  console.log('Cookies recibidas:', req.cookies);
  
  const token = req.cookies?.token;

  if (!token) {
    console.log('No se encontró token en cookies');
    return mensajes(400, "Token no proporcionado");
  }

  try {
    // NUEVO: Decodificar JWT que ahora contiene UID de Firebase Auth
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log('Token decodificado exitosamente:', {
      uid: decoded.uid, // CAMBIO: Ahora es UID en lugar de ID
      email: decoded.email, // CAMBIO: Ahora es email en lugar de username
      tipoUsuario: decoded.tipoUsuario
    });

    // MEJORADO: Verificar tipoUsuario del token JWT
    if (decoded.tipoUsuario !== "admin") {
      console.log('Usuario no tiene tipoUsuario admin:', decoded.tipoUsuario);
      return mensajes(403, "Admin no autorizado - tipo de usuario incorrecto");
    }

    // OPCIONAL: Verificación adicional contra Firebase Auth (más segura)
    // Esta parte es opcional pero recomendada para mayor seguridad
    if (process.env.VERIFICAR_ADMIN_FIREBASE === 'true') {
      console.log('Verificación adicional contra Firebase Auth habilitada');
      return verificarAdminContraFirebase(decoded.uid);
    }

    console.log('Admin autorizado exitosamente:', decoded.email);
    return mensajes(200, "Admin autorizado");
    
  } catch (error) {
    console.log('Error al verificar token:', error.message);
    
    // MEJORADO: Manejo específico de errores JWT
    if (error.name === 'TokenExpiredError') {
      return mensajes(401, "Token expirado - inicie sesión nuevamente");
    } else if (error.name === 'JsonWebTokenError') {
      return mensajes(401, "Token inválido");
    }
    
    return mensajes(401, "Token inválido", error);
  }
}

/**
 * NUEVO: Verificación adicional contra Firebase Authentication
 * Esta función opcional proporciona una capa extra de seguridad
 */
async function verificarAdminContraFirebase(uid) {
  try {
    console.log('Verificando admin contra Firebase Auth para UID:', uid);
    
    // Verificar que el usuario existe en Firebase Auth
    const userRecord = await auth.getUser(uid);
    
    if (!userRecord) {
      console.log('Usuario no encontrado en Firebase Auth');
      return mensajes(403, "Usuario no válido");
    }

    // Verificar datos adicionales en Realtime Database
    const perfilSnapshot = await db.ref(`/usuarios/${uid}`).once("value");
    const perfilData = perfilSnapshot.val();
    
    if (!perfilData || perfilData.tipoUsuario !== "admin") {
      console.log('Usuario no es admin según Realtime Database');
      return mensajes(403, "Admin no autorizado - verificación Firebase");
    }

    if (perfilData.activo === false) {
      console.log('Cuenta de admin desactivada');
      return mensajes(403, "Cuenta desactivada");
    }

    console.log('Verificación Firebase Auth exitosa para admin:', userRecord.email);
    return mensajes(200, "Admin autorizado - verificación completa");
    
  } catch (error) {
    console.error('Error en verificación Firebase Auth:', error.message);
    return mensajes(500, "Error en verificación de admin");
  }
}

/**
 * NUEVO: Función para crear admin inicial
 * Útil para configuración inicial del sistema
 */
async function crearAdminInicial() {
  try {
    const { crearAdmin } = require("../db/usuariosDB");
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@tractodo.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
    const adminUsername = process.env.ADMIN_USERNAME || "admin";

    console.log('👤 Creando administrador inicial...');
    
    const admin = await crearAdmin({
      email: adminEmail,
      password: adminPassword,
      username: adminUsername
    });

    console.log('Administrador inicial creado:', admin.email);
    return admin;
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('El administrador ya existe');
      return null;
    }
    console.error('Error creando admin inicial:', error.message);
    throw error;
  }
}

/**
 * NUEVO: Middleware para verificar usuario autenticado (no necesariamente admin)
 */
function usuarioAutenticado(req) {
  const token = req.cookies?.token;

  if (!token) {
    return mensajes(401, "Token de autenticación requerido");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    
    // Verificar que el token tenga los campos necesarios
    if (!decoded.uid || !decoded.email) {
      return mensajes(401, "Token inválido - datos incompletos");
    }

    return mensajes(200, "Usuario autenticado", "", { 
      uid: decoded.uid, 
      email: decoded.email, 
      tipoUsuario: decoded.tipoUsuario 
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return mensajes(401, "Sesión expirada");
    }
    return mensajes(401, "Token inválido");
  }
}

/**
 * ACTUALIZADO: Función para verificar token y extraer datos del usuario
 */
function extraerDatosToken(req) {
  const token = req.cookies?.token;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    return {
      uid: decoded.uid,
      email: decoded.email,
      username: decoded.username,
      tipoUsuario: decoded.tipoUsuario
    };
  } catch (error) {
    console.warn('Error extrayendo datos del token:', error.message);
    return null;
  }
}

// NOTA: Eliminamos las funciones de encriptación manual
// ya que Firebase Authentication maneja esto automáticamente

module.exports = {
  adminAutorizado,
  verificarAdminContraFirebase,
  usuarioAutenticado,
  extraerDatosToken,
  crearAdminInicial
};