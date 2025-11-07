/* Service Worker - Cloudflare Worker Style for sitemap.xml + Prerender Proxy */

const SITEMAP_ENDPOINT = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/serve-sitemap';
const PRERENDER_ENDPOINT = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/prerender-proxy';

// Bot user agents to detect
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
  'facebookexternalhit', 'twitterbot', 'rogerbot', 'linkedinbot', 'embedly',
  'quora link preview', 'showyoubot', 'outbrain', 'pinterest', 'slackbot',
  'whatsapp', 'telegrambot', 'vkshare', 'w3c_validator', 'validator.schema.org'
];

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
  const userAgent = event.request.headers.get('user-agent') || '';

  // Bot detection - proxy to prerender for HTML pages
  if (isBot(userAgent) && 
      url.pathname !== '/sw.js' && 
      url.pathname !== '/pwa-sw.js' &&
      !url.pathname.includes('/functions/') &&
      !url.pathname.endsWith('.xml') &&
      !url.pathname.endsWith('.json') &&
      !url.pathname.endsWith('.js') &&
      !url.pathname.endsWith('.css') &&
      url.origin === location.origin) {
    
    console.log('Bot detected, proxying to prerender:', url.href);
    
    const prerenderUrl = `${PRERENDER_ENDPOINT}?url=${encodeURIComponent(url.href)}`;
    
    event.respondWith(
      fetch(prerenderUrl, {
        headers: {
          'user-agent': userAgent
        }
      }).then(resp => {
        if (resp.ok && resp.headers.get('content-type')?.includes('text/html')) {
          return resp;
        }
        // Fallback to normal fetch
        return fetch(event.request);
      }).catch(e => {
        console.error('Prerender proxy error:', e);
        return fetch(event.request);
      })
    );
    return;
  }

  // Yalnız /sitemap.xml üçün işləsin (exact match like Cloudflare Worker)
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

// Push notification event handler
self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Jooble',
    body: 'Yeni bildiriş var',
    icon: '/icons/icon-192x192.jpg',
    badge: '/icons/icon-192x192.jpg',
    tag: 'default-notification',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || notificationData.tag,
        data: {
          url: data.url || notificationData.data.url
        }
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      vibrate: [200, 100, 200]
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
