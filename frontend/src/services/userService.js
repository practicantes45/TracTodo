import api from './api';

// Registro de usuario - ACTUALIZADO: ahora usa email
export const registrarUsuario = async (datosUsuario) => {
  try {
    // NUEVO: Validación de email
    if (!datosUsuario.email || !datosUsuario.email.includes('@')) {
      throw new Error('Email válido es requerido');
    }
    
    const respuesta = await api.post('/user/registro', datosUsuario);
    return respuesta.data;
  } catch (error) {
    const mensajeError = error.response?.data?.error || error.message;
    console.error("Error en registro:", mensajeError);
    throw new Error(mensajeError);
  }
};

// Inicio de sesión - ACTUALIZADO: ahora usa email
export const iniciarSesion = async (credenciales) => {
  try {
    // NUEVO: Validación de email
    if (!credenciales.email || !credenciales.email.includes('@')) {
      throw new Error('Email válido es requerido');
    }
    
    console.log('📧 Iniciando sesión con email:', credenciales.email);
    const respuesta = await api.post('/user/inicioSesion', credenciales);
    return respuesta.data;
  } catch (error) {
    const mensajeError = error.response?.data?.error || error.message;
    console.error("Error en login:", mensajeError);
    throw new Error(mensajeError);
  }
};

// Verificar si es administrador - MANTENIDO
export const verificarAdmin = async () => {
  try {
    console.log('🔄 Verificando admin con backend...');
    const respuesta = await api.get('/user/administradores');
    
    console.log('📡 Respuesta completa del backend:', {
      status: respuesta.status,
      data: respuesta.data
    });
    
    // El backend devuelve "Admin autorizado" cuando es admin
    // y status 200 cuando es válido
    if (respuesta.status === 200 && respuesta.data === "Admin autorizado") {
      console.log('✅ Backend confirmó que es admin');
      return { isAdmin: true };
    } else {
      console.log('❌ Backend dice que no es admin:', respuesta.data);
      return { isAdmin: false };
    }
  } catch (error) {
    console.error("❌ Error al verificar admin:", error.response?.status, error.response?.data);
    
    // Si es 403 (Admin no autorizado) o 401 (Token inválido), no es admin
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('🚫 Backend rechazó admin - status:', error.response.status);
      return { isAdmin: false };
    }
    
    // Para otros errores (500, network, etc.), asumir no admin
    return { isAdmin: false };
  }
};

// Cerrar sesión - MANTENIDO
export const cerrarSesion = async () => {
  try {
    const respuesta = await api.get('/user/cerrarSesion');
    return respuesta.data;
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};