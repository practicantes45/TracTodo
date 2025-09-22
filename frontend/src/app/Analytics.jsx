"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const q = searchParams?.toString();
    const url = q ? `${pathname}?${q}` : pathname;

    // Empuja al dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_location: url,
    });
  }, [pathname, searchParams]);

  return null;
}
