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

const CACHE_NAME = "flowsight-v3";
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

// ── Message handler (for UpdatePrompt "SKIP_WAITING" trigger) ──────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Push Notifications ─────────────────────────────────────────────────────
// Tenant-agnostisch: title + url + tag kommen aus payload (gesetzt vom Caller
// in sendOpsPush). Fallback auf generic FlowSight-Branding wenn payload fehlt.
// iOS App-Icon-Badge (die Zahl rechts oben) wird via navigator.setAppBadge
// gesetzt — Paul-Feedback 28.04. PM. Erfordert iOS 16.4+ und PWA-Install.
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FlowSight", body: event.data.text() };
  }

  const options = {
    body: payload.body ?? "",
    icon: "/api/ceo/pwa/icon?size=192",
    badge: "/api/ceo/pwa/icon?size=96",
    tag: payload.tag ?? "flowsight",
    data: { url: payload.url ?? "/" },
    vibrate: [100, 50, 100],
  };

  // App-Icon-Badge (number on icon). Server can pass payload.badgeCount,
  // otherwise we increment by 1 each push. iOS clears on click.
  const setBadge = async () => {
    try {
      if ("setAppBadge" in self.navigator) {
        const count = typeof payload.badgeCount === "number"
          ? payload.badgeCount
          : 1;
        await self.navigator.setAppBadge(count);
      }
    } catch { /* badge API unavailable, ignore */ }
  };

  event.waitUntil(Promise.all([
    self.registration.showNotification(payload.title ?? "FlowSight", options),
    setBadge(),
  ]));
});

// ── Notification Click ─────────────────────────────────────────────────────
// URL-aware tab focus: match the payload URL's base path (/ops, /ceo, /kunden,
// etc.) instead of hardcoding /ceo. Then clear the app-icon-badge — Paul
// tapped, so the "you have new" signal can go away.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/";
  const basePath = url.split("/")[1] || "";  // "/ops/reservations" → "ops"

  const clearBadge = async () => {
    try {
      if ("clearAppBadge" in self.navigator) {
        await self.navigator.clearAppBadge();
      }
    } catch { /* ignore */ }
  };

  event.waitUntil(
    Promise.all([
      clearBadge(),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        // Prefer existing tab on the same base path (e.g. another /ops/* tab)
        for (const client of clients) {
          if (basePath && client.url.includes("/" + basePath + "/") && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise: any tab from same origin, navigate it
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // No open tab: open new
        return self.clients.openWindow(url);
      }),
    ])
  );
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
