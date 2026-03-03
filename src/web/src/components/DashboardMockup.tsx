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
 * Full dashboard showcase — high-end mockup with KPI cards + 10 realistic
 * cases in a table layout. Used in the "Alles kommt zu Ihnen" section.
 */

const showcaseCases = [
  { id: "FS-0251", customer: "Fam. Brunner", address: "8800 Thalwil", category: "Sanitär", desc: "Rohrbruch Keller", source: "phone", urgency: "hoch", urgencyDot: "bg-red-500", status: "Neu", statusColor: "bg-blue-100 text-blue-700", date: "03.03." },
  { id: "FS-0250", customer: "Hr. Meier", address: "8002 Zürich", category: "Heizung", desc: "Heizung Störung OG", source: "phone", urgency: "mittel", urgencyDot: "bg-amber-500", status: "Neu", statusColor: "bg-blue-100 text-blue-700", date: "03.03." },
  { id: "FS-0249", customer: "Fr. Keller", address: "8134 Adliswil", category: "Sanitär", desc: "Tropfender Wasserhahn Bad", source: "globe", urgency: "normal", urgencyDot: "bg-gray-400", status: "Kontaktiert", statusColor: "bg-sky-100 text-sky-700", date: "02.03." },
  { id: "FS-0248", customer: "Fam. Schmid", address: "8045 Zürich", category: "Sanitär", desc: "WC-Spülung defekt", source: "phone", urgency: "mittel", urgencyDot: "bg-amber-500", status: "Geplant", statusColor: "bg-violet-100 text-violet-700", date: "02.03." },
  { id: "FS-0247", customer: "Hr. Weber", address: "8800 Thalwil", category: "Heizung", desc: "Boiler-Service jährlich", source: "globe", urgency: "normal", urgencyDot: "bg-gray-400", status: "Geplant", statusColor: "bg-violet-100 text-violet-700", date: "01.03." },
  { id: "FS-0246", customer: "Fr. Müller", address: "8942 Oberrieden", category: "Sanitär", desc: "Verstopfung Küche", source: "phone", urgency: "mittel", urgencyDot: "bg-amber-500", status: "Kontaktiert", statusColor: "bg-sky-100 text-sky-700", date: "01.03." },
  { id: "FS-0245", customer: "Hr. Huber", address: "8038 Zürich", category: "Heizung", desc: "Thermostat tauschen", source: "plus", urgency: "normal", urgencyDot: "bg-gray-400", status: "Geplant", statusColor: "bg-violet-100 text-violet-700", date: "28.02." },
  { id: "FS-0244", customer: "Fam. Fischer", address: "8002 Zürich", category: "Sanitär", desc: "Dusche Abdichtung", source: "phone", urgency: "normal", urgencyDot: "bg-gray-400", status: "Erledigt", statusColor: "bg-emerald-100 text-emerald-700", date: "27.02." },
  { id: "FS-0243", customer: "Fr. Steiner", address: "8134 Adliswil", category: "Heizung", desc: "Heizkörper entlüften", source: "globe", urgency: "normal", urgencyDot: "bg-gray-400", status: "Erledigt", statusColor: "bg-emerald-100 text-emerald-700", date: "27.02." },
  { id: "FS-0242", customer: "Hr. Roth", address: "8800 Thalwil", category: "Sanitär", desc: "Wasserenthärter Service", source: "phone", urgency: "normal", urgencyDot: "bg-gray-400", status: "Erledigt", statusColor: "bg-emerald-100 text-emerald-700", date: "26.02." },
];

const SOURCE_ICONS: Record<string, string> = {
  phone: "\uD83D\uDCDE",
  globe: "\uD83C\uDF10",
  plus: "\u2795",
};

