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

/**
 * Case detail mockup — shows a single case with appointment,
 * photos, and review button. Used in the dashboard showcase section
 * to illustrate deeper product functionality.
 */
export function CaseDetailMockup({ className = "" }: { className?: string }) {
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
          flowsight.ch/ops/cases/247
        </div>
      </div>

      {/* Case detail body */}
      <div className="rounded-b-xl border border-t-0 border-navy-200/60 bg-white shadow-2xl">
        {/* Back link */}
        <div className="border-b border-navy-100 px-5 py-2.5">
          <span className="text-[11px] text-navy-400">&larr; Zurück zu Fällen</span>
        </div>

        {/* Case header */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-navy-900">
              #247 &middot; Rohrbruch Keller
            </span>
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600">
              Dringend
            </span>
          </div>
          <div className="mt-1 text-[11px] text-navy-400">
            8045 Zürich &middot; Sanitär &middot; 26.02.2026
          </div>
        </div>

        {/* Appointment */}
        <div className="border-t border-navy-100 px-5 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
            Termin
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-gold-100 px-2.5 py-1 text-[11px] font-medium text-gold-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Mi, 26.02. &middot; 14:00
          </div>
        </div>

        {/* Photos */}
        <div className="border-t border-navy-100 px-5 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
            Fotos (2)
          </div>
          <div className="mt-1.5 flex gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-50">
              <svg className="h-4 w-4 text-navy-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v12a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-50">
              <svg className="h-4 w-4 text-navy-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v12a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Review button */}
        <div className="border-t border-navy-100 px-5 py-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-gold-500 px-3 py-1.5 text-[11px] font-semibold text-navy-950">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
            Review anfragen
          </span>
        </div>
      </div>
    </div>
  );
}
