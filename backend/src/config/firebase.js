const admin = require('firebase-admin');
require('dotenv').config();

try {
  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  const db = admin.database();

  //  Verificación opcional de conexión con productos
  db.ref("/").limitToFirst(1).once("value")
    .then(snapshot => {
      if (snapshot.exists()) {
        console.log("Conectado y datos recibidos desde Firebase.");
      } else {
        console.log("Conectado, pero no se encontraron productos.");
      }
    })
    .catch(err => {
      console.error("Error al leer desde Firebase:", err.message);
    });

  module.exports = { admin, db };

} catch (error) {
  console.error('Error al conectar con Firebase:', error.message);
}





  