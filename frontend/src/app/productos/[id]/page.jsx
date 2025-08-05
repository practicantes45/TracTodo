import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';
import { obtenerProductos } from '../../../services/productoService';

export async function generateStaticParams() {
    try {
        console.log('🔄 Generando parámetros estáticos para productos...');
        
        // Usar URL de producción para build
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tractodo-production.up.railway.app/api';
        const response = await fetch(`${apiUrl}/productos`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            console.warn('⚠️ No se pudieron obtener productos para build estático');
            return [];
        }
        
        const productos = await response.json();
        
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

// CAMBIO: Permitir parámetros dinámicos para Railway
export const dynamicParams = true;

export default function ProductoIndividualPage({ params }) {
    return <ProductoIndividualClient params={params} />;
}