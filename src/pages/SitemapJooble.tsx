import { useEffect } from 'react';

const SitemapJooble = () => {
  useEffect(() => {
    // Tam mirror - birbaşa edge function-a yönləndir
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return null;
};

export default SitemapJooble;