// src/app/productos/page.jsx
import { Suspense } from 'react';
import ProductosClient from './ProductosClient'; // El archivo que acabas de crear

export default function ProductosPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando productos...</div>}>
      <ProductosClient />
    </Suspense>
  );
}