
import { Montserrat, Ubuntu, Prompt, Mina } from 'next/font/google';
import './styles/global.css';
import { AuthProvider } from '../hooks/useAuth';
import CookieConsent from './components/CookieConsent/CookieConsent';

// Configuración de fuentes
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const ubuntu = Ubuntu({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ubuntu',
  weight: ['300', '400', '500', '700'],
});

const prompt = Prompt({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-prompt',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const mina = Mina({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mina',
  weight: ['400','700'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${ubuntu.variable} ${prompt.variable} ${mina.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        <title>TRACTODO - Refacciones para Motores Diésel</title>
        <meta name="description" content="Refacciones de calidad para motores diésel. Amplio inventario, precios competitivos y garantía confiable." />
        <meta name="keywords" content="refacciones, motores diesel, tractocamión, Querétaro, San Juan del Río" />
        <meta name="robots" content="index, follow" />
        <link rel="preload" href="/imgs/fondocamion4.png" as="image" />
        <link rel="preload" href="/imgs/logopeke.png" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google.com" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <CookieConsent />
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('🚀 Frontend iniciado en puerto 3001');
                console.log('🔗 Conectando con Backend en puerto 3000');
                console.log('📍 Página actual:', window.location.pathname);
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}