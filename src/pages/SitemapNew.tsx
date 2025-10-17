import { useEffect } from 'react';

const SitemapNew = () => {
  useEffect(() => {
    const loadAndRenderXML = async () => {
      const renderXML = (xml: string) => {
        const blob = new Blob([xml], { type: 'application/xml; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const html = `<!DOCTYPE html><html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sitemap New</title><link rel="canonical" href="/sitemap_new.xml"></head><body style="margin:0"><iframe src="${url}" style="border:0;width:100vw;height:100vh;display:block"></iframe><script>const u='${url}';window.addEventListener('load',()=>{setTimeout(()=>URL.revokeObjectURL(u),5000);});</script></body></html>`;
        document.open();
        document.write(html);
        document.close();
      };

      // 1) Try same-origin path first (ideal when _redirects works)
      try {
        const res = await fetch(`/sitemap_new.xml?t=${Date.now()}`, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        });
        if (res.ok) {
          const ct = (res.headers.get('content-type') || '').toLowerCase();
          if (ct.includes('application/xml') || ct.includes('text/xml')) {
            const xml = await res.text();
            renderXML(xml);
            return;
          }
        }
      } catch (e) {
        console.error('sitemap_new.xml same-origin yüklenmə xətası:', e);
      }

      // 2) Fallback: Edge Function (serve-sitemap) always rewrites to jooble.az links
      try {
        const r2 = await fetch(`https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/serve-sitemap?file=sitemap_new.xml&t=${Date.now()}`, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        });
        if (r2.ok) {
          const xml = await r2.text();
          renderXML(xml);
          return;
        }
      } catch (e) {
        console.error('sitemap_new.xml fallback xətası (edge function):', e);
      }

      // 3) Last resort: direct storage (if file exists publicly)
      try {
        const r3 = await fetch(`https://igrtzfvphltnoiwedbtz.supabase.co/storage/v1/object/public/sitemaps/sitemap_new.xml?t=${Date.now()}`, {
          headers: { 'Accept': 'application/xml' },
          cache: 'no-store',
        });
        if (r3.ok) {
          const xml = await r3.text();
          renderXML(xml);
          return;
        }
      } catch (e) {
        console.error('sitemap_new.xml storage xətası:', e);
      }
    };

    loadAndRenderXML();
  }, []);

  return null;
};

export default SitemapNew;
