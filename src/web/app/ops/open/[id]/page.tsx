"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * PWA deep-link trampoline.
 *
 * Email clients open links in the system browser, bypassing installed-PWA
 * interception.  This lightweight page sits at `/ops/open/[id]` and
 * immediately replaces the URL with the real case page (`/ops/cases/[id]`).
 *
 * Because the replacement is a same-origin, in-scope (`/ops/*`) navigation
 * the OS / browser can hand it off to the installed PWA on Android, Windows
 * (Edge) and desktop Chrome.  If the PWA is not installed the user simply
 * lands on the normal page in the browser — no harm done.
 */
export default function OpenCaseRedirect() {
  const params = useParams<{ id: string }>();

  useEffect(() => {
    if (params?.id) {
      window.location.replace(`/ops/cases/${params.id}`);
    }
  }, [params?.id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0b1120]">
      <p className="text-gray-400 text-sm animate-pulse">Wird geöffnet…</p>
    </div>
  );
}
