"use client";

import { useState, useMemo } from "react";

interface Props {
  companyName: string;
  brandColor: string;
  category: string;
  location: string;
  caseDate: string;
  googleReviewUrl: string | null;
  trackUrl: string | null;
  caseId?: string;
  token?: string;
}

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const REVIEW_CHIPS = [
  "Schnell & zuverlässig",
  "Saubere Arbeit",
  "Kompetente Beratung",
  "Jederzeit wieder",
];

export function ReviewSurfaceClient({
  companyName,
  brandColor,
  category,
  location,
  caseDate,
  googleReviewUrl,
  trackUrl,
  caseId,
  token,
}: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Positive path
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState("");

  // Negative path
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Done state (after Google click or explicit feedback send)
  const [done, setDone] = useState(false);

  // B9: Phase is DERIVED from rating, not locked after click.
  // Customer can always change stars — phase updates dynamically.
  const phase = done ? "done" : rating === 0 ? "rating" : rating >= 4 ? "positive" : "negative";

  const assembledText = useMemo(() => {
    const chips = Array.from(selectedChips).join(". ");
    const parts = [chips ? chips + "." : "", freeText.trim()].filter(Boolean);
    return parts.join(" ");
  }, [selectedChips, freeText]);

  async function saveReview(stars: number, text?: string) {
    if (!caseId || saving) return;
    setSaving(true);
    try {
      await fetch(`/api/review/${caseId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: stars, ...(text ? { text } : {}), ...(token ? { token } : {}) }),
      });
    } catch { /* fire-and-forget */ }
    setSaving(false);
  }

  // B9: Stars are ALWAYS clickable. Rating changes dynamically.
  // Rating is NOT saved on star click — only on explicit button click.
  // Prevents accidental 1-star saves + premature push notifications.
  function handleStarClick(n: number) {
    setRating(n);
    // Reset chips/text when switching between positive/negative
    if (n >= 4 && rating < 4) {
      setFeedbackText("");
      setFeedbackSent(false);
    }
    if (n < 4 && rating >= 4) {
      setSelectedChips(new Set());
      setFreeText("");
    }
  }

  function toggleChip(chip: string) {
    setSelectedChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }

  // B4: Copy text to clipboard BEFORE opening Google
  async function handleGoogleReview() {
    if (assembledText) {
      await saveReview(rating, assembledText);
    }
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(assembledText);
      setCopied(true);
      // Wait briefly so user sees "Copied!" before Google opens
      await new Promise((r) => setTimeout(r, 800));
    } catch { /* mobile fallback */ }
    // Track CTA click
    if (trackUrl) {
      fetch(trackUrl, { method: "POST" }).catch(() => {});
    }
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
    setDone(true);
  }

  async function handlePositiveFeedback() {
    if (assembledText) {
      await saveReview(rating, assembledText);
    }
    setDone(true);
  }

  async function handleNegativeFeedback() {
    if (feedbackText.trim()) {
      await saveReview(rating, feedbackText.trim());
    }
    setFeedbackSent(true);
  }

  const displayRating = hoverRating || rating;

  // B9: Interactive stars — shown in ALL phases (except done), always clickable
  const InteractiveStars = ({ size = "w-12 h-12" }: { size?: string }) => (
    <div className="flex items-center justify-center gap-2 mb-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => handleStarClick(n)}
          onMouseEnter={() => setHoverRating(n)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-0.5 transition-all duration-200 hover:scale-110 active:scale-95"
          disabled={saving}
        >
          <svg
            className={`${size} transition-colors duration-150 ${
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
  );

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

          {/* ── Phase: Rating (initial — no stars clicked yet) ──────── */}
          {phase === "rating" && (
            <div className="px-6 pb-6">
              <p className="text-sm text-gray-600 mb-1 text-center">
                Wie zufrieden waren Sie?
              </p>
              <p className="text-xs text-gray-400 mb-4 text-center">
                Tippen Sie einfach auf die Sterne — dauert nur 30 Sekunden.
              </p>
              <InteractiveStars />
            </div>
          )}

          {/* ── Phase: Positive (4-5 stars) ──────────────────────────── */}
          {phase === "positive" && (
            <div className="px-6 pb-5">
              {/* B9: Stars still clickable — customer can change rating */}
              <InteractiveStars size="w-8 h-8" />

              <p className="text-center text-sm text-emerald-700 font-medium mb-4">
                Vielen Dank für Ihre tolle Bewertung!
              </p>

              {/* Clickable text chips */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {REVIEW_CHIPS.map((chip) => {
                  const isSelected = selectedChips.has(chip);
                  return (
                    <button
                      key={chip}
                      onClick={() => toggleChip(chip)}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                        isSelected
                          ? "border-transparent text-white shadow-sm"
                          : "border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      style={isSelected ? { backgroundColor: brandColor } : undefined}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              {/* Free text */}
              <div className="mb-4">
                <textarea
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                  rows={3}
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="Beschreiben Sie Ihre Erfahrung..."
                />
              </div>

              {/* B4 + B5: Google CTA with clipboard copy + "optional" messaging */}
              {googleReviewUrl ? (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleReview}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {copied ? "Text kopiert — Google öffnet sich..." : "Auf Google teilen (optional)"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePositiveFeedback}
                    className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                  >
                    Ohne Google abschliessen
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handlePositiveFeedback}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  Bewertung abschliessen
                </button>
              )}
            </div>
          )}

          {/* ── Phase: Negative (1-3 stars) ──────────────────────────── */}
          {phase === "negative" && (
            <div className="px-6 pb-5">
              {/* B9: Stars still clickable — customer can upgrade to 4-5★ */}
              <InteractiveStars size="w-8 h-8" />

              {!feedbackSent ? (
                <>
                  <p className="text-center text-sm text-gray-700 font-medium mb-1">
                    Es tut uns leid, dass Sie nicht zufrieden waren.
                  </p>
                  <p className="text-center text-sm text-gray-500 mb-4">
                    Was können wir besser machen?
                  </p>

                  <textarea
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400 mb-4"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Ihr Feedback hilft uns, besser zu werden..."
                  />

                  <button
                    type="button"
                    onClick={handleNegativeFeedback}
                    disabled={saving || !feedbackText.trim()}
                    className="flex w-full items-center justify-center rounded-lg px-6 py-3 text-[15px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    Feedback senden
                  </button>

                  <div className="pt-4 pb-1">
                    <p className="text-center text-xs text-gray-400">
                      Kein Interesse? Sie müssen nichts tun.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-4">
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-700 font-medium">
                    Vielen Dank für Ihr Feedback.
                  </p>
                  <p className="text-center text-sm text-gray-500 mt-1">
                    Ihr Feedback hilft uns, besser zu werden.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Phase: Done (after Google click or explicit finish) ── */}
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

        {/* B10: Footer removed — Identity Contract R4: FlowSight invisible to end customers */}
      </div>
    </div>
  );
}
