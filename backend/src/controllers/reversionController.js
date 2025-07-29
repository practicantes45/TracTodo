const { db } = require("../config/firebase");

// ==================================================== Guardar backup ===============================================================================
exports.guardarBackup = async (tipo, id, datos) => {
  try {
    const timestamp = Date.now();
    await db.ref(`/backups/${tipo}/${id}`).set({
      ...datos,
      timestamp
    });
  } catch (error) {
    console.error(`Error al guardar backup de ${tipo}/${id}:`, error.message);
  }
};

// =========================================================== Restaurar backup ====================================================================
exports.restaurarBackup = async (req, res) => {
  const { tipo, id } = req.params;
  const tiposValidos = ["productos", "videos", "blogs"];

  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ mensaje: "Tipo inválido para restaurar" });
  }

  const rutas = {
    productos: "/",
    videos: "/entretenimiento/videos",
    blogs: "/entretenimiento/blog",
    mes: "/productosDelMes"
  };

  try {
    const backupRef = db.ref(`/backups/${tipo}/${id}`);
    const snapshot = await backupRef.once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "No hay backup para este elemento" });
    }

    const datos = snapshot.val();
    delete datos.timestamp;

    await db.ref(`${rutas[tipo]}/${id}`).set(datos);

    res.status(200).json({ mensaje: `${tipo.slice(0, -1)} restaurado correctamente`, datos });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al restaurar", detalles: error.message });
  }
};
