'use client';
import { useState, useEffect } from 'react';
import { getCookieConsentStatus } from '../services/trackingService';

export const useCookieConsent = () => {
  const [cookieStatus, setCookieStatus] = useState({
    accepted: false,
    uid: null,
    date: null,
    loading: true
  });

  useEffect(() => {
    const status = getCookieConsentStatus();
    setCookieStatus({
      ...status,
      loading: false
    });
  }, []);

  const updateCookieStatus = () => {
    const status = getCookieConsentStatus();
    setCookieStatus({
      ...status,
      loading: false
    });
  };

  return {
    ...cookieStatus,
    updateCookieStatus
  };
};