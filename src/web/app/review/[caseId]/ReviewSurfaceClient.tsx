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
  caseId?: string;
}

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

type Phase = "rating" | "positive" | "negative" | "done";

export function ReviewSurfaceClient({
  companyName,
  brandColor,
  category,
  location,
  caseDate,
  defaultText,
  googleReviewUrl,
  trackUrl,
  caseId,
}: Props) {
  const [phase, setPhase] = useState<Phase>("rating");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [text, setText] = useState(defaultText);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveRating(stars: number) {
    if (!caseId || saving) return;
    setSaving(true);
    try {
      await fetch(`/api/review/${caseId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars }),
      });
    } catch { /* fire-and-forget */ }
    setSaving(false);
  }

  function handleStarClick(n: number) {
    setRating(n);
    saveRating(n);
    if (n >= 4) {
      setPhase("positive");
    } else {
      setPhase("negative");
    }
  }

  async function handleCopyAndOpen() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(true);
    }
    if (trackUrl) {
      fetch(trackUrl, { method: "POST" }).catch(() => {});
    }
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
    setPhase("done");
  }

  async function handleCopyOnly() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-[440px]">
        {/* Card */}
        <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
          {/* Brand bar */}
          <div className="h-1.5" style={{ backgroundColor: brandColor }} />

          {/* Header */}
          <div className="px-6 pt-5 pb-3">
            <h1 className="text-xl font-bold" style={{ color: brandColor }}>
              {companyName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Wie war unser Service?
            </p>
          </div>

          {/* Case reference */}
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

          {/* Phase: Rating (star picker) */}
          {phase === "rating" && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Wie zufrieden waren Sie mit unserem Einsatz?
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleStarClick(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                    disabled={saving}
                  >
                    <svg
                      className={`w-10 h-10 transition-colors ${
                        n <= displayRating ? "text-amber-400" : "text-gray-200"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d={STAR_PATH} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phase: Positive (≥4 stars → show Google review option) */}
          {phase === "positive" && (
            <div className="px-6 pb-2">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    className={`w-6 h-6 ${n <= rating ? "text-amber-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d={STAR_PATH} />
                  </svg>
                ))}
              </div>

              <p className="text-center text-sm text-emerald-700 font-medium mb-4">
                Vielen Dank für Ihre tolle Bewertung!
              </p>

              {googleReviewUrl && (
                <>
                  {/* Editable review text */}
                  <div className="mb-4">
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
                      Sie können den Text anpassen, bevor Sie ihn auf Google einfügen.
                    </p>
                  </div>

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
                </>
              )}

              {!googleReviewUrl && (
                <button
                  type="button"
                  onClick={handleCopyOnly}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  Text kopieren
                </button>
              )}

              {copied && (
                <p className="text-center text-sm text-emerald-600 font-medium mt-2">
                  Text kopiert{googleReviewUrl ? " — Sie können ihn auf Google einfügen." : "."}
                </p>
              )}

              <div className="pt-4 pb-3">
                <p className="text-center text-xs text-gray-400">
                  Kein Interesse? Sie müssen nichts tun.
                </p>
              </div>
            </div>
          )}

          {/* Phase: Negative (≤3 stars → no Google link, internal feedback) */}
          {phase === "negative" && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    className={`w-6 h-6 ${n <= rating ? "text-amber-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d={STAR_PATH} />
                  </svg>
                ))}
              </div>

              <p className="text-center text-sm text-gray-700 font-medium mb-2">
                Danke für Ihr ehrliches Feedback.
              </p>
              <p className="text-center text-sm text-gray-500">
                Wir nehmen Ihre Rückmeldung ernst und arbeiten daran, unseren Service zu verbessern.
              </p>
            </div>
          )}

          {/* Phase: Done (after Google click) */}
          {phase === "done" && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-sm text-gray-700 font-medium">
                Vielen Dank für Ihre Bewertung!
              </p>
              <p className="text-center text-sm text-gray-500 mt-1">
                Ihre Meinung hilft uns und anderen Kunden.
              </p>
            </div>
          )}
        </div>

        {/* Footer — Identity Contract R4 */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Technologie-Partner:{" "}
          <a href="https://flowsight.ch" className="text-gray-500 hover:text-gray-600">
            flowsight.ch
          </a>
        </p>
      </div>
    </div>
  );
}
