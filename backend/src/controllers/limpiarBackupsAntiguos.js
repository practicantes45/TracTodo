const { db } = require("../config/firebase");

exports.limpiarBackupsAntiguos = async () => {
  const tipos = ["productos", "videos", "blogs"];
  const ahora = Date.now();
  const limite = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

  try {
    for (const tipo of tipos) {
      const backupsRef = db.ref(`/backups/${tipo}`);
      const snapshot = await backupsRef.once("value");

      snapshot.forEach(child => {
        const datos = child.val();
        if (datos.timestamp && (ahora - datos.timestamp > limite)) {
          console.log(`Eliminando backup antiguo: /backups/${tipo}/${child.key}`);
          backupsRef.child(child.key).remove();
        }
      });
    }
    console.log("Limpieza de backups completa.");
  } catch (error) {
    console.error("Error al limpiar backups antiguos:", error.message);
  }
};

