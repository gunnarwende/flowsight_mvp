"use client";

import { useEffect, useState } from "react";

/**
 * Tiny inline bell-with-check that renders ONLY when push is subscribed.
 * Sits next to the dashboard date so Paul sees at a glance that pushes
 * are active — without a permanent banner stealing vertical space (FB28).
 *
 * Renders nothing (null) in any other state. The full activation card lives
 * on the dashboard (PushEnableCard, prompt-state) until subscribed.
 */
export function PushStatusIndicator() {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;
    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(Boolean(sub));
      } catch {
        /* keep false */
      }
    })();
  }, []);

  if (!subscribed) return null;

  return (
    <span
      title="Notifications active"
      className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
      <span className="leading-none">on</span>
    </span>
  );
}
