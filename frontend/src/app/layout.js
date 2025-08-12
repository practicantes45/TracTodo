// app/layout.js
import { Inter, Ubuntu, Montserrat } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { SEOProvider } from '../contexts/SEOContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-ubuntu',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

// REMOVIDO: export const metadata = { ... } 
// La metadata ahora se maneja dinámicamente en cada página

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#002a5c',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${ubuntu.variable} ${montserrat.variable}`}>
      <head>
        {/* Preconnect para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Favicon y iconos */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Meta tags adicionales */}
        <meta name="msapplication-TileColor" content="#002a5c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Enlaces a sitemaps */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/images/tractodo-logo.jpg" as="image" />
      </head>
      <body>
        <AuthProvider>
          <SEOProvider>
            {children}
          </SEOProvider>
        </AuthProvider>
      </body>
    </html>
  );
}