"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger / X toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Menü schliessen" : "Menü öffnen"}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg text-navy-900 transition-colors hover:bg-navy-100"
      >
        <svg
          className="h-6 w-6 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          )}
        </svg>
      </button>

      {/* Fullscreen overlay */}
      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-navy-950/95 backdrop-blur-sm">
          {/* Close area — top right */}
          <div className="flex justify-end px-6 py-4">
            <button
              onClick={() => setOpen(false)}
              aria-label="Menü schliessen"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex flex-1 flex-col items-center justify-center gap-8">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- native <a> for hash-scroll */}
            <a
              href="/#funktionen"
              onClick={() => setOpen(false)}
              className="text-2xl font-semibold text-white transition-colors hover:text-gold-400"
            >
              Funktionen
            </a>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="text-2xl font-semibold text-white transition-colors hover:text-gold-400"
            >
              Preise
            </Link>
            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="text-2xl font-semibold text-white transition-colors hover:text-gold-400"
            >
              Kontakt
            </Link>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-2xl font-semibold text-white transition-colors hover:border-gold-400/40 hover:text-gold-400"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              {SITE.phone}
            </a>

            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="mt-4 rounded-lg bg-gold-500 px-10 py-4 text-lg font-semibold text-navy-950 transition-all hover:bg-gold-400"
            >
              Demo vereinbaren
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
