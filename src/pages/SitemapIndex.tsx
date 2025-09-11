import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    // Browser XML-i avtomatik olaraq gözəl format edəcək
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return null;
};

export default SitemapIndex;