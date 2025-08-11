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

    // Búsqueda por texto
    if (q) {
      const queryNormalizado = normalizarTexto(q);
      console.log(`🔍 Búsqueda normalizada: "${queryNormalizado}"`);

      const prioridad1_numeroParte = [];
      const prioridad2_nombre = [];
      const prioridad3_descripcion = [];

      productos.forEach(producto => {
        const numeroParte = normalizarTexto(producto.numeroParte || "");
        const nombre = normalizarTexto(producto.nombre || "");
        const descripcion = normalizarTexto(producto.descripcion || "");

        if (numeroParte.includes(queryNormalizado)) {
          prioridad1_numeroParte.push(producto);
        } else if (nombre.includes(queryNormalizado)) {
          prioridad2_nombre.push(producto);
        } else if (descripcion.includes(queryNormalizado)) {
          prioridad3_descripcion.push(producto);
        }
      });

      filtrados = [
        ...prioridad1_numeroParte,
        ...prioridad2_nombre,
        ...prioridad3_descripcion
      ];
    }

    // Filtro por marca
    if (marca && marca !== "todas") {
      const marcaNormalizada = normalizarTexto(marca);
      filtrados = filtrados.filter(producto => {
        const marcaProducto = normalizarTexto(producto.marca || "");
        const nombreProducto = normalizarTexto(producto.nombre || "");
        const descripcionProducto = normalizarTexto(producto.descripcion || "");
        
        if (marca === "Otros") {
          const marcasPredefinidas = ["cummins", "navistar", "volvo", "mercedes benz", "detroit", "caterpillar"];
          const texto = `${nombreProducto} ${descripcionProducto}`;
          return !marcasPredefinidas.some(m => texto.includes(m));
        }
        
        return marcaProducto === marcaNormalizada || 
               nombreProducto.includes(marcaNormalizada) || 
               descripcionProducto.includes(marcaNormalizada);
      });
    }

    // Ordenamiento (SOLO si no hay búsqueda para mantener prioridades)
    if (!q) {
      if (orden === "asc" || orden === "A-Z") {
        filtrados.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      } else if (orden === "desc" || orden === "Z-A") {
        filtrados.sort((a, b) => (b.nombre || "").localeCompare(a.nombre || ""));
      } else {
        // Por defecto A-Z cuando no hay orden especificado y no hay búsqueda
        filtrados.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
      }
    }

    res.json(filtrados);
  } catch (error) {
    console.error("Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
// Obtener producto por ID
exports.getProductoById = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const producto = { id, ...snapshot.val() };
    res.json(producto);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error.message);
    res.status(500).json({ mensaje: "Error al obtener el producto", detalles: error.message });
  }
};

// Obtener producto por nombre
exports.getProductoByNombre = async (req, res) => {
  const { nombre } = req.params;

  try {
    const nombreNormalizado = normalizarTexto(nombre.replace(/-/g, ' '));

    const snapshot = await db.ref("/").once("value");
    const data = snapshot.val();

    if (!data) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const producto = Object.entries(data).find(([id, prod]) => {
      if (!prod?.nombre) return false;
      const nombreProductoNormalizado = normalizarTexto(prod.nombre);
      return nombreProductoNormalizado === nombreNormalizado;
    });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const [id, data_producto] = producto;
    res.json({ id, ...data_producto });
  } catch (error) {
    console.error("Error al obtener producto por nombre:", error.message);
    res.status(500).json({ mensaje: "Error al obtener el producto", detalles: error.message });
  }
};

// Insertar un nuevo producto
exports.insertarProducto = async (req, res) => {
  const datos = req.body;

  try {
    const nuevoProductoRef = db.ref("/").push();
    const nuevoId = nuevoProductoRef.key;

    await nuevoProductoRef.set(datos);

    const productoCreado = { id: nuevoId, ...datos };

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: productoCreado
    });
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(400).json({ mensaje: "Error al crear producto", detalles: error.message });
  }
};

