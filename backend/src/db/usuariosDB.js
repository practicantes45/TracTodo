const { crearUsuario, obtenerUsuarioPorUsername } = require("../models/usuarioModelo");
const { validarPassword } = require("../middlewares/funcionesPassword");
const { crearToken } = require("../libs/jwt");
const { mensajes } = require("../libs/mensajes");

async function register({ username, email, password }) {
  try {
    const usuarioExistente = await obtenerUsuarioPorUsername(username);
    if (usuarioExistente) {
      return mensajes(400, "Usuario duplicado");
    }
    // Crear usuario en Firebase (genera salt y hash internamente)
    const usuario = await crearUsuario({ username, email, password });

    // Crear token JWT
    const token = await crearToken({
      id: usuario.uid,
      username: usuario.username,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });

    return mensajes(201, "Usuario registrado", "", token);
  } catch (error) {
    return mensajes(500, "Error al registrar usuario", error.message);
  }
}

async function login({ username, password }) {
  try {
    const usuario = await obtenerUsuarioPorUsername(username);
    if (!usuario) {
      return mensajes(400, "Usuario no encontrado");
    }

    const passwordCorrecto = validarPassword(password, usuario.salt, usuario.password);
    if (!passwordCorrecto) {
      return mensajes(400, "Contraseña incorrecta");
    }

    const token = await crearToken({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
    });

    return mensajes(200, "Login exitoso", "", token);
  } catch (error) {
    return mensajes(500, "Error al iniciar sesión", error.message);
  }
}

module.exports = {
  register,
  login,
};

