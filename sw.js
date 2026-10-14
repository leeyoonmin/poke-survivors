const CACHE_NAME = 'poke-survivors-v1';
const SPRITE_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 23, 25, 26,
  41, 50, 66, 81, 88, 92, 93, 94, 95, 109, 111, 123,
  125, 126, 130, 143, 145, 149, 150, 248, 373, 376, 447, 448
];

const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './audio.js',
  './game.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon.png',
  ...SPRITE_IDS.map((id) => `./assets/sprites/${id}.png`)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
