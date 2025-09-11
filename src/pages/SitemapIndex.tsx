import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const load = async () => {
      try {
        // First try same-origin path (SW will intercept if active)
        const response = await fetch('/sitemap_index.xml', {
          headers: { 'Accept': 'application/xml' }
        });
        if (response.ok) {
          const xml = await response.text();
          document.open();
          document.write(xml);
          document.close();
          return;
        }
      } catch (e) {
        console.error('Sitemap yüklenmə xətası:', e);
      }
      // Hard fallback: direct edge function
      try {
        const r2 = await fetch('https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-index', {
          headers: { 'Accept': 'application/xml' }
        });
        if (r2.ok) {
          const xml = await r2.text();
          document.open();
          document.write(xml);
          document.close();
        }
      } catch {}
    };

    // Immediate
    load();
  }, []);

  return null;
};

export default SitemapIndex;