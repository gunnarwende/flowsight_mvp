"use client";

import Image from "next/image";
import { useState } from "react";

export default function PhotoLightbox({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-shrink-0 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
      >
        <Image
          src={src}
          alt={alt}
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover shadow-sm"
          priority
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
          onClick={() => setOpen(false)}
        >
          <Image
            src={src}
            alt={alt}
            width={400}
            height={400}
            className="max-h-[70vh] max-w-[70vw] rounded-2xl object-cover shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
