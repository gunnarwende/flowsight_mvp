"use client";

import { useCallback, useEffect } from "react";
import { ImageGallery } from "./ImageGallery";

interface ServiceDetailProps {
  name: string;
  description?: string;
  bullets?: string[];
  images: { src: string; alt?: string }[];
  accent: string;
  onClose: () => void;
}

/**
 * Full-screen overlay showing complete service details.
 * Opens when user clicks a service card or the "Mehr" link.
 */
export function ServiceDetailOverlay({
  name,
  description,
  bullets,
  images,
  accent,
  onClose,
}: ServiceDetailProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl sm:my-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          aria-label="Schliessen"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="border-b border-gray-100 px-8 pb-6 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{name}</h2>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          {description && (
            <p className="text-base leading-relaxed text-gray-700">{description}</p>
          )}

          {bullets && bullets.length > 0 && (
            <ul className="mt-6 space-y-3">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0" style={{ color: accent }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm leading-relaxed text-gray-700">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Reference images */}
          {images.length > 0 && (
            <div className="mt-8 border-t border-gray-100 pt-6">
              <ImageGallery images={images} height={200} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
