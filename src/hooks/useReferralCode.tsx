import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const REFERRAL_CODE_KEY = 'referral_code';
const REFERRAL_EXPIRY_KEY = 'referral_expiry';
const REFERRAL_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useReferralCode = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Get referral code from URL if present
    const urlRefCode = searchParams.get('ref');
    
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
  }, [searchParams, location]);

  const getUrlWithReferral = (path: string) => {
    if (referralCode) {
      const separator = path.includes('?') ? '&' : '?';
      return `${path}${separator}ref=${referralCode}`;
    }
    return path;
  };

  const clearReferralCode = () => {
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