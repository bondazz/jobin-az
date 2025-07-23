import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Redirect to the sitemap XML endpoint
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return null;
};

export default Sitemap;