/**
 * Decorative dashboard mockup — shows a realistic case list
 * inside a browser frame. Used as hero visual on the marketing page.
 *
 * Pure HTML/Tailwind (server component). Replace with a real
 * screenshot once the product is polished enough.
 */

const cases = [
  {
    id: "#247",
    title: "Rohrbruch Keller",
    location: "8045 Zürich",
    category: "Sanitär",
    time: "vor 2 Std.",
    urgency: "Dringend",
    urgencyColor: "bg-red-500/10 text-red-600",
    status: "Neu",
    statusColor: "bg-gold-500/15 text-gold-600",
  },
  {
    id: "#246",
    title: "Heizung Störung",
    location: "8134 Adliswil",
    category: "Heizung",
    time: "vor 5 Std.",
    urgency: "Mittel",
    urgencyColor: "bg-amber-500/10 text-amber-600",
    status: "Geplant",
    statusColor: "bg-sky-500/10 text-sky-600",
  },
  {
    id: "#245",
    title: "Boiler-Service",
    location: "8002 Zürich",
    category: "Sanitär",
    time: "gestern",
    urgency: "Normal",
    urgencyColor: "bg-navy-100 text-navy-400",
    status: "Erledigt",
    statusColor: "bg-emerald-500/10 text-emerald-600",
  },
];

export function DashboardMockup({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 rounded-t-xl bg-navy-800 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-navy-700/60 px-3 py-1 text-[11px] text-navy-400">
          flowsight.ch/ops/cases
        </div>
      </div>

      {/* Dashboard body */}
      <div className="rounded-b-xl border border-t-0 border-navy-200/60 bg-white shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-navy-900">Fälle</span>
            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold text-gold-600">
              3 offen
            </span>
          </div>
          <div className="flex gap-2">
            <span className="rounded-md bg-navy-50 px-2.5 py-1 text-[10px] font-medium text-navy-400">
              Alle
            </span>
            <span className="rounded-md bg-navy-50 px-2.5 py-1 text-[10px] font-medium text-navy-400">
              Heute
            </span>
          </div>
        </div>

        {/* Case list */}
        <div className="divide-y divide-navy-100/60 px-5">
          {cases.map((c) => (
            <div key={c.id} className="flex items-center gap-4 py-3.5">
              {/* Left: case info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-navy-400">
                    {c.id}
                  </span>
                  <span className="truncate text-sm font-medium text-navy-900">
                    {c.title}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-navy-400">
                  <span>{c.location}</span>
                  <span>·</span>
                  <span>{c.category}</span>
                  <span>·</span>
                  <span>{c.time}</span>
                </div>
              </div>

              {/* Right: badges */}
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.urgencyColor}`}
                >
                  {c.urgency}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.statusColor}`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
