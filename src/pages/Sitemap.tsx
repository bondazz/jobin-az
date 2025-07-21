import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    // Redirect directly to the edge function
    window.location.href = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap';
  }, []);

  // Return null since we're redirecting
  return null;
};

export default Sitemap;