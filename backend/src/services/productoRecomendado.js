const { db } = require("../config/firebase");

const generarRecomendaciones = async () => {
  try {
    console.log("=== INICIANDO GENERACIÓN DE RECOMENDACIONES ===");
    
    const snapshot = await db.ref("/tracking").once("value");
    const data = snapshot.val();

    if (!data) {
      console.log("No hay eventos en /tracking");
      return;
    }

    console.log("Usuarios con tracking:", Object.keys(data).length);

    const coVisitas = {};
    let totalEventos = 0;

    // Recorremos cada usuario
    for (const [uid, eventosUsuario] of Object.entries(data)) {
      const eventos = Object.values(eventosUsuario)
        .filter(e => e.evento === "ver_producto" && e.data?.id)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      if (eventos.length < 2) {
        console.log(`Usuario ${uid}: solo ${eventos.length} eventos, saltando`);
        continue;
      }

      const ids = eventos.map(e => e.data.id);
      console.log(`Usuario ${uid} vio productos:`, ids);
      totalEventos += eventos.length;

      // Comparar todos con todos (co-visitas)
      for (let i = 0; i < ids.length; i++) {
        const idA = ids[i];
        for (let j = i + 1; j < ids.length; j++) {
          const idB = ids[j];
          if (idA === idB) continue;

          // Registrar co-visita A -> B
          coVisitas[idA] = coVisitas[idA] || {};
          coVisitas[idA][idB] = (coVisitas[idA][idB] || 0) + 1;

          // Registrar co-visita B -> A
          coVisitas[idB] = coVisitas[idB] || {};
          coVisitas[idB][idA] = (coVisitas[idB][idA] || 0) + 1;
        }
      }
    }

    console.log("Total eventos procesados:", totalEventos);
    console.log("Productos con co-visitas:", Object.keys(coVisitas).length);

    // Generar recomendaciones ordenadas
    const recomendaciones = {};
    for (const [id, relacionados] of Object.entries(coVisitas)) {
      const ordenados = Object.entries(relacionados)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6) // Top 6 recomendaciones
        .map(([relId]) => relId);

      if (ordenados.length > 0) {
        recomendaciones[id] = ordenados;
        console.log(`${id} → recomendados:`, ordenados);
      }
    }

    // Guardar recomendaciones en Firebase
    await db.ref("/recomendaciones").set(recomendaciones);
    console.log("Recomendaciones guardadas exitosamente");
    console.log("Total productos con recomendaciones:", Object.keys(recomendaciones).length);

    // LIMPIAR TRACKING DESPUÉS DE PROCESAR
    await limpiarTracking();

    console.log("=== GENERACIÓN COMPLETADA ===");

  } catch (error) {
    console.error("Error al generar recomendaciones:", error.message);
  }
};

// Función para limpiar el tracking después de procesar
const limpiarTracking = async () => {
  try {
    console.log("Limpiando tracking después de procesar...");
    
    // Opción 1: Borrar todo el tracking
    await db.ref("/tracking").remove();
    console.log("Tracking limpiado completamente");
    //////

  } catch (error) {
    console.error("Error al limpiar tracking:", error.message);
  }
};

// Función para ejecutar manualmente (para testing)
const ejecutarRecomendacionesManual = async () => {
  console.log("Ejecutando recomendaciones manualmente...");
  await generarRecomendaciones();
};


module.exports = { 
  generarRecomendaciones,
  limpiarTracking,
  ejecutarRecomendacionesManual
};


    
    // Opción 2: Si prefieres mantener tracking reciente (últimas 6 horas)
    // const SEIS_HORAS_MS = 6 * 60 * 60 * 1000;
    // const ahora = Date.now();
    // const snapshot = await db.ref("/tracking").once("value");
    // const data = snapshot.val() || {};
    
    // for (const [uid, eventosUsuario] of Object.entries(data)) {
    //   for (const [eventoId, evento] of Object.entries(eventosUsuario)) {
    //     if (!evento.timestamp) continue;
        
    //     const timestampMs = new Date(evento.timestamp).getTime();
    //     const diferencia = ahora - timestampMs;

    //     if (diferencia > SEIS_HORAS_MS) {
    //       await db.ref(`/tracking/${uid}/${eventoId}`).remove();
    //     }
    //   }
    // }