'use client';
import { useEffect } from 'react';
import Script from 'next/script';

export default function GoogleAnalytics() {
  useEffect(() => {
    // Inicializar dataLayer si no existe
    window.dataLayer = window.dataLayer || [];
    function gtag(){
      window.dataLayer.push(arguments);
    }
    
    // Configurar gtag
    gtag('js', new Date());
    gtag('config', 'AW-17474646394');
    
    // Hacer gtag disponible globalmente
    window.gtag = gtag;
  }, []);

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17474646394"
        strategy="afterInteractive"
        async
      />
    </>
  );
}