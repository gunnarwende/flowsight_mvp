"use client";

import { useEffect, useState } from "react";

/**
 * Notifications section on the help page. Shows current subscription state
 * and a "Send test notification" button (founder/onboarding diagnostic path).
 * Lives on /ops/help — never on the main dashboard, where it stole vertical
 * space as a permanent green banner (FB28).
 */
export function PushTestCard() {
  const [state, setState] = useState<"loading" | "unsupported" | "denied" | "prompt" | "subscribed">("loading");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") { setState("denied"); return; }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setState(sub ? "subscribed" : "prompt");
      } catch {
        setState("prompt");
      }
    })();
  }, []);

  async function sendTest() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/ops/push/send-test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus(`Sent — check your phone (${data.sent ?? 0} delivered)`);
      } else {
        setStatus(`Failed: ${data.error ?? res.status}`);
      }
    } catch (err) {
      setStatus(`Failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
      setTimeout(() => setStatus(null), 8000);
    }
  }

  if (state === "loading") return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-gray-900">Notifications</h2>

      {state === "subscribed" && (
        <>
          <p className="mt-2 text-sm text-gray-600">
            Push notifications are active. You&apos;ll get an alert when a new reservation comes in.
          </p>
          <button
            onClick={sendTest}
            disabled={busy}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {busy ? "Sending…" : "Send test notification"}
          </button>
          {status && <p className="mt-2 text-xs text-gray-600">{status}</p>}
        </>
      )}

      {state === "prompt" && (
        <p className="mt-2 text-sm text-gray-600">
          Notifications are not enabled yet. Open the dashboard and tap “Enable notifications”.
        </p>
      )}

      {state === "denied" && (
        <p className="mt-2 text-sm text-amber-700">
          Push permission was denied. Open your browser or system settings, allow notifications for this app, and reload.
        </p>
      )}

      {state === "unsupported" && (
        <p className="mt-2 text-sm text-gray-600">
          Push is not supported in this browser. On iPhone: install the app to your home screen first.
        </p>
      )}
    </div>
  );
}
