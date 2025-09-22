import { Suspense } from "react";
import EntretenimientoClient from "./EntretenimientoClient";

// ✅ NO uses generateMetadata aquí (suele colar viewport y rompe el build)
export const metadata = {
  title: "Entretenimiento",
  description: "Videos y artículos de Tractodo: shorts, tutoriales y blog.",
};

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <EntretenimientoClient />
    </Suspense>
  );
}

