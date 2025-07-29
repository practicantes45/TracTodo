const { db } = require("../config/firebase");
const { guardarBackup } = require("./reversionController");

// =============================================================== VIDEOS ==========================================================================

// Obtener todos los videos
exports.getVideos = async (req, res) => {
  try {
    const snapshot = await db.ref("/entretenimiento/videos").once("value");
    const data = snapshot.val() || {};
    const videos = Object.entries(data).map(([id, video]) => ({ id, ...video }));
    res.json(videos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener videos", detalles: error.message });
  }
};

// Agregar video
exports.agregarVideo = async (req, res) => {
  const nuevoVideo = req.body; // { titulo, descripcion, urlVideo, fecha }
  try {
    const ref = db.ref("/entretenimiento/videos").push();
    await ref.set(nuevoVideo);
    res.status(201).json({ mensaje: "Video agregado correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al agregar video", detalles: error.message });
  }
};

// Actualizar video
exports.actualizarVideo = async (req, res) => {
  const { id } = req.params;
  const datos = req.body;
  try {
    const ref = db.ref(`/entretenimiento/videos/${id}`);
    const snapshot = await ref.once("value");
    if (!snapshot.exists()) return res.status(404).json({ mensaje: "Video no encontrado" });

    const datosAnteriores = snapshot.val();
    await guardarBackup("videos", id, datosAnteriores); //  respaldo antes de actualizar

    await ref.update(datos);
    res.status(200).json({ mensaje: "Video actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al actualizar video", detalles: error.message });
  }
};

// Eliminar video
exports.eliminarVideo = async (req, res) => {
  const { id } = req.params;
  try {
    const ref = db.ref(`/entretenimiento/videos/${id}`);
    const snapshot = await ref.once("value");
    if (!snapshot.exists()) return res.status(404).json({ mensaje: "Video no encontrado" });

    const datosAnteriores = snapshot.val();
    await guardarBackup("videos", id, datosAnteriores); //  respaldo antes de eliminar

    await ref.remove();
    res.status(200).json({ mensaje: "Video eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar video", detalles: error.message });
  }
};

// ======================================================================= BLOGS ====================================================================

// Obtener todos los posts del blog
exports.obtenerPostsBlog = async (req, res) => {
  try {
    console.log('📚 Obteniendo todos los posts del blog...');
    const snapshot = await db.ref("/entretenimiento/blog").once("value");
    const data = snapshot.val() || {};
    const posts = Object.entries(data).map(([id, post]) => ({ id, ...post }));

    // Ordenar por fecha (más recientes primero)
    posts.sort((a, b) => new Date(b.fechaPublicacion || b.fecha || 0) - new Date(a.fechaPublicacion || a.fecha || 0));

    console.log(`✅ ${posts.length} posts obtenidos correctamente`);
    res.json(posts);
  } catch (error) {
    console.error('❌ Error al obtener posts:', error);
    res.status(500).json({ mensaje: "Error al obtener los posts", detalles: error.message });
  }
};

// Obtener post por ID
exports.obtenerPostPorId = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`📖 Obteniendo post con ID: ${id}`);
    const snapshot = await db.ref(`/entretenimiento/blog/${id}`).once("value");

    if (!snapshot.exists()) {
      console.log(`❌ Post con ID ${id} no encontrado`);
      return res.status(404).json({ mensaje: "Post no encontrado" });
    }

    const post = { id, ...snapshot.val() };
    console.log(`✅ Post obtenido:`, post);
    res.json(post);
  } catch (error) {
    console.error('❌ Error al obtener post por ID:', error);
    res.status(500).json({ mensaje: "Error al obtener el post", detalles: error.message });
  }
};

