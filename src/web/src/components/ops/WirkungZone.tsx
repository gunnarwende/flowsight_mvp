"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Wirkung — The gold zone. Stars, progress, celebration.
// "Deine harte Arbeit wird gesehen."
// ---------------------------------------------------------------------------

interface WirkungProps {
  /** Review stats by time period */
  reviewStats: {
    sent7d: number;
    sent30d: number;
    sentTotal: number;
    erledigt30d: number;
  };
  /** Average star rating (null if no reviews yet) */
  avgRating: number | null;
  /** Featured review text from settings */
  featuredReview?: string | null;
  /** Compact mode for techniker */
  compact?: boolean;
}

type Period = "7d" | "30d" | "gesamt";

export function WirkungZone({ reviewStats, avgRating, featuredReview, compact }: WirkungProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const sentByPeriod = {
    "7d": reviewStats.sent7d,
    "30d": reviewStats.sent30d,
    "gesamt": reviewStats.sentTotal,
  };
  const sentCount = sentByPeriod[period];
  const antwortQuote = reviewStats.erledigt30d > 0
    ? Math.round((reviewStats.sent30d / reviewStats.erledigt30d) * 100)
    : 0;

  const starsFilled = avgRating != null ? Math.round(avgRating) : 0;
  const starDisplay = avgRating != null ? avgRating.toFixed(1) : "—";

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Meine Woche</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg key={n} className={`w-4 h-4 ${n <= starsFilled ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm font-bold text-amber-600 ml-1">{starDisplay}</span>
          </div>
          <span className="text-xs text-gray-500">{reviewStats.sent7d} Bewertungen</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border border-amber-100/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between border-b border-amber-100/60">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wirkung</h2>
        {/* Period toggle */}
        <div className="flex gap-1">
          {(["7d", "30d", "gesamt"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                period === p
                  ? "bg-amber-100 text-amber-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {p === "7d" ? "7 Tage" : p === "30d" ? "30 Tage" : "Gesamt"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Stars + avg rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <svg key={n} className={`w-5 h-5 ${n <= starsFilled ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-2xl font-bold text-amber-600">{starDisplay}</span>
          </div>

          {/* Metrics */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{sentCount} Bewertungsanfragen</span>
              <span className="font-semibold text-gray-700">{antwortQuote}% Anfragequote</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, antwortQuote)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Featured review */}
        {featuredReview && (
          <div className="mt-3 pt-3 border-t border-amber-100/60">
            <p className="text-sm text-gray-600 italic leading-relaxed">"{featuredReview}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
