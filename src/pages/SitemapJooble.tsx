import { useEffect } from 'react';

const SitemapJooble = () => {
  useEffect(() => {
    // Direct redirect to the edge function - perfect mirror
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return null;
};

export default SitemapJooble;