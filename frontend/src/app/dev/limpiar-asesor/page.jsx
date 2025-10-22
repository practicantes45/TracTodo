"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

const STORAGE_KEY = "tractodo_selected_advisor";
const LAST_KEY = "tractodo_last_advisor";
const COOKIE_KEY = "tractodo_selected_advisor";

function clearCookie(name) {
  try {
    document.cookie = `${name}=; path=/; max-age=0`;
  } catch {}
}

export default function LimpiarAsesorPage() {
  const [done, setDone] = useState(false);
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (isProd) return; // No hace nada aquí; 404 más abajo

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_KEY);
    } catch {}

    clearCookie(COOKIE_KEY);
    setDone(true);

    const t = setTimeout(() => {
      try { window.location.href = "/"; } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [isProd]);

  if (isProd) return notFound();

  return (
    <div style={{ padding: 24 }}>
      <h1>Limpiar asesor seleccionado</h1>
      <p>{done ? "Asesor limpiado. Redirigiendo..." : "Limpiando..."}</p>
      <p>
        Si no redirige, vuelve al inicio manualmente: <a href="/">Inicio</a>
      </p>
    </div>
  );
}
