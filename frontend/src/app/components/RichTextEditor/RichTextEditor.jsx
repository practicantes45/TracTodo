'use client';
import { useState } from 'react';
import { FaHeading, FaBold, FaItalic, FaEye, FaEdit } from 'react-icons/fa';
import styles from './RichTextEditor.module.css';

const RichTextEditor = ({ value, onChange, placeholder }) => {
    const [isPreview, setIsPreview] = useState(false);

    const insertText = (beforeText, afterText = '', sampleText = '') => {
        const textarea = document.getElementById('contentEditor');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const textToInsert = selectedText || sampleText;
        
        const newText = value.substring(0, start) + 
                       beforeText + textToInsert + afterText + 
                       value.substring(end);
        
        onChange({ target: { name: 'contenido', value: newText } });
        
        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + beforeText.length + textToInsert.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 10);
    };

    const addSubtitle = () => {
        const textarea = document.getElementById('contentEditor');
        const cursorPos = textarea.selectionStart;
        const beforeCursor = value.substring(0, cursorPos);
        const afterCursor = value.substring(cursorPos);
        
        // Verificar si estamos al inicio de una línea
        const needsNewLine = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
        const prefix = needsNewLine ? '\n\n## ' : '## ';
        
        const newText = beforeCursor + prefix + 'Subtítulo' + '\n\n' + afterCursor;
        onChange({ target: { name: 'contenido', value: newText } });
        
        setTimeout(() => {
            textarea.focus();
            const newPos = cursorPos + prefix.length + 'Subtítulo'.length;
            textarea.setSelectionRange(newPos - 'Subtítulo'.length, newPos);
        }, 10);
    };

    const addParagraph = () => {
        const textarea = document.getElementById('contentEditor');
        const cursorPos = textarea.selectionStart;
        const beforeCursor = value.substring(0, cursorPos);
        const afterCursor = value.substring(cursorPos);
        
        const needsNewLine = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
        const prefix = needsNewLine ? '\n\n' : '';
        
        const newText = beforeCursor + prefix + 'Escribe tu párrafo aquí...' + '\n\n' + afterCursor;
        onChange({ target: { name: 'contenido', value: newText } });
        
        setTimeout(() => {
            textarea.focus();
            const startSelection = cursorPos + prefix.length;
            const endSelection = startSelection + 'Escribe tu párrafo aquí...'.length;
            textarea.setSelectionRange(startSelection, endSelection);
        }, 10);
    };

    const formatPreview = (text) => {
        return text
            .replace(/^## (.*$)/gm, '<h2 class="previewSubtitle">$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.*)$/, '<p>$1</p>');
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <button
                        type="button"
                        onClick={addSubtitle}
                        className={styles.toolButton}
                        title="Agregar subtítulo"
                    >
                        <FaHeading /> Subtítulo
                    </button>
                    
                    <button
                        type="button"
                        onClick={addParagraph}
                        className={styles.toolButton}
                        title="Agregar párrafo"
                    >
                        📝 Párrafo
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => insertText('**', '**', 'texto en negrita')}
                        className={styles.toolButton}
                        title="Texto en negrita"
                    >
                        <FaBold />
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => insertText('*', '*', 'texto en cursiva')}
                        className={styles.toolButton}
                        title="Texto en cursiva"
                    >
                        <FaItalic />
                    </button>
                </div>
                
                <div className={styles.toolbarRight}>
                    <button
                        type="button"
                        onClick={() => setIsPreview(!isPreview)}
                        className={`${styles.previewButton} ${isPreview ? styles.active : ''}`}
                        title={isPreview ? "Editar" : "Vista previa"}
                    >
                        {isPreview ? <FaEdit /> : <FaEye />}
                        {isPreview ? 'Editar' : 'Vista previa'}
                    </button>
                </div>
            </div>
            
            <div className={styles.editorContent}>
                {isPreview ? (
                    <div className={styles.preview}>
                        <div 
                            className={styles.previewContent}
                            dangerouslySetInnerHTML={{ 
                                __html: formatPreview(value || 'Escribe algo para ver la vista previa...') 
                            }}
                        />
                    </div>
                ) : (
                    <textarea
                        id="contentEditor"
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={styles.textarea}
                        rows="20"
                    />
                )}
            </div>
            
            <div className={styles.editorFooter}>
                <div className={styles.helpText}>
                    💡 Usa los botones para agregar contenido fácilmente, o escribe directamente usando **negrita** y *cursiva*
                </div>
                <div className={styles.characterCount}>
                    {value ? value.length : 0} caracteres
                </div>
            </div>
        </div>
    );
};

export default RichTextEditor;