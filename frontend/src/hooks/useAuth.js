'use client';
import { useState, useEffect, useContext, createContext } from 'react';
import { verificarAdmin } from '../services/userService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarSesionInicial();
  }, []);

 const verificarSesionInicial = async () => {
  try {
    console.log('🔍 === VERIFICACIÓN DE SESIÓN INICIAL ===');
    
    // PRIMERO: Verificar si hay una sesión de admin guardada en localStorage
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
      
      console.log('⏰ Verificación de tiempo:', {
        tiempoTranscurrido: Math.round(tiempoTranscurrido / (1000 * 60)), // minutos
        limiteTiempo: DURACION_SESION / (1000 * 60 * 60), // horas
        sesionValida: tiempoTranscurrido < DURACION_SESION
      });
      
      // Verificar si la sesión no ha expirado
      if (tiempoTranscurrido < DURACION_SESION) {
        console.log('📱 Sesión encontrada y no expirada, verificando con backend...');
        
        try {
          // VERIFICAR CON EL BACKEND si realmente es admin
          const respuestaAdmin = await verificarAdmin();
          console.log('📡 Resultado de verificación backend:', respuestaAdmin);
          
          if (respuestaAdmin.isAdmin) {
            const datosUsuario = JSON.parse(sesionGuardada);
            console.log('👤 Datos de usuario a restaurar:', datosUsuario);
            
            setUsuario(datosUsuario);
            setIsAdmin(true);
            console.log('✅ SESIÓN DE ADMINISTRADOR RESTAURADA EXITOSAMENTE');
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
};

  const limpiarSesion = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionTime');
    setUsuario(null);
    setIsAdmin(false);
    console.log('🧹 Sesión limpiada');
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
    console.log('💾 === GUARDANDO SESIÓN DE ADMIN ===');
    console.log('📝 Datos a guardar:', datosUsuario);
    
    const jsonData = JSON.stringify(datosUsuario);
    const timestamp = Date.now().toString();
    
    console.log('📱 Guardando en localStorage...');
    localStorage.setItem('adminSession', jsonData);
    localStorage.setItem('adminSessionTime', timestamp);
    
    // Verificar que se guardó
    const verificacion = localStorage.getItem('adminSession');
    console.log('✅ Verificación guardado:', !!verificacion);
    
    setUsuario(datosUsuario);
    setIsAdmin(true);
    console.log('🎯 Estado actualizado - isAdmin:', true);
    console.log('💾 === SESIÓN GUARDADA EXITOSAMENTE ===');
  } catch (error) {
    console.error('❌ ERROR al guardar sesión:', error);
  }
};

  const cerrarSesion = async () => {
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