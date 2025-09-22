import { Suspense } from "react";
import { generatePageMetadata } from "../../utils/metadataUtils";
import EntretenimientoClient from "./EntretenimientoClient";

// ✅ Metadata server-side (sin viewport aquí)
export async function generateMetadata() {
  return generatePageMetadata("entretenimiento", { path: "/entretenimiento" });
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <EntretenimientoClient />
    </Suspense>
  );
}
