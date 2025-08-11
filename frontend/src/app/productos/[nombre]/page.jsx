import './producto-individual.css';

import ProductoIndividualClient from './ProductoIndividualClient';

export const dynamicParams = true;

// Función para generar metadata dinámico basado en el nombre - CORREGIDA
export async function generateMetadata({ params }) {
  const { nombre } = await params; // AGREGADO: await params
  
  // Decodificar el nombre para el título
  const nombreDecodificado = decodeURIComponent(nombre);
  const nombreFormateado = nombreDecodificado
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${nombreFormateado} | TRACTODO`,
    description: `Compra ${nombreFormateado} en TRACTODO. Repuestos y refacciones de calidad para maquinaria pesada.`,
    openGraph: {
      title: `${nombreFormateado} | TRACTODO`,
      description: `Compra ${nombreFormateado} en TRACTODO. Repuestos y refacciones de calidad.`,
    },
  };
}

export default async function ProductoIndividualPage({ params }) {
    const awaitedParams = await params; // AGREGADO: await params
    return <ProductoIndividualClient params={awaitedParams} />;
}