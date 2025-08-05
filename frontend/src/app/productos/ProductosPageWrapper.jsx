'use client';
import { Suspense } from 'react';
import ProductosPage from './ProductosPageComponent';

function ProductosPageFallback() {
  return (
    <div className="layout productos-page">
      <div className="loadingContainer">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    </div>
  );
}

export default function ProductosPageWrapper() {
  return (
    <Suspense fallback={<ProductosPageFallback />}>
      <ProductosPage />
    </Suspense>
  );
}