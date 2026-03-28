/// <reference lib="webworker" />

const CACHE_NAME = 'mycel-v1';

const PRECACHE_ASSETS = [
  '/mycel/',
  '/mycel/app',
  '/mycel/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and WebSocket requests
  if (request.method !== 'GET' || request.url.startsWith('wss://')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for app shell
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Serve from cache when offline
        return caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 }));
      })
  );
});
