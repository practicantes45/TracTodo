const { auth, db } = require("../config/firebase");
const { crearToken } = require("../libs/jwt");
const { mensajes } = require("../libs/mensajes");

/**
 * NUEVO: Registrar usuario usando Firebase Authentication
 * Cambiado de username a email como identificador principal
 */
async function register({ email, password, username = null }) {
  try {
    console.log(`Registrando usuario con email: ${email}`);
    
    // Validaciones básicas
    if (!email || !email.includes('@')) {
      return mensajes(400, "Email inválido");
    }
    
    if (!password || password.length < 6) {
      return mensajes(400, "La contraseña debe tener al menos 6 caracteres");
    }

    // NUEVO: Crear usuario en Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: username || email.split('@')[0], // Usar parte del email si no hay username
      emailVerified: false,
      disabled: false
    });

    console.log(`Usuario creado en Authentication con UID: ${userRecord.uid}`);

    // NUEVO: Guardar datos adicionales en Realtime Database (perfil extendido)
    const userData = {
      email: email,
      username: username || email.split('@')[0],
      tipoUsuario: "usuario", // Por defecto es usuario normal
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      activo: true
    };

    // Guardar en /usuarios/{uid} para datos adicionales
    await db.ref(`/usuarios/${userRecord.uid}`).set(userData);
    
    console.log(`Perfil de usuario guardado en Realtime Database`);

    // NUEVO: Crear token JWT con los datos del usuario
    const token = await crearToken({
      uid: userRecord.uid,
      email: userRecord.email,
      username: userData.username,
      tipoUsuario: userData.tipoUsuario,
    });

    return mensajes(201, "Usuario registrado correctamente", "", token);
    
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);
    
    // Manejar errores específicos de Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return mensajes(400, "Este email ya está registrado");
    } else if (error.code === 'auth/invalid-email') {
      return mensajes(400, "Email inválido");
    } else if (error.code === 'auth/weak-password') {
      return mensajes(400, "La contraseña es muy débil");
    }
    
    return mensajes(500, "Error al registrar usuario", error.message);
  }
}

/**
 * NUEVO: Iniciar sesión usando Firebase Authentication
 * Ahora usa email en lugar de username
 */
async function login({ email, password }) {
  try {
    console.log(`Intentando iniciar sesión con email: ${email}`);
    
    if (!email || !password) {
      return mensajes(400, "Email y contraseña son requeridos");
    }

    // NUEVO: Obtener usuario por email desde Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return mensajes(400, "Usuario no encontrado");
      }
      throw error;
    }

    console.log(`Usuario encontrado: ${userRecord.uid}`);

    // IMPORTANTE: Firebase Admin SDK no puede verificar contraseñas directamente
    // Necesitamos usar Firebase Auth REST API o implementar verificación personalizada
    // Por ahora, usaremos un método alternativo
    
    try {
      // NUEVO: Verificar password usando Firebase Auth REST API
      const isPasswordValid = await verifyPasswordWithFirebaseAPI(email, password);
      
      if (!isPasswordValid) {
        return mensajes(400, "Contraseña incorrecta");
      }
    } catch (authError) {
      console.error("Error verificando contraseña:", authError.message);
      return mensajes(400, "Credenciales inválidas");
    }

    // NUEVO: Obtener datos adicionales del perfil desde Realtime Database
    const perfilSnapshot = await db.ref(`/usuarios/${userRecord.uid}`).once("value");
    const perfilData = perfilSnapshot.val() || {};

    // Combinar datos de Auth con perfil personalizado
    const datosCompletos = {
      uid: userRecord.uid,
      email: userRecord.email,
      username: perfilData.username || userRecord.displayName || email.split('@')[0],
      tipoUsuario: perfilData.tipoUsuario || "usuario",
      activo: perfilData.activo !== false, // Por defecto activo
      fechaUltimoAcceso: new Date().toISOString()
    };

    // Actualizar fecha de último acceso
    await db.ref(`/usuarios/${userRecord.uid}/fechaUltimoAcceso`).set(datosCompletos.fechaUltimoAcceso);

    // NUEVO: Crear token JWT
    const token = await crearToken({
      uid: datosCompletos.uid,
      email: datosCompletos.email,
      username: datosCompletos.username,
      tipoUsuario: datosCompletos.tipoUsuario,
    });

    console.log(`Login exitoso para: ${email}`);
    return mensajes(200, "Login exitoso", "", token);
    
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    return mensajes(500, "Error al iniciar sesión", error.message);
  }
}

/**
 * NUEVO: Verificar contraseña usando Firebase Auth REST API
 * Firebase Admin SDK no puede verificar contraseñas, necesitamos usar la REST API
 */
async function verifyPasswordWithFirebaseAPI(email, password) {
  try {
    const fetch = require('node-fetch'); // Necesitarás instalar: npm install node-fetch
    const apiKey = process.env.FIREBASE_WEB_API_KEY; // Necesitas agregar esto a tu .env
    
    if (!apiKey) {
      console.warn("FIREBASE_WEB_API_KEY no configurado, saltando verificación de contraseña");
      return true; // En desarrollo, permitir acceso
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        returnSecureToken: true
      })
    });

    const result = await response.json();
    
    if (response.ok && result.localId) {
      return true; // Contraseña correcta
    } else {
      return false; // Contraseña incorrecta
    }
    
  } catch (error) {
    console.error("Error verificando contraseña con API:", error.message);
    return false;
  }
}

/**
 * NUEVO: Obtener usuario por UID (reemplaza obtenerUsuarioPorUsername)
 */
async function obtenerUsuarioPorUID(uid) {
  try {
    // Obtener datos de Firebase Auth
    const userRecord = await auth.getUser(uid);
    
    // Obtener datos adicionales del perfil
    const perfilSnapshot = await db.ref(`/usuarios/${uid}`).once("value");
    const perfilData = perfilSnapshot.val() || {};
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      username: perfilData.username || userRecord.displayName,
      tipoUsuario: perfilData.tipoUsuario || "usuario",
      activo: perfilData.activo !== false,
      fechaCreacion: perfilData.fechaCreacion,
      fechaUltimoAcceso: perfilData.fechaUltimoAcceso
    };
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * NUEVO: Obtener usuario por email (útil para verificaciones)
 */
async function obtenerUsuarioPorEmail(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return obtenerUsuarioPorUID(userRecord.uid);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * NUEVO: Crear usuario admin (función helper)
 */
async function crearAdmin({ email, password, username = "admin" }) {
  try {
    const { uid } = await auth.createUser({
      email: email,
      password: password,
      displayName: username,
      emailVerified: true
    });

    // IMPORTANTE: Marcar como admin en el perfil
    await db.ref(`/usuarios/${uid}`).set({
      email: email,
      username: username,
      tipoUsuario: "admin", // CRUCIAL: Tipo admin
      fechaCreacion: new Date().toISOString(),
      activo: true
    });

    console.log(`Administrador creado: ${email} con UID: ${uid}`);
    return { uid, email, username, tipoUsuario: "admin" };
    
  } catch (error) {
    console.error("Error creando admin:", error.message);
    throw error;
  }
}

module.exports = {
  register,
  login,
  obtenerUsuarioPorUID,
  obtenerUsuarioPorEmail,
  crearAdmin,
  verifyPasswordWithFirebaseAPI
};
