// Classic (non-module) service worker: kept dependency-free so it runs in every
// browser without relying on module-worker support.

const CACHE_NAME = 'oleksiisedun-shell-v3';

// Same-origin shell files needed for the terminal to load offline. Must all
// succeed at install time (cache.addAll is atomic).
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/css/mochi.css',
  '/js/config.js',
  '/js/script.js',
  '/js/terminal.js',
  '/js/handlers.js',
  '/js/templates.js',
  '/js/mochi.js',
  '/js/pwa.js',
  '/commands/help.txt',
  '/commands/skills.txt',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// Cross-origin assets (fonts, icon script) — best-effort, must not block install.
const OPTIONAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=VT323&display=swap',
  'https://code.iconify.design/3/3.1.0/iconify.min.js',
];

// Dynamic API host: always network, never cached. Duplicated from
// js/config.js's ANALYTICS_ENDPOINT — a classic-script service worker
// can't import that ES module, so keep this in sync by hand.
const NETWORK_ONLY_HOSTS = ['analytics.oleksiisedun.workers.dev'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await Promise.all(
        OPTIONAL_ASSETS.map((url) => cache.add(url).catch(() => {}))
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (NETWORK_ONLY_HOSTS.includes(url.hostname)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
