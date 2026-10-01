/*
 * Service worker: stores every file of the app on first visit so the game
 * opens and plays with no internet connection afterwards.
 *
 * Changed files are picked up automatically (see the fetch handler). Bump
 * VERSION only when you add, rename or remove files in FILES.
 */
const VERSION = 'v3';
const CACHE = 'chess-coach-' + VERSION;
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/core.js',
  'js/i18n.js',
  'js/terms.js',
  'js/facts.js',
  'js/coach.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', event => {
  // cache: 'reload' bypasses the HTTP cache so a new version gets fresh files.
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('chess-coach-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: answer instantly from the cache (works offline),
// and when online refresh the stored copy in the background so edits to the
// site reach installed players on their next launch.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const network = fetch(req).then(res => {
          if (res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        });
        if (hit) {
          event.waitUntil(network.catch(() => {}));
          return hit;
        }
        return network.catch(() => req.mode === 'navigate' ? cache.match('index.html') : Response.error());
      })
    )
  );
});
