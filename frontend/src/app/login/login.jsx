'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { iniciarSesion, verificarAdmin } from '../../services/userService';
import './login.css'; // Importa el CSS de la página

export default function Login() {
  const [formData, setFormData] = useState({
    username: '', // CORREGIDO: cambiado de email a username
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { guardarSesion } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const respuestaLogin = await iniciarSesion({
        username: formData.username,
        password: formData.password
      });
      
      if (respuestaLogin.mensaje === "Login exitoso") {
        const respuestaAdmin = await verificarAdmin();
        
        if (respuestaAdmin.isAdmin) {
          guardarSesion({
            username: formData.username,
            isAdmin: true,
            loginTime: new Date().toISOString()
          });
          
          console.log('✅ Login exitoso - Admin autenticado');
          router.push('/');
        } else {
          setError('No tienes permisos de administrador');
        }
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="leftSection">
        <div className="welcomeContent">
          <h1>¡Bienvenido!</h1>
          <p>Ingrese sus datos personales para acceder al panel de administración</p>
          <button 
            className="switchBtn"
            onClick={() => router.push('/')}
          >
            Volver al sitio
          </button>
        </div>
        <div className="decorativeCircle"></div>
      </div>
      
      <div className="rightSection">
        <div className="formContainer">
          <h2>Panel de Administración</h2>
          
          <div className="socialButtons">
            <button className="socialBtn" type="button">
              <i className="fas fa-user-shield"></i>
            </button>
            <button className="socialBtn" type="button">
              <i className="fas fa-cog"></i>
            </button>
            <button className="socialBtn" type="button">
              <i className="fas fa-lock"></i>
            </button>
            <button className="socialBtn" type="button">
              <i className="fas fa-key"></i>
            </button>
          </div>
          
          <p className="formSubtitle">Use su usuario y contraseña de administrador</p>
          
          {error && (
            <div className="errorMessage">
              {error}
            </div>
          )}
          
          <form className="loginForm" onSubmit={handleSubmit}>
            <div className="inputGroup">
              <i className="fas fa-user"></i>
              <input 
                type="text" 
                name="username"
                placeholder="Usuario" 
                value={formData.username}
                onChange={handleChange}
                required 
                disabled={loading}
              />
            </div>
            
            <div className="inputGroup">
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                name="password"
                placeholder="Contraseña" 
                value={formData.password}
                onChange={handleChange}
                required 
                disabled={loading}
              />
            </div>
            
            <button type="button" className="forgotPassword">
              ¿Olvidaste tu contraseña?
            </button>
            
            <button 
              type="submit" 
              className="submitBtn"
              disabled={loading}
            >
              {loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}