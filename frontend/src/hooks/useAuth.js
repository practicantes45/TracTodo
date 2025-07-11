import { useState, useEffect, createContext, useContext } from 'react';
import { verificarAdmin, cerrarSesion as logout } from '../services/userService';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarUsuario();
  }, []);

  const verificarUsuario = async () => {
    try {
      const token = Cookies.get('token');
      if (token) {
        const respuesta = await verificarAdmin();
        setIsAdmin(respuesta.isAdmin || false);
        setUsuario({ token });
      }
    } catch (error) {
      console.error("Error verificando usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await logout();
      setUsuario(null);
      setIsAdmin(false);
      Cookies.remove('token');
      window.location.href = '/';
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      isAdmin,
      loading,
      setUsuario,
      setIsAdmin,
      cerrarSesion,
      verificarUsuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};