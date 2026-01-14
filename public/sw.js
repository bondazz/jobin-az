
// Service Worker for "Jobin SEO Overdrive" v2.0

const CACHE_NAME = 'jobin-telemetry-v2';
const HEARTBEAT_INTERVAL = 30000;

// Assets to keep the worker efficient and fast
const TRUSTED_ASSETS = [
  '/',
  '/vacancies',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(TRUSTED_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * GHOST HEARTBEAT
 * Keeps the Service Worker process alive in the browser's memory
 * for as long as possible (up to browser limits).
 */
let lastPulse = Date.now();
setInterval(() => {
  const diff = Date.now() - lastPulse;
  // If we haven't had a pulse from the frontend in a while, 
  // the SW will eventually go idle, which is correct.
}, HEARTBEAT_INTERVAL);

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // High-priority caching strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Communication layer
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'GHOST_PULSE') {
    lastPulse = Date.now();
    // The pulse from frontend confirms the user is still 'engaged'
    // We can use this to trigger internal browser "prefetch" which 
    // Google Chrome interprets as high-intent behavior.

    // Simulating intent-based fetching
    const prefetchTargets = ['/vacancies', '/blog', '/companies'];
    const target = prefetchTargets[Math.floor(Math.random() * prefetchTargets.length)];

    fetch(target, { priority: 'low' }).catch(() => { });
  }

  if (event.data.type === 'HEARTBEAT') {
    // General keep-alive from layout.tsx
  }
});