// Borrar producto por ID
exports.borrarProductoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const datosProducto = snapshot.val();
    await guardarBackup("productos", id, datosProducto);
    await db.ref(`/${id}`).remove();
    
    res.status(200).json({ mensaje: "Producto borrado correctamente" });
  } catch (error) {
    console.error("Error al borrar producto:", error.message);
    res.status(400).json({ mensaje: "Error al borrar producto", detalles: error.message });
  }
};

// Actualizar producto por ID
exports.actualizarProductoPorId = async (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  try {
    const snapshot = await db.ref(`/${id}`).once("value");
    if (!snapshot.exists()) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const datosProducto = snapshot.val();
    await guardarBackup("productos", id, datosProducto);
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

// TOTALMENTE CORREGIDO: SIN VALIDACIONES DE PRECIOMES
exports.insertarProductosDelMes = async (req, res) => {
  const { productos } = req.body;

  console.log('📥 === INSERTANDO PRODUCTOS DEL MES - VERSION CORREGIDA ===');
  console.log('📦 Productos recibidos:', productos);

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Debes enviar un arreglo válido de productos" });
  }

  // VALIDACIÓN LIMPIA: Solo ID y nuevoPrecio opcional
  for (const producto of productos) {
    console.log('🔍 Validando producto:', producto);
    
    if (!producto.id) {
      return res.status(400).json({ error: "Cada producto debe tener un ID válido" });
    }
    
    // Solo validar nuevoPrecio si existe
    if (producto.nuevoPrecio !== undefined) {
      const precio = parseFloat(producto.nuevoPrecio);
      if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: `El precio del producto ${producto.id} debe ser mayor que 0` });
      }
    }
  }

  try {
    console.log('✅ Validaciones pasadas, procesando...');
    
    // Obtener productos actuales del mes
    const snapshot = await db.ref("/productosDelMes").once("value");
    const actuales = snapshot.val() || {};

    // Obtener todos los productos para validación
    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    // Procesar cada producto
    for (const producto of productos) {
      console.log(`🔄 Procesando producto: ${producto.id}`);
      
      // Verificar que el producto existe
      if (!todosProductos[producto.id]) {
        return res.status(404).json({ error: `Producto con ID ${producto.id} no encontrado` });
      }

      // Si se especifica nuevo precio, actualizar el producto original
      if (producto.nuevoPrecio !== undefined) {
        const nuevoPrecio = parseFloat(producto.nuevoPrecio);
        
        console.log(`💰 Actualizando precio de ${producto.id}: $${nuevoPrecio}`);
        
        // Backup antes de modificar
        await guardarBackup("productos", producto.id, todosProductos[producto.id]);

        // Actualizar precio original
        await db.ref(`/${producto.id}/precioVentaSugerido`).set(nuevoPrecio);
      }

      // Agregar a productos del mes
      actuales[producto.id] = {
        id: producto.id,
        fechaAgregado: new Date().toISOString()
      };
    }

    // Guardar lista actualizada
    await db.ref("/productosDelMes").set(actuales);
    console.log('💾 Lista de productos del mes actualizada');

    // Obtener productos completos para respuesta
    const updatedSnapshot = await db.ref("/").once("value");
    const productosActualizados = updatedSnapshot.val() || {};

    const productosCompletos = Object.values(actuales).map(prodMes => ({
      ...productosActualizados[prodMes.id],
      id: prodMes.id,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p && p.nombre);

    console.log('✅ Productos del mes insertados exitosamente');
    
    res.status(200).json({
      mensaje: "Productos del mes agregados correctamente",
      productos: productosCompletos
    });
    
  } catch (error) {
    console.error("❌ Error al insertar productos del mes:", error.message);
    res.status(500).json({ error: "Error al insertar productos del mes", detalles: error.message });
  }
};

// Obtener productos del mes
exports.getProductosDelMes = async (req, res) => {
  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productosDelMes = snapshot.val() || {};

    if (Object.keys(productosDelMes).length === 0) {
      return res.json([]);
    }

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const destacados = Object.values(productosDelMes)
      .map(prodMes => ({
        ...todosProductos[prodMes.id],
        id: prodMes.id,
        fechaAgregado: prodMes.fechaAgregado
      }))
      .filter(p => p && p.nombre);

    console.log(`📦 Devolviendo ${destacados.length} productos del mes`);
    res.json(destacados);
  } catch (error) {
    console.error("Error al obtener productos del mes:", error.message);
    res.status(500).json({ mensaje: "Error al obtener productos del mes", detalles: error.message });
  }
};

