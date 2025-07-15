'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { iniciarSesion } from '../../../services/userService';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './AdminLoginModal.module.css';

export default function AdminLoginModal({ isOpen, onClose }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUsuario, setIsAdmin, verificarUsuario } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Faltan campos requeridos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const respuesta = await iniciarSesion(credentials);
      console.log('Respuesta login:', respuesta);
      
      // Actualizar estado y verificar admin
      await verificarUsuario();
      setIsAdmin(true);
      onClose();
    } catch (error) {
      console.error('Error login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <div className={styles.header}>
            <button 
              className={styles.backButton}
              onClick={onClose}
              type="button"
            >
              ←
            </button>
            <h2 className={styles.title}>Login</h2>
          </div>
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputBox}>
              <input 
                className={styles.input}
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
              <label className={styles.label}>Usuario</label>
            </div>
            
            <div className={styles.inputBox}>
              <input 
                className={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <label className={styles.label}>Password</label>
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <button 
              className={styles.btn} 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Login'}
            </button>
          </form>
        </div>
        
        {[...Array(50)].map((_, i) => (
          <span key={i} style={{'--i': i}} />
        ))}
      </div>
    </div>
  );
}