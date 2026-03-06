"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Horizontal-scroll image gallery with arrow navigation + lightbox.
 * All images rendered at uniform height. Click to enlarge.
 */
export function ImageGallery({
  images,
  height = 200,
}: {
  images: { src: string; alt?: string }[];
  height?: number;
}) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  const goNext = useCallback(
    () =>
      setLightboxIdx((prev) =>
        prev !== null ? (prev + 1) % images.length : null
      ),
    [images.length]
  );

  const goPrev = useCallback(
    () =>
      setLightboxIdx((prev) =>
        prev !== null ? (prev - 1 + images.length) % images.length : null
      ),
    [images.length]
  );

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -(height * 1.4 + 12), behavior: "smooth" });
  }, [height]);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: height * 1.4 + 12, behavior: "smooth" });
  }, [height]);

  if (images.length === 0) return null;

  return (
    <>
      {/* Inline gallery with arrow navigation */}
      <div className="relative group/gallery">
        {/* Left arrow */}
        {images.length > 1 && (
          <button
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 opacity-0 transition-opacity group-hover/gallery:opacity-100 hover:bg-gray-50"
            aria-label="Zurück"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="shrink-0 cursor-pointer overflow-hidden rounded-xl bg-gray-100 transition-transform hover:scale-[1.02]"
              style={{ height, width: height * 1.4 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt ?? `Referenz ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Right arrow */}
        {images.length > 1 && (
          <button
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-600 opacity-0 transition-opacity group-hover/gallery:opacity-100 hover:bg-gray-50"
            aria-label="Weiter"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Lightbox overlay */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Schliessen"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Vorheriges Bild"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIdx].src}
            alt={images[lightboxIdx].alt ?? "Referenz"}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Nächstes Bild"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
