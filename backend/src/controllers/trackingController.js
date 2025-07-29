const { db } = require("../config/firebase");

exports.registrarEvento = async (req, res) => {
  const { uid, evento, data, timestamp } = req.body;

  // NUEVO: Log detallado para cookies
  console.log("\n🍪 === EVENTO DE TRACKING RECIBIDO ===");
  console.log("📅 Timestamp:", new Date().toISOString());
  console.log("👤 UID:", uid);
  console.log("🎯 Evento:", evento);
  console.log("📊 Data:", JSON.stringify(data, null, 2));
  console.log("⏰ Timestamp del evento:", timestamp);

  if (!uid || !evento || !timestamp) {
    console.log("❌ ERROR: Datos incompletos");
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // Identificar específicamente eventos de cookies
    if (evento === 'cookie_consent') {
      console.log("\n🍪 === EVENTO DE COOKIES DETECTADO ===");
      console.log("🔧 Acción realizada:", data?.action);
      
      if (data?.action === 'accepted') {
        console.log("✅ Usuario ACEPTÓ las cookies");
        console.log("📝 Se creará variable de seguimiento en Firebase");
      } else if (data?.action === 'rejected') {
        console.log("❌ Usuario RECHAZÓ las cookies");
        console.log("📝 Se registrará rechazo en Firebase");
      }
    }

    await db.ref(`/tracking/${uid}`).push({
      evento,
      data,
      timestamp
    });

    console.log("💾 Evento guardado exitosamente en Firebase");
    console.log("=====================================\n");

    res.status(200).json({ ok: true, mensaje: "Evento registrado correctamente" });
  } catch (error) {
    console.error("💥 ERROR registrando evento:", error.message);
    res.status(500).json({ error: "Error al guardar el evento", detalles: error.message });
  }
};