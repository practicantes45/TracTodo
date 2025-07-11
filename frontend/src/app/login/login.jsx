'use client';
import { useState } from 'react';
import styles from './Login.module.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.welcomeContent}>
          <h1>¡Bienvenido!</h1>
          <p>Ingrese sus datos personales para usar todas las funciones del sitio</p>
          <button className={styles.switchBtn}>Registrarse</button>
        </div>
        <div className={styles.decorativeCircle}></div>
      </div>
      
      <div className={styles.rightSection}>
        <div className={styles.formContainer}>
          <h2>Iniciar Sesión</h2>
          
          <div className={styles.socialButtons}>
            <button className={styles.socialBtn}>
              <i className="fab fa-twitch"></i>
            </button>
            <button className={styles.socialBtn}>
              <i className="fab fa-twitter"></i>
            </button>
            <button className={styles.socialBtn}>
              <i className="fab fa-instagram"></i>
            </button>
            <button className={styles.socialBtn}>
              <i className="fab fa-tiktok"></i>
            </button>
          </div>
          
          <p className={styles.formSubtitle}>Use su correo y contraseña</p>
          
          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <i className="fas fa-envelope"></i>
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className={styles.inputGroup}>
              <i className="fas fa-lock"></i>
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
            
            <button type="button" className={styles.forgotPassword}>
              ¿Olvidaste tu contraseña?
            </button>
            
            <button type="submit" className={styles.submitBtn}>
              INICIAR SESIÓN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}