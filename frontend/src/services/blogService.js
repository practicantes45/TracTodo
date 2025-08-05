import api from './api';

// URL base para llamadas del servidor (SSR)
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tractodo-production.up.railway.app/api';

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
      const response = await fetch(`${SERVER_API_URL}/entretenimiento/blogs/${id}`, {
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

// Resto de las funciones permanecen igual...
export const eliminarPost = async (id) => {
  try {
    const respuesta = await api.delete(`/entretenimiento/blogs/${id}`);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al eliminar post:", error);
    throw error;
  }
};