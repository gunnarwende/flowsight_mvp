"use client";

import { useState } from "react";

interface Props {
  companyName: string;
  brandColor: string;
  category: string;
  location: string;
  caseDate: string;
  defaultText: string;
  googleReviewUrl: string | null;
  trackUrl: string | null;
}

export function ReviewSurfaceClient({
  companyName,
  brandColor,
  category,
  location,
  caseDate,
  defaultText,
  googleReviewUrl,
  trackUrl,
}: Props) {
  const [text, setText] = useState(defaultText);
  const [copied, setCopied] = useState(false);

  async function handleCopyAndOpen() {
    // Copy text to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Fallback: select text
      setCopied(true);
    }

    // Track CTA click (fire-and-forget)
    if (trackUrl) {
      fetch(trackUrl, { method: "POST" }).catch(() => {});
    }

    // Open Google Review URL in new tab
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function handleCopyOnly() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[440px]">
        {/* Card */}
        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          {/* Brand bar */}
          <div className="h-1.5" style={{ backgroundColor: brandColor }} />

          {/* Header: Company name in brand color */}
          <div className="px-6 pt-5 pb-3">
            <h1
              className="text-xl font-bold"
              style={{ color: brandColor }}
            >
              {companyName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Wie war unser Service?
            </p>
          </div>

          {/* Case reference block (RS2) */}
          <div className="mx-6 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 mb-4">
            <div className="grid grid-cols-2 gap-y-1.5 text-sm">
              <span className="text-gray-400">Auftrag</span>
              <span className="text-gray-700 font-medium">{category}</span>
              <span className="text-gray-400">Ort</span>
              <span className="text-gray-700">{location}</span>
              <span className="text-gray-400">Datum</span>
              <span className="text-gray-700">{caseDate}</span>
            </div>
          </div>

          {/* Editable review text (RS3) */}
          <div className="px-6 mb-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Ihr Bewertungstext
            </label>
            <textarea
              className="h-[110px] w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-[14px] leading-relaxed text-gray-700 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              value={text}
              onChange={(e) => { setText(e.target.value); setCopied(false); }}
              placeholder="Beschreiben Sie Ihre Erfahrung..."
            />
            <p className="mt-1 text-xs text-gray-400">
              Sie k&ouml;nnen den Text anpassen, bevor Sie ihn auf Google einf&uuml;gen.
            </p>
          </div>

          {/* Primary CTA (RS4) */}
          <div className="px-6 pb-2">
            {googleReviewUrl ? (
              <button
                type="button"
                onClick={handleCopyAndOpen}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Auf Google bewerten
              </button>
            ) : (
              /* RS9: No Google URL → "Text kopieren" only */
              <button
                type="button"
                onClick={handleCopyOnly}
                className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Text kopieren
              </button>
            )}
          </div>

          {/* RS5: Inline confirmation after click */}
          {copied && (
            <div className="px-6 pb-2">
              <p className="text-center text-sm text-emerald-600 font-medium">
                Text kopiert{googleReviewUrl ? " \u2014 Sie k\u00f6nnen ihn auf Google einf\u00fcgen." : "."}
              </p>
            </div>
          )}

          {/* RS6: No Cancel. Instead: dismissal text */}
          <div className="px-6 pb-5 pt-2">
            <p className="text-center text-xs text-gray-400">
              Kein Interesse? Sie m&uuml;ssen nichts tun.
            </p>
          </div>
        </div>

        {/* RS10: Footer */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Website powered by{" "}
          <a href="https://flowsight.ch" className="text-gray-500 hover:text-gray-600">
            FlowSight
          </a>
        </p>
      </div>
    </div>
  );
}
