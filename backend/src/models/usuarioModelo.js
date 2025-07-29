const { db } = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const crearUsuario = async ({ username, email, password }) => {
  const uid = uuidv4();
  const now = Date.now();

  // Generar salt y hash
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64, "sha512").toString("hex");

  const nuevoUsuario = {
    username,
    email,
    tipoUsuario: "usuario",
    password: hash,
    salt,
    //createdAt: now,
    //updatedAt: now,
  };

  await db.ref(`/usuarios/${uid}`).set(nuevoUsuario);

  return { uid, ...nuevoUsuario };
};

const obtenerUsuarioPorUsername = async (username) => {
  const snapshot = await db.ref("usuarios").orderByChild("username").equalTo(username).once("value");
  if (!snapshot.exists()) return null;
  const usuarios = snapshot.val();
  const usuarioKey = Object.keys(usuarios)[0];
  return { id: usuarioKey, ...usuarios[usuarioKey] };
};

const obtenerUsuarioPorId = async (id) => {
  const snapshot = await db.ref(`usuarios/${id}`).once("value");
  return snapshot.exists() ? snapshot.val() : null;
};

module.exports = {
  
  crearUsuario,
  obtenerUsuarioPorUsername,
  obtenerUsuarioPorId,
};
