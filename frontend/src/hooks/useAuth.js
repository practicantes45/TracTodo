'use client';
import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { verificarAdmin } from '../services/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const limpiarSesion = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminSession');
      localStorage.removeItem('adminSessionTime');
    }
    setUsuario(null);
    setIsAdmin(false);
    console.log('🧹 Sesión limpiada');
  }, []);

  const verificarSesionInicial = useCallback(async () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 === VERIFICACIÓN DE SESIÓN INICIAL ===');
      
      const sesionGuardada = localStorage.getItem('adminSession');
      const tiempoSesion = localStorage.getItem('adminSessionTime');
      
      console.log('📱 Datos en localStorage:', {
        tieneSession: !!sesionGuardada,
        tiempoSesion: tiempoSesion
      });
      
      if (sesionGuardada && tiempoSesion) {
        const ahora = Date.now();
        const tiempoGuardado = parseInt(tiempoSesion);
        const DURACION_SESION = 24 * 60 * 60 * 1000; // 24 horas
        const tiempoTranscurrido = ahora - tiempoGuardado;
        
        if (tiempoTranscurrido < DURACION_SESION) {
          console.log('📱 Sesión encontrada y no expirada, verificando con backend...');
          
          try {
            const respuestaAdmin = await verificarAdmin();
            console.log('📡 Resultado de verificación backend:', respuestaAdmin);
            
            if (respuestaAdmin.isAdmin) {
              const datosUsuario = JSON.parse(sesionGuardada);
              setUsuario(datosUsuario);
              setIsAdmin(true);
              console.log('✅ SESIÓN DE ADMINISTRADOR RESTAURADA EXITOSAMENTE');
              console.log('📧 Usuario:', datosUsuario.email || datosUsuario.username); // CAMBIO: mostrar email preferentemente
            } else {
              console.log('❌ Backend rechazó la sesión de admin');
              limpiarSesion();
            }
          } catch (backendError) {
            console.log('🔌 Error verificando admin con backend:', backendError.message);
            limpiarSesion();
          }
        } else {
          console.log('⏰ Sesión de admin expirada por tiempo');
          limpiarSesion();
        }
      } else {
        console.log('👤 No hay sesión de admin guardada - iniciando como usuario normal');
      }
    } catch (error) {
      console.error('💥 Error en verificación de sesión:', error);
      limpiarSesion();
    } finally {
      setLoading(false);
      console.log('🏁 Verificación de sesión completada');
    }
  }, [limpiarSesion]);

  useEffect(() => {
    verificarSesionInicial();
  }, [verificarSesionInicial]);

  const verificarUsuario = useCallback(async () => {
    try {
      const respuesta = await verificarAdmin();
      return respuesta.isAdmin;
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      return false;
    }
  }, []);

  const guardarSesion = useCallback((datosUsuario) => {
    if (typeof window === 'undefined') return;

    try {
      console.log('💾 === GUARDANDO SESIÓN DE ADMIN ===');
      
      // NUEVO: Asegurar que tenemos email y username
      const usuarioCompleto = {
        ...datosUsuario,
        email: datosUsuario.email || datosUsuario.username, // fallback
        username: datosUsuario.username || datosUsuario.email?.split('@')[0] || 'admin' // generar username si no existe
      };
      
      const jsonData = JSON.stringify(usuarioCompleto);
      const timestamp = Date.now().toString();
      
      localStorage.setItem('adminSession', jsonData);
      localStorage.setItem('adminSessionTime', timestamp);
      
      setUsuario(usuarioCompleto);
      setIsAdmin(true);
      console.log('💾 === SESIÓN GUARDADA EXITOSAMENTE ===');
      console.log('📧 Email:', usuarioCompleto.email);
    } catch (error) {
      console.error('❌ ERROR al guardar sesión:', error);
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      console.log('👋 Cerrando sesión de admin...');
      const { cerrarSesion: cerrarSesionBackend } = require('../services/userService');
      await cerrarSesionBackend();
      console.log('🔌 Sesión cerrada en backend');
    } catch (error) {
      console.error('⚠️ Error al cerrar sesión en backend:', error);
    } finally {
      limpiarSesion();
      console.log('✅ Sesión de admin cerrada completamente');
    }
  }, [limpiarSesion]);

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