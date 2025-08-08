import './producto-individual.css';
import ProductoIndividualClient from './ProductoIndividualClient';

export const dynamicParams = false;

export default function ProductoIndividualPage({ params }) {
    return <ProductoIndividualClient params={params} />;
}