// Actualizar productos del mes
exports.actualizarProductosDelMes = async (req, res) => {
  const { productos } = req.body;

  if (!Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Se requiere una lista válida de productos" });
  }

  try {
    const snapshot = await db.ref("/productosDelMes").once("value");
    const productosAntes = snapshot.val() || {};

    await guardarBackup("productosDelMes", "listaCompleta", productosAntes);

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const nuevosProductos = {};
    for (const producto of productos) {
      if (producto.id) {
        if (!todosProductos[producto.id]) {
          return res.status(404).json({ error: `Producto con ID ${producto.id} no encontrado` });
        }

        if (producto.nuevoPrecio !== undefined) {
          const nuevoPrecio = parseFloat(producto.nuevoPrecio);
          if (isNaN(nuevoPrecio) || nuevoPrecio <= 0) {
            return res.status(400).json({ error: `El precio para el producto ${producto.id} debe ser válido` });
          }

          await guardarBackup("productos", producto.id, todosProductos[producto.id]);
          await db.ref(`/${producto.id}/precioVentaSugerido`).set(nuevoPrecio);
        }

        nuevosProductos[producto.id] = {
          id: producto.id,
          fechaAgregado: productosAntes[producto.id]?.fechaAgregado || new Date().toISOString()
        };
      }
    }

    await db.ref("/productosDelMes").set(nuevosProductos);

    const updatedSnapshot = await db.ref("/").once("value");
    const productosActualizados = updatedSnapshot.val() || {};

    const productosCompletos = Object.values(nuevosProductos).map(prodMes => ({
      ...productosActualizados[prodMes.id],
      id: prodMes.id,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p && p.nombre);

    res.status(200).json({
      mensaje: "Lista de productos del mes actualizada correctamente",
      productos: productosCompletos,
    });
  } catch (error) {
    console.error("Error al actualizar productos del mes:", error.message);
    res.status(500).json({ error: "Error al actualizar productos del mes", detalles: error.message });
  }
};

// Eliminar producto del mes
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

    delete productos[id];
    await db.ref("/productosDelMes").set(productos);

    const allSnapshot = await db.ref("/").once("value");
    const todosProductos = allSnapshot.val() || {};

    const productosRestantes = Object.values(productos).map(prodMes => ({
      ...todosProductos[prodMes.id],
      id: prodMes.id,
      fechaAgregado: prodMes.fechaAgregado
    })).filter(p => p && p.nombre);

    res.status(200).json({
      mensaje: "Producto eliminado de productos del mes",
      productos: productosRestantes,
    });
  } catch (error) {
    console.error("Error al eliminar producto del mes:", error.message);
    res.status(500).json({ error: "Error al eliminar producto del mes", detalles: error.message });
  }
};

// Actualizar precio del producto original
exports.actualizarPrecioProductoDelMes = async (req, res) => {
  const { id } = req.params;
  const { nuevoPrecio } = req.body;

  if (!id || nuevoPrecio === undefined) {
    return res.status(400).json({ error: "Faltan datos: ID del producto y nuevo precio" });
  }

  const precio = parseFloat(nuevoPrecio);
  if (isNaN(precio) || precio <= 0) {
    return res.status(400).json({ error: "El precio debe ser un número válido mayor que 0" });
  }

  try {
    const snapshot = await db.ref(`/${id}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const productoActual = snapshot.val();
    await guardarBackup("productos", id, productoActual);
    await db.ref(`/${id}/precioVentaSugerido`).set(precio);

    const mesSnapshot = await db.ref(`/productosDelMes/${id}`).once("value");
    if (!mesSnapshot.exists()) {
      return res.status(404).json({ error: "Producto no encontrado en productos del mes" });
    }

    res.status(200).json({
      mensaje: "Precio del producto actualizado correctamente",
      precio: precio
    });
  } catch (error) {
    console.error("Error al actualizar precio:", error.message);
    res.status(500).json({ error: "Error al actualizar precio", detalles: error.message });
  }
};