import { Inter, Ubuntu, Montserrat } from "next/font/google";
import SEOProvider from "./components/SEOProvider/SEOProvider";
import { AuthProvider } from "../hooks/useAuth";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import Script from "next/script";
import Analytics from "./Analytics";

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

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || "https://tractodo.com"),
  title: { template: "%s | Tractodo", default: "Tractodo - Refacciones para Tractocamión" },
  description: "Refaccionaria especializada en partes y componentes para tractocamión.",
  verification: { google: "google-site-verification-code" },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
  viewport: { width: "device-width", initialScale: 1, themeColor: "#002a5c" },
};

export default function RootLayout({ children }) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TK5BTJRB"; // 👈 tu ID real de GTM

  return (
    <html lang="es-MX" className={`${inter.variable} ${ubuntu.variable} ${montserrat.variable}`}>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        {/* Empuja eventos page_view al dataLayer */}
        <Analytics />

        <AuthProvider>
          <SEOProvider>
            {children}
            <CookieConsent />
          </SEOProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
