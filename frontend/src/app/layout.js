import { Inter, Ubuntu, Montserrat } from 'next/font/google';
import SEOProvider from './components/SEOProvider/SEOProvider';
import { AuthProvider } from '../hooks/useAuth';
import CookieConsent from './components/CookieConsent/CookieConsent';
import GoogleAnalytics from './components/GoogleAnalytics/GoogleAnalytics';
import Script from 'next/script';

import './styles/global.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ubuntu = Ubuntu({ weight: ['300','400','500','700'], subsets: ['latin'], variable: '--font-ubuntu' });
const montserrat = Montserrat({ weight: ['300','400','500','600','700'], subsets: ['latin'], variable: '--font-montserrat' });

// METADATA GENÉRICA
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://tractodo.com'),
  title: { template: '%s | Tractodo', default: 'Tractodo - Refacciones para Tractocamión' },
  description: 'Refaccionaria especializada en partes y componentes para tractocamión.',
  verification: { google: 'google-site-verification-code' },
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
  robots: { index: true, follow: true },
  viewport: { width: 'device-width', initialScale: 1, themeColor: '#002a5c' },
};

export default function RootLayout({ children }) {
  const GTM_ID = 'GTM-TK5BTJRB'; // 👈 remplaza por tu ID real

  return (
    <html lang="es-MX" className={`${inter.variable} ${ubuntu.variable} ${montserrat.variable}`}>
      <head>
        {/* Google Tag Manager Script */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* Preconnect para mejorar rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="msapplication-TileColor" content="#002a5c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="preload" href="/images/tractodo-logo.jpg" as="image" />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        <AuthProvider>
          <SEOProvider>
            <GoogleAnalytics />
            {children}
            <CookieConsent />
          </SEOProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
