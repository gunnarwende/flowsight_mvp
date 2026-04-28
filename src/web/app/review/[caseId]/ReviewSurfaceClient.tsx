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

interface InteractiveStarsProps {
  size?: number;
  displayRating: number;
  saving: boolean;
  onStarClick: (n: number) => void;
  onHover: (n: number) => void;
  onLeave: () => void;
}

function InteractiveStars({ size = 40, displayRating, saving, onStarClick, onHover, onLeave }: InteractiveStarsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onStarClick(n)}
          onMouseEnter={() => onHover(n)}
          onMouseLeave={onLeave}
          aria-label={`${n} Sterne`}
          className="touch-manipulation p-1 transition-transform duration-150 active:scale-90"
          disabled={saving}
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            className={`transition-colors duration-150 ${
              n <= displayRating ? "text-amber-400" : "text-gray-200"
            }`}
            fill="currentColor"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}

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

  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set());
  const [freeText, setFreeText] = useState("");

  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [done, setDone] = useState(false);

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

  function handleStarClick(n: number) {
    setRating(n);
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

  async function handleGoogleReview() {
    if (assembledText) {
      await saveReview(rating, assembledText);
    } else {
      await saveReview(rating);
    }
    try {
      if (assembledText) {
        await navigator.clipboard.writeText(assembledText);
        setCopied(true);
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch { /* mobile fallback */ }
    if (trackUrl) {
      fetch(trackUrl, { method: "POST" }).catch(() => {});
    }
    if (googleReviewUrl) {
      window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
    }
    setDone(true);
  }

  async function handlePositiveFeedback() {
    await saveReview(rating, assembledText || undefined);
    setDone(true);
  }

  async function handleNegativeFeedback() {
    if (feedbackText.trim()) {
      await saveReview(rating, feedbackText.trim());
    } else {
      await saveReview(rating);
    }
    setFeedbackSent(true);
  }

  const displayRating = hoverRating || rating;
  const starsProps = {
    displayRating,
    saving,
    onStarClick: handleStarClick,
    onHover: setHoverRating,
    onLeave: () => setHoverRating(0),
  };

  return (
    <div className="min-h-dvh bg-gray-100">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-white sm:my-6 sm:min-h-0 sm:rounded-2xl sm:shadow-xl">
        {/* Brand bar */}
        <div className="h-1.5 flex-shrink-0" style={{ backgroundColor: brandColor }} />

        {/* Content */}
        <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
          {/* Header */}
          <h1 className="text-[26px] font-bold leading-tight" style={{ color: brandColor }}>
            {companyName}
          </h1>
          <p className="mt-1.5 text-[15px] text-gray-500">
            Wie war unser Service?
          </p>

          {/* Case reference */}
          <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3.5">
            <div className="grid grid-cols-[80px_1fr] gap-y-2 text-[15px]">
              <span className="text-gray-400">Auftrag</span>
              <span className="text-gray-800 font-semibold">{category}</span>
              <span className="text-gray-400">Ort</span>
              <span className="text-gray-800">{location}</span>
              <span className="text-gray-400">Datum</span>
              <span className="text-gray-800">{caseDate}</span>
            </div>
          </div>

          {/* ── Phase: Rating (initial) ────────────────────────── */}
          {phase === "rating" && (
            <div className="mt-8 flex flex-1 flex-col">
              <p className="text-center text-[15px] text-gray-600">
                Wie zufrieden waren Sie?
              </p>
              <p className="mt-1 text-center text-[13px] text-gray-400">
                Tippen Sie auf die Sterne — dauert nur 30 Sekunden.
              </p>
              <div className="mt-8">
                <InteractiveStars size={48} {...starsProps} />
              </div>
            </div>
          )}

          {/* ── Phase: Positive (4-5 stars) ────────────────────── */}
          {phase === "positive" && (
            <div className="mt-6 flex flex-1 flex-col">
              <div className="py-2">
                <InteractiveStars size={36} {...starsProps} />
              </div>
              <p className="mt-3 text-center text-[15px] font-semibold text-emerald-700">
                Vielen Dank für Ihre tolle Bewertung!
              </p>

              {/* Quick-select chips */}
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {REVIEW_CHIPS.map((chip) => {
                  const isSelected = selectedChips.has(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleChip(chip)}
                      className={`rounded-xl border-2 px-3 py-3 text-[14px] font-medium leading-tight transition-all duration-150 ${
                        isSelected
                          ? "border-transparent text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                      style={isSelected ? { backgroundColor: brandColor } : undefined}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              {/* Free text */}
              <textarea
                className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                rows={3}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="Beschreiben Sie Ihre Erfahrung..."
              />

              {/* CTA */}
              <div className="mt-5">
                {googleReviewUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleReview}
                      disabled={saving}
                      className="flex w-full items-center justify-center rounded-xl px-6 py-4 text-[16px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{ backgroundColor: brandColor }}
                    >
                      {copied ? "Text kopiert — Google öffnet sich…" : "Bewertung abschliessen"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePositiveFeedback}
                      className="mt-2 w-full py-2 text-center text-[13px] text-gray-500 transition-colors hover:text-gray-700"
                    >
                      Ohne Google abschliessen
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handlePositiveFeedback}
                    disabled={saving}
                    className="flex w-full items-center justify-center rounded-xl px-6 py-4 text-[16px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    Bewertung abschliessen
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Phase: Negative (1-3 stars) ────────────────────── */}
          {phase === "negative" && (
            <div className="mt-6 flex flex-1 flex-col">
              <div className="py-2">
                <InteractiveStars size={36} {...starsProps} />
              </div>

              {!feedbackSent ? (
                <>
                  <p className="mt-4 text-center text-[15px] font-semibold text-gray-800">
                    Es tut uns leid, dass Sie nicht zufrieden waren.
                  </p>
                  <p className="mt-1 text-center text-[14px] text-gray-500">
                    Was können wir besser machen?
                  </p>

                  <textarea
                    className="mt-5 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    rows={5}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Ihr Feedback hilft uns, besser zu werden…"
                  />

                  <button
                    type="button"
                    onClick={handleNegativeFeedback}
                    disabled={saving || !feedbackText.trim()}
                    className="mt-5 flex w-full items-center justify-center rounded-xl px-6 py-4 text-[16px] font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    Feedback senden
                  </button>
                </>
              ) : (
                <div className="mt-8 flex flex-1 flex-col items-center justify-start">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <p className="mt-4 text-center text-[16px] font-semibold text-gray-800">
                    Vielen Dank für Ihre Bewertung!
                  </p>
                  <p className="mt-1 text-center text-[14px] text-gray-500">
                    Ihre Meinung hilft uns und anderen Kunden.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Phase: Done ─────────────────────────────────────── */}
          {phase === "done" && (
            <div className="mt-8 flex flex-1 flex-col items-center justify-start">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="mt-4 text-center text-[16px] font-semibold text-gray-800">
                Vielen Dank für Ihre Bewertung!
              </p>
              <p className="mt-1 text-center text-[14px] text-gray-500">
                Ihre Meinung hilft uns und anderen Kunden.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
