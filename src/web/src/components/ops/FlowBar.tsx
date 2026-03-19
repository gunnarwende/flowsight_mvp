"use client";

// ---------------------------------------------------------------------------
// FlowBar — High-End horizontaler Flow für Admin UND Techniker
// Klickbare Steps mit farbigen Akzenten, Hover-Effekten, Gold-Sterne.
// ---------------------------------------------------------------------------

export interface FlowStep {
  key: string;
  icon: string;
  count: number;
  label: string;
  subLabel?: string;
  accent: "blue" | "indigo" | "emerald" | "amber";
  badge?: number;
}

interface FlowBarProps {
  steps: FlowStep[];
  starRating: number | null;
  starSub: string;
  activeStep: string | null;
  onStepClick: (key: string | null) => void;
  greeting?: string;
  periodToggle?: {
    value: "7d" | "30d";
    onChange: (v: "7d" | "30d") => void;
  };
  nextAppointment?: {
    time: string;
    location: string;
    mapsUrl: string;
  } | null;
}

const ACCENT = {
  blue: {
    border: "border-t-blue-500",
    activeBg: "bg-blue-50",
    activeRing: "ring-blue-300",
    hoverBg: "hover:bg-blue-50/50",
  },
  indigo: {
    border: "border-t-indigo-500",
    activeBg: "bg-indigo-50",
    activeRing: "ring-indigo-300",
    hoverBg: "hover:bg-indigo-50/50",
  },
  emerald: {
    border: "border-t-emerald-500",
    activeBg: "bg-emerald-50",
    activeRing: "ring-emerald-300",
    hoverBg: "hover:bg-emerald-50/50",
  },
  amber: {
    border: "border-t-amber-400",
    activeBg: "bg-amber-50",
    activeRing: "ring-amber-300",
    hoverBg: "hover:bg-amber-50/50",
  },
};

const STAR_PATH =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

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
  const starsFilled = starRating != null ? Math.round(starRating) : 0;
  const starDisplay = starRating != null ? starRating.toFixed(1) : "—";
  const starActive = activeStep === "bewertung";

  function toggle(key: string) {
    onStepClick(activeStep === key ? null : key);
  }

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
              {(["7d", "30d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => periodToggle.onChange(p)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    periodToggle.value === p
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p === "7d" ? "7 Tage" : "30 Tage"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Flow steps */}
      <div className="px-3 sm:px-5 pb-5 pt-2">
        <div className="flex items-stretch gap-2 sm:gap-3">
          {steps.map((step, i) => {
            const a = ACCENT[step.accent];
            const active = activeStep === step.key;
            return (
              <div
                key={step.key}
                className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0"
              >
                {i > 0 && (
                  <svg
                    className="w-5 h-5 text-gray-300 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                )}
                <button
                  onClick={() => toggle(step.key)}
                  className={`
                    flex-1 flex flex-col items-center justify-center
                    rounded-xl border-t-[3px] border border-gray-200
                    px-2 py-3 sm:px-4 sm:py-4
                    transition-all duration-200 cursor-pointer relative
                    ${a.border}
                    ${
                      active
                        ? `${a.activeBg} ring-2 ${a.activeRing} shadow-md`
                        : `bg-white ${a.hoverBg} hover:shadow-sm`
                    }
                  `}
                >
                  <span className="text-base sm:text-lg">{step.icon}</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none mt-0.5">
                    {step.count}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">
                    {step.label}
                  </span>
                  {step.subLabel && (
                    <span className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">
                      {step.subLabel}
                    </span>
                  )}
                  {step.badge != null && step.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow">
                      {step.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Arrow to stars */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <svg
              className="w-5 h-5 text-gray-300 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>

            {/* Star step */}
            <button
              onClick={() => toggle("bewertung")}
              className={`
                flex flex-col items-center justify-center
                rounded-xl border-t-[3px] border border-gray-200
                px-2 py-3 sm:px-4 sm:py-4 min-w-[72px] sm:min-w-[90px]
                transition-all duration-200 cursor-pointer
                border-t-amber-400
                ${
                  starActive
                    ? "bg-amber-50 ring-2 ring-amber-300 shadow-md"
                    : "bg-white hover:bg-amber-50/50 hover:shadow-sm"
                }
              `}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <svg
                    key={n}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${n <= starsFilled ? "text-amber-400" : "text-gray-200"}`}
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
      </div>

      {/* Next appointment (Techniker) */}
      {nextAppointment && (
        <div className="mx-4 mb-4 flex items-center gap-3 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
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
            📍 Nav
          </a>
        </div>
      )}
    </div>
  );
}
