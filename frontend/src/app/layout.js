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
  title: 'Frontend',
  description: 'Sitio del Frontend',
  // Meta tags para controlar el caché del navegador
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${ubuntu.variable} ${prompt.variable} ${mina.variable}`}>
      <head>
        {/* Meta tags adicionales para evitar caché */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        {/* Versioning para forzar actualización */}
        <meta name="version" content={Date.now().toString()} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}