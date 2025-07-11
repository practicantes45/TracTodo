'use client';
import { useState } from 'react';
import styles from './Register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
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
    console.log('Register:', formData);
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.formContainer}>
          <h2>Registrarse</h2>
          
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
          
          <p className={styles.formSubtitle}>Use su correo electrónico para registrarse</p>
          
          <form className={styles.registerForm} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <i className="fas fa-user"></i>
              <input 
                type="text" 
                name="name"
                placeholder="Nombre" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            
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
            
            <button type="submit" className={styles.submitBtn}>
              REGISTRARSE
            </button>
          </form>
        </div>
      </div>
      
      <div className={styles.rightSection}>
        <div className={styles.welcomeContent}>
          <h1>¡Hola!</h1>
          <p>Regístrese con sus datos personales para usar todas las funciones del sitio</p>
          <button className={styles.switchBtn}>Iniciar Sesión</button>
        </div>
        <div className={styles.decorativeCircle}></div>
      </div>
    </div>
  );
}