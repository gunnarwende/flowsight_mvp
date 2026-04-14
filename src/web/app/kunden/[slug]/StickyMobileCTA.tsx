"use client";

import { useEffect, useState } from "react";

/**
 * StickyMobileCTA — fixed bottom bar on mobile with call + wizard buttons.
 * Hides when scrolling up (user wants to see content), shows when scrolling down.
 * Only visible on mobile (<768px).
 */
export function StickyMobileCTA({
  phone,
  wizardUrl,
  accent,
}: {
  phone: string;
  wizardUrl: string;
  accent: string;
}) {
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Show when scrolling down or at top, hide when scrolling up
      setVisible(y <= 100 || y > lastY);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Safe area spacer for phones with gesture bars */}
      <div
        className="flex items-center gap-2 px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
        style={{ backgroundColor: "var(--cs-surface, #ffffff)" }}
      >
        <a
          href={`tel:${phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
          Anrufen
        </a>
        <a
          href={wizardUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
          style={{ borderColor: accent, color: accent }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
          Online melden
        </a>
      </div>
      {/* Bottom safe area for gesture-bar phones */}
      <div className="h-[env(safe-area-inset-bottom)]" style={{ backgroundColor: "var(--cs-surface, #ffffff)" }} />
    </div>
  );
}
