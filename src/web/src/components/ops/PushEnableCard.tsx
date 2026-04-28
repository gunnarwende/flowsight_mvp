"use client";

import { useEffect, useState } from "react";

/**
 * Persistent Push-Activation card for the Pub-Dashboard. Replaces reliance
 * on the one-shot PushOnboardingBanner — this card is ALWAYS visible until
 * the user has actually subscribed. Lets Paul (or founder) enable push at
 * any time, and offers a "Send test" so we can verify end-to-end during
 * onboarding.
 *
 * iOS quirk: Web Push only works on iOS 16.4+ AND the app must be installed
 * to the home screen (PWA). We surface that hint inline.
 */
export function PushEnableCard() {
  const [state, setState] = useState<"unsupported" | "denied" | "prompt" | "subscribed" | "loading">(
    "loading",
  );
  const [busy, setBusy] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") { setState("denied"); return; }
    // Check if we already have an active subscription
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "subscribed" : (perm === "granted" ? "prompt" : "prompt"));
      } catch {
        setState("prompt");
      }
    })();
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "prompt");
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setBusy(false); return; }
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
      setState("subscribed");
    } catch {
      setState("prompt");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/ops/push/send-test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTestStatus(`✓ Sent — check your phone (${data.sent ?? 0} delivered)`);
      } else {
        setTestStatus(`Failed: ${data.error ?? res.status}`);
      }
    } catch (err) {
      setTestStatus(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
      setTimeout(() => setTestStatus(null), 8000);
    }
  }

  if (state === "loading") return null;
  if (state === "unsupported") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Notifications</p>
        <p className="mt-2 text-sm text-gray-600">
          Push not supported in this browser. On iPhone: install the app to your home screen first.
        </p>
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Notifications blocked</p>
        <p className="mt-2 text-sm text-amber-700">
          Push permission was denied. Open your browser/system settings and enable notifications for this app, then reload.
        </p>
      </div>
    );
  }
  if (state === "subscribed") {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-900">Notifications active</p>
            <p className="text-xs text-emerald-700 mt-0.5">You&apos;ll get a push when a new reservation comes in.</p>
            <button
              onClick={sendTest}
              disabled={busy}
              className="mt-2 text-xs font-medium text-emerald-700 hover:text-emerald-900 underline disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send test notification"}
            </button>
            {testStatus && <p className="mt-1 text-[11px] text-emerald-700">{testStatus}</p>}
          </div>
        </div>
      </div>
    );
  }
  // prompt state
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Get notified instantly</p>
          <p className="text-xs text-gray-500 mt-0.5">A push lands on your phone when a new reservation arrives.</p>
          <button
            onClick={enable}
            disabled={busy}
            className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {busy ? "Enabling…" : "Enable notifications"}
          </button>
          <p className="mt-2 text-[10px] text-gray-400">
            iPhone tip: install this app to your home screen first, then enable here.
          </p>
        </div>
      </div>
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
