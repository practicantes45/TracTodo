import { Inter, Ubuntu, Montserrat } from 'next/font/google';
import SEOProvider from './components/SEOProvider/SEOProvider';
import { AuthProvider } from '../hooks/useAuth';
import './styles/global.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const ubuntu = Ubuntu({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-ubuntu'
});

const montserrat = Montserrat({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat'
});

// METADATA GENÉRICA - será sobrescrita por cada página
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://tractodo.com'),
  
  // Metadata por defecto muy genérica
  title: {
    template: '%s | Tractodo',
    default: 'Tractodo - Refacciones para Tractocamión'
  },
  
  description: 'Refaccionaria especializada en partes y componentes para tractocamión.',
  
  verification: {
    google: 'google-site-verification-code', // Reemplazar con código real
  },
  
  // Icons y manifest
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  
  manifest: '/site.webmanifest',
  
  // Configuración básica
  robots: {
    index: true,
    follow: true,
  },
  
  // Configuración de viewport movida aquí desde el export separado
  viewport: {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#002a5c',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${ubuntu.variable} ${montserrat.variable}`}>
      <head>
        {/* Preconnect para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
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