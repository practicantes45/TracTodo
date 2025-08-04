require("dotenv").config();
const { procesarProductosParaSEO } = require("./src/services/seoService");

/**
 * Script para inicializar SEO de todos los productos existentes
 * Ejecutar con: node inicializarSEO.js
 */
const inicializarSEO = async () => {
  console.log("=== INICIALIZANDO SEO PARA TODOS LOS PRODUCTOS ===");
  console.log("Iniciado:", new Date().toISOString());
  
  try {
    console.log("Procesando productos y generando datos SEO...");
    
    const resultado = await procesarProductosParaSEO();
    
    console.log("=== INICIALIZACIÓN SEO COMPLETADA ===");
    console.log(`Total productos procesados: ${Object.keys(resultado).length}`);
    console.log("Finalizado:", new Date().toISOString());
    
    // Mostrar algunos ejemplos de los datos generados
    const ejemplos = Object.entries(resultado).slice(0, 3);
    console.log("\nEjemplos de SEO generado:");
    
    ejemplos.forEach(([id, seo], index) => {
      console.log(`\n${index + 1}. Producto ID: ${id}`);
      console.log(`   Título: ${seo.titulo}`);
      console.log(`   Descripción: ${seo.descripcion.substring(0, 100)}...`);
      console.log(`   Palabras clave: ${seo.palabrasClave.slice(0, 3).join(", ")}`);
      console.log(`   Slug: ${seo.slug}`);
    });
    
    console.log("\n¡SEO inicializado correctamente!");
    console.log("Ahora los productos tendrán optimización SEO automática");
    console.log("Sitemap disponible en: /api/seo/sitemap.xml");
    console.log("Robots.txt disponible en: /api/seo/robots.txt");
    
    process.exit(0);
    
  } catch (error) {
    console.error("Error durante la inicialización:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

// Ejecutar inicialización
inicializarSEO();