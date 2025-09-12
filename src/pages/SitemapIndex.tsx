import { useEffect } from 'react';

const SitemapIndex = () => {
  useEffect(() => {
    const load = async () => {
      const writeXML = (xml: string) => {
        document.open();
        document.write(xml);
        document.close();
      };

      try {
        // Try same-origin first (SW will intercept if active). If not XML, fall back.
        const response = await fetch(`/sitemap_index.xml?t=${Date.now()}` as RequestInfo, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        } as RequestInit);
        if (response.ok) {
          const ct = (response.headers.get('content-type') || '').toLowerCase();
          if (ct.includes('application/xml') || ct.includes('text/xml')) {
            const xml = await response.text();
            writeXML(xml);
            return;
          }
        }
      } catch (e) {
        console.error('Sitemap yüklenmə xətası (same-origin):', e);
      }

      // Hard fallback: call edge function directly to ensure first load works
      try {
        const r2 = await fetch(`https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-index?t=${Date.now()}` as RequestInfo, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        } as RequestInit);
        if (r2.ok) {
          const xml = await r2.text();
          writeXML(xml);
          return;
        }
      } catch (e) {
        console.error('Sitemap fallback xətası (edge function):', e);
      }
    };

    // Immediate
    load();
  }, []);

  return null;
};

export default SitemapIndex;