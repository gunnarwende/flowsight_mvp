/**
 * FlowSight Leitsystem — Service Worker
 *
 * Strategy:
 * - Static assets (/_next/static/): cache-first (content-hashed, safe forever)
 * - Pages & API: network-first (fresh data, offline fallback)
 * - Offline: show cached shell or fallback page
 *
 * This SW is intentionally minimal. Its primary purposes are:
 * 1. Making the app installable as PWA
 * 2. Caching static assets for fast loads
 * 3. Providing offline fallback
 * 4. Future: push notification handling (Phase 2)
 */

const CACHE_NAME = "flowsight-v2";
const OFFLINE_URL = "/ops/offline";

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Pre-cache the offline fallback page
      cache.add(OFFLINE_URL).catch(() => {
        // Offline page might not exist yet during first install — that's OK
      })
    )
  );
  // Activate immediately (don't wait for old SW to die)
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip non-HTTP(S) requests (e.g. chrome-extension://)
  if (!url.protocol.startsWith("http")) return;

  // ── Static assets: cache-first ──
  // Next.js static assets are content-hashed — safe to cache indefinitely
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // Only cache successful responses
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // ── Manifest & icons: cache with revalidation ──
  if (
    url.pathname.includes("/pwa/manifest") ||
    url.pathname.includes("/pwa/icon")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // ── API requests: network-only (too dynamic to cache reliably) ──
  if (url.pathname.startsWith("/api/")) {
    return; // Let browser handle normally
  }

  // ── Pages: network-first with offline fallback ──
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL))
      )
    );
    return;
  }
});
