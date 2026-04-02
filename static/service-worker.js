/// <reference lib="webworker" />

// Cache name is set at build time via a query parameter on the registration URL
const CACHE_NAME = 'mycel-' + new URL(self.location).searchParams.get('v');

const PRECACHE_ASSETS = [
  '/mycel/',
  '/mycel/app',
  '/mycel/favicon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(['/mycel/']))
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
    if (request.method !== 'GET' || request.url.startsWith('wss://')) return;

    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok && request.url.startsWith(self.location.origin)) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then((cached) => cached || new Response('Offline', { status: 503 }));
            })
    );
});
