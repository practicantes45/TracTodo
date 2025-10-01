"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ADVISORS } from "../utils/advisors";

const STORAGE_KEY = "tractodo_selected_advisor";
const LAST_KEY = "tractodo_last_advisor";
const COOKIE_KEY = "tractodo_selected_advisor";

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

  useEffect(() => {
    if (typeof window === "undefined") {
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

  const persistAdvisor = useCallback((advisor) => {
    if (typeof window === "undefined" || !advisor) {
      return;
    }

    const normalizedPhone = normalizePhone(advisor.phoneNumber);
    window.localStorage.setItem(STORAGE_KEY, normalizedPhone);
    window.localStorage.setItem(LAST_KEY, normalizedPhone);
    writeCookie(COOKIE_KEY, normalizedPhone, 60 * 60 * 24 * 30); // 30 days
  }, []);

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
  }, []);

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
