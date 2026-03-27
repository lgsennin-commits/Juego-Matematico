const CACHE_NAME = 'math-game-v1';
const urlsToCache = [
    './index.html',
    './manifest.json',
    './icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Si está en caché, devuélvelo
                }
                return fetch(event.request); // Si no, búscalo en la red
            })
    );
});
