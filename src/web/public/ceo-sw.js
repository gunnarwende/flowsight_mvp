// Minimal Service Worker for CEO-App PWA installability.
// Required: Chrome needs an active SW with fetch handler to show install prompt.
// Caching is handled by the main sw.js — this just enables installation.

const CACHE_NAME = "flowsight-ceo-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add("/ceo/pulse"))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("flowsight-ceo-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first for all CEO routes
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
