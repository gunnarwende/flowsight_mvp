/* ── HeroVisual ──────────────────────────────────────────
   Split-visual: Phone (incoming call) → Arrow → Structured Case
   Pure Server Component — no interactivity needed.
   ──────────────────────────────────────────────────────── */

export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-4">
        {/* ── Left: Smartphone with incoming notification ── */}
        <div className="relative mx-auto w-full max-w-xs lg:mx-0 lg:-rotate-2">
          {/* Phone frame */}
          <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-navy-800 to-navy-900 p-3 shadow-2xl">
            {/* Notch */}
            <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-navy-950" />

            {/* Screen */}
            <div className="rounded-2xl bg-navy-950 px-4 pb-6 pt-4">
              {/* Status bar */}
              <div className="flex items-center justify-between text-[10px] text-navy-400">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span>5G</span>
                </div>
              </div>

              {/* Pulsing call indicator */}
              <div className="mt-6 flex items-center justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-gold-400/20" />
                  <div className="absolute inset-1 animate-pulse rounded-full bg-gold-400/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gold-500">
                    <svg className="h-5 w-5 text-navy-950" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Voice waveform hint */}
              <div className="mt-4 flex items-end justify-center gap-[3px]">
                {[3, 5, 8, 12, 8, 14, 10, 6, 9, 4, 7, 11, 6, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-gold-400/40"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              {/* Notification card */}
              <div className="mt-5 rounded-xl border border-navy-700 bg-navy-800/80 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gold-400">
                  Neue Meldung
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">
                  Rohrbruch Keller
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-navy-300">
                  <span>8045 Zürich</span>
                  <span className="text-navy-600">·</span>
                  <span className="font-medium text-red-400">Dringend</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Visual connector ── */}
        {/* Desktop: horizontal arrow */}
        <div className="hidden shrink-0 flex-col items-center lg:flex">
          <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="text-gold-400">
            <line x1="0" y1="20" x2="64" y2="20" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <polygon points="64,12 80,20 64,28" fill="currentColor" />
          </svg>
          <span className="mt-1 text-[10px] font-medium tracking-wide text-gold-400/70">
            KI verarbeitet…
          </span>
        </div>
        {/* Mobile: vertical arrow */}
        <div className="flex flex-col items-center lg:hidden">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" className="text-gold-400">
            <line x1="20" y1="0" x2="20" y2="34" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
            <polygon points="12,34 20,48 28,34" fill="currentColor" />
          </svg>
          <span className="mt-1 text-[10px] font-medium tracking-wide text-gold-400/70">
            KI verarbeitet…
          </span>
        </div>

        {/* ── Right: Structured case (mini browser) ── */}
        <div className="relative mx-auto w-full max-w-xs lg:mx-0 lg:rotate-1">
          <div className="overflow-hidden rounded-xl shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 bg-navy-800 px-3 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-navy-600" />
                <div className="h-2 w-2 rounded-full bg-navy-600" />
                <div className="h-2 w-2 rounded-full bg-navy-600" />
              </div>
              <div className="flex-1 rounded bg-navy-700 px-2 py-0.5 text-center text-[9px] text-navy-400">
                ops.flowsight.ch
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-white p-4">
              {/* Case header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-navy-400">
                    Fallnummer
                  </p>
                  <p className="text-sm font-bold text-navy-900">
                    FS-0247 · Rohrbruch Keller
                  </p>
                </div>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                  Dringend
                </span>
              </div>

              {/* Structured fields */}
              <div className="mt-4 space-y-2">
                {[
                  { label: "PLZ / Ort", value: "8045 Zürich" },
                  { label: "Kategorie", value: "Rohrbruch" },
                  { label: "Quelle", value: "Telefonassistent" },
                  { label: "Status", value: "Neu" },
                ].map((field) => (
                  <div key={field.label} className="flex items-center justify-between border-b border-navy-100 pb-1.5">
                    <span className="text-[11px] text-navy-400">{field.label}</span>
                    <span className="text-[11px] font-medium text-navy-900">{field.value}</span>
                  </div>
                ))}
              </div>

              {/* Timestamp */}
              <p className="mt-3 text-[9px] text-navy-300">
                Erstellt: vor 2 Minuten
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
