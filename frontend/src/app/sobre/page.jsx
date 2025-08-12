import { Suspense } from 'react';
import { generatePageMetadata } from '../../utils/metadataUtils';
import SobreClient from './SobreClient';

// AGREGAR METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('sobre', { path: '/sobre' });
}

export default function SobrePageWrapper() {
  return (
    <Suspense fallback={<div>Cargando sobre...</div>}>
      <SobreClient />
    </Suspense>
  );
}