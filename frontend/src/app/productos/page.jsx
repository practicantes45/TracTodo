import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';

// SIMPLIFICADO: generateStaticParams sin dependencias externas
export async function generateStaticParams() {
    try {
        console.log('🔄 Generando parámetros estáticos para productos...');
        
        // Durante build time, no hay backend disponible, así que retornamos array vacío
        // Las rutas se generarán dinámicamente en runtime
        console.log('⚠️ Build time - retornando array vacío, rutas dinámicas en runtime');
        return [];
    } catch (error) {
        console.error('❌ Error al generar parámetros estáticos:', error);
        return [];
    }
}

// IMPORTANTE: Permitir parámetros dinámicos para Railway
export const dynamicParams = true;

export default function ProductoIndividualPage({ params }) {
    return <ProductoIndividualClient params={params} />;
}