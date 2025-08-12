const { crearAdministrador } = require("../models/usuarioModelo");

const crearAdmin = async () => {
  try {
    const adminData = {
      username: "admin",
      email: "admin@tractodo.com",
      password: "admin123" // Cambiar por una contraseña segura
    };

    const nuevoAdmin = await crearAdministrador(adminData);
    console.log("✅ Administrador creado exitosamente:", nuevoAdmin.username);
    console.log("📝 Tipo de usuario:", nuevoAdmin.tipoUsuario);
    return nuevoAdmin;
  } catch (error) {
    console.error("❌ Error al crear administrador:", error.message);
  }
};

// NUEVA FUNCIÓN: Convertir usuario existente en admin
const convertirEnAdmin = async (username) => {
  try {
    const { obtenerUsuarioPorUsername, actualizarTipoUsuario } = require("../models/usuarioModelo");
    
    const usuario = await obtenerUsuarioPorUsername(username);
    if (!usuario) {
      console.error("❌ Usuario no encontrado:", username);
      return false;
    }

    const exito = await actualizarTipoUsuario(usuario.id, "admin");
    if (exito) {
      console.log("✅ Usuario convertido a admin:", username);
      return true;
    } else {
      console.error("❌ Error al convertir usuario:", username);
      return false;
    }
  } catch (error) {
    console.error("❌ Error al convertir en admin:", error.message);
    return false;
  }
};

// Ejecutar según necesidad
const main = async () => {
  // Opción 1: Crear nuevo admin
  await crearAdmin();
  
  // Opción 2: Convertir usuario existente (descomenta si necesitas)
  // await convertirEnAdmin("juanperez");
};

main();

module.exports = { crearAdmin, convertirEnAdmin };