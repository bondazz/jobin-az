import { useEffect } from 'react';

const SitemapMain = () => {
  useEffect(() => {
    const load = async () => {
      const renderXML = (xml: string) => {
        const blob = new Blob([xml], { type: 'application/xml; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Main Sitemap</title><link rel="canonical" href="/sitemap_main.xml"></head><body style="margin:0"><iframe src="${url}" style="border:0;width:100vw;height:100vh;display:block"></iframe><script>const u='${url}';window.addEventListener('load',()=>{setTimeout(()=>URL.revokeObjectURL(u),5000);});</script></body></html>`;
        document.open();
        document.write(html);
        document.close();
      };

      try {
        // Try same-origin first (SW will intercept if active)
        const response = await fetch(`/sitemap_main.xml?t=${Date.now()}` as RequestInfo, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        } as RequestInit);
        if (response.ok) {
          const ct = (response.headers.get('content-type') || '').toLowerCase();
          if (ct.includes('application/xml') || ct.includes('text/xml')) {
            const xml = await response.text();
            renderXML(xml);
            return;
          }
        }
      } catch (e) {
        console.error('Main sitemap yüklenmə xətası (same-origin):', e);
      }

      // Hard fallback: call edge function directly
      try {
        const r2 = await fetch(`https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/sitemap-main?t=${Date.now()}` as RequestInfo, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        } as RequestInit);
        if (r2.ok) {
          const xml = await r2.text();
          renderXML(xml);
          return;
        }
      } catch (e) {
        console.error('Main sitemap fallback xətası (edge function):', e);
      }
    };

    // Immediate
    load();
  }, []);

  return null;
};

export default SitemapMain;