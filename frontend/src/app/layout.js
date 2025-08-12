import { Inter, Ubuntu, Montserrat } from 'next/font/google';
import SEOProvider from './components/SEOProvider/SEOProvider';
import './globals.css';

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

export const metadata = {
  title: 'Tractodo - Refaccionaria para Tractocamión | Querétaro',
  description: 'Refaccionaria especializada en partes y componentes para tractocamión. Venta de cabezas de motor, turbos, árboles de levas y kits de media reparación para motores Cummins, Caterpillar, Detroit y más.',
  keywords: ['refacciones tractocamión', 'partes motor diésel', 'turbos', 'cabezas motor', 'Querétaro', 'Cummins', 'Caterpillar', 'Detroit'],
  authors: [{ name: 'Tractodo' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Tractodo - Refaccionaria para Tractocamión | Querétaro',
    description: 'Refaccionaria especializada en partes y componentes para tractocamión. Venta de cabezas de motor, turbos, árboles de levas y kits de media reparación.',
    url: 'https://tractodo.com',
    siteName: 'Tractodo',
    images: [
      {
        url: '/images/tractodo-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Tractodo - Refaccionaria para Tractocamión',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tractodo - Refaccionaria para Tractocamión | Querétaro',
    description: 'Refaccionaria especializada en partes y componentes para tractocamión.',
    images: ['/images/tractodo-logo.jpg'],
    site: '@tractodo',
  },
  verification: {
    google: 'google-site-verification-code', // Reemplazar con código real
  },
  alternates: {
    canonical: 'https://tractodo.com',
  },
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
        <meta name="theme-color" content="#002a5c" />
        <meta name="msapplication-TileColor" content="#002a5c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Enlaces a sitemaps */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/images/tractodo-logo.jpg" as="image" />
      </head>
      <body>
        <SEOProvider>
          {children}
        </SEOProvider>
      </body>
    </html>
  );
}