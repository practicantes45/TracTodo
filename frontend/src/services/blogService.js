import api from './api';

// Obtener todos los posts del blog
export const obtenerPosts = async () => {
  try {
    const respuesta = await api.get('/entretenimiento/blogs');
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener posts:", error);
    throw error;
  }
};

// Obtener post por ID - MEJORADO PARA SERVIDOR
export const obtenerPostPorId = async (id) => {
  try {    
    // Si estamos en el servidor, hacer la petición directamente
    if (typeof window === 'undefined') {
      // Estamos en el servidor - hacer petición HTTP directa
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/entretenimiento/blogs/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } else {
      // Estamos en el cliente - usar axios como antes
      const respuesta = await api.get(`/entretenimiento/blogs/${id}`);
      return respuesta.data;
    }
  } catch (error) {
    console.error("❌ Error al obtener post por ID:", error);
    throw error;
  }
};

// Crear post (solo admin) - CORREGIDO
export const crearPost = async (datosPost) => {
  try {
    console.log('📤 Enviando datos al backend:', datosPost);

    // Validar que los datos tienen la estructura correcta
    if (!datosPost.titulo || !datosPost.titulo.trim()) {
      throw new Error('El título es obligatorio');
    }

    if (!datosPost.categoria) {
      throw new Error('La categoría es obligatoria');
    }

    if (!datosPost.bloques || !Array.isArray(datosPost.bloques) || datosPost.bloques.length === 0) {
      throw new Error('Se requiere al menos un bloque de contenido');
    }

    // Validar primer bloque
    const primerBloque = datosPost.bloques[0];
    if (!primerBloque.subtitulo || !primerBloque.subtitulo.trim()) {
      throw new Error('El subtítulo del primer bloque es obligatorio');
    }
    if (!primerBloque.texto || !primerBloque.texto.trim()) {
      throw new Error('El texto del primer bloque es obligatorio');
    }
    if (!primerBloque.imagen || !primerBloque.imagen.trim()) {
      throw new Error('La imagen del primer bloque es obligatoria');
    }

    const respuesta = await api.post('/entretenimiento/blogs', datosPost);
    console.log('✅ Post creado exitosamente:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al crear post:", error);
    throw error;
  }
};


// Actualizar post (solo admin) - CORREGIDO
export const actualizarPost = async (id, datosPost) => {
  try {    
    console.log('📝 Actualizando post:', id, datosPost);
    
    const respuesta = await api.put(`/entretenimiento/blogs/${id}`, datosPost);
    console.log('✅ Post actualizado exitosamente:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al actualizar post:", error);
    throw error;
  }
};

// Eliminar post (solo admin)
export const eliminarPost = async (id) => {
  try {
    console.log(`🗑️ Eliminando post con ID: ${id}`);
    const respuesta = await api.delete(`/entretenimiento/blogs/${id}`);
    console.log('✅ Post eliminado exitosamente:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al eliminar post:", error);
    throw error;
  }
};

// Buscar posts (implementación básica usando obtenerPosts y filtro local)
export const buscarPosts = async (termino) => {
  try {
    console.log(`🔍 Buscando posts con término: "${termino}"`);
    
    const todosLosPosts = await obtenerPosts();
    
    const postsFiltrados = todosLosPosts.filter(post => {
      const titulo = (post.titulo || post.title || '').toLowerCase();
      const contenido = (post.contenido || post.content || '').toLowerCase();
      const terminoBusqueda = termino.toLowerCase();
      
      return titulo.includes(terminoBusqueda) || contenido.includes(terminoBusqueda);
    });
    
    console.log(`✅ Encontrados ${postsFiltrados.length} posts que coinciden con "${termino}"`);
    return postsFiltrados;
  } catch (error) {
    console.error("❌ Error al buscar posts:", error);
    throw error;
  }
};

// Función auxiliar para obtener posts por categoría
export const obtenerPostsPorCategoria = async (categoria) => {
  try {
    console.log(`📂 Obteniendo posts de la categoría: ${categoria}`);
    
    const todosLosPosts = await obtenerPosts();
    
    if (categoria === 'todos') {
      return todosLosPosts;
    }
    
    const postsFiltrados = todosLosPosts.filter(post => {
      const categoriaPost = post.categoria || post.category || '';
      return categoriaPost.toLowerCase() === categoria.toLowerCase();
    });
    
    console.log(`✅ Encontrados ${postsFiltrados.length} posts en la categoría "${categoria}"`);
    return postsFiltrados;
  } catch (error) {
    console.error("❌ Error al obtener posts por categoría:", error);
    throw error;
  }
};

// Función auxiliar para formatear post para mostrar
export const formatearPostParaFrontend = (post) => {
  return {
    id: post.id,
    title: post.titulo || post.title,
    content: post.contenido || post.content,
    images: post.imagenes || [post.imagenUrl] || [post.image],
    publishDate: post.fechaPublicacion || post.fecha || post.publishDate,
    category: post.categoria || post.category || 'General',
    author: post.autor || 'TracTodo',
    
    // Campos calculados
    excerpt: (post.contenido || post.content || '').substring(0, 200) + '...',
    readTime: calcularTiempoLectura(post.contenido || post.content || ''),
    views: Math.floor(Math.random() * 5000) + "K"
  };
};

// Función auxiliar para calcular tiempo de lectura
const calcularTiempoLectura = (contenido) => {
  const palabrasPorMinuto = 200;
  const numeroPalabras = contenido.split(' ').length;
  const minutos = Math.ceil(numeroPalabras / palabrasPorMinuto);
  return `${minutos} min`;
};