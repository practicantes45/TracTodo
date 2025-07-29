const { db } = require("../config/firebase");
const { MARCAS_PREDEFINIDAS } = require("../utils/constantes");
const { guardarBackup } = require("./reversionController");

// Función para normalizar texto y quitar acentos
const normalizarTexto = (texto) => {
  return texto
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase();
};

exports.getAllProductos = async (req, res) => {
  const { q, marca, orden } = req.query;

  try {
    const snapshot = await db.ref("/").once("value");
    const data = snapshot.val();

    if (!data) return res.json([]);

    const productos = Object.entries(data)
      .filter(([id, prod]) => prod?.nombre)
      .map(([id, prod]) => ({ id, ...prod }));

    let filtrados = productos;

    // Búsqueda por texto CON PRIORIDADES CORREGIDAS
    if (q) {
      const queryNormalizado = normalizarTexto(q);
      console.log(`🔍 Búsqueda normalizada: "${queryNormalizado}"`);
      
      // Arrays para cada nivel de prioridad
      const prioridad1_numeroParte = [];
      const prioridad2_nombre = [];
      const prioridad3_descripcion = [];
      
      productos.forEach(producto => {
        const numeroParte = normalizarTexto(producto.numeroParte || "");
        const nombre = normalizarTexto(producto.nombre || "");
        const descripcion = normalizarTexto(producto.descripcion || "");
        
        let coincidencia = false;
        
        // PRIORIDAD 1: Número de parte (exacta y parcial)
        if (numeroParte.includes(queryNormalizado)) {
          prioridad1_numeroParte.push(producto);
          coincidencia = true;
          console.log(`✅ P1 (Número): ${producto.nombre} - ${producto.numeroParte}`);
        }
        // PRIORIDAD 2: Nombre (solo si no coincidió en número de parte)
        else if (nombre.includes(queryNormalizado)) {
          prioridad2_nombre.push(producto);
          coincidencia = true;
          console.log(`✅ P2 (Nombre): ${producto.nombre}`);
        }
        // PRIORIDAD 3: Descripción (solo si no coincidió en anteriores)
        else if (descripcion.includes(queryNormalizado)) {
          prioridad3_descripcion.push(producto);
          coincidencia = true;
          console.log(`✅ P3 (Descripción): ${producto.nombre}`);
        }
      });

      // Combinar resultados manteniendo el orden de prioridad
      filtrados = [
        ...prioridad1_numeroParte,
        ...prioridad2_nombre,
        ...prioridad3_descripcion
      ];

      console.log(`🔍 Resultados de búsqueda para "${q}":`);
      console.log(`   - Prioridad 1 (Número de parte): ${prioridad1_numeroParte.length} productos`);
      console.log(`   - Prioridad 2 (Nombre): ${prioridad2_nombre.length} productos`);
      console.log(`   - Prioridad 3 (Descripción): ${prioridad3_descripcion.length} productos`);
      console.log(`   - Total: ${filtrados.length} productos`);
      
      // Mostrar los primeros 5 resultados para debug
      console.log(`📋 Primeros resultados:`, filtrados.slice(0, 5).map(p => `${p.nombre} (${p.numeroParte || 'Sin número'})`));
    }

    // Filtro por marca (analiza también nombre y descripción)
    if (marca) {
      const marcaBuscada = normalizarTexto(marca);
      filtrados = filtrados.filter(p => {
        const texto = normalizarTexto(`${p.nombre} ${p.descripcion}`);
        if (marca === "Otros") {
          return !MARCAS_PREDEFINIDAS.some(m =>
            texto.includes(normalizarTexto(m))
          );
        }
        return texto.includes(marcaBuscada);
      });
    }

    // Orden alfabético (SOLO si no hay búsqueda por texto, para mantener prioridades)
    if (!q) {
      if (orden === "asc") {
        filtrados.sort((a, b) => a.nombre?.localeCompare(b.nombre));
      } else if (orden === "desc") {
        filtrados.sort((a, b) => b.nombre?.localeCompare(a.nombre));
      }
    } else {
      console.log(`ℹ️ Manteniendo orden de prioridad de búsqueda (sin ordenamiento alfabético)`);
    }

    res.json(filtrados);
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error al obtener productos", detalles: error.message });
  }
};

