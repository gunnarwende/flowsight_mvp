"use client";

import React from "react";

// ---------------------------------------------------------------------------
// FlowBar — High-End horizontaler Flow für Admin UND Techniker
// CSS Grid für gleiche KPI-Breiten, YTD-Toggle, Gold-Sterne, Mobile 2x2.
// ---------------------------------------------------------------------------

export interface SourceItem {
  icon: React.ReactNode;
  label: string;
  count: number;
}

export interface FlowStep {
  key: string;
  icon: React.ReactNode;
  count: number;
  label: string;
  subLabel?: string;
  accent: "blue" | "indigo" | "emerald" | "amber" | "orange" | "gray";
  badge?: number;
  onBadgeClick?: () => void;
  sourceBreakdown?: SourceItem[];
}

export type PeriodValue = "7d" | "30d" | "ytd";

interface FlowBarProps {
  steps: FlowStep[];
  starRating: number | null;
  starSub: string;
  activeStep: string | null;
  onStepClick: (key: string | null) => void;
  greeting?: string;
  periodToggle?: {
    value: PeriodValue;
    onChange: (v: PeriodValue) => void;
  };
  nextAppointment?: {
    time: string;
    location: string;
    mapsUrl: string;
  } | null;
}

const ACCENT: Record<string, { border: string; activeBg: string; activeRing: string; hoverBg: string }> = {
  blue: { border: "border-t-blue-500", activeBg: "bg-blue-50", activeRing: "ring-blue-300", hoverBg: "hover:bg-blue-50/50" },
  indigo: { border: "border-t-indigo-500", activeBg: "bg-indigo-50", activeRing: "ring-indigo-300", hoverBg: "hover:bg-indigo-50/50" },
  emerald: { border: "border-t-emerald-500", activeBg: "bg-emerald-50", activeRing: "ring-emerald-300", hoverBg: "hover:bg-emerald-50/50" },
  amber: { border: "border-t-amber-400", activeBg: "bg-amber-50", activeRing: "ring-amber-300", hoverBg: "hover:bg-amber-50/50" },
  orange: { border: "border-t-orange-500", activeBg: "bg-orange-50", activeRing: "ring-orange-300", hoverBg: "hover:bg-orange-50/50" },
  gray: { border: "border-t-gray-400", activeBg: "bg-gray-50", activeRing: "ring-gray-300", hoverBg: "hover:bg-gray-50/50" },
};

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const PERIOD_LABELS: Record<PeriodValue, string> = {
  "7d": "7 Tage",
  "30d": "30 Tage",
  ytd: "YTD",
};

