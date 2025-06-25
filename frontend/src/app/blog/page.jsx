'use client';
import './blog.css';
import { useState } from 'react';
import { FaCalendarAlt, FaClock, FaEye, FaTag, FaSearch, FaArrowRight } from "react-icons/fa";
import Navbar from '../components/Navbar/Navbar';

import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export default function BlogPage() {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    // Datos expandidos del blog
    const allPosts = [
        {
            id: 1,
            title: "Cuando considerar una media reparación",
            excerpt: "La inversión en un tractocamión es considerable, y maximizar su vida útil es fundamental para el negocio del transporte. Conoce cuándo es el momento adecuado para una media reparación.",
            content: "Una media reparación es una inversión importante que puede extender significativamente la vida útil de tu motor...",
            image: "/imgs/blog-1.jpg",
            publishDate: "2024-01-18",
            readTime: "5 min",
            category: "Mantenimiento",
            author: "TRACTODO",
            views: "1.2K",
            tags: ["motor", "reparación", "mantenimiento", "tractocamión"]
        },
        {
            id: 2,
            title: "La importancia de una cabeza de motor en buen estado",
            excerpt: "Una cabeza de motor en mal estado puede ser un enemigo silencioso, afectando el consumo de combustible, la potencia y, en última instancia, elevando los costos operativos.",
            content: "La cabeza del motor es una de las partes más críticas del sistema...",
            image: "/imgs/blog-2.jpg",
            publishDate: "2024-01-15",
            readTime: "3 min",
            category: "Reparaciones",
            author: "TRACTODO",
            views: "950",
            tags: ["cabeza motor", "diagnóstico", "reparación"]
        },
        {
            id: 3,
            title: "Cómo elegir las refacciones correctas para tu motor",
            excerpt: "Elegir las refacciones adecuadas es crucial para mantener el rendimiento óptimo de tu vehículo pesado y evitar costosas reparaciones futuras.",
            content: "La selección de refacciones de calidad es fundamental...",
            image: "/imgs/blog-3.jpg",
            publishDate: "2024-01-12",
            readTime: "4 min",
            category: "Guías",
            author: "TRACTODO",
            views: "1.8K",
            tags: ["refacciones", "calidad", "selección", "guía"]
        },
        {
            id: 4,
            title: "Mantenimiento preventivo vs correctivo: ¿Cuál conviene más?",
            excerpt: "Descubre las diferencias entre el mantenimiento preventivo y correctivo, y cuál es la mejor estrategia para tu flota de transporte.",
            content: "El mantenimiento es la clave para prolongar la vida útil de cualquier vehículo...",
            image: "/imgs/blog-4.jpg",
            publishDate: "2024-01-08",
            readTime: "6 min",
            category: "Mantenimiento",
            author: "TRACTODO",
            views: "2.1K",
            tags: ["mantenimiento", "preventivo", "correctivo", "flota"]
        },
        {
            id: 5,
            title: "Síntomas de fallas en el sistema de inyección diésel",
            excerpt: "Identifica a tiempo los problemas en el sistema de inyección de tu motor diésel para evitar reparaciones costosas y tiempo perdido en carretera.",
            content: "El sistema de inyección es el corazón del motor diésel...",
            image: "/imgs/blog-5.jpg",
            publishDate: "2024-01-05",
            readTime: "7 min",
            category: "Diagnóstico",
            author: "TRACTODO",
            views: "1.6K",
            tags: ["inyección", "diésel", "diagnóstico", "fallas"]
        },
        {
            id: 6,
            title: "Ventajas de usar refacciones originales vs genéricas",
            excerpt: "Análisis completo sobre las diferencias entre refacciones originales y genéricas, para que tomes la mejor decisión para tu negocio.",
            content: "La elección entre refacciones originales y genéricas es una decisión importante...",
            image: "/imgs/blog-6.jpg",
            publishDate: "2024-01-02",
            readTime: "5 min",
            category: "Guías",
            author: "TRACTODO",
            views: "1.4K",
            tags: ["refacciones", "originales", "genéricas", "comparación"]
        },
        {
            id: 7,
            title: "Cómo preparar tu tractocamión para viajes largos",
            excerpt: "Lista de verificación completa para asegurar que tu vehículo esté en perfectas condiciones antes de emprender viajes de larga distancia.",
            content: "Los viajes largos ponen a prueba todos los sistemas del vehículo...",
            image: "/imgs/blog-7.jpg",
            publishDate: "2023-12-28",
            readTime: "8 min",
            category: "Mantenimiento",
            author: "TRACTODO",
            views: "2.3K",
            tags: ["viajes", "preparación", "checklist", "mantenimiento"]
        },
        {
            id: 8,
            title: "Tendencias en tecnología para motores diésel 2024",
            excerpt: "Conoce las últimas innovaciones y tendencias tecnológicas que están revolucionando la industria de motores diésel.",
            content: "La tecnología en motores diésel avanza constantemente...",
            image: "/imgs/blog-8.jpg",
            publishDate: "2023-12-20",
            readTime: "6 min",
            category: "Tecnología",
            author: "TRACTODO",
            views: "1.9K",
            tags: ["tecnología", "innovación", "tendencias", "2024"]
        },
        {
            id: 9,
            title: "Ahorro de combustible: Tips prácticos para transportistas",
            excerpt: "Estrategias comprobadas para reducir el consumo de combustible y maximizar la rentabilidad de tu operación de transporte.",
            content: "El combustible representa uno de los mayores gastos operativos...",
            image: "/imgs/blog-9.jpg",
            publishDate: "2023-12-15",
            readTime: "5 min",
            category: "Eficiencia",
            author: "TRACTODO",
            views: "2.8K",
            tags: ["combustible", "ahorro", "eficiencia", "tips"]
        },
        {
            id: 10,
            title: "Historia de TRACTODO: 15 años de experiencia",
            excerpt: "Conoce la historia de nuestra empresa, desde sus inicios hasta convertirse en referente en refacciones para motores diésel.",
            content: "En 2010 nació TRACTODO con la visión de ser el proveedor confiable...",
            image: "/imgs/blog-10.jpg",
            publishDate: "2023-12-10",
            readTime: "4 min",
            category: "Empresa",
            author: "TRACTODO",
            views: "1.1K",
            tags: ["historia", "empresa", "experiencia", "trayectoria"]
        }
    ];

    const categories = [
        { id: 'todos', label: 'Todos los Artículos' },
        { id: 'Mantenimiento', label: 'Mantenimiento' },
        { id: 'Reparaciones', label: 'Reparaciones' },
        { id: 'Guías', label: 'Guías' },
        { id: 'Diagnóstico', label: 'Diagnóstico' },
        { id: 'Tecnología', label: 'Tecnología' },
        { id: 'Eficiencia', label: 'Eficiencia' },
        { id: 'Empresa', label: 'Empresa' }
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

    // Obtener el post destacado (más reciente)
    const featuredPost = allPosts[0];

    // Posts relacionados (excluyendo el destacado)
    const relatedPosts = allPosts.slice(1, 4);

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
                        
                        {/* Header con estadísticas y búsqueda */}
                        <div className="blogHeader">
                            <div className="blogStats">
                                <h2>Artículos del Blog</h2>
                                <p>{filteredPosts.length} artículos encontrados</p>
                            </div>
                            
                            {/* Barra de búsqueda */}
                            <div className="searchContainer">
                                <FaSearch className="searchIcon" />
                                <input
                                    type="text"
                                    placeholder="Buscar artículos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="searchInput"
                                />
                            </div>
                        </div>

                        {/* Post destacado */}
                        <div className="featuredSection">
                            <h3 className="featuredTitle">Artículo Destacado</h3>
                            <article className="featuredPost" onClick={() => handlePostClick(featuredPost)}>
                                <div className="featuredImageContainer">
                                    <div className="featuredImagePlaceholder">
                                        <div className="featuredCategory">{featuredPost.category}</div>
                                    </div>
                                </div>
                                <div className="featuredContent">
                                    <h2 className="featuredPostTitle">{featuredPost.title}</h2>
                                    <p className="featuredExcerpt">{featuredPost.excerpt}</p>
                                    <div className="featuredMeta">
                                        <div className="featuredMetaItem">
                                            <FaCalendarAlt />
                                            <span>{formatDate(featuredPost.publishDate)}</span>
                                        </div>
                                        <div className="featuredMetaItem">
                                            <FaClock />
                                            <span>{featuredPost.readTime} de lectura</span>
                                        </div>
                                        <div className="featuredMetaItem">
                                            <FaEye />
                                            <span>{featuredPost.views} visualizaciones</span>
                                        </div>
                                    </div>
                                    <div className="featuredTags">
                                        {featuredPost.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="featuredTag">
                                                <FaTag />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="readMoreFeatured">
                                        Leer artículo completo
                                        <FaArrowRight />
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Filtros de categorías */}
                        <div className="categoryFiltersSection">
                            <h3 className="filtersTitle">Categorías</h3>
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
                        </div>

                        {/* Grid de artículos */}
                        <div className="postsGrid">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="postCard"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div className="postImageContainer">
                                            <div className="postImagePlaceholder">
                                                <div className="postCategory">{post.category}</div>
                                            </div>
                                        </div>
                                        <div className="postContent">
                                            <h3 className="postTitle">{post.title}</h3>
                                            <p className="postExcerpt">{post.excerpt}</p>
                                            <div className="postMeta">
                                                <div className="postMetaItem">
                                                    <FaCalendarAlt />
                                                    <span>{formatDate(post.publishDate)}</span>
                                                </div>
                                                <div className="postMetaItem">
                                                    <FaClock />
                                                    <span>{post.readTime}</span>
                                                </div>
                                                <div className="postMetaItem">
                                                    <FaEye />
                                                    <span>{post.views}</span>
                                                </div>
                                            </div>
                                            <div className="postTags">
                                                {post.tags.slice(0, 2).map((tag, index) => (
                                                    <span key={index} className="postTag">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="readMoreButton">
                                                Leer más
                                                <FaArrowRight />
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="noResults">
                                    <h3>No se encontraron artículos</h3>
                                    <p>Intenta cambiar los filtros o términos de búsqueda</p>
                                </div>
                            )}
                        </div>

                        {/* Newsletter suscripción */}
                        <div className="newsletterSection">
                            <div className="newsletterContent">
                                <h3>Mantente actualizado</h3>
                                <p>Recibe los últimos artículos y tips directamente en tu correo</p>
                                <div className="newsletterForm">
                                    <input 
                                        type="email" 
                                        placeholder="Tu correo electrónico"
                                        className="newsletterInput"
                                    />
                                    <button className="newsletterButton">
                                        Suscribirse
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
}