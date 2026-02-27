"use client";

export interface CaseEvent {
  id: string;
  event_type: string;
  title: string;
  detail?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

const DOT_COLORS: Record<string, string> = {
  case_created: "bg-amber-500",
  status_changed: "bg-violet-500",
  email_notification_sent: "bg-green-500",
  reporter_confirmation_sent: "bg-green-400",
  invite_sent: "bg-amber-400",
  review_requested: "bg-emerald-500",
  fields_updated: "bg-gray-400",
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

export function CaseTimeline({ events }: { events: CaseEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-gray-400 text-sm py-4">Noch keine Einträge.</p>
    );
  }

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-[9px] top-3 bottom-3 w-px bg-gray-200" />

      <ul className="space-y-4">
        {events.map((event, i) => {
          const dotColor = DOT_COLORS[event.event_type] ?? "bg-gray-300";
          const isLast = i === events.length - 1;
          return (
            <li key={event.id} className="relative flex gap-3">
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0 mt-1">
                <div className={`w-[18px] h-[18px] rounded-full border-2 border-white ${dotColor}`} />
              </div>

              {/* Content */}
              <div className={`flex-1 ${isLast ? "" : "pb-1"}`}>
                <p className="text-sm text-gray-900 font-medium leading-snug">
                  {event.title}
                </p>
                {event.detail && (
                  <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {formatEventDate(event.created_at)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
