// src/app/productos/page.jsx
import { Suspense } from 'react';
import SobreClient from './SobreClient'; // El archivo que acabas de crear

export default function SobrePageWrapper() {
  return (
    <Suspense fallback={<div>Cargando sobre...</div>}>
      <SobreClient />
    </Suspense>
  );
}