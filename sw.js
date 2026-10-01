/*
 * Service worker: stores every file of the app on first visit so the game
 * opens and plays with no internet connection afterwards.
 *
 * Changed files are picked up automatically (see the fetch handler) and open
 * pages show "A new version is available — Reload". Bump VERSION only when you
 * add, rename or remove files in FILES.
 */
const VERSION = 'v5';
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
// and when online refresh the stored copy in the background. If a file has
// changed, open pages are told so they can offer "A new version is available".
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const saved = hit ? hit.clone() : null; // copy before the page reads it
        // 'no-cache' asks the server whether the file changed (a cheap check)
        // instead of reusing the browser's HTTP cache, so updates arrive promptly.
        const network = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
          if (res.ok && res.type === 'basic') {
            const fresh = res.clone();
            event.waitUntil(cache.put(req, fresh.clone()).then(() => saved && changed(saved, fresh)).then(isNew => { if (isNew) notifyUpdate(); }));
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

async function changed(oldRes, newRes) {
  const [a, b] = await Promise.all([oldRes.arrayBuffer(), newRes.arrayBuffer()]);
  if (a.byteLength !== b.byteLength) return true;
  const x = new Uint8Array(a), y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return true;
  return false;
}

async function notifyUpdate() {
  const pages = await self.clients.matchAll({ type: 'window' });
  pages.forEach(page => page.postMessage({ type: 'updated' }));
}