// obtener producto por ID
exports.getProductoById = async (req, res) => {
  const { id } = req.params;

  try {
    // Obtener el producto
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const producto = snapshot.val();

    // Obtener recomendaciones generadas (por comportamiento)
    const recoSnapshot = await db.ref(`/recomendaciones/${id}`).once("value");
    let idsRecomendados = recoSnapshot.val() || [];

    console.log(`🔍 Recomendaciones para producto ${id}:`, idsRecomendados);

    // Si no hay recomendaciones por comportamiento, crear recomendaciones básicas
    if (idsRecomendados.length === 0) {
      console.log('⚠️ No hay recomendaciones por comportamiento, generando básicas...');
      
      // Obtener todos los productos
      const allSnapshot = await db.ref("/").once("value");
      const allData = allSnapshot.val() || {};
      
      // Filtrar productos similares (misma marca o palabras clave en nombre)
      const productosDisponibles = Object.entries(allData)
        .filter(([pid, prod]) => pid !== id && prod?.nombre) // Excluir el producto actual
        .map(([pid, prod]) => ({ id: pid, ...prod }));

      // Buscar productos de la misma marca
      const productosMismaMarca = productosDisponibles.filter(p => 
        p.marca && producto.marca && p.marca.toLowerCase() === producto.marca.toLowerCase()
      );

      // Buscar productos con palabras clave similares en el nombre
      const palabrasProducto = producto.nombre?.toLowerCase().split(' ') || [];
      const productosSimilares = productosDisponibles.filter(p => {
        const palabrasOtro = p.nombre?.toLowerCase().split(' ') || [];
        return palabrasProducto.some(palabra => 
          palabra.length > 3 && palabrasOtro.some(otraPalabra => otraPalabra.includes(palabra))
        );
      });

      // Combinar y limitar a 6 productos
      const recomendacionesBasicas = [
        ...productosMismaMarca.slice(0, 3),
        ...productosSimilares.slice(0, 3),
        ...productosDisponibles.slice(0, 2) // Productos aleatorios como fallback
      ];

      // Eliminar duplicados y limitar
      const recomendacionesUnicas = recomendacionesBasicas
        .filter((prod, index, arr) => arr.findIndex(p => p.id === prod.id) === index)
        .slice(0, 6);

      idsRecomendados = recomendacionesUnicas.map(p => p.id);
      
      console.log(`✅ Generadas ${idsRecomendados.length} recomendaciones básicas:`, idsRecomendados);
    }

    // Obtener datos completos de productos recomendados
    const allSnapshot = await db.ref("/").once("value");
    const allData = allSnapshot.val() || {};

    const recomendados = idsRecomendados
      .map(pid => ({ id: pid, ...allData[pid] }))
      .filter(p => p.nombre); // filtramos los que existen

    console.log(`📦 Devolviendo ${recomendados.length} productos relacionados`);

    res.json({
      producto: { id, ...producto },
      recomendados
    });
  } catch (error) {
    console.error("Error al obtener producto:", error.message);
    res.status(500).json({ error: "Error al obtener producto", detalles: error.message });
  }
};

// Crea un nuevo producto
exports.insertarProducto = async (req, res) => {
  const datos = req.body;

  try {
    // Validación básica (puedes expandirla según tus necesidades)
    if (!datos.nombre || !datos.numeroParte || !datos.descripcion) {
      return res.status(400).json({ mensaje: "Faltan campos obligatorios" });
    }

    // Creamos un nuevo ID usando push
    const nuevoRef = db.ref("/").push();
    await nuevoRef.set(datos);

    const nuevoId = nuevoRef.key;

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: { id: nuevoId, ...datos }
    });
  } catch (error) {
    console.error("Error al insertar producto:", error.message);
    res.status(500).json({ mensaje: "Error al insertar producto", detalles: error.message });
  }
};

// Elimina un producto por ID
exports.borrarProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const datosProducto = snapshot.val();

    
    await guardarBackup("productos", id, datosProducto); // Guardamos backup antes de borrar

    await db.ref(`/${id}`).remove();
    res.status(200).json({ mensaje: "Producto borrado correctamente" });
  } catch (error) {
    console.error("Error al borrar producto:", error.message);
    res.status(400).json({ mensaje: "Error al borrar producto", detalles: error.message });
  }
};

// Actualiza un producto por ID
exports.actualizarProductoPorId = async (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const datosProducto = snapshot.val();

  
    await guardarBackup("productos", id, datosProducto);    // Guardamos backup antes de actualizar

    await db.ref(`/${id}`).update(datos);
    const actualizadoSnapshot = await db.ref(`/${id}`).once("value");
    const productoActualizado = actualizadoSnapshot.val();

    res.status(200).json({ 
      mensaje: "Producto actualizado correctamente", 
      producto: { id, ...productoActualizado } 
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    res.status(400).json({ mensaje: "Error al actualizar producto", detalles: error.message });
  }
};

// ==================================================================== Productos del mes ===================================================================

//insertar productos del mes
exports.insertarProductosDelMes = async (req, res) => {
  const { productos } = req.body; // Array de objetos {id, precioMes}

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debes enviar un arreglo de productos con id y precioMes" });
  }

  // Validar estructura de productos
  for (const producto of productos) {
    if (!producto.id || producto.precioMes === undefined) {
      return res.status(400).json({ error: "Cada producto debe tener id y precioMes" });
    }
  }

  try {
    // Obtener los productos actuales del mes
    const snapshot = await db.ref("/productosDelMes").once("value");
    const actuales = snapshot.val() || {};

    // Agregar o actualizar productos
    for (const producto of productos) {
      actuales[producto.id] = {
        id: producto.id,
        precioMes: parseFloat(producto.precioMes),
        fechaAgregado: new Date().toISOString()
      };
    }

    // Guardar en Firebase
    await db.ref("/productosDelMes").set(actuales);

    // Obtener productos completos para respuesta
    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};
    
    const productosCompletos = Object.values(actuales).map(prodMes => ({
      ...todosProductos[prodMes.id],
      id: prodMes.id,
      precioMes: prodMes.precioMes,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p.nombre);

    res.status(200).json({ 
      mensaje: "Productos del mes agregados correctamente", 
      productos: productosCompletos 
    });
  } catch (error) {
    console.error("Error al insertar productos del mes:", error.message);
    res.status(500).json({ error: "Error al insertar productos del mes", detalles: error.message });
  }
};

//obtener productos del mes
exports.getProductosDelMes = async (req, res) => {
  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productosDelMes = snapshot.val() || {};

    // Si no hay productos del mes, devolver array vacío
    if (Object.keys(productosDelMes).length === 0) {
      return res.json([]);
    }

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const destacados = Object.values(productosDelMes)
      .map(prodMes => ({
        ...todosProductos[prodMes.id],
        id: prodMes.id,
        precioMes: prodMes.precioMes,
        fechaAgregado: prodMes.fechaAgregado
      }))
      .filter(p => p && p.nombre);

    console.log(`📦 Devolviendo ${destacados.length} productos del mes con precios temporales`);
    res.json(destacados);
  } catch (error) {
    console.error("Error al obtener productos del mes:", error.message);
    res.status(500).json({ mensaje: "Error al obtener productos del mes", detalles: error.message });
  }
};

