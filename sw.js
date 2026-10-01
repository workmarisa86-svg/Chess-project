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
const VERSION = 'v7';
// Cache Storage is shared by every app on the same domain: this app only ever
// creates, reads and deletes caches whose names start with 'chess-coach-'.
const CACHE_PREFIX = 'chess-coach-';
const CACHE = CACHE_PREFIX + VERSION;
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
      .then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks a waiting (updated) worker to take over when the player taps "Reload".
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

// Did a file really change? Compare the stored and downloaded bytes.
async function changed(oldRes, newRes) {
  const [a, b] = await Promise.all([oldRes.arrayBuffer(), newRes.arrayBuffer()]);
  if (a.byteLength !== b.byteLength) return true;
  const x = new Uint8Array(a), y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return true;
  return false;
}

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
  // Only this app's own files (inside /Chess-project/); anything else on the
  // domain, such as another app, goes straight to the network untouched.
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(hit => {
        const saved = hit ? hit.clone() : null; // copy before the page reads it
        // 'no-cache' asks the server whether the file changed instead of reusing
        // the browser's HTTP cache, so updates arrive promptly.
        const network = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
          if (res.ok && res.type === 'basic') {
            const fresh = res.clone();
            event.waitUntil(cache.put(req, fresh.clone())
              .then(() => saved && changed(saved, fresh))
              .then(isNew => { if (isNew) announceUpdate(); }));
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