export function FlowBar({
  steps,
  starRating,
  starSub,
  activeStep,
  onStepClick,
  greeting,
  periodToggle,
  nextAppointment,
}: FlowBarProps) {
  const starDisplay = starRating != null ? starRating.toFixed(1) : "Noch keine";
  const starActive = activeStep === "bewertung";

  function toggle(key: string) {
    onStepClick(activeStep === key ? null : key);
  }

  // Total columns = steps + 1 (star step)
  const colCount = steps.length + 1;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header: greeting and/or period toggle */}
      {(greeting || periodToggle) && (
        <div className="px-5 py-3 flex items-center justify-between">
          {greeting ? (
            <h1 className="text-lg font-bold text-gray-900">{greeting}</h1>
          ) : (
            <div />
          )}
          {periodToggle && (
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {(["7d", "30d", "ytd"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => periodToggle.onChange(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    periodToggle.value === p
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Next appointment (Techniker) — above flow steps, always visible */}
      {nextAppointment && (
        <div className="mx-4 mb-2 flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">Nächster Einsatz:</span>{" "}
              <span className="text-gray-600">
                {nextAppointment.time}, {nextAppointment.location}
              </span>
            </p>
          </div>
          <a
            href={nextAppointment.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            Nav
          </a>
        </div>
      )}

      {/* Flow steps — CSS Grid for equal widths */}
      <div className="px-3 sm:px-5 pb-5 pt-2">
        {/* Desktop: all columns in one row with chevrons between */}
        <div className={`hidden md:grid gap-2 sm:gap-3`} style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {steps.map((step, i) => {
            const a = ACCENT[step.accent] ?? ACCENT.gray;
            const active = activeStep === step.key;
            return (
              <div key={step.key} className="relative">
                {/* Chevron between steps */}
                {i > 0 && (
                  <svg
                    className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 z-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
                <button
                  onClick={() => toggle(step.key)}
                  className={`
                    w-full flex flex-col items-center justify-center
                    rounded-xl border-t-[3px] border border-gray-200
                    px-2 py-3 sm:px-4 sm:py-4
                    transition-all duration-200 cursor-pointer relative
                    ${a.border}
                    ${active
                      ? `${a.activeBg} ring-2 ${a.activeRing} shadow-md`
                      : `bg-white ${a.hoverBg} hover:shadow-sm`
                    }
                  `}
                >
                  {step.icon && <span className="text-base sm:text-lg">{step.icon}</span>}
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none mt-0.5">
                    {step.count}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
                    {step.label}
                  </span>
                  {step.sourceBreakdown && step.sourceBreakdown.length > 0 && (
                    <span className="flex items-center gap-1.5 mt-1 text-[8px] sm:text-[9px] text-gray-400">
                      {step.sourceBreakdown.map((s) => (
                        <span key={s.label} className="inline-flex items-center gap-0.5">
                          <span className="w-3 h-3">{s.icon}</span>
                          <span>{s.count}</span>
                        </span>
                      ))}
                    </span>
                  )}
                  {step.subLabel && !step.sourceBreakdown && (
                    <span className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">
                      {step.subLabel}
                    </span>
                  )}
                  {step.badge != null && step.badge > 0 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        step.onBadgeClick?.();
                      }}
                      className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow ${step.onBadgeClick ? "cursor-pointer hover:bg-red-600" : ""}`}
                    >
                      {step.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Star step (last column) */}
          <div className="relative">
            <svg
              className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 z-10"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <button
              onClick={() => toggle("bewertung")}
              className={`
                w-full flex flex-col items-center justify-center
                rounded-xl border-t-[3px] border border-gray-200
                px-2 py-3 sm:px-4 sm:py-4
                transition-all duration-200 cursor-pointer
                border-t-amber-400
                ${starActive
                  ? "bg-amber-50 ring-2 ring-amber-300 shadow-md"
                  : "bg-white hover:bg-amber-50/50 hover:shadow-sm"
                }
              `}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d={STAR_PATH} />
                  </svg>
                ))}
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-600 leading-none mt-1">
                {starDisplay}
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
                Bewertung
              </span>
              <span className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">
                {starSub}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile: 2x2 grid, no arrows */}
        <div className="md:hidden grid grid-cols-2 gap-2">
          {steps.map((step) => {
            const a = ACCENT[step.accent] ?? ACCENT.gray;
            const active = activeStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => toggle(step.key)}
                className={`
                  flex flex-col items-center justify-center
                  rounded-xl border-t-[3px] border border-gray-200
                  px-2 py-3 transition-all duration-200 cursor-pointer relative
                  ${a.border}
                  ${active
                    ? `${a.activeBg} ring-2 ${a.activeRing} shadow-md`
                    : `bg-white ${a.hoverBg} hover:shadow-sm`
                  }
                `}
              >
                {step.icon && <span className="text-base">{step.icon}</span>}
                <span className="text-2xl font-extrabold text-gray-900 leading-none mt-0.5">
                  {step.count}
                </span>
                <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
                  {step.label}
                </span>
                {step.sourceBreakdown && step.sourceBreakdown.length > 0 && (
                  <span className="flex items-center gap-1 mt-1 text-[8px] text-gray-400">
                    {step.sourceBreakdown.map((s) => (
                      <span key={s.label} className="inline-flex items-center gap-0.5">
                        <span className="w-3 h-3">{s.icon}</span>
                        <span>{s.count}</span>
                      </span>
                    ))}
                  </span>
                )}
                {step.subLabel && !step.sourceBreakdown && (
                  <span className="text-[8px] text-gray-400 mt-0.5">{step.subLabel}</span>
                )}
                {step.badge != null && step.badge > 0 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      step.onBadgeClick?.();
                    }}
                    className={`absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow ${step.onBadgeClick ? "cursor-pointer hover:bg-red-600" : ""}`}
                  >
                    {step.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Star step mobile */}
          <button
            onClick={() => toggle("bewertung")}
            className={`
              flex flex-col items-center justify-center
              rounded-xl border-t-[3px] border border-gray-200
              px-2 py-3 transition-all duration-200 cursor-pointer
              border-t-amber-400
              ${starActive
                ? "bg-amber-50 ring-2 ring-amber-300 shadow-md"
                : "bg-white hover:bg-amber-50/50 hover:shadow-sm"
              }
            `}
          >
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <svg
                  key={n}
                  className="w-3 h-3 text-amber-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d={STAR_PATH} />
                </svg>
              ))}
            </div>
            <span className="text-xl font-extrabold text-amber-600 leading-none mt-1">
              {starDisplay}
            </span>
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Bewertung
            </span>
            <span className="text-[8px] text-gray-400 mt-0.5">{starSub}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
