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
    console.log('ðŸ§¹ SesiÃ³n limpiada');
  }, []);

  const verificarSesionInicial = useCallback(async () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      console.log('ðŸ” === VERIFICACIÃ“N DE SESIÃ“N INICIAL ===');
      
      const sesionGuardada = localStorage.getItem('adminSession');
      const tiempoSesion = localStorage.getItem('adminSessionTime');
      
      console.log('ðŸ“± Datos en localStorage:', {
        tieneSession: !!sesionGuardada,
        tiempoSesion: tiempoSesion
      });
      
      if (sesionGuardada && tiempoSesion) {
        const ahora = Date.now();
        const tiempoGuardado = parseInt(tiempoSesion);
        const DURACION_SESION = 24 * 60 * 60 * 1000; // 24 horas
        const tiempoTranscurrido = ahora - tiempoGuardado;
        
        if (tiempoTranscurrido < DURACION_SESION) {
          console.log('ðŸ“± SesiÃ³n encontrada y no expirada, verificando con backend...');
          
          try {
            const respuestaAdmin = await verificarAdmin();
            console.log('ðŸ“¡ Resultado de verificaciÃ³n backend:', respuestaAdmin);
            
            if (respuestaAdmin.isAdmin) {
              const datosUsuario = JSON.parse(sesionGuardada);
              setUsuario(datosUsuario);
              setIsAdmin(true);
              console.log('âœ… SESIÃ“N DE ADMINISTRADOR RESTAURADA EXITOSAMENTE');
            } else {
              console.log('âŒ Backend rechazÃ³ la sesiÃ³n de admin');
              limpiarSesion();
            }
          } catch (backendError) {
            console.log('ðŸ”Œ Error verificando admin con backend:', backendError.message);
            limpiarSesion();
          }
        } else {
          console.log('â° SesiÃ³n de admin expirada por tiempo');
          limpiarSesion();
        }
      } else {
        console.log('ðŸ‘¤ No hay sesiÃ³n de admin guardada - iniciando como usuario normal');
      }
    } catch (error) {
      console.error('ðŸ’¥ Error en verificaciÃ³n de sesiÃ³n:', error);
      limpiarSesion();
    } finally {
      setLoading(false);
      console.log('ðŸ VerificaciÃ³n de sesiÃ³n completada');
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
      console.log('ðŸ’¾ === GUARDANDO SESIÃ“N DE ADMIN ===');
      const jsonData = JSON.stringify(datosUsuario);
      const timestamp = Date.now().toString();
      
      localStorage.setItem('adminSession', jsonData);
      localStorage.setItem('adminSessionTime', timestamp);
      
      setUsuario(datosUsuario);
      setIsAdmin(true);
      console.log('ðŸ’¾ === SESIÃ“N GUARDADA EXITOSAMENTE ===');
    } catch (error) {
      console.error('âŒ ERROR al guardar sesiÃ³n:', error);
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      console.log('ðŸ‘‹ Cerrando sesiÃ³n de admin...');
      const { cerrarSesion: cerrarSesionBackend } = require('../services/userService');
      await cerrarSesionBackend();
      console.log('ðŸ”Œ SesiÃ³n cerrada en backend');
    } catch (error) {
      console.error('âš ï¸ Error al cerrar sesiÃ³n en backend:', error);
    } finally {
      limpiarSesion();
      console.log('âœ… SesiÃ³n de admin cerrada completamente');
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