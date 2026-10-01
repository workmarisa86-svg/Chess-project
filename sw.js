/*
 * Service worker: stores every file of the app on first visit so the game
 * opens and plays with no internet connection afterwards.
 *
 * Updates reach players in two ways:
 *  - Edited files are refreshed in the background (see the fetch handler);
 *    when one really changed, the page shows "A new version is available — Reload".
 *  - If you add, rename or remove files in FILES, bump VERSION. The new worker
 *    then waits, and the same notice lets the player switch when they like.
 */
const VERSION = 'v6';
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
  'pieces/cburnett/wK.svg',
  'pieces/cburnett/wQ.svg',
  'pieces/cburnett/wR.svg',
  'pieces/cburnett/wB.svg',
  'pieces/cburnett/wN.svg',
  'pieces/cburnett/wP.svg',
  'pieces/cburnett/bK.svg',
  'pieces/cburnett/bQ.svg',
  'pieces/cburnett/bR.svg',
  'pieces/cburnett/bB.svg',
  'pieces/cburnett/bN.svg',
  'pieces/cburnett/bP.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', event => {
  // cache: 'reload' bypasses the HTTP cache so a new version gets fresh files.
  // No skipWaiting here: an updated worker waits until the player taps Reload.
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('chess-coach-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks a waiting (updated) worker to take over when the player taps "Reload".
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// A cheap fingerprint of a response, used to notice that a file changed.
const stamp = res => res.headers.get('etag') || res.headers.get('last-modified') || res.headers.get('content-length') || '';

let notifyTimer = null;
function announceUpdate() {
  clearTimeout(notifyTimer);
  // Several files usually change together: tell the page once.
  notifyTimer = setTimeout(() => {
    self.clients.matchAll({ type: 'window' }).then(list => list.forEach(c => c.postMessage({ type: 'updated' })));
  }, 1500);
}

// Stale-while-revalidate: answer instantly from the cache (works offline), and
// when online refresh the stored copy in the background.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const network = fetch(req, { cache: 'no-cache' }).then(res => {
          if (res.ok && res.type === 'basic') {
            if (hit && stamp(hit) && stamp(res) && stamp(hit) !== stamp(res)) announceUpdate();
            cache.put(req, res.clone());
          }
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
