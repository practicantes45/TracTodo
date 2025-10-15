'use client';

import { useRouter } from 'next/navigation';
import AdminLoginModal from '../components/AdminLoginModal/AdminLoginModal';

export default function AdminPageClient() {
  const router = useRouter();
  return (
    <AdminLoginModal
      isOpen={true}
      onClose={() => router.push('/')}
    />
  );
}

