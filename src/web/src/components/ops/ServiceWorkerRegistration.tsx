"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on mount.
 * Placed in the OpsShell so it runs once per session.
 * Silent — no UI, no errors shown to user.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV === "development"
    ) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fail — SW is a progressive enhancement
    });
  }, []);

  return null;
}
