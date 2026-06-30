// service-worker.js — full offline support, cache-first.
//
// ░░ HOW UPDATES WORK ░░
// Bump CACHE_VERSION on every deploy (change the number). On the next visit the
// browser fetches this file, sees a new cache name, installs the new shell, and
// the app shows an "actualizare disponibilă" banner. Tapping it calls
// skipWaiting() and reloads onto the fresh version. So you can NEVER get stuck
// on a stale build.
const CACHE_VERSION = 'minus10-v2';   // <-- bump this each deploy (v2, v3, ...)

// Everything the app needs to run with no network at all.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
];

// Install: pre-cache the whole shell, then become the waiting worker.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  // We deliberately DON'T skipWaiting() here — we wait until the app's banner
  // tells us to, so the user isn't reloaded out from under their typing.
});

// Activate: delete any old versioned caches, take control of open pages.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first. Serve from cache instantly; fall back to network and
// cache anything new. If both fail (offline + uncached), fall back to the shell.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          // Only cache same-origin successful responses.
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

// The app posts {type:'SKIP_WAITING'} when the user taps the update banner.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
