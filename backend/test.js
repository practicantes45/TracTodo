const { db } = require('./src/config/firebase');

async function test() {
  const snapshot = await db.ref('productos').once('value');
  console.log("Datos en productos:", snapshot.val());
}

test().catch(console.error);