//actualizar productos del mes 
exports.actualizarProductosDelMes = async (req, res) => {
  const { productos } = req.body; // Array de objetos {id, precioMes}

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Se requiere una lista válida de productos con precios" });
  }

  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productosAntes = snapshot.val() || {};

    await guardarBackup("productosDelMes", "listaCompleta", productosAntes);

    // Crear nueva estructura
    const nuevosProductos = {};
    for (const producto of productos) {
      if (producto.id && producto.precioMes !== undefined) {
        nuevosProductos[producto.id] = {
          id: producto.id,
          precioMes: parseFloat(producto.precioMes),
          fechaAgregado: productosAntes[producto.id]?.fechaAgregado || new Date().toISOString()
        };
      }
    }

    await db.ref("/productosDelMes").set(nuevosProductos);

    // Obtener productos completos para respuesta
    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};
    
    const productosCompletos = Object.values(nuevosProductos).map(prodMes => ({
      ...todosProductos[prodMes.id],
      id: prodMes.id,
      precioMes: prodMes.precioMes,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p.nombre);

    res.status(200).json({
      mensaje: "Lista de productos del mes actualizada correctamente",
      productos: productosCompletos,
    });
  } catch (error) {
    console.error("Error al actualizar productos del mes:", error.message);
    res.status(500).json({ error: "Error al actualizar productos del mes", detalles: error.message });
  }
};

//eliminar productos del mes 
exports.eliminarProductoDelMes = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Falta el ID del producto a eliminar" });
  }

  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productos = snapshot.val() || {};

    if (!productos[id]) {
      return res.status(404).json({ error: "El producto no está en la lista de productos del mes" });
    }

    await guardarBackup("productosDelMes", id, productos[id]);

    // Eliminar el producto
    delete productos[id];
    await db.ref("/productosDelMes").set(productos);

    // Obtener productos restantes completos
    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};
    
    const productosRestantes = Object.values(productos).map(prodMes => ({
      ...todosProductos[prodMes.id],
      id: prodMes.id,
      precioMes: prodMes.precioMes,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p.nombre);

    res.status(200).json({
      mensaje: "Producto eliminado de productos del mes",
      productos: productosRestantes,
    });
  } catch (error) {
    console.error("Error al eliminar producto del mes:", error.message);
    res.status(500).json({ error: "Error al eliminar producto del mes", detalles: error.message });
  }
};

// Nueva función para actualizar solo el precio
exports.actualizarPrecioProductoDelMes = async (req, res) => {
  const { id } = req.params;
  const { precioMes } = req.body;

  if (!id || precioMes === undefined) {
    return res.status(400).json({ error: "Faltan datos: ID del producto y precio" });
  }

  const precio = parseFloat(precioMes);
  if (isNaN(precio) || precio <= 0) {
    return res.status(400).json({ error: "El precio debe ser un número válido mayor que 0" });
  }

  try {
    const snapshot = await db.ref(`/productosDelMes/${id}`).once("value");
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado en productos del mes" });
    }

    const productoActual = snapshot.val();
    
    // Backup antes de actualizar
    await guardarBackup("productosDelMes", id, productoActual);

    // Actualizar precio
    const productoActualizado = {
      ...productoActual,
      precioMes: precio,
      fechaActualizacion: new Date().toISOString()
    };

    await db.ref(`/productosDelMes/${id}`).set(productoActualizado);

    res.status(200).json({
      mensaje: "Precio actualizado correctamente",
      producto: productoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar precio:", error.message);
    res.status(500).json({ error: "Error al actualizar precio", detalles: error.message });
  }
};