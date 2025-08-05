// src/app/productos/page.jsx
import { Suspense } from 'react';
import VideosClient from './VideosClient'; // El archivo que acabas de crear

export default function VideosPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando videos...</div>}>
      <VideosClient />
    </Suspense>
  );
}