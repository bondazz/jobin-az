import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    // Redirect directly to the sitemap XML endpoint
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return null;
};

export default SitemapIndex;