import { useEffect } from 'react';

const Sitemap = () => {
  useEffect(() => {
    const fetchAndRedirect = async () => {
      // Directly redirect to the edge function URL
      window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap');
    };

    fetchAndRedirect();
  }, []);

  // Show loading while redirecting
  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px', 
      backgroundColor: '#f5f5f5' 
    }}>
      Sitemap yüklənir...
    </div>
  );
};

export default Sitemap;