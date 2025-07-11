import api from './api';

// Registrar una vista (POST - incrementa contador)
export const registrarVista = async () => {
  try {
    console.log('🚀 Enviando registro de vista...');
    const respuesta = await api.post('/vistas/registrar-vista');
    console.log('✅ Vista registrada:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al registrar vista:", error);
    throw error;
  }
};

// Obtener contador actual (GET - no incrementa)
export const obtenerContadorVistas = async () => {
  try {
    console.log('📊 Obteniendo contador...');
    const respuesta = await api.get('/vistas/contador');
    console.log('✅ Contador obtenido:', respuesta.data);
    return respuesta.data;
  } catch (error) {
    console.error("❌ Error al obtener contador:", error);
    throw error;
  }
};