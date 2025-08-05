import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';
import { obtenerProductos } from '../../../services/productoService';

export const dynamicParams = 'force-dynamic';

export default function ProductoIndividualPage({ params }) {
    return <ProductoIndividualClient params={params} />;
}