'use client';
import { useMemo } from 'react';
import styles from './FormattedDescription.module.css';

export default function FormattedDescription({ description, className = '' }) {
  const formattedContent = useMemo(() => {
    if (!description || typeof description !== 'string') {
      return null;
    }

    // Dividir por líneas y filtrar líneas vacías
    const lines = description.split('\n').filter(line => line.trim() !== '');
    const elements = [];
    let currentListItems = [];
    let elementKey = 0;

    const flushListItems = () => {
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`list-${elementKey++}`} className={styles.advantagesList}>
            {currentListItems.map((item, index) => (
              <li key={index} className={styles.advantageItem}>
                {item}
              </li>
            ))}
          </ul>
        );
        currentListItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detectar encabezados (líneas que terminan con ":")
      if (trimmedLine.endsWith(':') && trimmedLine.length > 1) {
        flushListItems();
        elements.push(
          <h4 key={`heading-${elementKey++}`} className={styles.sectionHeading}>
            {trimmedLine}
          </h4>
        );
      }
      // Detectar elementos de lista (líneas que empiezan con "* ")
      else if (trimmedLine.startsWith('* ')) {
        const listItemText = trimmedLine.substring(2).trim();
        currentListItems.push(listItemText);
      }
      // Párrafos normales
      else if (trimmedLine.length > 0) {
        flushListItems();
        elements.push(
          <p key={`paragraph-${elementKey++}`} className={styles.paragraph}>
            {trimmedLine}
          </p>
        );
      }
    });

    // Flush any remaining list items
    flushListItems();

    return elements;
  }, [description]);

  if (!formattedContent || formattedContent.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <p className={styles.paragraph}>No hay descripción disponible</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {formattedContent}
    </div>
  );
}