import { Suspense } from 'react';
import { generatePageMetadata } from '../../utils/metadataUtils';
import ProductosClient from './ProductosClient';
import ProductosOverrides from './ProductosOverrides';

// AGREGAR METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('productos', { path: '/productos' });
}

export default function ProductosPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ProductosOverrides>
        <ProductosClient />
      </ProductosOverrides>
    </Suspense>
  );
}
