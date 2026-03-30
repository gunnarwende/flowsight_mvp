"use client";

import { useState } from "react";

interface ScreenPreviewProps {
  src: string;
  alt: string;
  /** Show only top portion (0-1, e.g. 0.55 = top 55%) */
  cropTop?: number;
  className?: string;
}

export default function ScreenPreview({ src, alt, cropTop, className = "" }: ScreenPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Preview — optionally cropped */}
      <button
        onClick={() => setOpen(true)}
        className={`group relative block cursor-pointer overflow-hidden rounded-2xl border border-navy-700/20 bg-navy-800/50 shadow-2xl shadow-navy-950/50 transition-transform hover:scale-[1.02] ${className}`}
        aria-label="Bild vergrössern"
      >
        {cropTop ? (
          /* Cropped: show only top portion via clip-path */
          <div className="relative overflow-hidden" style={{ aspectRatio: `390 / ${Math.round(844 * cropTop)}` }}>
            <img
              src={src}
              alt={alt}
              className="absolute left-0 top-0 w-full"
              loading="eager"
            />
            {/* Fade-out gradient at bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-navy-800/90 to-transparent" />
          </div>
        ) : (
          <img src={src} alt={alt} className="w-full" loading="eager" />
        )}

        {/* Expand hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-navy-900/80 px-3 py-1.5 text-[11px] font-medium text-navy-300 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
          </svg>
          Vergrössern
        </div>
      </button>

      {/* Lightbox Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-sm overflow-auto rounded-2xl border border-navy-700/30 bg-navy-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="w-full rounded-2xl"
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/80 text-navy-300 backdrop-blur-sm transition-colors hover:bg-navy-800 hover:text-white"
              aria-label="Schliessen"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
