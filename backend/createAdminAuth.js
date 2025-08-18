require("dotenv").config();
const { crearAdmin } = require("./src/db/usuariosDB");

/**
 * NUEVO: Script para crear administrador inicial usando Firebase Authentication
 * Ejecutar con: node createAdminAuth.js
 */
const crearAdministradorInicial = async () => {
  console.log("=== CREANDO ADMINISTRADOR INICIAL (FIREBASE AUTH) ===");
  console.log("Iniciado:", new Date().toISOString());
  
  try {
    // CONFIGURACIÓN: Datos del administrador inicial
    const adminData = {
      email: process.env.ADMIN_EMAIL || "admin@tractodo.com",
      password: process.env.ADMIN_PASSWORD || "admin123456", // CAMBIAR EN PRODUCCIÓN
      username: process.env.ADMIN_USERNAME || "Administrador TracTodo"
    };

    console.log("Email del admin:", adminData.email);
    console.log("Username:", adminData.username);
    console.log("Password:", "****** (oculto)");
    
    // CREAR ADMIN usando Firebase Authentication
    console.log("\nCreando administrador en Firebase Authentication...");
    
    const nuevoAdmin = await crearAdmin(adminData);
    
    console.log("\n=== ADMINISTRADOR CREADO EXITOSAMENTE ===");
    console.log("UID:", nuevoAdmin.uid);
    console.log("Email:", nuevoAdmin.email);
    console.log("Username:", nuevoAdmin.username);
    console.log("Tipo:", nuevoAdmin.tipoUsuario);
    console.log("Finalizado:", new Date().toISOString());
    
    console.log("\n¡ÉXITO! Administrador creado correctamente");
    console.log("Ahora puedes iniciar sesión en:");
    console.log("   - Frontend: https://tractodo-production-3e8e.up.railway.app");
    console.log("   - Endpoint: POST /api/user/inicioSesion");
    console.log("   - Datos: { email: '" + adminData.email + "', password: '******' }");
    
    console.log("\n IMPORTANTE:");
    console.log("   - Cambia la contraseña por defecto en producción");
    console.log("   - Considera habilitar verificación de email");
    console.log("   - El admin puede acceder a todas las rutas protegidas");
    
    process.exit(0);
    
  } catch (error) {
    console.error("\nERROR CREANDO ADMINISTRADOR:");
    console.error("Mensaje:", error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.log("\n El administrador ya existe en el sistema");
      console.log("    Puedes usar las credenciales existentes para iniciar sesión");
      process.exit(0);
    } else if (error.code === 'auth/weak-password') {
      console.log("\n La contraseña es muy débil");
      console.log("   Modifica ADMIN_PASSWORD en tu .env con una contraseña más segura");
    } else if (error.code === 'auth/invalid-email') {
      console.log("\n El email no es válido");
      console.log("   Modifica ADMIN_EMAIL en tu .env con un email válido");
    }
    
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
};

// VERIFICAR CONFIGURACIÓN antes de crear admin
const verificarConfiguracion = () => {
  console.log("Verificando configuración...");
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error("Variables de entorno faltantes:", missing);
    console.error("   Verifica tu archivo .env");
    process.exit(1);
  }
  
  console.log("Configuración verificada");
};

// FUNCIÓN PRINCIPAL
const main = async () => {
  console.log("SCRIPT DE CREACIÓN DE ADMINISTRADOR");
  console.log("=====================================\n");
  
  verificarConfiguracion();
  await crearAdministradorInicial();
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { crearAdministradorInicial, verificarConfiguracion };