// Agregar nuevo post al blog (solo admin) - CORREGIDO
exports.agregarPostBlog = async (req, res) => {
  const { titulo, categoria, bloques } = req.body;

  // Validaciones
  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ mensaje: "El título es obligatorio" });
  }

  if (!categoria) {
    return res.status(400).json({ mensaje: "La categoría es obligatoria" });
  }

  // Validar categorías permitidas
  const categoriasPermitidas = [
    'Tracto-Consejos',
    'Tracto-Promociones',
    'Tracto-Casos de Éxito',
    'Tracto-Preguntas Frecuentes'
  ];

  if (!categoriasPermitidas.includes(categoria)) {
    return res.status(400).json({ mensaje: "Categoría no válida" });
  }

  // Validar bloques
  if (!bloques || !Array.isArray(bloques) || bloques.length === 0) {
    return res.status(400).json({ mensaje: "Se requiere al menos un bloque de contenido" });
  }

  // Validar primer bloque (obligatorio)
  const primerBloque = bloques[0];
  if (!primerBloque.subtitulo || !primerBloque.subtitulo.trim()) {
    return res.status(400).json({ mensaje: "El subtítulo del primer bloque es obligatorio" });
  }
  if (!primerBloque.texto || !primerBloque.texto.trim()) {
    return res.status(400).json({ mensaje: "El texto del primer bloque es obligatorio" });
  }
  if (!primerBloque.imagen || !primerBloque.imagen.trim()) {
    return res.status(400).json({ mensaje: "La imagen del primer bloque es obligatoria" });
  }

  try {
    console.log('➕ Creando nuevo post del blog...');

    const fechaActual = new Date().toISOString();

    // GUARDAR SOLO LA ESTRUCTURA DE BLOQUES - SIN CONTENIDO CONCATENADO
    const postData = {
      titulo: titulo.trim(),
      categoria: categoria,
      autor: 'TracTodo',
      fechaPublicacion: fechaActual,
      fechaCreacion: fechaActual,
      fechaActualizacion: fechaActual,
      bloques: bloques.filter(bloque => 
        bloque.subtitulo && bloque.subtitulo.trim() && 
        bloque.texto && bloque.texto.trim() && 
        bloque.imagen && bloque.imagen.trim()
      ),
      // Para compatibilidad con frontend antiguo - crear arrays separados
      imagenes: bloques
        .filter(bloque => bloque.imagen && bloque.imagen.trim())
        .map(bloque => bloque.imagen.trim()),
      contenido: bloques
        .filter(bloque => bloque.subtitulo && bloque.subtitulo.trim() && bloque.texto && bloque.texto.trim())
        .map(bloque => `## ${bloque.subtitulo}\n\n${bloque.texto}`)
        .join('\n\n')
    };

    console.log('📤 Datos del nuevo post:', postData);

    const nuevoPostRef = db.ref("/entretenimiento/blog").push();
    await nuevoPostRef.set(postData);

    console.log(`✅ Post creado con ID: ${nuevoPostRef.key}`);
    res.status(201).json({
      mensaje: "Post agregado correctamente",
      id: nuevoPostRef.key,
      post: { id: nuevoPostRef.key, ...postData }
    });
  } catch (error) {
    console.error('❌ Error al crear post:', error);
    res.status(400).json({ mensaje: "Error al agregar post", detalles: error.message });
  }
};

// Actualizar post del blog por ID (solo admin) - CORREGIDO
exports.actualizarPostBlog = async (req, res) => {
  const { id } = req.params;
  const { titulo, categoria, bloques } = req.body;

  try {
    console.log(`📝 Actualizando post ${id}...`);

    const postRef = db.ref(`/entretenimiento/blog/${id}`);
    const snapshot = await postRef.once("value");

    if (!snapshot.exists()) {
      console.log(`❌ Post con ID ${id} no encontrado para actualizar`);
      return res.status(404).json({ mensaje: "Post no encontrado" });
    }

    const datosAnteriores = snapshot.val();
    console.log('💾 Guardando backup del post antes de actualizar...');
    await guardarBackup("blogs", id, datosAnteriores);

    // Preparar datos actualizados
    const datosActualizados = {
      fechaActualizacion: new Date().toISOString()
    };

    // Solo actualizar campos que se proporcionaron
    if (titulo !== undefined) datosActualizados.titulo = titulo.trim();
    if (categoria !== undefined) datosActualizados.categoria = categoria;
    
    if (bloques !== undefined && Array.isArray(bloques)) {
      // Filtrar solo bloques completos
      const bloquesValidos = bloques.filter(bloque => 
        bloque.subtitulo && bloque.subtitulo.trim() && 
        bloque.texto && bloque.texto.trim() && 
        bloque.imagen && bloque.imagen.trim()
      );

      datosActualizados.bloques = bloquesValidos;
      
      // Actualizar también los campos de compatibilidad
      datosActualizados.imagenes = bloquesValidos.map(bloque => bloque.imagen.trim());
      datosActualizados.contenido = bloquesValidos
        .map(bloque => `## ${bloque.subtitulo}\n\n${bloque.texto}`)
        .join('\n\n');
    }

    await postRef.update(datosActualizados);

    console.log(`✅ Post ${id} actualizado correctamente`);
    res.status(200).json({
      mensaje: "Post actualizado correctamente",
      id: id,
      datosActualizados: datosActualizados
    });
  } catch (error) {
    console.error('❌ Error al actualizar post:', error);
    res.status(400).json({ mensaje: "Error al actualizar post", detalles: error.message });
  }
};

