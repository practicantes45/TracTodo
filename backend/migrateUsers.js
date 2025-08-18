require("dotenv").config();
const { db } = require("./src/config/firebase");
const { crearAdmin } = require("./src/db/usuariosDB");

/**
 * SCRIPT DE MIGRACIÓN: Usuarios de Realtime Database a Firebase Authentication
 * Ejecutar con: node migrateUsers.js
 */
const migrarUsuarios = async () => {
  console.log("=== MIGRACIÓN DE USUARIOS A FIREBASE AUTHENTICATION ===");
  console.log("Iniciado:", new Date().toISOString());
  
  try {
    // PASO 1: Obtener usuarios existentes de Realtime Database
    console.log("\n 1. Obteniendo usuarios existentes de Realtime Database...");
    
    const usuariosSnapshot = await db.ref("/usuarios").once("value");
    const usuariosExistentes = usuariosSnapshot.val() || {};
    
    const totalUsuarios = Object.keys(usuariosExistentes).length;
    console.log(` Usuarios encontrados: ${totalUsuarios}`);
    
    if (totalUsuarios === 0) {
      console.log("ℹ No hay usuarios existentes que migrar");
      console.log("Migración completada - sistema listo para nuevos usuarios");
      return;
    }

    // PASO 2: Analizar usuarios existentes
    console.log("\n 2. Analizando usuarios existentes...");
    
    const usuariosParaMigrar = [];
    const usuariosSinEmail = [];
    const usuariosAdmin = [];
    
    Object.entries(usuariosExistentes).forEach(([id, usuario]) => {
      console.log(`   👤 ${usuario.username || 'Sin username'} - Tipo: ${usuario.tipoUsuario || 'usuario'}`);
      
      if (usuario.tipoUsuario === 'admin') {
        usuariosAdmin.push({ id, ...usuario });
      } else if (usuario.email && usuario.email.includes('@')) {
        usuariosParaMigrar.push({ id, ...usuario });
      } else {
        usuariosSinEmail.push({ id, ...usuario });
      }
    });

    console.log(`\n ANÁLISIS COMPLETADO:`);
    console.log(`   - Administradores: ${usuariosAdmin.length}`);
    console.log(`   - Usuarios con email: ${usuariosParaMigrar.length}`);
    console.log(`   - Usuarios sin email: ${usuariosSinEmail.length}`);

    // PASO 3: Migrar administradores primero
    if (usuariosAdmin.length > 0) {
      console.log("\n 3. Migrando administradores...");
      
      for (const admin of usuariosAdmin) {
        try {
          const emailAdmin = admin.email || `${admin.username}@tractodo.com`;
          const passwordAdmin = process.env.ADMIN_PASSWORD || "admin123456";
          
          console.log(`   Migrando admin: ${admin.username} (${emailAdmin})`);
          
          const nuevoAdmin = await crearAdmin({
            email: emailAdmin,
            password: passwordAdmin,
            username: admin.username
          });
          
          console.log(`   Admin migrado: ${nuevoAdmin.email}`);
          
        } catch (error) {
          if (error.code === 'auth/email-already-exists') {
            console.log(`   Admin ya existe: ${admin.username}`);
          } else {
            console.error(`  Error migrando admin ${admin.username}:`, error.message);
          }
        }
      }
    }

    // PASO 4: Crear archivo de usuarios para migración manual
    if (usuariosParaMigrar.length > 0 || usuariosSinEmail.length > 0) {
      console.log("\n 4. Creando reporte de migración...");
      
      const reporte = {
        fechaMigracion: new Date().toISOString(),
        usuariosConEmail: usuariosParaMigrar.map(u => ({
          username: u.username,
          email: u.email,
          tipoUsuario: u.tipoUsuario,
          nota: "Debe re-registrarse con email en el nuevo sistema"
        })),
        usuariosSinEmail: usuariosSinEmail.map(u => ({
          username: u.username,
          tipoUsuario: u.tipoUsuario,
          nota: "Necesita proporcionar email para re-registrarse"
        })),
        instrucciones: {
          paraUsuarios: "Los usuarios deben registrarse nuevamente usando POST /api/user/registro con { email, password, username }",
          paraAdmins: "Los administradores han sido migrados automáticamente",
          passwordDefecto: "Los usuarios deben crear nuevas contraseñas"
        }
      };
      
      const fs = require('fs');
      fs.writeFileSync('reporteMigracion.json', JSON.stringify(reporte, null, 2));
      console.log(" Reporte creado: reporteMigracion.json");
    }

    //  PASO 5: Hacer backup de usuarios antiguos
    console.log("\n 5. Creando backup de usuarios antiguos...");
    
    const fechaBackup = new Date().toISOString().replace(/[:.]/g, '-');
    await db.ref(`/backups/usuarios_antiguos_${fechaBackup}`).set(usuariosExistentes);
    
    console.log(" Backup creado en Firebase");

    //  PASO 6: Resumen final
    console.log("\n=== MIGRACIÓN COMPLETADA ===");
    console.log(`Administradores migrados: ${usuariosAdmin.length}`);
    console.log(`Usuarios que deben re-registrarse: ${usuariosParaMigrar.length + usuariosSinEmail.length}`);
    console.log(`Backup creado: /backups/usuarios_antiguos_${fechaBackup}`);
    
    if (usuariosParaMigrar.length > 0 || usuariosSinEmail.length > 0) {
      console.log("\n REPORTE DETALLADO:");
      console.log("   - Revisa el archivo 'reporteMigracion.json'");
      console.log("   - Informa a los usuarios que deben re-registrarse");
      console.log("   - Los admins pueden iniciar sesión inmediatamente");
    }
    
    console.log("\n MIGRACIÓN EXITOSA");
    console.log(" Sistema listo para usar Firebase Authentication");
    
  } catch (error) {
    console.error("\n ERROR EN MIGRACIÓN:");
    console.error("Mensaje:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

/**
 *  FUNCIÓN AUXILIAR: Limpiar usuarios antiguos (CUIDADO)
 */
const limpiarUsuariosAntiguos = async () => {
  console.log("  LIMPIANDO USUARIOS ANTIGUOS DE REALTIME DATABASE");
  console.log("   Esta acción es IRREVERSIBLE");
  
  try {
    // Hacer backup final antes de limpiar
    const usuariosSnapshot = await db.ref("/usuarios").once("value");
    const usuariosExistentes = usuariosSnapshot.val() || {};
    
    const fechaBackupFinal = new Date().toISOString().replace(/[:.]/g, '-');
    await db.ref(`/backups/usuarios_final_${fechaBackupFinal}`).set(usuariosExistentes);
    
    // Limpiar usuarios antiguos
    await db.ref("/usuarios").remove();
    
    console.log(" Usuarios antiguos eliminados");
    console.log(` Backup final: /backups/usuarios_final_${fechaBackupFinal}`);
    
  } catch (error) {
    console.error(" Error limpiando usuarios antiguos:", error.message);
  }
};

//  FUNCIÓN PRINCIPAL
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--limpiar')) {
    console.log("  MODO LIMPIEZA ACTIVADO");
    await limpiarUsuariosAntiguos();
  } else {
    await migrarUsuarios();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { migrarUsuarios, limpiarUsuariosAntiguos };