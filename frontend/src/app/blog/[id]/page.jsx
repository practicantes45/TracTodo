import { obtenerPostPorId, obtenerPosts } from '../../../services/blogService';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

// Función requerida para rutas dinámicas
export async function generateStaticParams() {
  try {
    console.log('🏗️ Generando parámetros estáticos para blog...');
    
    // Usar URL de producción para build
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api';
    const response = await fetch(`${apiUrl}/entretenimiento/blogs`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        console.warn('⚠️ No se pudieron obtener posts para build estático');
        return [];
    }
    
    const posts = await response.json();
    
    // Retornar array de objetos con la propiedad 'id'
    const params = posts.map((post) => ({
      id: post.id.toString()
    }));
    
    console.log('✅ Parámetros generados:', params);
    return params;
  } catch (error) {
    console.error('❌ Error al generar parámetros estáticos:', error);
    // En caso de error, retornar array vacío
    return [];
  }
}

// Metadata dinámica para SEO
export async function generateMetadata({ params }) {
  try {
    const post = await obtenerPostPorId(params.id);
    return {
      title: `${post.titulo || post.title} - TracTodo Blog`,
      description: (post.contenido || post.content || '').substring(0, 160),
      openGraph: {
        title: post.titulo || post.title,
        description: (post.contenido || post.content || '').substring(0, 160),
        images: post.imagenes || (post.imagenUrl ? [post.imagenUrl] : []),
      },
    };
  } catch (error) {
    return {
      title: 'Artículo no encontrado - TracTodo Blog',
      description: 'El artículo que buscas no está disponible.',
    };
  }
}

export default async function BlogPostPage({ params }) {
  let post = null;
  let error = null;

  try {
    const postData = await obtenerPostPorId(params.id);
    
    // Formatear datos del post
    post = {
      id: postData.id,
      title: postData.titulo || postData.title,
      content: postData.contenido || postData.content,
      images: postData.imagenes || (postData.imagenUrl ? [postData.imagenUrl] : []) || (postData.image ? [postData.image] : []),
      publishDate: postData.fechaPublicacion || postData.fecha || postData.publishDate,
      category: postData.categoria || postData.category || 'Tracto-Consejos',
      author: postData.autor || 'TracTodo',
    };
  } catch (err) {
    console.error('❌ Error al cargar post:', err);
    // Si no encontramos el post, mostrar 404
    notFound();
  }

  // Pasar los datos al Client Component
  return <BlogPostClient post={post} />;
}
