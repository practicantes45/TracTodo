'use client';
import { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaImage, FaCalendarAlt, FaUser, FaBold, FaItalic, FaHeading, FaEye, FaEyeSlash, FaMinus } from 'react-icons/fa';
import { obtenerPosts, crearPost, actualizarPost, eliminarPost } from '../../../services/blogService';
import styles from './BlogManager.module.css';

const BlogManager = ({ onClose, onUpdate }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        categoria: 'Tracto-Consejos',
        bloques: [
            {
                subtitulo: '',
                texto: '',
                imagen: ''
            }
        ]
    });

    const categorias = [
        'Tracto-Consejos',
        'Tracto-Promociones',
        'Tracto-Casos de Éxito',
        'Tracto-Preguntas Frecuentes'
    ];

    useEffect(() => {
        cargarPosts();
    }, []);

    const cargarPosts = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('📚 Cargando posts para gestión...');

            const postsData = await obtenerPosts();
            setPosts(postsData);
            console.log('✅ Posts cargados para gestión:', postsData);
        } catch (error) {
            console.error('❌ Error al cargar posts:', error);
            setError('Error al cargar los artículos');
        } finally {
            setLoading(false);
        }
    };

    // Funciones del editor de texto para bloques
    const insertarTextoEnBloque = (bloqueIndex, inicio, fin = '', placeholder = '') => {
        const textarea = document.getElementById(`texto-bloque-${bloqueIndex}`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textoSeleccionado = formData.bloques[bloqueIndex].texto.substring(start, end);
        const textoAInsertar = textoSeleccionado || placeholder;

        const antes = formData.bloques[bloqueIndex].texto.substring(0, start);
        const despues = formData.bloques[bloqueIndex].texto.substring(end);
        const nuevoTexto = antes + inicio + textoAInsertar + fin + despues;

        const nuevosBloque = [...formData.bloques];
        nuevosBloque[bloqueIndex].texto = nuevoTexto;
        setFormData(prev => ({ ...prev, bloques: nuevosBloque }));

        setTimeout(() => {
            textarea.focus();
            const nuevaPosicion = start + inicio.length + textoAInsertar.length;
            textarea.setSelectionRange(nuevaPosicion, nuevaPosicion);
        }, 0);
    };

    const formatearNegrita = (bloqueIndex) => {
        insertarTextoEnBloque(bloqueIndex, '**', '**', 'texto en negrita');
    };

    const formatearCursiva = (bloqueIndex) => {
        insertarTextoEnBloque(bloqueIndex, '*', '*', 'texto en cursiva');
    };

    // Funciones para manejar bloques
    const agregarBloque = () => {
        if (formData.bloques.length < 2) {
            setFormData(prev => ({
                ...prev,
                bloques: [...prev.bloques, { subtitulo: '', texto: '', imagen: '' }]
            }));
        }
    };

    const eliminarBloque = (index) => {
        if (formData.bloques.length > 1) {
            const nuevosBloque = formData.bloques.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, bloques: nuevosBloque }));
        }
    };

    const actualizarBloque = (index, campo, valor) => {
        const nuevosBloque = [...formData.bloques];
        nuevosBloque[index][campo] = valor;
        setFormData(prev => ({ ...prev, bloques: nuevosBloque }));
    };

    // Función para renderizar vista previa de bloques
    const renderizarVistaPreviaBloque = (bloque) => {
        let contenido = bloque.texto
            .replace(/\*\*(.*?)\*\*/g, '<strong class="preview-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="preview-italic">$1</em>')
            .replace(/\n/g, '<br>');

        return `
            <div class="preview-bloque">
                <h3 class="preview-subtitulo">${bloque.subtitulo || 'Subtítulo del bloque'}</h3>
                <div class="preview-content">
                    <div class="preview-texto">${contenido || 'Texto del bloque...'}</div>
                    <div class="preview-imagen-container">
                        ${bloque.imagen ?
                `<img src="${bloque.imagen}" alt="Vista previa" class="preview-imagen" />` :
                '<div class="preview-placeholder">Imagen del bloque</div>'
            }
                    </div>
                </div>
            </div>
        `;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            console.log('🔍 Iniciando validaciones...');
            console.log('📋 Datos del formulario:', formData);

            // VALIDACIONES PASO A PASO CON LOGGING
            if (!formData.titulo || !formData.titulo.trim()) {
                console.error('❌ Validación falló: título vacío');
                setError('El título es obligatorio');
                return;
            }
            console.log('✅ Título válido:', formData.titulo);

            if (!formData.categoria) {
                console.error('❌ Validación falló: categoría vacía');
                setError('La categoría es obligatoria');
                return;
            }
            console.log('✅ Categoría válida:', formData.categoria);

            if (!categorias.includes(formData.categoria)) {
                console.error('❌ Validación falló: categoría no válida');
                setError('La categoría seleccionada no es válida');
                return;
            }
            console.log('✅ Categoría permitida');

            if (!formData.bloques || formData.bloques.length === 0) {
                console.error('❌ Validación falló: sin bloques');
                setError('Se requiere al menos un bloque de contenido');
                return;
            }
            console.log('✅ Tiene bloques:', formData.bloques.length);

            // Validar primer bloque (obligatorio)
            const primerBloque = formData.bloques[0];
            console.log('🔍 Validando primer bloque:', primerBloque);

            if (!primerBloque.subtitulo || !primerBloque.subtitulo.trim()) {
                console.error('❌ Primer bloque: subtítulo vacío');
                setError('El subtítulo del primer bloque es obligatorio');
                return;
            }
            if (!primerBloque.texto || !primerBloque.texto.trim()) {
                console.error('❌ Primer bloque: texto vacío');
                setError('El texto del primer bloque es obligatorio');
                return;
            }
            if (!primerBloque.imagen || !primerBloque.imagen.trim()) {
                console.error('❌ Primer bloque: imagen vacía');
                setError('La imagen del primer bloque es obligatoria');
                return;
            }
            console.log('✅ Primer bloque válido');

            // Validar segundo bloque si existe y tiene contenido
            let bloquesValidos = [primerBloque];
            if (formData.bloques.length > 1) {
                const segundoBloque = formData.bloques[1];
                console.log('🔍 Validando segundo bloque:', segundoBloque);

                const tieneContenido = segundoBloque.subtitulo.trim() ||
                    segundoBloque.texto.trim() ||
                    segundoBloque.imagen.trim();

                if (tieneContenido) {
                    console.log('📝 Segundo bloque tiene contenido, validando...');
                    // Si tiene algún contenido, validar que tenga todo
                    if (!segundoBloque.subtitulo.trim()) {
                        console.error('❌ Segundo bloque: subtítulo vacío');
                        setError('El subtítulo del segundo bloque es obligatorio si se agrega contenido');
                        return;
                    }
                    if (!segundoBloque.texto.trim()) {
                        console.error('❌ Segundo bloque: texto vacío');
                        setError('El texto del segundo bloque es obligatorio si se agrega contenido');
                        return;
                    }
                    if (!segundoBloque.imagen.trim()) {
                        console.error('❌ Segundo bloque: imagen vacía');
                        setError('La imagen del segundo bloque es obligatoria si se agrega contenido');
                        return;
                    }
                    bloquesValidos.push(segundoBloque);
                    console.log('✅ Segundo bloque válido y agregado');
                } else {
                    console.log('ℹ️ Segundo bloque vacío, no se incluirá');
                }
            }

            // Preparar datos para enviar - ESTRUCTURA EXACTA QUE ESPERA EL BACKEND
            const postData = {
                titulo: formData.titulo.trim(),
                categoria: formData.categoria,
                bloques: bloquesValidos.map(bloque => ({
                    subtitulo: bloque.subtitulo.trim(),
                    texto: bloque.texto.trim(),
                    imagen: bloque.imagen.trim()
                }))
            };

            console.log('📤 Datos finales a enviar:', JSON.stringify(postData, null, 2));
            console.log('🔢 Número de bloques válidos:', postData.bloques.length);

            if (editingPost) {
                console.log('📝 Actualizando post:', editingPost.id);
                const resultado = await actualizarPost(editingPost.id, postData);
                console.log('✅ Resultado actualización:', resultado);
                setSuccess('Artículo actualizado exitosamente');
            } else {
                console.log('➕ Creando nuevo post');
                const resultado = await crearPost(postData);
                console.log('✅ Resultado creación:', resultado);
                setSuccess('Artículo creado exitosamente');
            }

            await cargarPosts();
            cerrarModal();

            if (onUpdate) {
                setTimeout(() => onUpdate(), 500);
            }
        } catch (error) {
            console.error('❌ Error completo:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);

            // Manejar errores específicos del backend
            if (error.response?.data?.mensaje) {
                setError(`Error del servidor: ${error.response.data.mensaje}`);
            } else if (error.response?.data?.detalles) {
                setError(`Detalles del error: ${error.response.data.detalles}`);
            } else if (error.message) {
                setError(`Error: ${error.message}`);
            } else {
                setError('Error desconocido al guardar el artículo. Revisa la consola para más detalles.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId, postTitle) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar "${postTitle}"?`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            console.log('🗑️ Eliminando post:', postId);
            await eliminarPost(postId);
            setSuccess('Artículo eliminado exitosamente');

            await cargarPosts();

            if (onUpdate) {
                setTimeout(() => onUpdate(), 500);
            }
        } catch (error) {
            console.error('❌ Error al eliminar post:', error);
            setError(error.response?.data?.mensaje || 'Error al eliminar el artículo');
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (post = null) => {
        if (post) {
            setEditingPost(post);

            let bloques = [];

            // PRIORIZAR SIEMPRE LA ESTRUCTURA DE BLOQUES SI EXISTE
            if (post.bloques && Array.isArray(post.bloques) && post.bloques.length > 0) {
                console.log('✅ Usando estructura de bloques existente:', post.bloques);
                bloques = post.bloques.map(bloque => ({
                    subtitulo: bloque.subtitulo || '',
                    texto: bloque.texto || '',
                    imagen: bloque.imagen || ''
                }));
            } else {
                // FALLBACK PARA DATOS MUY ANTIGUOS - PARSEAR CONTENIDO MARKDOWN
                console.log('🔄 Parseando contenido markdown antiguo...');
                const contenido = post.contenido || post.content || '';
                const imagenes = post.imagenes || post.images || [];

                if (contenido) {
                    // Intentar parsear el contenido markdown para extraer bloques
                    const bloquesParsed = parsearContenidoMarkdown(contenido, imagenes);
                    if (bloquesParsed.length > 0) {
                        bloques = bloquesParsed;
                    } else {
                        // Si no se puede parsear, crear bloque básico
                        bloques.push({
                            subtitulo: 'Contenido principal',
                            texto: contenido,
                            imagen: imagenes[0] || ''
                        });
                    }
                } else {
                    // Crear bloque vacío si no hay contenido
                    bloques.push({
                        subtitulo: '',
                        texto: '',
                        imagen: imagenes[0] || ''
                    });
                }
            }

            // Asegurar que hay al menos un bloque
            if (bloques.length === 0) {
                bloques.push({
                    subtitulo: '',
                    texto: '',
                    imagen: ''
                });
            }

            setFormData({
                titulo: post.titulo || post.title || '',
                categoria: post.categoria || post.category || 'Tracto-Consejos',
                bloques: bloques
            });
        } else {
            setEditingPost(null);
            setFormData({
                titulo: '',
                categoria: 'Tracto-Consejos',
                bloques: [
                    {
                        subtitulo: '',
                        texto: '',
                        imagen: ''
                    }
                ]
            });
        }
        setShowModal(true);
        setShowPreview(false);
        setError('');
        setSuccess('');
    };

    // Función auxiliar para parsear contenido markdown y extraer bloques
    const parsearContenidoMarkdown = (contenido, imagenes = []) => {
        const bloques = [];

        // Dividir el contenido por subtítulos markdown (##)
        const seccionesRegex = /^## (.+?)$([\s\S]*?)(?=^## |$)/gm;
        let match;
        let imagenIndex = 0;

        while ((match = seccionesRegex.exec(contenido)) !== null) {
            const subtitulo = match[1].trim();
            const texto = match[2].trim().replace(/\n+/g, '\n').replace(/^\n|\n$/g, '');

            if (subtitulo && texto) {
                bloques.push({
                    subtitulo: subtitulo,
                    texto: texto,
                    imagen: imagenes[imagenIndex] || ''
                });
                imagenIndex++;
            }
        }

        return bloques;
    };

    const cerrarModal = () => {
        setShowModal(false);
        setEditingPost(null);
        setShowPreview(false);
        setFormData({
            titulo: '',
            categoria: 'Tracto-Consejos',
            bloques: [
                {
                    subtitulo: '',
                    texto: '',
                    imagen: ''
                }
            ]
        });
        setError('');
        setSuccess('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.blogManagerOverlay}>
            <div className={styles.blogManagerContainer}>
                <div className={styles.blogManagerHeader}>
                    <h2>Gestión del Blog</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        title="Cerrar"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.blogManagerContent}>
                    <div className={styles.actionButtons}>
                        <button
                            onClick={() => abrirModal()}
                            className={styles.addButton}
                            disabled={loading}
                        >
                            <FaPlus /> Agregar Artículo
                        </button>
                    </div>

                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    <div className={styles.postsContainer}>
                        {loading ? (
                            <div className={styles.loadingMessage}>
                                <p>Cargando artículos...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className={styles.emptyMessage}>
                                <p>No hay artículos publicados</p>
                                <p>Usa el botón "Agregar Artículo" para crear el primero</p>
                            </div>
                        ) : (
                            <div className={styles.postsList}>
                                {posts.map((post) => (
                                    <div key={post.id} className={styles.postItem}>
                                        <div className={styles.postItemImage}>
                                            <img
                                                src={(post.imagenes && post.imagenes[0]) || (post.bloques && post.bloques[0]?.imagen) || post.imagenUrl || post.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc>'}
                                                alt={post.titulo || post.title}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDE1MCA3NUwyNTAgNzVMMjAwIDEwMFoiIGZpbGw9IiNEMUQ1REIiLz4KPGV4dCB4PSIyMDAiIHk9IjEzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjU3Mzg5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZW4gbm8gZW5jb250cmFkYTwvdGV4dD4KPC9zdmc>';
                                                }}
                                            />
                                        </div>
                                        <div className={styles.postItemContent}>
                                            <h3>{post.titulo || post.title}</h3>
                                            <p className={styles.postItemExcerpt}>
                                                {(post.contenido || post.content || '').substring(0, 100)}...
                                            </p>
                                            <div className={styles.postItemMeta}>
                                                <span className={styles.postDate}>
                                                    <FaCalendarAlt /> {formatDate(post.fechaPublicacion || post.fecha || post.publishDate)}
                                                </span>
                                                <span className={styles.postAuthor}>
                                                    <FaUser /> {post.autor || 'TracTodo'}
                                                </span>
                                                <span className={styles.postCategory}>
                                                    {post.categoria || post.category || 'Sin categoría'}
                                                </span>
                                            </div>
                                            {((post.bloques && post.bloques.length) || (post.imagenes && post.imagenes.length)) && (
                                                <div className={styles.imageCount}>
                                                    <FaImage /> {post.bloques ? post.bloques.length : (post.imagenes ? post.imagenes.length : 0)} bloques
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.postItemActions}>
                                            <button
                                                onClick={() => abrirModal(post)}
                                                className={styles.editButton}
                                                title="Editar artículo"
                                                disabled={loading}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id, post.titulo || post.title)}
                                                className={styles.deleteButton}
                                                title="Eliminar artículo"
                                                disabled={loading}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para crear/editar artículo */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContainer}>
                        <div className={styles.modalHeader}>
                            <h3>{editingPost ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
                            <button
                                onClick={cerrarModal}
                                className={styles.modalCloseButton}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formGroup}>
                                <label htmlFor="titulo">
                                    <FaHeading /> Título *
                                </label>
                                <input
                                    type="text"
                                    id="titulo"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Título del artículo"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="categoria">
                                    📂 Categoría *
                                </label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* SECCIÓN DE BLOQUES DE CONTENIDO */}
                            <div className={styles.formGroup}>
                                <label>
                                    📝 Bloques de Contenido *
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className={`${styles.previewToggle} ${showPreview ? styles.active : ''}`}
                                        title={showPreview ? 'Ocultar vista previa' : 'Ver vista previa'}
                                    >
                                        {showPreview ? <FaEyeSlash /> : <FaEye />}
                                        {showPreview ? ' Ocultar vista previa' : ' Ver vista previa'}
                                    </button>
                                </label>

                                {!showPreview ? (
                                    <div className={styles.bloquesContainer}>
                                        {formData.bloques.map((bloque, index) => (
                                            <div key={index} className={styles.bloqueEditor}>
                                                <div className={styles.bloqueHeader}>
                                                    <h4>Bloque {index + 1} {index === 0 ? '(Obligatorio)' : '(Opcional)'}</h4>
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarBloque(index)}
                                                            className={styles.eliminarBloqueButton}
                                                            title="Eliminar bloque"
                                                        >
                                                            <FaMinus />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className={styles.bloqueFields}>
                                                    {/* Subtítulo */}
                                                    <div className={styles.bloqueField}>
                                                        <label>
                                                            <FaHeading /> Subtítulo {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={bloque.subtitulo}
                                                            onChange={(e) => actualizarBloque(index, 'subtitulo', e.target.value)}
                                                            placeholder={`Subtítulo del bloque ${index + 1}`}
                                                            required={index === 0}
                                                        />
                                                    </div>

                                                    {/* Texto con herramientas */}
                                                    <div className={styles.bloqueField}>
                                                        <label>📝 Texto {index === 0 ? '*' : ''}</label>
                                                        <div className={styles.editorToolbar}>
                                                            <button
                                                                type="button"
                                                                onClick={() => formatearNegrita(index)}
                                                                className={styles.toolbarButton}
                                                                title="Texto en negrita"
                                                            >
                                                                <FaBold />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => formatearCursiva(index)}
                                                                className={styles.toolbarButton}
                                                                title="Texto en cursiva"
                                                            >
                                                                <FaItalic />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            id={`texto-bloque-${index}`}
                                                            value={bloque.texto}
                                                            onChange={(e) => actualizarBloque(index, 'texto', e.target.value)}
                                                            placeholder={`Contenido del bloque ${index + 1}...`}
                                                            rows="6"
                                                            required={index === 0}
                                                        />
                                                    </div>

                                                    {/* Imagen */}
                                                    <div className={styles.bloqueField}>
                                                        <label>
                                                            <FaImage /> URL de la Imagen {index === 0 ? '*' : ''}
                                                        </label>
                                                        <input
                                                            type="url"
                                                            value={bloque.imagen}
                                                            onChange={(e) => actualizarBloque(index, 'imagen', e.target.value)}
                                                            placeholder={`https://ejemplo.com/imagen${index + 1}.jpg`}
                                                            required={index === 0}
                                                        />
                                                        {bloque.imagen && (
                                                            <div className={styles.imagenPreview}>
                                                                <img
                                                                    src={bloque.imagen}
                                                                    alt="Vista previa"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Botón para agregar segundo bloque */}
                                        {formData.bloques.length < 2 && (
                                            <div className={styles.agregarBloqueContainer}>
                                                <button
                                                    type="button"
                                                    onClick={agregarBloque}
                                                    className={styles.agregarBloqueButton}
                                                >
                                                    <FaPlus /> Agregar segundo bloque (opcional)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles.bloquesPreview}>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: formData.bloques
                                                    .filter(bloque => bloque.subtitulo || bloque.texto || bloque.imagen)
                                                    .map(bloque => renderizarVistaPreviaBloque(bloque))
                                                    .join('') || '<p class="preview-empty">Agrega contenido para ver la vista previa...</p>'
                                            }}
                                        />
                                    </div>
                                )}

                                <small className={styles.contentHelp}>
                                    <strong>💡 Instrucciones importantes:</strong>
                                    <br />• <strong>Primer bloque:</strong> Título, subtítulo, texto e imagen son OBLIGATORIOS
                                    <br />• <strong>Segundo bloque:</strong> Completamente opcional, pero si agregas contenido, todos los campos son obligatorios
                                    <br />• <strong>Formato:</strong> Usa **texto** para negrita y *texto* para cursiva
                                    <br />• <strong>Imágenes:</strong> Deben ser URLs válidas (https://...)
                                    <br />• <strong>Vista previa:</strong> Alterna entre edición y vista previa para verificar el resultado
                                </small>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className={styles.cancelButton}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.saveButton}
                                    disabled={loading}
                                >
                                    <FaSave />
                                    {loading ? 'Guardando...' : (editingPost ? 'Actualizar Artículo' : 'Crear Artículo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManager;