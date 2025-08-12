const { crearUsuario } = require("../models/usuarioModelo");

const crearAdmin = async () => {
  try {
    const adminData = {
      username: "admin",
      email: "admin@tractodo.com",
      password: "admin123" // Cambiar por una contraseña segura
    };

    const nuevoAdmin = await crearUsuario(adminData);
    console.log("✅ Administrador creado exitosamente:", nuevoAdmin.username);
  } catch (error) {
    console.error("❌ Error al crear administrador:", error.message);
  }
};

crearAdmin();