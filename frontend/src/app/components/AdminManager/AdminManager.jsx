'use client';
import { useState } from 'react';
import { verificarAdmin } from '../../../services/userService';
import { useAuth } from '../../../hooks/useAuth';
import styles from './AdminManager.module.css';

export default function AdminManager() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  const handleConvertToAdmin = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setMessage('Por favor ingresa un nombre de usuario');
      return;
    }

    setLoading(true);
    try {
      // Aquí necesitarías crear un endpoint en el backend para esto
      const response = await fetch('/api/user/convertir-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim() })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Usuario ${username} convertido a admin exitosamente`);
        setUsername('');
      } else {
        setMessage(`❌ Error: ${result.error || 'No se pudo convertir el usuario'}`);
      }
    } catch (error) {
      setMessage(`❌ Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Gestión de Administradores</h3>
      
      <form className={styles.form} onSubmit={handleConvertToAdmin}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Convertir usuario en admin:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className={styles.input}
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className={styles.button}
          disabled={loading || !username.trim()}
        >
          {loading ? 'Convirtiendo...' : 'Convertir a Admin'}
        </button>
      </form>

      {message && (
        <div className={`${styles.message} ${message.includes('✅') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}
    </div>
  );
}