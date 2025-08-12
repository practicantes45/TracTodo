import { generatePageMetadata } from '../../utils/metadataUtils';
import UbicacionClient from './UbicacionClient';

// METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('ubicacion', { path: '/ubicacion' });
}

export default function UbicacionPage() {
  return <UbicacionClient />;
}