"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

function clearAllCookies() {
  try {
    const cookies = document.cookie?.split(";") || [];
    for (const c of cookies) {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      document.cookie = `${name}=; path=/; max-age=0`;
    }
  } catch {}
}

async function clearCaches() {
  try {
    if (typeof caches !== "undefined" && caches?.keys) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch {}
}

async function clearIndexedDB() {
  try {
    if (typeof indexedDB !== "undefined") {
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs
            .map((db) => db?.name)
            .filter(Boolean)
            .map((name) => new Promise((resolve) => {
              const req = indexedDB.deleteDatabase(name);
              req.onsuccess = req.onerror = req.onblocked = () => resolve();
            }))
        );
      }
    }
  } catch {}
}

async function unregisterServiceWorkers() {
  try {
    if (navigator?.serviceWorker?.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {}
}

export default function LimpiarCacheYDatosPage() {
  const [done, setDone] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (isProd) return; // 404 más abajo en producción

    (async () => {
      try {
        try { localStorage.clear(); } catch {}
        try { sessionStorage.clear(); } catch {}

        clearAllCookies();
        await Promise.all([
          clearCaches(),
          clearIndexedDB(),
          unregisterServiceWorkers(),
        ]);

        setDone(true);
      } finally {
        const t = setTimeout(() => {
          try { window.location.href = "/"; } catch {}
        }, 900);
        return () => clearTimeout(t);
      }
    })();
  }, [isProd]);

  if (isProd) return notFound();

  return (
    <div style={{ padding: 24 }}>
      <h1>Limpiar caché y datos (dev)</h1>
      <p>{done ? "Datos limpiados. Redirigiendo..." : "Limpiando almacenamiento y cachés..."}</p>
      <p>
        Si no redirige, vuelve al inicio manualmente: <a href="/">Inicio</a>
      </p>
    </div>
  );
}

