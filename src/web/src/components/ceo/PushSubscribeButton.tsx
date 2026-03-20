"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Push notification subscribe/unsubscribe button for CEO shell.
 * Shows bell icon with state: subscribed (gold), not subscribed (gray), unsupported (hidden).
 */
export function PushSubscribeButton() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    } catch {
      /* permission denied or SW not ready */
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  async function handleToggle() {
    if (!supported) return;
    setLoading(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();

      if (existing) {
        // Unsubscribe
        await fetch("/api/ceo/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        await existing.unsubscribe();
        setSubscribed(false);
      } else {
        // Subscribe
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          console.warn("VAPID public key not configured");
          setLoading(false);
          return;
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        });

        const subJson = sub.toJSON();
        await fetch("/api/ceo/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            },
          }),
        });

        setSubscribed(true);
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    }

    setLoading(false);
  }

  if (!supported) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-[11px] transition-colors ${
        subscribed
          ? "text-gold-500 hover:text-gold-400 hover:bg-gold-500/10"
          : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
      } ${loading ? "opacity-40" : ""}`}
      title={subscribed ? "Push-Benachrichtigungen deaktivieren" : "Push-Benachrichtigungen aktivieren"}
    >
      <svg className="w-3.5 h-3.5" fill={subscribed ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
      {subscribed ? "Push aktiv" : "Push aktivieren"}
    </button>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
