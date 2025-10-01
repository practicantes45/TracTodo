
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdvisorSelection } from "./useAdvisorSelection";

const buildWhatsAppUrl = (phoneNumber, message) => {
  const digits = phoneNumber.replace(/[^0-9]/g, "");
  const formatted = digits.startsWith("52") ? digits : `52${digits}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${formatted}&text=${encodedMessage}`;
};

export const useWhatsAppContact = ({
  getMessage,
  allowSelection = false,
  onRequireSelection,
} = {}) => {
  const {
    advisors,
    selectedAdvisor,
    isModalOpen,
    openModal,
    closeModal,
    selectAdvisor,
    rememberAdvisor,
    clearAdvisor,
    isReady,
  } = useAdvisorSelection();
  const [pendingPayload, setPendingPayload] = useState(null);

  const resolveMessage = useCallback(
    (advisor, payload) => {
      if (getMessage) {
        return getMessage({ advisor, payload });
      }
      return advisor.generalMessage;
    },
    [getMessage]
  );

  const launchWhatsApp = useCallback(
    (advisor, payload) => {
      if (!advisor || typeof window === "undefined") {
        return;
      }

      const message = resolveMessage(advisor, payload);
      const url = buildWhatsAppUrl(advisor.phoneNumber, message);
      window.open(url, "_blank");
      rememberAdvisor(advisor);
    },
    [rememberAdvisor, resolveMessage]
  );

  useEffect(() => {
    if (selectedAdvisor && pendingPayload) {
      launchWhatsApp(selectedAdvisor, pendingPayload);
      setPendingPayload(null);
    }
  }, [selectedAdvisor, pendingPayload, launchWhatsApp]);

  const handleRequireSelection = useCallback(
    (payload) => {
      if (onRequireSelection) {
        onRequireSelection(payload);
      }
    },
    [onRequireSelection]
  );

  const startContact = useCallback(
    (payload, event) => {
      if (event) {
        event.preventDefault();
        if (typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
      }

      if (!isReady) {
        setPendingPayload(payload);
        if (allowSelection) {
          openModal();
        } else {
          handleRequireSelection(payload);
        }
        return;
      }

      if (selectedAdvisor) {
        launchWhatsApp(selectedAdvisor, payload);
        return;
      }

      if (allowSelection) {
        setPendingPayload(payload);
        openModal();
      } else {
        handleRequireSelection(payload);
      }
    },
    [allowSelection, handleRequireSelection, isReady, launchWhatsApp, openModal, selectedAdvisor]
  );

  const changeAdvisor = useCallback(() => {
    if (!allowSelection) {
      handleRequireSelection();
      return;
    }
    clearAdvisor();
    setPendingPayload(null);
    openModal();
  }, [allowSelection, clearAdvisor, handleRequireSelection, openModal]);

  const openSelection = useCallback(() => {
    if (!allowSelection) {
      handleRequireSelection();
      return;
    }
    openModal();
  }, [allowSelection, handleRequireSelection, openModal]);

  return {
    advisors,
    selectedAdvisor,
    isModalOpen,
    openModal: openSelection,
    closeModal,
    selectAdvisor,
    startContact,
    changeAdvisor,
    launchWhatsApp,
    isReady,
  };
};
