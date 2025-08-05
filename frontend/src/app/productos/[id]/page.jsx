import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';
import { obtenerProductos } from '../../../services/productoService';

export async function generateStaticParams() {
    try {
        console.log('🔄 Generando parámetros estáticos para productos...');
        const productos = await obtenerProductos();
        
        if (!productos || productos.length === 0) {
            console.warn('⚠️ No se encontraron productos para generar rutas estáticas');
            return [];
        }

        const params = productos.map((producto) => ({
            id: producto.id.toString(),
        }));

        console.log(`✅ Generados ${params.length} parámetros estáticos`);
        return params;
    } catch (error) {
        console.error('❌ Error al generar parámetros estáticos:', error);
        return [];
    }
}

// CAMBIO CRÍTICO: Usar false con output: export
export const dynamicParams = false;

export default function ProductoIndividualPage({ params }) {
    return <ProductoIndividualClient params={params} />;
}