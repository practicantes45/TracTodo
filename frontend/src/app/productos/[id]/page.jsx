import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';
import { obtenerProductos } from '../../../services/productoService';

// REMOVER generateStaticParams para deployment de servidor
// export async function generateStaticParams() { ... }

// REMOVER dynamicParams
// export const dynamicParams = false;

export default function ProductoIndividualPage({ params }) {
    return <ProductoIndividualClient params={params} />;
}