export function DashboardShowcase({ className = "" }: { className?: string }) {
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
      <div className="rounded-b-xl border border-t-0 border-navy-200/60 bg-gray-50 shadow-2xl">
        {/* Sidebar + main area */}
        <div className="flex">
          {/* Minimal sidebar hint */}
          <div className="hidden sm:flex w-12 shrink-0 flex-col items-center gap-4 border-r border-navy-100 bg-navy-800 py-4">
            <div className="h-5 w-5 rounded bg-gold-500/80" />
            <div className="h-4 w-4 rounded bg-navy-600" />
            <div className="h-4 w-4 rounded bg-navy-500" />
            <div className="h-4 w-4 rounded bg-navy-600" />
          </div>

          <div className="flex-1 min-w-0">
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 px-3 md:px-4 pt-3 md:pt-4 pb-2 md:pb-3">
              {[
                { label: "Total Fälle", value: "47", color: "text-navy-900", accent: "border-l-slate-400" },
                { label: "Neu heute", value: "2", color: "text-blue-700", accent: "border-l-blue-500" },
                { label: "In Bearbeitung", value: "5", color: "text-violet-700", accent: "border-l-violet-500" },
                { label: "Erledigt (7d)", value: "8", color: "text-emerald-700", accent: "border-l-emerald-500" },
              ].map((kpi) => (
                <div key={kpi.label} className={`bg-white border border-gray-200 border-l-[3px] ${kpi.accent} rounded-lg px-2.5 py-2`}>
                  <div className="text-[9px] text-gray-500 font-medium">{kpi.label}</div>
                  <div className={`text-lg font-bold ${kpi.color}`}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-gray-200 bg-white px-2 py-1">
                  <svg className="w-2.5 h-2.5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <span className="text-[9px] text-gray-400">Suchen...</span>
                </div>
                <span className="text-[9px] text-gray-500 font-medium">10 Fälle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[9px] font-medium text-gray-600">Exportieren</span>
                <span className="rounded-md bg-navy-800 px-2 py-1 text-[9px] font-medium text-white">+ Neuer Fall</span>
              </div>
            </div>

            {/* Desktop table */}
            <div className="mx-4 mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white hidden md:block">
              {/* Table header */}
              <div className="grid grid-cols-[60px_80px_80px_1fr_36px_52px_56px_40px] gap-0 border-b border-gray-200 bg-gray-50/80 px-3 py-1.5">
                {["Fall-ID", "Kunde", "Adresse", "Problem", "Quelle", "Dringl.", "Status", "Datum"].map((h) => (
                  <span key={h} className="text-[8px] font-semibold uppercase tracking-wider text-gray-400">{h}</span>
                ))}
              </div>

              {/* Table rows */}
              {showcaseCases.map((c, i) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-[60px_80px_80px_1fr_36px_52px_56px_40px] gap-0 items-center px-3 py-1.5 ${i < showcaseCases.length - 1 ? "border-b border-gray-50" : ""} ${i === 0 ? "bg-blue-50/40" : ""}`}
                >
                  <span className="text-[10px] font-medium text-amber-600">{c.id}</span>
                  <span className="text-[10px] text-gray-900 truncate">{c.customer}</span>
                  <span className="text-[10px] text-gray-500 truncate">{c.address}</span>
                  <span className="text-[10px] text-gray-700 truncate">
                    <span className="font-medium">{c.category}</span>
                    <span className="text-gray-400"> — {c.desc}</span>
                  </span>
                  <span className="text-[10px]">{SOURCE_ICONS[c.source] ?? ""}</span>
                  <span className="inline-flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.urgencyDot}`} />
                    <span className="text-[9px] text-gray-600 capitalize">{c.urgency}</span>
                  </span>
                  <span className={`inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold text-center ${c.statusColor}`}>
                    {c.status}
                  </span>
                  <span className="text-[9px] text-gray-400">{c.date}</span>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="mx-3 mb-3 space-y-2 md:hidden">
              {showcaseCases.map((c) => (
                <div key={c.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-amber-600">{c.id}</span>
                      <span className="text-[10px] text-gray-500">{c.customer}</span>
                    </div>
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${c.statusColor}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-900 font-medium">
                    {c.category} — {c.desc}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.urgencyDot}`} />
                      <span className="capitalize">{c.urgency}</span>
                    </span>
                    <span>{SOURCE_ICONS[c.source]}</span>
                    <span>{c.address}</span>
                    <span>{c.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
