import { Suspense } from 'react';
import { generatePageMetadata } from '../../utils/metadataUtils';
import VideosClient from './VideosClient';

// AGREGAR METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('videos', { path: '/videos' });
}

export default function VideosPageWrapper() {
  return (
    <Suspense fallback={null}>
      <VideosClient />
    </Suspense>
  );
}
