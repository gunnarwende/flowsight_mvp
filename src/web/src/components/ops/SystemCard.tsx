"use client";

import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// SystemCard — Admin Kreislauf-Visualisierung
// EINE Card. Ring mit 4 klickbaren Nodes. Geschlossenes System.
// ---------------------------------------------------------------------------

interface SystemCardProps {
  cases: {
    status: string;
    urgency: string;
    source: string;
    created_at: string;
    updated_at: string;
    review_sent_at?: string | null;
  }[];
  avgRating: number | null;
  weeklyDone: number;
  onNodeClick: (node: string | null) => void;
  activeNode: string | null;
}

export function SystemCard({
  cases,
  avgRating,
  weeklyDone,
  onNodeClick,
  activeNode,
}: SystemCardProps) {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");

  const cutoff = useMemo(
    () => Date.now() - (period === "7d" ? 7 : 30) * 86400000,
    [period],
  );

  const stats = useMemo(() => {
    let eingang = 0,
      beiUns = 0,
      erledigt = 0,
      notfaelle = 0;
    let voice = 0,
      web = 0,
      manual = 0;
    let reviewSent = 0,
      doneTotal = 0;

    for (const c of cases) {
      const ct = new Date(c.created_at).getTime();
      const ut = new Date(c.updated_at).getTime();

      if (c.status === "new" && ct >= cutoff) {
        eingang++;
        if (c.source === "voice") voice++;
        else if (c.source === "wizard" || c.source === "website") web++;
        else manual++;
      }
      if (
        c.status === "scheduled" ||
        c.status === "in_arbeit" ||
        c.status === "warten"
      ) {
        beiUns++;
        if (c.urgency === "notfall") notfaelle++;
      }
      if (c.status === "done" && ut >= cutoff) erledigt++;
      if (c.status === "done") {
        doneTotal++;
        if (c.review_sent_at) reviewSent++;
      }
    }

    return {
      eingang,
      beiUns,
      erledigt,
      notfaelle,
      voice,
      web,
      manual,
      reviewSent,
      doneTotal,
    };
  }, [cases, cutoff]);

  const starsFilled = avgRating != null ? Math.round(avgRating) : 0;
  const starDisplay = avgRating != null ? avgRating.toFixed(1) : "—";

  function toggle(node: string) {
    onNodeClick(activeNode === node ? null : node);
  }

  // Sources text
  const srcParts: string[] = [];
  if (stats.voice) srcParts.push(`Tel ${stats.voice}`);
  if (stats.web) srcParts.push(`Web ${stats.web}`);
  if (stats.manual) srcParts.push(`Man ${stats.manual}`);
  const srcText = srcParts.join(" · ") || "—";

  const nb =
    "flex flex-col items-center justify-center rounded-2xl border-2 transition-all cursor-pointer select-none";

  function nc(key: string) {
    const on = activeNode === key;
    return `${nb} ${
      on
        ? "border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-100"
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
    }`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Period toggle */}
      <div className="px-5 py-3 flex items-center justify-end">
        <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {(["7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "7d" ? "7 Tage" : "30 Tage"}
            </button>
          ))}
        </div>
      </div>

      {/* Ring visualization */}
      <div className="px-2 sm:px-4 pb-6">
        <div
          className="relative mx-auto"
          style={{ maxWidth: 420, aspectRatio: "11/8" }}
        >
          {/* SVG connecting curves */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 440 320"
            fill="none"
          >
            <defs>
              <marker
                id="sys-arr"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L8,3 L0,6" fill="#d1d5db" />
              </marker>
            </defs>
            {/* Eingang → Bei uns */}
            <path
              d="M280,60 C335,50 368,95 370,125"
              stroke="#e5e7eb"
              strokeWidth="2"
              markerEnd="url(#sys-arr)"
            />
            {/* Bei uns → Erledigt */}
            <path
              d="M370,200 C368,230 335,268 280,270"
              stroke="#e5e7eb"
              strokeWidth="2"
              markerEnd="url(#sys-arr)"
            />
            {/* Erledigt → Bewertung */}
            <path
              d="M160,270 C105,268 72,230 70,200"
              stroke="#e5e7eb"
              strokeWidth="2"
              markerEnd="url(#sys-arr)"
            />
            {/* Bewertung → Eingang */}
            <path
              d="M70,125 C72,95 105,50 160,60"
              stroke="#e5e7eb"
              strokeWidth="2"
              markerEnd="url(#sys-arr)"
            />
          </svg>

          {/* Eingang — top center */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: "2%" }}
          >
            <button
              onClick={() => toggle("eingang")}
              className={`${nc("eingang")} w-[100px] h-[72px] sm:w-[125px] sm:h-[85px]`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm">📞</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.eingang}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase">
                Eingang
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 hidden sm:block">
                {srcText}
              </span>
            </button>
          </div>

          {/* Bei uns — right center */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ right: "2%" }}
          >
            <button
              onClick={() => toggle("bei_uns")}
              className={`${nc("bei_uns")} w-[100px] h-[72px] sm:w-[125px] sm:h-[85px] relative`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm">⚡</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.beiUns}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase">
                Bei uns
              </span>
              {stats.notfaelle > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm">
                  {stats.notfaelle} NF
                </span>
              )}
            </button>
          </div>

          {/* Erledigt — bottom center */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: "2%" }}
          >
            <button
              onClick={() => toggle("erledigt")}
              className={`${nc("erledigt")} w-[100px] h-[72px] sm:w-[125px] sm:h-[85px]`}
            >
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm">✅</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.erledigt}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase">
                Erledigt
              </span>
              <span className="text-[8px] sm:text-[9px] text-emerald-600 font-medium">
                +{weeklyDone} /Woche
              </span>
            </button>
          </div>

          {/* Bewertung — left center */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: "2%" }}
          >
            <button
              onClick={() => toggle("bewertung")}
              className={`${nc("bewertung")} w-[100px] h-[72px] sm:w-[125px] sm:h-[85px]`}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${n <= starsFilled ? "text-amber-400" : "text-gray-200"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm sm:text-base font-bold text-amber-600 ml-0.5">
                  {starDisplay}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase">
                Bewertung
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400">
                {stats.reviewSent} von {stats.doneTotal}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
