'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const REFERRAL_CODE_KEY = 'referral_code';
const REFERRAL_EXPIRY_KEY = 'referral_expiry';
const REFERRAL_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useReferralCode = () => {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Get referral code from URL if present
    const urlRefCode = searchParams?.get('ref');

    if (urlRefCode) {
      // Store new referral code with expiry
      const expiry = Date.now() + REFERRAL_DURATION;
      localStorage.setItem(REFERRAL_CODE_KEY, urlRefCode);
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiry.toString());
      setReferralCode(urlRefCode);
    } else {
      // Check for stored referral code
      const storedCode = localStorage.getItem(REFERRAL_CODE_KEY);
      const storedExpiry = localStorage.getItem(REFERRAL_EXPIRY_KEY);

      if (storedCode && storedExpiry) {
        const expiryTime = parseInt(storedExpiry);

        if (Date.now() < expiryTime) {
          // Code is still valid
          setReferralCode(storedCode);
        } else {
          // Code has expired, remove it
          localStorage.removeItem(REFERRAL_CODE_KEY);
          localStorage.removeItem(REFERRAL_EXPIRY_KEY);
          setReferralCode(null);
        }
      }
    }
  }, [searchParams, isClient]);

  const getUrlWithReferral = (path?: string | null): string => {
    // Always return a valid string, never undefined
    const validPath = path || '/';
    if (!isClient) return validPath; // Return path as-is during SSR
    if (referralCode) {
      const separator = validPath.includes('?') ? '&' : '?';
      return `${validPath}${separator}ref=${referralCode}`;
    }
    return validPath;
  };

  const clearReferralCode = () => {
    if (!isClient) return;
    localStorage.removeItem(REFERRAL_CODE_KEY);
    localStorage.removeItem(REFERRAL_EXPIRY_KEY);
    setReferralCode(null);
  };

  return {
    referralCode,
    getUrlWithReferral,
    clearReferralCode
  };
};