"use client";

export interface CaseEvent {
  id: string;
  event_type: string;
  title: string;
  detail?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

/** Status → next expected action hint (German). */
const NEXT_STEP: Record<string, string> = {
  new: "Kunden kontaktieren",
  contacted: "Termin vereinbaren",
  scheduled: "Einsatz durchführen",
};

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

export function CaseTimeline({ events, status }: { events: CaseEvent[]; status?: string }) {
  const nextStep = status ? NEXT_STEP[status] : undefined;

  if (events.length === 0 && !nextStep) {
    return (
      <p className="text-gray-400 text-sm py-2">Noch keine Einträge.</p>
    );
  }

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="relative flex gap-2.5">
            {/* Dot — uniform gray for all past events */}
            <div className="relative z-10 flex-shrink-0 mt-1.5">
              <div className="w-[14px] h-[14px] rounded-full border-2 border-white bg-slate-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 leading-snug truncate">
                {event.title}
              </p>
              <p className="text-[11px] text-gray-400">
                {formatEventDate(event.created_at)}
              </p>
            </div>
          </li>
        ))}

        {/* Next expected step — amber dashed hint */}
        {nextStep && (
          <li className="relative flex gap-2.5">
            <div className="relative z-10 flex-shrink-0 mt-1.5">
              <div className="w-[14px] h-[14px] rounded-full border-2 border-dashed border-amber-400 bg-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-600 font-medium leading-snug">
                {nextStep}
              </p>
              <p className="text-[11px] text-gray-400">Nächster Schritt</p>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}
