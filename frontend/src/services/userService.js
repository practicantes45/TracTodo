import api from './api';

// Registro de usuario
export const registrarUsuario = async (datosUsuario) => {
  try {
    const respuesta = await api.post('/user/registro', datosUsuario);
    return respuesta.data;
  } catch (error) {
    const mensajeError = error.response?.data?.error || error.message;
    console.error("Error en registro:", mensajeError);
    throw new Error(mensajeError);
  }
};

// Inicio de sesión
export const iniciarSesion = async (credenciales) => {
  try {
    const respuesta = await api.post('/user/inicioSesion', credenciales);
    return respuesta.data;
  } catch (error) {
    const mensajeError = error.response?.data?.error || error.message;
    console.error("Error en login:", mensajeError);
    throw new Error(mensajeError);
  }
};

// Verificar si es administrador - CORREGIDO
export const verificarAdmin = async () => {
  try {
    const respuesta = await api.get('/user/administradores');
    
    // CORREGIDO: El backend devuelve el mensaje directo, no un objeto con isAdmin
    if (respuesta.data === "Admin autorizado") {
      return { isAdmin: true };
    } else {
      return { isAdmin: false };
    }
  } catch (error) {
    console.error("Error al verificar admin:", error);
    return { isAdmin: false };
  }
};

// Cerrar sesión
export const cerrarSesion = async () => {
  try {
    const respuesta = await api.get('/user/cerrarSesion');
    return respuesta.data;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};