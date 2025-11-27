/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Configuración para evitar caché excesivo
  generateEtags: false,
  poweredByHeader: false,
  
  // CORREGIDO: serverExternalPackages en lugar de experimental.serverComponentsExternalPackages
  serverExternalPackages: [],
  
  // Headers personalizados para controlar el caché
  async headers() {
    return [
      {
        source: '/:path*\\.(png|jpg|jpeg|gif|webp|avif|svg)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
      {
        source: '/((?!.*\\.(?:css|js|png|jpg|jpeg|gif|webp|avif|svg)$).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=300',
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
    ];
  },
};

export default nextConfig;
