export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import AdminPageClient from './AdminPageClient';

export default function AdminPage() {
  // Página dedicada para acceso de administradores
  // No está enlazada en el home y tiene noindex
  return <AdminPageClient />;
}

