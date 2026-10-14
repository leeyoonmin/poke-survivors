const CACHE_NAME = 'poke-survivors-v5';
const SPRITE_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19, 23, 25, 26,
  41, 50, 66, 81, 88, 92, 93, 94, 95, 109, 111, 123,
  125, 126, 130, 143, 145, 149, 150, 248, 373, 376, 447, 448
];
const ART_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 25, 26, 92, 93, 94, 95, 130, 143, 145, 150, 447, 448];
const ITEM_NAMES = [
  'poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'rare-candy',
  'potion', 'super-potion', 'hyper-potion', 'full-restore', 'magnet',
  'charcoal', 'mystic-water', 'miracle-seed', 'spell-tag', 'expert-belt',
  'choice-scarf', 'lucky-egg', 'amulet-coin', 'revive', 'max-revive'
];
const ENV_NAMES = ['grass_1', 'grass_2', 'path_1', 'bush', 'rock', 'flowers'];

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
  ...SPRITE_IDS.map((id) => `./assets/sprites/${id}.png`),
  ...ART_IDS.map((id) => `./assets/art/${id}.png`),
  ...ITEM_NAMES.map((n) => `./assets/items/${n}.png`),
  ...ENV_NAMES.map((n) => `./assets/env/${n}.png`)
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
  const url = new URL(event.request.url);
  const isCodeFile =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.json');

  if (isCodeFile) {
    // Network-First for code/HTML so installed PWAs always get live updates immediately
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First for static sprite/image assets
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
