/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVER: output: 'export',
  images: {
    unoptimized: true,
  },
  // Configuración para evitar caché excesivo
  generateEtags: false,
  poweredByHeader: false,
  
  // Headers personalizados para controlar el caché
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      // Para archivos estáticos específicos (CSS, JS)
      {
        source: '/(.*)\\.(css|js)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate', // 1 hora con revalidación
          },
        ],
      },
    ];
  },
};

export default nextConfig;