/* Service Worker - Prerender.io integration + Sitemap handling */

const SITEMAP_ENDPOINT = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/serve-sitemap';
const PRERENDER_TOKEN = 'WdZtNbkh09B6xRFySBJ2';

// Bot user agents that should get pre-rendered content
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'whatsapp',
  'telegrambot'
];

// Check if request is from a bot
function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

self.addEventListener('install', (event) => {
  // Install immediately without waiting
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Activate immediately and claim clients
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear old caches if any
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const userAgent = event.request.headers.get('User-Agent') || '';

  // Only handle same-origin GET/HEAD requests
  if (url.origin !== self.location.origin || 
      (event.request.method !== 'GET' && event.request.method !== 'HEAD')) {
    return;
  }

  // Check if this is a bot request (excluding static assets)
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/i.test(url.pathname);
  
  if (isBot(userAgent) && !isStaticAsset && url.pathname !== '/sitemap.xml') {
    event.respondWith(
      fetch(`https://service.prerender.io/${url.href}`, {
        headers: {
          'X-Prerender-Token': PRERENDER_TOKEN
        }
      })
      .then(response => {
        if (response.ok) {
          return response;
        }
        // If Prerender fails, fall back to normal fetch
        return fetch(event.request);
      })
      .catch(() => {
        // If Prerender is unavailable, serve normal content
        return fetch(event.request);
      })
    );
    return;
  }

  // Handle /sitemap.xml (exact match like Cloudflare Worker)
  if (url.pathname === "/sitemap.xml") {
    const version = Date.now().toString();
    const upstream = `${SITEMAP_ENDPOINT}?file=sitemap.xml&storage_path=sitemap.xml&v=${version}`;

    // Supabase-ə GET/HEAD ötürürük
    const init = {
      method: event.request.method === "HEAD" ? "HEAD" : "GET",
      headers: {
        // UA optional; bəzən upstream-lər üçün faydalıdır
        "User-Agent": "ServiceWorker/jooble.az",
        "Accept": "application/xml,text/xml;q=0.9,*/*;q=0.8",
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
      },
      cache: "no-store",
    };

    event.respondWith(
      fetch(upstream, init).then(resp => {
        // Header-ları nizamla: XML content-type + cache
        const headers = new Headers(resp.headers);
        headers.set("content-type", "application/xml; charset=utf-8");
        headers.set("cache-control", "no-store, no-cache, must-revalidate");

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
