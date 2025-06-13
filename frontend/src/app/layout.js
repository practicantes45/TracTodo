import { Montserrat, Ubuntu, Prompt, Mina } from 'next/font/google';
import './styles/global.css';

// Configura las fuentes
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

export const metadata = {
  title: 'TRACTODO - Refacciones para Motores Diésel',
  description: 'Refacciones de calidad para motores diésel. Amplio inventario, precios competitivos y garantía confiable.',
  keywords: 'refacciones, motores diesel, tractocamión, Querétaro, San Juan del Río',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  // Eliminamos los meta tags de cache que pueden causar problemas
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${ubuntu.variable} ${prompt.variable} ${mina.variable}`}>
      <head>
        {/* Meta tags optimizados para navegación */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        
        {/* Preload crítico para rendimiento */}
        <link rel="preload" href="/imgs/fondocamion4.png" as="image" />
        <link rel="preload" href="/imgs/logopeke.png" as="image" />
        
        {/* DNS prefetch para optimización */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google.com" />
        
        {/* Eliminar cache forzado que puede causar problemas de navegación */}
      </head>
      <body>
        {children}
        
        {/* Script para debugging en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log('Page loaded:', window.location.pathname);
                window.addEventListener('beforeunload', () => {
                  console.log('Page unloading:', window.location.pathname);
                });
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}