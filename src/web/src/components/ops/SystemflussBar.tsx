"use client";

// ---------------------------------------------------------------------------
// Systemfluss — The visual pipeline: Eingang → Bei uns → Erledigt → ★★★★★
// Compact single line on desktop, ticker on mobile. Read-only overview.
// ---------------------------------------------------------------------------

interface SystemflussProps {
  eingang: number;
  beiUns: number;
  erledigt: number;
  reviewAvg: number | null;
  /** Source breakdown: voice, wizard, manual */
  sources: { voice: number; wizard: number; manual: number };
  /** Compact mode for techniker (no sources, smaller) */
  compact?: boolean;
}

export function SystemflussBar({ eingang, beiUns, erledigt, reviewAvg, sources, compact }: SystemflussProps) {
  const steps = [
    { icon: "📞", count: eingang, label: "Eingang", subLabel: !compact ? `${sources.voice}📞 ${sources.wizard}🌐 ${sources.manual}✏️` : undefined },
    { icon: "⚡", count: beiUns, label: "Bei uns", subLabel: undefined },
    { icon: "✅", count: erledigt, label: "Erledigt", subLabel: undefined },
  ];

  const starDisplay = reviewAvg != null ? reviewAvg.toFixed(1) : "—";
  const starsFilled = reviewAvg != null ? Math.round(reviewAvg) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 py-1.5">
        <span>📞 {eingang}</span>
        <span className="text-gray-300">→</span>
        <span>⚡ {beiUns}</span>
        <span className="text-gray-300">→</span>
        <span>✅ {erledigt}</span>
        <span className="text-gray-300">→</span>
        <span className="text-amber-500">★ {starDisplay}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        {/* Pipeline steps */}
        <div className="flex items-center gap-1 sm:gap-3 flex-1 min-w-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1 sm:gap-3 min-w-0">
              {i > 0 && (
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              )}
              {i > 0 && <span className="text-gray-300 sm:hidden flex-shrink-0">→</span>}
              <div className="flex flex-col items-center min-w-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs sm:text-sm">{step.icon}</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">{step.count}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{step.label}</span>
                {step.subLabel && (
                  <span className="text-[9px] text-gray-400 mt-0.5 hidden sm:block">{step.subLabel}</span>
                )}
              </div>
            </div>
          ))}

          {/* Arrow to stars */}
          <svg className="w-4 h-4 text-gray-300 flex-shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          <span className="text-gray-300 sm:hidden flex-shrink-0">→</span>

          {/* Stars — the reward */}
          <div className="flex flex-col items-center min-w-0">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <svg
                  key={n}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${n <= starsFilled ? "text-amber-400" : "text-gray-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-lg sm:text-xl font-bold text-amber-600">{starDisplay}</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Bewertung</span>
          </div>
        </div>
      </div>
    </div>
  );
}
