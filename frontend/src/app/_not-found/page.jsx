import Link from 'next/link';

export const metadata = {
  title: 'Página no encontrada | Tractodo',
  description: 'La página que buscas no existe o ha sido movida.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe o ha sido movida.</p>
      <Link href="/" style={{ color: '#b00020', textDecoration: 'underline' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
