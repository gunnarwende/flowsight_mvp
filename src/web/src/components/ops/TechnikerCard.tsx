"use client";

import type { LeitzentraleCase } from "./LeitzentraleView";

// ---------------------------------------------------------------------------
// TechnikerCard — Horizontaler Flow (linear, persönlich)
// EINE Card. "Bei mir" → "Heute" → "Erledigt" → ★ Bewertung
// ---------------------------------------------------------------------------

interface TechnikerCardProps {
  staffName: string;
  cases: LeitzentraleCase[];
  avgRating: number | null;
  reviewCount: number;
  nextAppointment: LeitzentraleCase | null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 17) return "Guten Tag";
  return "Guten Abend";
}

export function TechnikerCard({
  staffName,
  cases,
  avgRating,
  reviewCount,
  nextAppointment,
}: TechnikerCardProps) {
  const firstName = staffName.split(" ")[0];

  // Counts
  const beiMir = cases.filter((c) => c.status !== "done").length;
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Zurich",
  });
  const heute = cases.filter(
    (c) =>
      c.scheduled_at &&
      c.status !== "done" &&
      new Date(c.scheduled_at).toLocaleDateString("en-CA", {
        timeZone: "Europe/Zurich",
      }) === todayStr,
  ).length;
  const erledigt = cases.filter((c) => c.status === "done").length;

  const starsFilled = avgRating != null ? Math.round(avgRating) : 0;
  const starDisplay = avgRating != null ? avgRating.toFixed(1) : "—";

  // Next appointment address + maps link
  const nextAddr = nextAppointment
    ? [
        nextAppointment.street,
        nextAppointment.house_number,
        nextAppointment.plz,
        nextAppointment.city,
      ]
        .filter(Boolean)
        .join(" ")
    : null;
  const nextTime = nextAppointment?.scheduled_at
    ? new Date(nextAppointment.scheduled_at).toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      })
    : null;
  const nextCity = nextAppointment
    ? [nextAppointment.plz, nextAppointment.city].filter(Boolean).join(" ")
    : null;

  const steps = [
    { count: beiMir, label: "Bei mir" },
    { count: heute, label: "Heute" },
    { count: erledigt, label: "Erledigt" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden px-5 py-5">
      {/* Greeting */}
      <h1 className="text-lg font-bold text-gray-900 mb-4">
        {getGreeting()}, {firstName}
      </h1>

      {/* Horizontal flow */}
      <div className="flex items-center gap-2 sm:gap-3 justify-center mb-4">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <svg
                className="w-4 h-4 text-gray-300 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            )}
            <div className="flex flex-col items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-2.5 min-w-[68px]">
              <span className="text-xl font-bold text-gray-900">{s.count}</span>
              <span className="text-[10px] text-gray-500 font-medium uppercase">
                {s.label}
              </span>
            </div>
          </div>
        ))}

        {/* Arrow to stars */}
        <svg
          className="w-4 h-4 text-gray-300 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
          />
        </svg>

        {/* Stars */}
        <div className="flex flex-col items-center bg-amber-50/60 rounded-xl border border-amber-200 px-3 py-2.5 min-w-[80px]">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <svg
                key={n}
                className={`w-3 h-3 ${n <= starsFilled ? "text-amber-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm font-bold text-amber-600 ml-0.5">
              {starDisplay}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium">
            {reviewCount} Bew.
          </span>
        </div>
      </div>

      {/* Next appointment */}
      {nextAppointment && nextAddr && (
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Nächster Einsatz:{" "}
              <span className="text-gray-600">
                {nextTime}, {nextAppointment.street}{" "}
                {nextAppointment.house_number}, {nextCity}
              </span>
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextAddr + " Schweiz")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <span>📍</span> Nav
          </a>
        </div>
      )}
    </div>
  );
}
