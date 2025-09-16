/* Service Worker v3 to serve dynamic sitemaps from Supabase database */

const SITEMAP_ENDPOINT = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/serve-sitemap';

self.addEventListener('install', (event) => {
  // Force immediate activation and clear all caches
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately and clear old caches
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

function streamXML(res) {
  // Stream pass-through to avoid truncation for large XML
  const headers = new Headers(res.headers);
  headers.set('Content-Type', 'application/xml; charset=utf-8');
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  headers.set('Pragma', 'no-cache');
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

async function proxyXML(url) {
  try {
    console.log('SW: Fetching sitemap from:', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/xml',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return streamXML(res);
  } catch (e) {
    console.error('SW: Error fetching sitemap:', e);
    const today = new Date().toISOString().split('T')[0];
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://jooble.az/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(fallback, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // Intercept ALL XML sitemap requests and serve from edge function
  if (path.endsWith('.xml') && (
    path === '/sitemap.xml' || 
    path === '/sitemap_index.xml' ||
    path === '/sitemap_main.xml' ||
    path === '/sitemapjooble.xml' ||
    path.startsWith('/sitemap-')
  )) {
    console.log('SW: Intercepting sitemap request:', path);
    const filename = path.substring(1); // Remove leading slash
    const timestamp = Date.now();
    event.respondWith(proxyXML(`${SITEMAP_ENDPOINT}?file=${filename}&t=${timestamp}`));
    return;
  }
});
