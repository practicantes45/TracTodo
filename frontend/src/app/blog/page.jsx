'use client';
import './blog.css';
import { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaClock, FaEye, FaUser, FaTag, FaArrowLeft } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Datos de posts del blog - Solo 5 artículos
    const allPosts = [
        {
            id: 1,
            title: "Cuando considerar una media reparación",
            excerpt: "La inversión en un tractocamión es considerable, y maximizar su vida útil es fundamental para el negocio del transporte.",
            content: "La inversión en un tractocamión es considerable, y maximizar su vida útil es fundamental para el negocio del transporte. Una media reparación puede ser la diferencia entre seguir operando de manera rentable o enfrentar costosos gastos de reemplazo...",
            image: "/imgs/blog-1.jpg",
            publishDate: "2024-01-18",
            readTime: "5 min",
            category: "Mantenimiento",
            author: "TRACTODO",
            views: "2.3K",
            tags: ["mantenimiento", "reparación", "tractocamión", "motor"]
        },
        {
            id: 2,
            title: "La importancia de una cabeza de motor en buen estado",
            excerpt: "Una cabeza de motor en mal estado puede ser un enemigo silencioso, afectando el consumo de combustible, la potencia y, en última instancia, elevando los costos operativos.",
            content: "Una cabeza de motor en mal estado puede ser un enemigo silencioso, afectando el consumo de combustible, la potencia y, en última instancia, elevando los costos operativos. Es fundamental entender cuándo y cómo realizar el mantenimiento adecuado...",
            image: "/imgs/blog-2.jpg",
            publishDate: "2024-01-15",
            readTime: "3 min",
            category: "Reparaciones",
            author: "TRACTODO",
            views: "1.8K",
            tags: ["cabeza motor", "reparaciones", "consumo", "potencia"]
        },
        {
            id: 3,
            title: "Cómo elegir las refacciones correctas para tu motor",
            excerpt: "Elegir las refacciones adecuadas es crucial para mantener el rendimiento óptimo de tu vehículo pesado y evitar costosas reparaciones futuras.",
            content: "Elegir las refacciones adecuadas es crucial para mantener el rendimiento óptimo de tu vehículo pesado y evitar costosas reparaciones futuras. La calidad de las piezas puede marcar la diferencia entre un motor que dure años o uno que falle prematuramente...",
            image: "/imgs/blog-3.jpg",
            publishDate: "2024-01-12",
            readTime: "4 min",
            category: "Guías",
            author: "TRACTODO",
            views: "3.1K",
            tags: ["refacciones", "guía", "calidad", "selección"]
        },
        {
            id: 4,
            title: "Mantenimiento preventivo: Calendario anual para tu flota",
            excerpt: "Un programa de mantenimiento preventivo bien estructurado puede reducir hasta un 40% los costos de reparación y aumentar significativamente la vida útil de tus vehículos.",
            content: "Un programa de mantenimiento preventivo bien estructurado puede reducir hasta un 40% los costos de reparación y aumentar significativamente la vida útil de tus vehículos. Te presentamos un calendario completo para organizar el mantenimiento de tu flota...",
            image: "/imgs/blog-4.jpg",
            publishDate: "2024-01-08",
            readTime: "7 min",
            category: "Mantenimiento",
            author: "TRACTODO",
            views: "4.2K",
            tags: ["preventivo", "calendario", "flota", "programación"]
        },
        {
            id: 5,
            title: "Síntomas de problemas en el sistema de inyección",
            excerpt: "Identificar tempranamente los problemas en el sistema de inyección puede ahorrarte miles de pesos en reparaciones mayores.",
            content: "Identificar tempranamente los problemas en el sistema de inyección puede ahorrarte miles de pesos en reparaciones mayores. Los síntomas pueden ser sutiles al principio, pero conocer las señales de alerta es fundamental...",
            image: "/imgs/blog-5.jpg",
            publishDate: "2024-01-05",
            readTime: "6 min",
            category: "Diagnóstico",
            author: "TRACTODO",
            views: "2.7K",
            tags: ["inyección", "síntomas", "diagnóstico", "problemas"]
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos los Artículos' },
        { id: 'Mantenimiento', label: 'Mantenimiento' },
        { id: 'Reparaciones', label: 'Reparaciones' },
        { id: 'Guías', label: 'Guías' },
        { id: 'Diagnóstico', label: 'Diagnóstico' }
    ];

    // Filtrar posts según categoría y búsqueda
    const filteredPosts = allPosts.filter(post => {
        const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handlePostClick = (post) => {
        // Redirigir a la página individual del artículo
        window.location.href = `/blog/${post.id}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCategoryCount = (categoryId) => {
        if (categoryId === 'todos') return allPosts.length;
        return allPosts.filter(post => post.category === categoryId).length;
    };

    const handleBackToEntertainment = () => {
        window.location.href = '/entretenimiento';
    };

    // Obtener el post destacado (más reciente)
    const featuredPost = allPosts[0];

    // Posts relacionados (excluyendo el destacado)
    const relatedPosts = filteredPosts.slice(1);

    return (
        <div className="layout blog-page">
            
            <Navbar />

            <main className="mainContent">
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Blog TRACTODO</h1>
                        </div>
                    </div>
                </div>

                {/* Sección principal del blog */}
                <section className="blogMainSection">
                    <div className="blogContainer">
                        
                        {/* Botón de regreso */}
                        <div className="backButtonContainer">
                            <button 
                                className="backButton" 
                                onClick={handleBackToEntertainment}
                                aria-label="Regresar a entretenimiento"
                            >
                                <FaArrowLeft className="backIcon" />
                                Regresar a Entretenimiento
                            </button>
                        </div>


                        {/* Post destacado */}
                        <div className="featuredSection">
                            <h3>Artículo Destacado</h3>
                            <article className="featuredPost" onClick={() => handlePostClick(featuredPost)}>
                                <div className="featuredImageContainer">
                                    <img 
                                        src={featuredPost.image} 
                                        alt={featuredPost.title}
                                        className="featuredImage"
                                    />
                                    <div className="featuredCategory">{featuredPost.category}</div>
                                </div>
                                <div className="featuredContent">
                                    <h4 className="featuredTitle">{featuredPost.title}</h4>
                                    <p className="featuredExcerpt">{featuredPost.excerpt}</p>
                                    <div className="featuredMeta">
                                        <span className="featuredAuthor">
                                            <FaUser /> {featuredPost.author}
                                        </span>
                                        <span className="featuredDate">
                                            <FaCalendarAlt /> {formatDate(featuredPost.publishDate)}
                                        </span>
                                        <span className="featuredViews">
                                            <FaEye /> {featuredPost.views} vistas
                                        </span>
                                        <span className="featuredReadTime">
                                            <FaClock /> {featuredPost.readTime}
                                        </span>
                                    </div>
                                    <div className="featuredTags">
                                        {featuredPost.tags.map((tag, index) => (
                                            <span key={index} className="featuredTag">
                                                <FaTag /> {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                            </article>
                        </div>

                        
                        {/* Header con estadísticas y búsqueda */}
                        <div className="blogHeader">
                            <div className="blogStats">
                                <h2>Artículos del Blog</h2>
                                <p>{filteredPosts.length} artículos encontrados</p>
                            </div>
                        
                        </div>

                        {/* Filtros de categorías con contadores */}
                        <div className="categoryFilters">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    className={`categoryButton ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    <span className="categoryLabel">{category.label}</span>
                                    <span className="categoryCount">({getCategoryCount(category.id)})</span>
                                </button>
                            ))}
                        </div>

                        {/* Grid de posts */}
                        {relatedPosts.length > 0 ? (
                            <div className="postsGrid">
                                {relatedPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="postCard"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div className="postImageContainer">
                                            <img 
                                                src={post.image} 
                                                alt={post.title}
                                                className="postImage"
                                            />
                                            <div className="postCategory">{post.category}</div>
                                        </div>
                                        <div className="postContent">
                                            <h3 className="postTitle">{post.title}</h3>
                                            <p className="postExcerpt">{post.excerpt}</p>
                                            <div className="postMeta">
                                                <span className="postAuthor">
                                                    <FaUser /> {post.author}
                                                </span>
                                                <span className="postDate">
                                                    <FaCalendarAlt /> {formatDate(post.publishDate)}
                                                </span>
                                            </div>
                                            <div className="postStats">
                                                <span className="postViews">
                                                    <FaEye /> {post.views}
                                                </span>
                                                <span className="postReadTime">
                                                    <FaClock /> {post.readTime}
                                                </span>
                                            </div>
                                            <div className="postTags">
                                                {post.tags.slice(0, 3).map((tag, index) => (
                                                    <span key={index} className="postTag">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="noResults">
                                <h3>No se encontraron artículos</h3>
                                <p>Intenta cambiar los filtros o términos de búsqueda</p>
                            </div>
                        )}

                    </div>
                </section>

            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
}