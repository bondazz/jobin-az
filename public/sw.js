/* Service Worker to mirror sitemap XML from Supabase edge function without redirecting */

const SITEMAP_ENDPOINT = 'https://igrtzfvphltnoiwedbtz.supabase.co/functions/v1/serve-sitemap';

self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(self.clients.claim());
});

function streamXML(res) {
  // Stream pass-through to avoid truncation for large XML
  const headers = new Headers(res.headers);
  headers.set('Content-Type', 'application/xml; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

async function proxyXML(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/xml' },
      cache: 'no-store',
    });
    return streamXML(res);
  } catch (e) {
    const today = new Date().toISOString().split('T')[0];
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://jooble.az/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(fallback, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const path = url.pathname;

  // All sitemap requests go to serve-sitemap function
  if (path.endsWith('.xml') && (
    path === '/sitemap.xml' || 
    path === '/sitemap_index.xml' ||
    path === '/sitemap_main.xml' ||
    path === '/sitemapjooble.xml' ||
    path.startsWith('/sitemap-')
  )) {
    const filename = path.substring(1); // Remove leading slash
    event.respondWith(proxyXML(`${SITEMAP_ENDPOINT}?file=${filename}&t=${Date.now()}`));
    return;
  }
});
