"use client";

import "./entretenimiento.css";
import "./entretenimiento.mobile.overrides.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlay,
  FaCalendarAlt,
  FaBook,
  FaArrowDown,
  FaUser,
  FaShare,
} from "react-icons/fa";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop";
import EntertainmentVideoManager from "../components/EntertainmentVideoManager/EntertainmentVideoManager";
import EntertainmentBlogManager from "../components/EntertainmentBlogManager/EntertainmentBlogManager";
import BlogPostModal from "../components/BlogPostModal/BlogPostModal";
import SEOHead from "../components/SEOHead/SEOHead";

import { useAuth } from "../../hooks/useAuth";
import { useSEO } from "../../hooks/useSEO";
import { obtenerVideosSeleccionados } from "../../services/entretenimientoVideoService";
import { obtenerArticulosSeleccionados } from "../../services/entretenimientoBlogService";

export default function EntretenimientoClient() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(true);
  const [shortsData, setShortsData] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogLoading, setBlogLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogError, setBlogError] = useState(null);

  // Estados para el modal del blog
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showBlogModal, setShowBlogModal] = useState(false);

  // Hook SEO para página de entretenimiento
  const { seoData } = useSEO("entretenimiento", { path: "/entretenimiento" });

  // Cargar videos seleccionados del backend
  useEffect(() => {
    cargarVideosSeleccionados();
  }, []);

  // Cargar artículos seleccionados del backend
  useEffect(() => {
    cargarArticulosSeleccionados();
  }, []);

  // ===== UTILIDADES DE CONTENIDO =====

  const limpiarMarkdown = (content) => {
    if (!content) return "";
    return content
      .replace(/^## (.+)$/gm, "$1") // subtítulos
      .replace(/^# (.+)$/gm, "$1") // títulos
      .replace(/\*\*(.*?)\*\*/g, "$1") // negritas
      .replace(/\*(.*?)\*/g, "$1") // cursivas
      .replace(/\n\s*\n/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const generarExcerptInteligente = (post, maxLength = 160) => {
    let contenido = "";

    if (post.bloques && Array.isArray(post.bloques) && post.bloques.length > 0) {
      const primerBloque = post.bloques[0];
      if (primerBloque.subtitulo && primerBloque.subtitulo.trim()) {
        contenido = `${primerBloque.subtitulo.trim()}. `;
      }
      if (primerBloque.texto && primerBloque.texto.trim()) {
        const textoLimpio = limpiarMarkdown(primerBloque.texto);
        contenido += textoLimpio;
      }
    } else if (post.contenido || post.content) {
      contenido = post.contenido || post.content;
    }

    const contenidoLimpio = limpiarMarkdown(contenido);
    if (contenidoLimpio.length <= maxLength) return contenidoLimpio;

    const palabras = contenidoLimpio.split(" ");
    let excerptFinal = "";
    for (const palabra of palabras) {
      if ((excerptFinal + palabra + " ").length > maxLength - 3) break;
      excerptFinal += palabra + " ";
    }
    return excerptFinal.trim() + "...";
  };

  const extraerPrimerSubtitulo = (post) => {
    if (post.bloques && Array.isArray(post.bloques) && post.bloques.length > 0) {
      const primerBloque = post.bloques[0];
      if (primerBloque.subtitulo && primerBloque.subtitulo.trim()) {
        return primerBloque.subtitulo.trim();
      }
    }
    const contenido = post.contenido || post.content || "";
    const subtituloMatch = contenido.match(/^## (.+)$/m);
    return subtituloMatch ? subtituloMatch[1].trim() : null;
  };

  // ===== CARGA DE DATOS =====

  const cargarVideosSeleccionados = async () => {
    try {
      setLoading(true);
      setError(null);
      const videos = await obtenerVideosSeleccionados();

      const videosFormateados = (videos || []).map((video) => ({
        id: video.id,
        title: video.titulo || video.title,
        youtubeLink: video.urlVideo || video.youtubeLink,
        category: video.categoria || video.category,
      }));

      setShortsData(videosFormateados);
    } catch (err) {
      console.error("❌ Error al cargar videos seleccionados:", err);
      setError("Error al cargar los videos. Inténtalo de nuevo.");
      setShortsData([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarArticulosSeleccionados = async () => {
    try {
      setBlogLoading(true);
      setBlogError(null);

      const articulos = await obtenerArticulosSeleccionados();

      const articulosFormateados = (articulos || []).map((articulo) => {
        const excerptInteligente = generarExcerptInteligente(articulo, 160);
        const subtituloDestacado = extraerPrimerSubtitulo(articulo);

        return {
          id: articulo.id,
          title: articulo.titulo || articulo.title,
          excerpt: excerptInteligente,
          subtituloDestacado,
          content: articulo.contenido || articulo.content,
          images:
            articulo.imagenes ||
            (articulo.imagenUrl ? [articulo.imagenUrl] : []) ||
            (articulo.image ? [articulo.image] : []),
          publishDate:
            articulo.fechaPublicacion ||
            articulo.fecha ||
            articulo.publishDate ||
            new Date().toISOString(),
          readTime: calcularTiempoLectura(articulo.contenido || ""),
          category: articulo.categoria || articulo.category || "Tracto-Consejos",
          author: articulo.autor || "TracTodo",
          bloques: articulo.bloques || [],
        };
      });

      setBlogData(articulosFormateados);
    } catch (err) {
      console.error("❌ Error al cargar artículos seleccionados:", err);
      setBlogError("Error al cargar los artículos del blog.");
      setBlogData([]);
    } finally {
      setBlogLoading(false);
    }
  };

  // ===== UTILIDADES VARIAS =====

  const calcularTiempoLectura = (contenido) => {
    const palabrasPorMinuto = 200;
    const numeroPalabras = (contenido || "").split(" ").length;
    const minutos = Math.ceil(numeroPalabras / palabrasPorMinuto);
    return `${minutos} min`;
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    try {
      const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shortsMatch) return shortsMatch[1];

      const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (watchMatch) return watchMatch[1];

      const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (shortUrlMatch) return shortUrlMatch[1];

      const directIdMatch = url.match(/^[a-zA-Z0-9_-]{11}$/);
      if (directIdMatch) return url;
    } catch (error) {
      console.error("💥 Error extracting YouTube ID:", error);
    }
    return null;
  };

  const getYouTubeThumbnail = (youtubeLink) => {
    const videoId = extractYouTubeId(youtubeLink);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    return "/imgs/default-video-thumb.jpg";
  };

  // ===== HANDLERS =====

  const handleVideoClick = (video) => {
    try {
      const videoId = extractYouTubeId(video.youtubeLink);
      if (videoId) {
        const videoData = {
          ...video,
          youtubeId: videoId,
          isShort: video.youtubeLink.includes("/shorts/"),
        };
        setSelectedVideo(videoData);
        setIsVideoModalOpen(true);
      } else {
        window.open(video.youtubeLink, "_blank");
      }
    } catch (error) {
      console.error("💥 Error in handleVideoClick:", error);
      window.open(video.youtubeLink, "_blank");
    }
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  const handleBlogClick = (post) => {
    setSelectedPostId(post.id);
    setShowBlogModal(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseBlogModal = () => {
    setShowBlogModal(false);
    setSelectedPostId(null);
    document.body.style.overflow = "unset";
  };

  const handleShareVideo = (video, e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Mira este short de TRACTODO: ${video.title}`,
        url: video.youtubeLink,
      });
    } else {
      navigator.clipboard.writeText(video.youtubeLink).then(() => {
        alert("Enlace copiado al portapapeles");
      });
    }
  };

  const scrollToBlog = () => {
    const blogSection = document.querySelector(".blogSection");
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Ocultar el botón sticky "Ver Blog" cuando la sección blog ya es visible
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const blogSection = document.querySelector(".blogSection");
      if (!blogSection) return;
      const rect = blogSection.getBoundingClientRect();
      const inView = rect.top <= window.innerHeight * 0.35;
      setShowStickyButton(!inView);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const goToVideos = () => router.push("/videos");
  const goToBlog = () => router.push("/blog");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleImageError = (e) => {
    e.target.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc+';
    e.target.alt = "Imagen no encontrada";
  };

  // ===== Schema.org =====

  const schemaEntertainment = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Entretenimiento Tractodo",
    description:
      "Contenido educativo sobre tractocamiones: videos técnicos, artículos especializados, consejos y casos de éxito",
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/entretenimiento`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: shortsData.length + blogData.length,
      itemListElement: [
        ...shortsData.slice(0, 5).map((video, index) => ({
          "@type": "VideoObject",
          position: index + 1,
          name: video.title,
          description: video.category,
          thumbnailUrl: getYouTubeThumbnail(video.youtubeLink),
          embedUrl: `https://www.youtube.com/embed/${extractYouTubeId(
            video.youtubeLink
          )}`,
        })),
        ...blogData.slice(0, 5).map((post, index) => ({
          "@type": "BlogPosting",
          position: shortsData.length + index + 1,
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishDate,
        })),
      ],
    },
  };

  // ===== RENDER =====

  return (
    <>
      {/* SEO Head */}
      {seoData && (
        <SEOHead
          title={seoData.title}
          description={seoData.description}
          keywords={seoData.keywords}
          ogTitle={seoData.ogTitle}
          ogDescription={seoData.ogDescription}
          ogImage={seoData.ogImage}
          ogUrl={seoData.ogUrl}
          canonicalUrl={seoData.canonicalUrl}
          schema={schemaEntertainment}
        />
      )}

      <div className="layout entretenimiento-page">
        <Navbar />

        <main className="mainContent">
          {/* Hero Section */}
          <div className="heroSection">
            <div className="heroOverlay">
              <div className="heroContent">
                <h1>Entretenimiento</h1>
              </div>
            </div>
          </div>

          {/* Sección principal de contenido */}
          <section className="entertainmentMainSection">
            <div className="entertainmentContainer">
              {/* Gestión de videos - Solo admin */}
              {isAdmin && (
                <div className="adminVideoControls">
                  <EntertainmentVideoManager onVideosUpdate={cargarVideosSeleccionados} />
                </div>
              )}

              {/* Sección de Shorts */}
              <div className="videosSection">
                <div className="sectionHeader">
                  <h2>VIDEOS</h2>
                  <p className="sectionDescription">
                    Tractovideos: ¡Vía hacia la emoción y la información!
                  </p>
                </div>

                {loading && (
                  <div className="loadingContainer">
                    <h3>Cargando videos...</h3>
                    <p>Por favor espera un momento</p>
                  </div>
                )}

                {error && (
                  <div className="errorContainer">
                    <h3>Error al cargar videos</h3>
                    <p>{error}</p>
                    <button onClick={cargarVideosSeleccionados} className="retryButton">
                      Intentar de nuevo
                    </button>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {shortsData.length > 0 ? (
                      <div className="shortsGrid">
                        {shortsData.map((short) => (
                          <div
                            key={short.id}
                            className="shortCard"
                            onClick={() => handleVideoClick(short)}
                          >
                            <div className="shortThumbnail">
                              <div
                                className="thumbnailPlaceholder"
                                style={{
                                  backgroundImage: `url(${getYouTubeThumbnail(short.youtubeLink)})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              >
                                <div className="playOverlay">
                                  <FaPlay className="playIcon" />
                                </div>
                                <div className="shortBadge">SHORT</div>
                                <button
                                  className="shareButton"
                                  onClick={(e) => handleShareVideo(short, e)}
                                  aria-label="Compartir short"
                                >
                                  <FaShare />
                                </button>
                              </div>
                            </div>
                            <div className="shortInfo">
                              <h3 className="shortTitle">{short.title}</h3>
                              <div className="shortMeta">
                                <span className="shortCategory">{short.category}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="noVideosMessage">
                        <h3>No hay videos seleccionados</h3>
                        <p>
                          El administrador no ha seleccionado videos para mostrar en
                          entretenimiento.
                        </p>
                        {isAdmin && (
                          <p>
                            <strong>
                              Como administrador, puedes seleccionar videos usando el botón
                              "Gestionar Videos" arriba.
                            </strong>
                          </p>
                        )}
                      </div>
                    )}

                    {shortsData.length > 0 && (
                      <div className="sectionFooter">
                        <button onClick={goToVideos} className="viewMoreButton shorts" type="button">
                          Ver más shorts
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sección de Blog */}
              <div className="blogSection">
                <div className="sectionHeader">
                  <h2>BLOG</h2>
                  <p className="sectionDescription">
                    Tractoinformación: ¡Conocimiento en movimiento!
                  </p>
                </div>

                {isAdmin && (
                  <div className="adminBlogControls">
                    <EntertainmentBlogManager onArticulosUpdate={cargarArticulosSeleccionados} />
                  </div>
                )}

                {blogLoading && (
                  <div className="loadingContainer">
                    <h3>Cargando artículos...</h3>
                    <p>Por favor espera un momento</p>
                  </div>
                )}

                {blogError && (
                  <div className="errorContainer">
                    <h3>Error al cargar artículos</h3>
                    <p>{blogError}</p>
                    <button onClick={cargarArticulosSeleccionados} className="retryButton">
                      Intentar de nuevo
                    </button>
                  </div>
                )}

                {!blogLoading && !blogError && (
                  <>
                    {blogData.length > 0 ? (
                      <div className="blogGrid">
                        {blogData.map((post) => (
                          <article
                            key={post.id}
                            className="blogCard"
                            onClick={() => handleBlogClick(post)}
                          >
                            <div className="blogImageContainer">
                              <img
                                src={(post.images && post.images[0]) || "/imgs/default-blog.jpg"}
                                alt={post.title}
                                className="blogImage"
                                onError={handleImageError}
                              />
                              <div className="blogCategory">{post.category}</div>
                              {post.images && post.images.length > 1 && (
                                <div className="imageCount">+{post.images.length - 1}</div>
                              )}
                            </div>
                            <div className="blogContent">
                              <h3 className="blogTitle">{post.title}</h3>

                              {post.subtituloDestacado && (
                                <h4 className="blogSubtitle">{post.subtituloDestacado}</h4>
                              )}

                              <p className="blogExcerpt">{post.excerpt}</p>
                              <div className="blogMeta">
                                <span className="blogAuthor">
                                  <FaUser /> {post.author}
                                </span>
                                <span className="blogDate">
                                  <FaCalendarAlt /> {formatDate(post.publishDate)}
                                </span>
                              </div>
                              <button className="readMoreButton">
                                <span>Leer más</span>
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="noBlogMessage">
                        <h3>No hay artículos seleccionados</h3>
                        <p>
                          El administrador no ha seleccionado artículos para mostrar en
                          entretenimiento.
                        </p>
                        {isAdmin && (
                          <p>
                            <strong>
                              Como administrador, puedes seleccionar artículos usando el botón
                              "Gestionar Artículos" arriba.
                            </strong>
                          </p>
                        )}
                      </div>
                    )}

                    {blogData.length > 0 && (
                      <div className="sectionFooter">
                        <button onClick={goToBlog} className="viewMoreButton" type="button">
                          Ver más artículos
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Botón Sticky para Ver Blog - Solo móvil */}
          {showStickyButton && (
            <button
              className="more-content-sticky"
              onClick={scrollToBlog}
              aria-label="Ver blog de TRACTODO"
            >
              <FaBook className="sticky-button-icon" />
              Ver Blog
              <FaArrowDown className="sticky-button-icon" />
            </button>
          )}

          {/* Modal de video/short */}
          {isVideoModalOpen && selectedVideo && (
            <div className="videoModal" onClick={closeVideoModal}>
              <div className="videoModalContent" onClick={(e) => e.stopPropagation()}>
                <button
                  className="videoModalClose"
                  onClick={closeVideoModal}
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
                <div className="videoContainer">
                  {selectedVideo.youtubeId ? (
                    <iframe
                      src={
                        selectedVideo.isShort
                          ? `https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&mute=1`
                          : `https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`
                      }
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="videoErrorContainer">
                      <div>Error al cargar el video</div>
                      <button
                        className="youtubeButton"
                        onClick={() => window.open(selectedVideo.youtubeLink, "_blank")}
                      >
                        Ver en YouTube
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal para mostrar artículo del blog */}
          <BlogPostModal postId={selectedPostId} isOpen={showBlogModal} onClose={handleCloseBlogModal} />
        </main>

        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
}
