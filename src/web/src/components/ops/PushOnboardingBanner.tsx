"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "ops-push-onboarding-dismissed";
const DISMISS_DAYS = 30;

/**
 * Non-intrusive banner asking staff to enable push notifications.
 * Shows ONCE after first login, dismissible for 30 days.
 * Does NOT show the aggressive browser permission dialog immediately.
 */
export function PushOnboardingBanner() {
  const [show, setShow] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Don't show if:
    // - Push not supported
    // - Already subscribed
    // - Already dismissed recently
    // - Already in standalone mode (PWA) with permission granted
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_DAYS * 86400000) return;
    }

    // Show after 3 seconds (not immediately)
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  async function subscribe() {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        dismiss();
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { dismiss(); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as ArrayBuffer,
      });

      const json = sub.toJSON();
      await fetch("/api/ops/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });

      setDone(true);
      setTimeout(() => setShow(false), 2000);
    } catch {
      dismiss();
    }
    setSubscribing(false);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="mx-4 mb-3 bg-navy-900 border border-gold-500/30 rounded-xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-top">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">
          {done ? "Benachrichtigungen aktiviert" : "Benachrichtigungen aktivieren?"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {done
            ? "Sie werden bei Notfällen und Zuweisungen informiert."
            : "Erfahren Sie sofort von Notfällen, Zuweisungen und Bewertungen."}
        </p>
      </div>
      {!done && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={subscribe}
            disabled={subscribing}
            className="px-3 py-1.5 rounded-lg bg-gold-500 text-navy-950 text-xs font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50"
          >
            {subscribing ? "..." : "Aktivieren"}
          </button>
          <button
            onClick={dismiss}
            className="px-2 py-1.5 rounded-lg text-gray-500 text-xs hover:text-gray-300 transition-colors"
          >
            Später
          </button>
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
