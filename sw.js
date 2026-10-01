/* Service worker: keeps a copy of every file so the app opens and plays offline.
 * Bump VERSION whenever any file listed in ASSETS changes, so visitors get the update. */
const VERSION = 'v1';
const CACHE = 'chess-coach-' + VERSION;
const ASSETS = [
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
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png'
];

self.addEventListener('install', e => {
  // 'reload' skips the HTTP cache so a new version never stores stale files.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('chess-coach-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// The page asks a waiting (updated) worker to take over when the user taps "Reload".
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

// Cache first, then network. Offline, any page request falls back to the cached app.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('index.html');
        if (shell) return shell;
      }
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
