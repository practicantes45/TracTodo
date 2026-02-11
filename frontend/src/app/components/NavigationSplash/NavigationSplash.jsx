"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./NavigationSplash.module.css";

const SHOW_DELAY_MS = 900;
const MIN_DURATION_MS = 180;
const MAX_DURATION_MS = 12000;
const SLOW_ROUTES = ["/productos", "/blog", "/entretenimiento", "/videos"];

const isLikelySlowRoute = (pathname = "") =>
  SLOW_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const isModifiedEvent = (event) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const getAnchor = (event) => {
  if (!event?.target) return null;
  return event.target.closest("a[href]");
};

const shouldIgnoreAnchor = (anchor) => {
  if (!anchor) return true;
  if (anchor.hasAttribute("download")) return true;
  if (anchor.dataset?.noSplash === "true") return true;
  const target = anchor.getAttribute("target");
  if (target && target !== "_self") return true;
  return false;
};

const buildInternalUrl = (href) => {
  if (!href) return null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  if (href.startsWith("#")) return null;
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    return url;
  } catch (error) {
    return null;
  }
};

export default function NavigationSplash() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const startRef = useRef(Date.now());
  const hideTimeoutRef = useRef(null);
  const maxTimeoutRef = useRef(null);
  const showTimeoutRef = useRef(null);

  const routeKey = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  const showSplash = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (active || showTimeoutRef.current) {
      return;
    }
    showTimeoutRef.current = setTimeout(() => {
      showTimeoutRef.current = null;
      startRef.current = Date.now();
      setActive(true);
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
      maxTimeoutRef.current = setTimeout(() => {
        setActive(false);
      }, MAX_DURATION_MS);
    }, SHOW_DELAY_MS);
  };

  const hideSplash = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (!active) {
      return;
    }
    const elapsed = Date.now() - startRef.current;
    const delay = Math.max(0, MIN_DURATION_MS - elapsed);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    hideTimeoutRef.current = setTimeout(() => {
      setActive(false);
    }, delay);
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onReady = () => hideSplash();

    if (document.readyState === "complete") {
      onReady();
    } else {
      showSplash();
      window.addEventListener("load", onReady, { once: true });
    }

    return () => window.removeEventListener("load", onReady);
  }, []);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    hideSplash();
  }, [routeKey]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleClick = (event) => {
      if (event.defaultPrevented || isModifiedEvent(event)) return;
      if (event.button && event.button !== 0) return;

      const anchor = getAnchor(event);
      if (!anchor || shouldIgnoreAnchor(anchor)) return;

      const href = anchor.getAttribute("href");
      const url = buildInternalUrl(href);
      if (!url) return;

      const samePath =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;

      if (samePath && url.hash) {
        return;
      }

      if (!isLikelySlowRoute(url.pathname)) {
        return;
      }

      showSplash();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onPopState = () => {
      if (isLikelySlowRoute(window.location.pathname)) {
        showSplash();
      }
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <div
      className={`${styles.overlay} ${active ? styles.active : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <div className={styles.logoWrap}>
        <Image
          src="/logo-tractodo.png"
          alt="Tractodo"
          width={220}
          height={220}
          priority
        />
      </div>
      <div className={styles.loadingText}>Cargando...</div>
      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
