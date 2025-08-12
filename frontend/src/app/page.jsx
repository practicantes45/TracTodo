import { generatePageMetadata } from '../utils/metadataUtils';
import HomeClient from './HomeClient';

// METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('inicio', { path: '/' });
}

export default function HomePage() {
  return <HomeClient />;
}