import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    // Birbaşa edge function-a yönləndir - sinxron XML məzmunu
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return null;
};

export default SitemapIndex;