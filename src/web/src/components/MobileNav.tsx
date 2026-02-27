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
              className="text-2xl font-semibold text-white transition-colors hover:text-gold-400"
            >
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
