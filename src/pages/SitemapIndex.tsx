import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-xml', {
          headers: { 'Accept': 'application/xml' }
        });
        if (response.ok) {
          const xml = await response.text();
          document.open();
          document.write(xml);
          document.close();
        }
      } catch (e) {
        console.error('Sitemap yüklenmə xətası:', e);
      }
    };

    // Fallback for first visit before SW takes control
    setTimeout(load, 50);
  }, []);

  return null;
};

export default SitemapIndex;