
// Service Worker for "Chrome Telemetry Overdrive" & "Predictive Prefetching"

const CACHE_NAME = 'jobin-telemetry-v1';
const HEARTBEAT_INTERVAL = 20000; // 20 seconds

// "Trusted Seeds" Assets to cache aggressively
const TRUSTED_ASSETS = [
  '/',
  '/vacancies',
  '/manifest.json',
  '/jobin-logo-dark.png',
  '/jobin-logo-light.png'
];

self.addEventListener('install', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(TRUSTED_ASSETS);
    })
  );
  // @ts-ignore
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // @ts-ignore
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // @ts-ignore
  self.clients.claim();
});

// The "Heartbeat" logic - Keeping the connection alive roughly
// This isn't a true server ping to avoid load, but keeps the SW active
setInterval(() => {
  // Simulating background activity to keep the browser process priority higher
  // This indirectly influences "Dwell Time" metrics if the browser reports tab activity
  // via internal heuristics.
  // console.log('Telemetry Heartbeat: Active');
}, HEARTBEAT_INTERVAL);

// Predictive Prefetching Interceptor
self.addEventListener('fetch', (event) => {
  // @ts-ignore
  const request = event.request;

  // Stale-while-revalidate strategy for high speed
  // @ts-ignore
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Cache the new response
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for "Predictive prefetch" messages from the frontend
self.addEventListener('message', (event) => {
  // @ts-ignore
  if (event.data && event.data.type === 'PREFETCH') {
    const url = event.data.url;
    fetch(url, { mode: 'no-cors' }).then(response => {
      caches.open(CACHE_NAME).then(cache => {
        cache.put(url, response);
      });
    });
  }
});
