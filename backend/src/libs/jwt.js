const jwt = require("jsonwebtoken");
require("dotenv").config();
const { mensajes } = require("../libs/mensajes");

function crearToken(dato) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      dato,
      process.env.SECRET_TOKEN,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) {
          reject(mensajes(400, "Error al generar el token"));
        } else {
          resolve(token);
        }
      }
    );
  });
}

module.exports = { crearToken };