// Eliminar post del blog por ID (solo admin)
exports.eliminarPostBlog = async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🗑️ Eliminando post con ID: ${id}`);

    const postRef = db.ref(`/entretenimiento/blog/${id}`);
    const snapshot = await postRef.once("value");

    if (!snapshot.exists()) {
      console.log(`❌ Post con ID ${id} no encontrado para eliminar`);
      return res.status(404).json({ mensaje: "Post no encontrado" });
    }

    const datosAnteriores = snapshot.val();
    console.log('💾 Guardando backup del post antes de eliminar...');
    await guardarBackup("blogs", id, datosAnteriores);

    await postRef.remove();

    console.log(`✅ Post ${id} eliminado correctamente`);
    res.status(200).json({
      mensaje: "Post eliminado correctamente",
      id: id
    });
  } catch (error) {
    console.error('❌ Error al eliminar post:', error);
    res.status(400).json({ mensaje: "Error al eliminar post", detalles: error.message });
  }
};

// =============================================================== VIDEOS SELECCIONADOS PARA ENTRETENIMIENTO ==========================================================================

// Obtener videos seleccionados para entretenimiento (máximo 5)
exports.getVideosSeleccionados = async (req, res) => {
  try {
    // Obtener IDs de videos seleccionados
    const snapshot = await db.ref("/entretenimiento/videosSeleccionados").once("value");
    const videosSeleccionadosIds = snapshot.val() || [];

    if (videosSeleccionadosIds.length === 0) {
      return res.json([]);
    }

    // Obtener datos completos de los videos seleccionados
    const videosSnapshot = await db.ref("/entretenimiento/videos").once("value");
    const todosLosVideos = videosSnapshot.val() || {};

    const videosSeleccionados = videosSeleccionadosIds
      .map(id => ({ id, ...todosLosVideos[id] }))
      .filter(video => video.titulo); // Solo videos que existen

    res.json(videosSeleccionados);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener videos seleccionados", detalles: error.message });
  }
};

// Agregar video a seleccionados para entretenimiento
exports.agregarVideoSeleccionado = async (req, res) => {
  const { videoId } = req.body;

  try {
    // Verificar que el video existe
    const videoSnapshot = await db.ref(`/entretenimiento/videos/${videoId}`).once("value");
    if (!videoSnapshot.exists()) {
      return res.status(404).json({ mensaje: "Video no encontrado" });
    }

    // Obtener lista actual de seleccionados
    const snapshot = await db.ref("/entretenimiento/videosSeleccionados").once("value");
    const videosSeleccionados = snapshot.val() || [];

    // Verificar límite de 5 videos
    if (videosSeleccionados.length >= 5) {
      return res.status(400).json({ mensaje: "Máximo 5 videos permitidos en entretenimiento" });
    }

    // Verificar que no esté ya seleccionado
    if (videosSeleccionados.includes(videoId)) {
      return res.status(400).json({ mensaje: "Video ya está seleccionado" });
    }

    // Agregar a la lista
    videosSeleccionados.push(videoId);
    await db.ref("/entretenimiento/videosSeleccionados").set(videosSeleccionados);

    res.status(200).json({ mensaje: "Video agregado a entretenimiento correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al agregar video", detalles: error.message });
  }
};

// Eliminar video de seleccionados para entretenimiento
exports.eliminarVideoSeleccionado = async (req, res) => {
  const { videoId } = req.body;

  try {
    // Obtener lista actual
    const snapshot = await db.ref("/entretenimiento/videosSeleccionados").once("value");
    const videosSeleccionados = snapshot.val() || [];

    // Filtrar el video a eliminar
    const nuevaLista = videosSeleccionados.filter(id => id !== videoId);

    // Guardar nueva lista
    await db.ref("/entretenimiento/videosSeleccionados").set(nuevaLista);

    res.status(200).json({ mensaje: "Video eliminado de entretenimiento correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar video", detalles: error.message });
  }
};

// Obtener videos disponibles para seleccionar (todos menos los ya seleccionados)
exports.getVideosDisponibles = async (req, res) => {
  try {
    // Obtener videos seleccionados
    const seleccionadosSnapshot = await db.ref("/entretenimiento/videosSeleccionados").once("value");
    const videosSeleccionados = seleccionadosSnapshot.val() || [];

    // Obtener todos los videos
    const todosSnapshot = await db.ref("/entretenimiento/videos").once("value");
    const todosLosVideos = todosSnapshot.val() || {};

    // Filtrar videos no seleccionados
    const videosDisponibles = Object.entries(todosLosVideos)
      .filter(([id, video]) => !videosSeleccionados.includes(id) && video.titulo)
      .map(([id, video]) => ({ id, ...video }));

    res.json(videosDisponibles);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener videos disponibles", detalles: error.message });
  }
};

// =============================================================== ARTÍCULOS SELECCIONADOS PARA ENTRETENIMIENTO ==========================================================================

// Obtener artículos seleccionados para entretenimiento (máximo 3)
exports.getArticulosSeleccionados = async (req, res) => {
  try {
    // Obtener IDs de artículos seleccionados
    const snapshot = await db.ref("/entretenimiento/articulosSeleccionados").once("value");
    const articulosSeleccionadosIds = snapshot.val() || [];

    if (articulosSeleccionadosIds.length === 0) {
      return res.json([]);
    }

    // Obtener datos completos de los artículos seleccionados
    const articulosSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const todosLosArticulos = articulosSnapshot.val() || {};

    const articulosSeleccionados = articulosSeleccionadosIds
      .map(id => ({ id, ...todosLosArticulos[id] }))
      .filter(articulo => articulo.titulo); // Solo artículos que existen

    res.json(articulosSeleccionados);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener artículos seleccionados", detalles: error.message });
  }
};

// Agregar artículo a seleccionados para entretenimiento
exports.agregarArticuloSeleccionado = async (req, res) => {
  const { articuloId } = req.body;

  try {
    // Verificar que el artículo existe
    const articuloSnapshot = await db.ref(`/entretenimiento/blog/${articuloId}`).once("value");
    if (!articuloSnapshot.exists()) {
      return res.status(404).json({ mensaje: "Artículo no encontrado" });
    }

    // Obtener lista actual de seleccionados
    const snapshot = await db.ref("/entretenimiento/articulosSeleccionados").once("value");
    const articulosSeleccionados = snapshot.val() || [];

    // Verificar límite de 3 artículos
    if (articulosSeleccionados.length >= 3) {
      return res.status(400).json({ mensaje: "Máximo 3 artículos permitidos en entretenimiento" });
    }

    // Verificar que no esté ya seleccionado
    if (articulosSeleccionados.includes(articuloId)) {
      return res.status(400).json({ mensaje: "Artículo ya está seleccionado" });
    }

    // Agregar a la lista
    articulosSeleccionados.push(articuloId);
    await db.ref("/entretenimiento/articulosSeleccionados").set(articulosSeleccionados);

    res.status(200).json({ mensaje: "Artículo agregado a entretenimiento correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al agregar artículo", detalles: error.message });
  }
};

// Eliminar artículo de seleccionados para entretenimiento
exports.eliminarArticuloSeleccionado = async (req, res) => {
  const { articuloId } = req.body;

  try {
    // Obtener lista actual
    const snapshot = await db.ref("/entretenimiento/articulosSeleccionados").once("value");
    const articulosSeleccionados = snapshot.val() || [];

    // Filtrar el artículo a eliminar
    const nuevaLista = articulosSeleccionados.filter(id => id !== articuloId);

    // Guardar nueva lista
    await db.ref("/entretenimiento/articulosSeleccionados").set(nuevaLista);

    res.status(200).json({ mensaje: "Artículo eliminado de entretenimiento correctamente" });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al eliminar artículo", detalles: error.message });
  }
};

// Obtener artículos disponibles para seleccionar (todos menos los ya seleccionados)
exports.getArticulosDisponibles = async (req, res) => {
  try {
    // Obtener artículos seleccionados
    const seleccionadosSnapshot = await db.ref("/entretenimiento/articulosSeleccionados").once("value");
    const articulosSeleccionados = seleccionadosSnapshot.val() || [];

    // Obtener todos los artículos
    const todosSnapshot = await db.ref("/entretenimiento/blog").once("value");
    const todosLosArticulos = todosSnapshot.val() || {};

    // Filtrar artículos no seleccionados
    const articulosDisponibles = Object.entries(todosLosArticulos)
      .filter(([id, articulo]) => !articulosSeleccionados.includes(id) && articulo.titulo)
      .map(([id, articulo]) => ({ id, ...articulo }));

    res.json(articulosDisponibles);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener artículos disponibles", detalles: error.message });
  }
};