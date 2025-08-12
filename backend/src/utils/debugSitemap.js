const { db } = require("../config/firebase");

/**
 * Función de debugging para verificar datos en Firebase
 */
const debugFirebaseData = async () => {
  try {
    console.log("🔍 === DEBUGGING DATOS DE FIREBASE ===");
    
    // Verificar datos en la raíz
    const rootSnapshot = await db.ref("/").once("value");
    const rootData = rootSnapshot.val() || {};
    
    console.log(`📊 Total nodos en raíz: ${Object.keys(rootData).length}`);
    
    // Analizar cada tipo de nodo
    const nodosSistema = [];
    const productos = [];
    const otros = [];
    
    Object.entries(rootData).forEach(([id, datos]) => {
      if (id.startsWith('seo') || id.startsWith('tracking') || 
          id.startsWith('usuarios') || id.startsWith('entretenimiento') ||
          id.startsWith('backups') || id.startsWith('recomendaciones') ||
          id.startsWith('productosDelMes')) {
        nodosSistema.push(id);
      } else if (datos && typeof datos === 'object' && datos.nombre) {
        productos.push({
          id,
          nombre: datos.nombre,
          numeroParte: datos.numeroParte || 'N/A',
          descripcion: datos.descripcion ? datos.descripcion.substring(0, 50) + '...' : 'Sin descripción'
        });
      } else {
        otros.push({ id, tipo: typeof datos });
      }
    });
    
    console.log(`🔧 Nodos del sistema: ${nodosSistema.length}`, nodosSistema);
    console.log(`📦 Productos válidos: ${productos.length}`);
    console.log(`❓ Otros nodos: ${otros.length}`, otros);
    
    // Mostrar primeros 5 productos como ejemplo
    if (productos.length > 0) {
      console.log("\n📦 PRIMEROS 5 PRODUCTOS:");
      productos.slice(0, 5).forEach((prod, index) => {
        console.log(`   ${index + 1}. ${prod.nombre} (${prod.numeroParte})`);
      });
    } else {
      console.log("❌ NO SE ENCONTRARON PRODUCTOS VÁLIDOS");
    }
    
    // Verificar blog
    const blogSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const blogData = blogSnapshot.val() || {};
    console.log(`📖 Posts en blog: ${Object.keys(blogData).length}`);
    
    return {
      totalNodos: Object.keys(rootData).length,
      productos: productos.length,
      nodosSistema: nodosSistema.length,
      otros: otros.length,
      posts: Object.keys(blogData).length
    };
    
  } catch (error) {
    console.error("❌ Error en debugging:", error.message);
    return null;
  }
};

module.exports = {
  debugFirebaseData
};