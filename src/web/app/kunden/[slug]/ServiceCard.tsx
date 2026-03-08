"use client";

import { useState } from "react";
import { ImageGallery } from "./ImageGallery";
import { ServiceDetailOverlay } from "./ServiceDetailOverlay";

interface ServiceCardProps {
  name: string;
  summary: string;
  description?: string;
  bullets?: string[];
  icon: React.ReactNode;
  images: { src: string; alt?: string }[];
  accent: string;
}

/**
 * Service card with 2-sentence preview.
 * Click anywhere on the card → opens full detail overlay.
 */
export function ServiceCard({
  name,
  summary,
  description,
  bullets,
  icon,
  images,
  accent,
}: ServiceCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
      >
        {/* Icon header */}
        <div className="flex items-center justify-center pb-4 pt-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: accent }}
          >
            {icon}
          </div>
        </div>
        {/* Content */}
        <div className="px-5 pb-6">
          <h3 className="text-center text-lg font-semibold">{name}</h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-gray-600">
            {summary}
          </p>

          {/* Separator + "Mehr" link */}
          {description && (
            <>
              <div className="my-4 border-t border-gray-100" />
              <p className="text-sm font-medium transition-colors group-hover:underline" style={{ color: accent }}>
                Mehr &rarr;
              </p>
            </>
          )}

          {/* Reference images — always visible */}
          {images.length > 0 && (
            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                Referenzbilder
              </p>
              <ImageGallery images={images} height={140} />
            </div>
          )}
        </div>
      </div>

      {/* Detail overlay */}
      {open && (
        <ServiceDetailOverlay
          name={name}
          description={description}
          bullets={bullets}
          images={images}
          accent={accent}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
