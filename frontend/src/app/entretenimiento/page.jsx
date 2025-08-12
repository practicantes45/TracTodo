import { generatePageMetadata } from '../../utils/metadataUtils';
import EntretenimientoClient from './EntretenimientoClient';

// METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('entretenimiento', { path: '/entretenimiento' });
}

export default function EntretenimientoPage() {
  return <EntretenimientoClient />;
}