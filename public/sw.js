/* Service Worker - Cloudflare Worker Style for sitemap.xml */

const SITEMAP_ENDPOINT = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/serve-sitemap';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Yalnız /sitemap.xml üçün işləsin (exact match like Cloudflare Worker)
  if (url.pathname === "/sitemap.xml") {
    const upstream = `${SITEMAP_ENDPOINT}?file=sitemap.xml`;

    // Supabase-ə GET/HEAD ötürürük
    const init = {
      method: event.request.method === "HEAD" ? "HEAD" : "GET",
      headers: {
        // UA optional; bəzən upstream-lər üçün faydalıdır
        "User-Agent": "ServiceWorker/jooble.az",
        "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    };

    event.respondWith(
      fetch(upstream, init).then(resp => {
        // Header-ları nizamla: XML content-type + cache
        const headers = new Headers(resp.headers);
        headers.set("content-type", "application/xml; charset=utf-8");
        // 1 saat edge cache (istəsəniz artırın/azaldın)
        headers.set("cache-control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600");

        // Body-ni olduğu kimi qaytarırıq (stream)
        return new Response(resp.body, {
          status: resp.status,
          statusText: resp.statusText,
          headers,
        });
      }).catch(e => {
        // Upstream düşərsə 502 qaytar
        console.error('Sitemap upstream error:', e);
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><error>Upstream error</error>`,
          {
            status: 502,
            headers: { "content-type": "application/xml; charset=utf-8" },
          }
        );
      })
    );
  }

  // Digər bütün path-lar toxunulmaz qalır (originə gedir)
});
