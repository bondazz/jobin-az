import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Redirect to the edge function that generates sitemap.xml
    window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap';
  }, []);

  return null;
};

export default Sitemap;