import { Inter, Ubuntu, Montserrat } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import SEOProvider from "./components/SEOProvider/SEOProvider";
import { AuthProvider } from "../hooks/useAuth";
import { CartProvider } from "../context/CartContext";
import CartWidget from "./components/CartWidget/CartWidgetRoot";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import Analytics from "./Analytics"; // empuja page_view al dataLayer

import "./styles/global.css";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ubuntu = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});
const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

// ===== Metadata global (sin viewport aquí) =====
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "https://tractodo.com"),
  title: { template: "%s | Tractodo", default: "Tractodo - Especial Halloween de Refacciones" },
  description: "Refaccionaria especializada en partes y componentes para tractocamión con edición especial de Halloween y Día de Muertos.",
  verification: { google: "google-site-verification-code" },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
};

// ✅ En App Router, viewport debe exportarse aparte
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a0b2e",
};

export default function RootLayout({ children }) {
  const GTM_ID = "GTM-TK5BTJRB";

  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${ubuntu.variable} ${montserrat.variable}`}
    >
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* Performance: preconnect a Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Extras opcionales que ya traías */}
        <meta name="msapplication-TileColor" content="#4c1d95" />
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

        {/* Importante: envolver Analytics (usa useSearchParams) en Suspense */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        <AuthProvider>
          <CartProvider>
            <SEOProvider>
              {children}
              <CartWidget />
              <CookieConsent />
            </SEOProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
