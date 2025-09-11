import { useEffect } from 'react';

const SitemapJooble = () => {
  useEffect(() => {
    // Birbaşa edge function-a yönləndir - tam mirror
    window.location.replace('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml');
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', padding: '20px' }}>
      Sitemap yüklənir...
    </div>
  );
};

export default SitemapJooble;