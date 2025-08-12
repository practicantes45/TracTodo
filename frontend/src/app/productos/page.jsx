import { Suspense } from 'react';
import { generatePageMetadata } from '../../utils/metadataUtils';
import ProductosClient from './ProductosClient';

// AGREGAR METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('productos', { path: '/productos' });
}

export default function ProductosPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando productos...</div>}>
      <ProductosClient />
    </Suspense>
  );
}