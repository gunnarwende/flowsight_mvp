"use client";

import { useState } from "react";

/**
 * Expandable service description. Shows first ~120 chars with a "Mehr" toggle.
 */
export function ServiceDescription({
  text,
  accent,
}: {
  text: string;
  accent: string;
}) {
  const [open, setOpen] = useState(false);
  const LIMIT = 120;
  const needsTruncation = text.length > LIMIT;

  return (
    <div className="text-sm leading-relaxed text-gray-600">
      {needsTruncation && !open ? (
        <>
          {text.slice(0, LIMIT).trimEnd()}&hellip;{" "}
          <button
            onClick={() => setOpen(true)}
            className="font-medium hover:underline"
            style={{ color: accent }}
          >
            Mehr
          </button>
        </>
      ) : (
        <>
          {text}
          {needsTruncation && (
            <>
              {" "}
              <button
                onClick={() => setOpen(false)}
                className="font-medium hover:underline"
                style={{ color: accent }}
              >
                Weniger
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
