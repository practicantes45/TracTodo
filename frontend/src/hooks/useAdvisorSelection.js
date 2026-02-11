"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADVISORS } from "../utils/advisors";

const STORAGE_KEY = "tractodo_selected_advisor";
const LAST_KEY = "tractodo_last_advisor";
const COOKIE_KEY = "tractodo_selected_advisor";

// Dev-only flags (do not affect production builds)
const IS_DEV = process.env.NODE_ENV !== "production";
const CLEAR_ON_START = IS_DEV && ["1", "true", "yes"].includes(String(process.env.NEXT_PUBLIC_CLEAR_ADVISOR_ON_START || "").toLowerCase());
const DISABLE_SELECTION = IS_DEV && ["1", "true", "yes"].includes(String(process.env.NEXT_PUBLIC_DISABLE_ADVISOR_SELECTION || "").toLowerCase());

const normalizePhone = (phone) => phone.replace(/\D/g, "");

const readCookie = (key) => {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${key}=`));

  if (!cookie) {
    return null;
  }

  try {
    return decodeURIComponent(cookie.split("=")[1] || "");
  } catch (error) {
    console.warn("Error decoding cookie", error);
    return null;
  }
};

const writeCookie = (key, value, maxAgeSeconds) => {
  if (typeof document === "undefined") {
    return;
  }

  let expires = "";
  if (typeof maxAgeSeconds === "number") {
    expires = `; max-age=${maxAgeSeconds}`;
  }
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/${expires}`;
};

const findAdvisorByPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return (
    ADVISORS.find(
      (advisor) => normalizePhone(advisor.phoneNumber) === normalized
    ) || null
  );
};

export const useAdvisorSelection = () => {
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // In development, optionally clear any previously selected advisor on startup.
    if (CLEAR_ON_START) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(LAST_KEY);
      } catch {}
      writeCookie(COOKIE_KEY, "", 0);
      setSelectedAdvisor(null);
      setIsReady(true);
      return;
    }

    const storedSelection = window.localStorage.getItem(STORAGE_KEY);
    const storedLast = window.localStorage.getItem(LAST_KEY);
    const cookieValue = readCookie(COOKIE_KEY);

    const candidatePhone = storedSelection || storedLast || cookieValue;
    if (candidatePhone) {
      const advisor = findAdvisorByPhone(candidatePhone);
      if (advisor) {
        setSelectedAdvisor(advisor);
      }
    }

    setIsReady(true);
  }, []);

  // Sincroniza otras instancias del hook cuando cambia la selección
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromPersistence = () => {
      try {
        const storedSelection = window.localStorage.getItem(STORAGE_KEY);
        const storedLast = window.localStorage.getItem(LAST_KEY);
        const cookieValue = readCookie(COOKIE_KEY);
        const candidatePhone = storedSelection || storedLast || cookieValue;
        if (candidatePhone) {
          const advisor = findAdvisorByPhone(candidatePhone);
          setSelectedAdvisor(advisor);
        } else {
          setSelectedAdvisor(null);
        }
      } catch {}
    };

    const onAdvisorChange = () => syncFromPersistence();
    const onStorage = (e) => {
      if (!e || e.key === STORAGE_KEY || e.key === LAST_KEY) {
        syncFromPersistence();
      }
    };

    window.addEventListener("advisorchange", onAdvisorChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("advisorchange", onAdvisorChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const persistAdvisor = useCallback((advisor) => {
    if (typeof window === "undefined" || !advisor) {
      return;
    }

    // When disabled in dev, skip persisting selection
    if (DISABLE_SELECTION) {
      return;
    }

    const normalizedPhone = normalizePhone(advisor.phoneNumber);
    window.localStorage.setItem(STORAGE_KEY, normalizedPhone);
    window.localStorage.setItem(LAST_KEY, normalizedPhone);
    writeCookie(COOKIE_KEY, normalizedPhone, 60 * 60 * 24 * 30); // 30 days

    // Notificar a otras instancias del hook en la misma pestaña
    try {
      window.dispatchEvent(
        new CustomEvent("advisorchange", { detail: normalizedPhone })
      );
    } catch {}

    // Refrescar discretamente datos de Server Components que dependan de cookies
    try {
      router?.refresh?.();
    } catch {}
  }, [router]);

  const selectAdvisor = useCallback(
    (advisorIdOrPhone) => {
      const advisor =
        ADVISORS.find(
          (item) =>
            item.id === advisorIdOrPhone ||
            normalizePhone(item.phoneNumber) === normalizePhone(advisorIdOrPhone)
        ) || null;

      if (!advisor) {
        console.warn("Advisor not found", advisorIdOrPhone);
        return;
      }

      // Allow selecting visually even in dev, but avoid persisting when disabled
      setSelectedAdvisor(advisor);
      persistAdvisor(advisor);
      setIsModalOpen(false);
    },
    [persistAdvisor]
  );

  const rememberAdvisor = useCallback(
    (advisor) => {
      if (!advisor) {
        return;
      }
      persistAdvisor(advisor);
      setSelectedAdvisor(advisor);
    },
    [persistAdvisor]
  );

  const clearAdvisor = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LAST_KEY);
    }
    writeCookie(COOKIE_KEY, "", 0);
    setSelectedAdvisor(null);
    try {
      window.dispatchEvent(new CustomEvent("advisorchange", { detail: "" }));
    } catch {}
    try {
      router?.refresh?.();
    } catch {}
  }, [router]);

  const advisors = useMemo(() => ADVISORS, []);

  return {
    advisors,
    selectedAdvisor,
    isModalOpen,
    setModalOpen: setIsModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    selectAdvisor,
    rememberAdvisor,
    clearAdvisor,
    isReady,
  };
};
