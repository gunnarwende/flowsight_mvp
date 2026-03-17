"use client";

import { useEffect, useState } from "react";

/**
 * Detects new service worker versions and shows a non-intrusive
 * "Update available" banner. Critical for 50+ tenants — ensures
 * all businesses see the latest version without manual intervention.
 *
 * Strategy:
 * 1. On mount: check for SW updates
 * 2. On interval (every 60s): check again
 * 3. When new SW found: show banner with reload button
 * 4. User clicks → activate new SW → reload page
 */
export function UpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }

    let registration: ServiceWorkerRegistration | undefined;

    async function checkForUpdates() {
      try {
        registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        // Check for waiting worker (new version already downloaded)
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setUpdateReady(true);
          return;
        }

        // Listen for new updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
              setUpdateReady(true);
            }
          });
        });

        // Trigger update check
        await registration.update();
      } catch {
        // Silent — update checks are best-effort
      }
    }

    checkForUpdates();

    // Periodic check every 60 seconds
    const interval = setInterval(() => {
      registration?.update().catch(() => {});
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  function handleUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    // Reload after short delay to let SW activate
    setTimeout(() => window.location.reload(), 300);
  }

  if (!updateReady) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 shadow-lg"
        style={{
          backgroundColor: "#1a2744",
          border: "1px solid #2e4066",
        }}
      >
        <span className="text-sm text-white">Neue Version verfügbar</span>
        <button
          onClick={handleUpdate}
          className="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
          style={{
            backgroundColor: "#c8965a",
            color: "#1a2744",
          }}
        >
          Aktualisieren
        </button>
      </div>
    </div>
  );
}
