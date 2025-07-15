'use client';
import { useState, useEffect, useContext, createContext } from 'react';
import { verificarAdmin } from '../services/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar la aplicación
  useEffect(() => {
    verificarSesionInicial();
  }, []);

  const verificarSesionInicial = async () => {
    try {
      console.log('🔍 Verificando sesión inicial...');
      
      // PRIMERA PRIORIDAD: Verificar si hay token válido en cookies del backend
      const respuestaAdmin = await verificarAdmin();
      
      if (respuestaAdmin.isAdmin) {
        // Hay token válido en el backend, restaurar sesión
        const datosUsuario = {
          isAdmin: true,
          loginTime: new Date().toISOString()
        };
        
        setUsuario(datosUsuario);
        setIsAdmin(true);
        
        // Guardar en localStorage para coherencia
        localStorage.setItem('adminSession', JSON.stringify(datosUsuario));
        localStorage.setItem('adminSessionTime', Date.now().toString());
        
        console.log('✅ Sesión de administrador verificada con backend');
        return;
      }
      
      // SEGUNDA OPCIÓN: Verificar localStorage (por si falló la verificación)
      const sesionGuardada = localStorage.getItem('adminSession');
      const tiempoSesion = localStorage.getItem('adminSessionTime');
      
      if (sesionGuardada && tiempoSesion) {
        const ahora = Date.now();
        const tiempoGuardado = parseInt(tiempoSesion);
        const DURACION_SESION = 24 * 60 * 60 * 1000; // 24 horas
        
        if (ahora - tiempoGuardado < DURACION_SESION) {
          const datosUsuario = JSON.parse(sesionGuardada);
          setUsuario(datosUsuario);
          setIsAdmin(true);
          console.log('✅ Sesión restaurada desde localStorage');
          return;
        } else {
          // Sesión expirada
          localStorage.removeItem('adminSession');
          localStorage.removeItem('adminSessionTime');
          console.log('⏰ Sesión expirada, requiere nuevo login');
        }
      }
      
      console.log('❌ No hay sesión válida');
      
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      // Limpiar localStorage si hay error
      localStorage.removeItem('adminSession');
      localStorage.removeItem('adminSessionTime');
    } finally {
      setLoading(false);
    }
  };

  const verificarUsuario = async () => {
    try {
      const respuesta = await verificarAdmin();
      return respuesta.isAdmin;
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      return false;
    }
  };

  const guardarSesion = (datosUsuario) => {
    try {
      localStorage.setItem('adminSession', JSON.stringify(datosUsuario));
      localStorage.setItem('adminSessionTime', Date.now().toString());
      setUsuario(datosUsuario);
      setIsAdmin(true);
      console.log('💾 Sesión de administrador guardada');
    } catch (error) {
      console.error('Error al guardar sesión:', error);
    }
  };

  const cerrarSesion = () => {
    try {
      localStorage.removeItem('adminSession');
      localStorage.removeItem('adminSessionTime');
      setUsuario(null);
      setIsAdmin(false);
      console.log('👋 Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    usuario,
    setUsuario,
    isAdmin,
    setIsAdmin,
    loading,
    verificarUsuario,
    guardarSesion,
    cerrarSesion
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}