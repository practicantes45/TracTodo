import { generatePageMetadata } from '../../utils/metadataUtils';
import BlogClient from './BlogClient';

// METADATA SERVER-SIDE
export async function generateMetadata() {
  return generatePageMetadata('blog', { path: '/blog' });
}

export default function BlogPage() {
  return <BlogClient />;
}