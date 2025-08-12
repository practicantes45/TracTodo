'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { iniciarSesion, verificarAdmin } from '../../../services/userService';
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
  const { guardarSesion } = useAuth();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  // FUNCIÓN PARA VERIFICAR ADMIN CON REINTENTOS
  const verificarAdminConReintentos = async (maxIntentos = 3) => {
    for (let intento = 1; intento <= maxIntentos; intento++) {
      console.log(`🔄 Intento ${intento}/${maxIntentos} - Verificando admin...`);
      
      try {
        const respuestaAdmin = await verificarAdmin();
        console.log(`📡 Respuesta admin intento ${intento}:`, respuestaAdmin);
        
        if (respuestaAdmin.isAdmin) {
          console.log(`✅ Admin verificado en intento ${intento}`);
          return respuestaAdmin;
        }
      } catch (error) {
        console.log(`❌ Error en intento ${intento}:`, error.message);
      }
      
      // Si no es el último intento, esperar antes del siguiente
      if (intento < maxIntentos) {
        const delay = intento * 2000; // 2s, 4s, 6s...
        console.log(`⏰ Esperando ${delay/1000}s antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('❌ Todos los intentos fallaron');
    return { isAdmin: false };
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
      console.log('🔐 === MODAL LOGIN - INICIANDO ===');
      console.log('👤 Usuario:', credentials.username);

      const respuestaLogin = await iniciarSesion(credentials);
      console.log('📡 Respuesta login modal:', respuestaLogin);
      
      if (respuestaLogin.mensaje === "Login exitoso") {
        console.log('✅ Login exitoso - esperando propagación de cookies...');
        
        // DELAY INICIAL MÁS LARGO PARA RAILWAY
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('⏰ Delay inicial completado - iniciando verificación con reintentos...');
        
        const respuestaAdmin = await verificarAdminConReintentos(3);
        
        if (respuestaAdmin.isAdmin) {
          const datosUsuario = {
            username: credentials.username,
            isAdmin: true,
            loginTime: new Date().toISOString()
          };
          
          console.log('💾 MODAL - Guardando sesión admin:', datosUsuario);
          guardarSesion(datosUsuario);
          
          console.log('✅ MODAL - Admin autenticado, cerrando modal');
          onClose();
        } else {
          console.log('❌ MODAL - No es admin después de todos los intentos');
          setError('No tienes permisos de administrador o error de conexión');
        }
      } else {
        console.log('❌ MODAL - Login falló');
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('❌ MODAL - Error login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
      console.log('🏁 MODAL - Proceso terminado');
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
            <h2 className={styles.title}>Exclusivo</h2>
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