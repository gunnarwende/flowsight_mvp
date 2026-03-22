/* ── HeroVisual ──────────────────────────────────────────
   3-Element Chain: Phone (call) → SMS (confirmation) → Leitstand (case)
   Shows the complete cycle in one visual. The SMS with the company name
   is the mirror moment — the strongest psychological trigger.
   Pure Server Component — no interactivity needed.
   ──────────────────────────────────────────────────────── */

function Arrow({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center py-2">
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none" className="text-gold-400">
          <line x1="20" y1="0" x2="20" y2="22" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
          <polygon points="13,22 20,32 27,22" fill="currentColor" />
        </svg>
      </div>
    );
  }
  return (
    <div className="hidden shrink-0 lg:flex lg:flex-col lg:items-center">
      <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="text-gold-400">
        <line x1="0" y1="12" x2="36" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
        <polygon points="36,6 48,12 36,18" fill="currentColor" />
      </svg>
    </div>
  );
}

export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* Desktop: horizontal 3-element chain */}
      <div className="hidden lg:flex lg:items-center lg:gap-2">
        {/* 1. Phone — Incoming call */}
        <div className="w-[180px] shrink-0 -rotate-2">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-2.5 shadow-2xl">
            <div className="mx-auto mb-2 h-4 w-16 rounded-full bg-navy-950" />
            <div className="rounded-xl bg-navy-950 px-3 pb-4 pt-3">
              <div className="flex items-center justify-between text-[9px] text-navy-400">
                <span>09:41</span>
                <span>5G</span>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <div className="relative flex h-11 w-11 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-gold-400/20" />
                  <div className="absolute inset-1 animate-pulse rounded-full bg-gold-400/30" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gold-500">
                    <svg className="h-4 w-4 text-navy-950" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-center gap-[2px]">
                {[3, 5, 8, 12, 8, 14, 10, 6, 9, 4].map((h, i) => (
                  <div key={i} className="w-[2px] rounded-full bg-gold-400/40" style={{ height: `${h}px` }} />
                ))}
              </div>
              <p className="mt-3 text-center text-[9px] font-medium text-navy-300">Eingehender Anruf</p>
            </div>
          </div>
        </div>

        <Arrow />

        {/* 2. SMS — Confirmation with company name (THE MIRROR MOMENT) */}
        <div className="w-[180px] shrink-0">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-2.5 shadow-2xl">
            <div className="mx-auto mb-2 h-4 w-16 rounded-full bg-navy-950" />
            <div className="rounded-xl bg-navy-950 px-3 pb-4 pt-3">
              <div className="flex items-center justify-between text-[9px] text-navy-400">
                <span>09:44</span>
                <span>5G</span>
              </div>
              {/* SMS notification */}
              <div className="mt-3 rounded-lg border border-navy-700 bg-navy-800/80 p-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/20">
                    <svg className="h-3 w-3 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-semibold text-gold-400">Weinberger AG</p>
                </div>
                <p className="mt-2 text-[9px] leading-relaxed text-navy-300">
                  Ihre Meldung wurde aufgenommen. Stimmt alles? flowsight.ch/v/JW-22
                </p>
              </div>
              <p className="mt-3 text-center text-[9px] font-medium text-gold-400/70">
                10 Sek. sp&auml;ter
              </p>
            </div>
          </div>
        </div>

        <Arrow />

        {/* 3. Leitstand — Structured case */}
        <div className="w-[200px] shrink-0 rotate-1">
          <div className="overflow-hidden rounded-xl shadow-2xl">
            <div className="flex items-center gap-2 bg-navy-800 px-2.5 py-1.5">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-navy-600" />
                <div className="h-1.5 w-1.5 rounded-full bg-navy-600" />
                <div className="h-1.5 w-1.5 rounded-full bg-navy-600" />
              </div>
              <div className="flex-1 rounded bg-navy-700 px-2 py-0.5 text-center text-[8px] text-navy-400">
                flowsight.ch/ops
              </div>
            </div>
            <div className="bg-white p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9px] font-medium text-navy-400">Fallnummer</p>
                  <p className="text-[11px] font-bold text-navy-900">JW-0022 &middot; Rohrbruch</p>
                </div>
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] font-semibold text-red-700">
                  Dringend
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5">
                {[
                  { label: "PLZ / Ort", value: "8800 Thalwil" },
                  { label: "Kategorie", value: "Rohrbruch" },
                  { label: "Quelle", value: "Telefon" },
                  { label: "Status", value: "Neu" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center justify-between border-b border-navy-100 pb-1">
                    <span className="text-[9px] text-navy-400">{f.label}</span>
                    <span className="text-[9px] font-medium text-navy-900">{f.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[8px] text-navy-300">Erstellt: vor 2 Min.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: vertical 3-element chain */}
      <div className="flex flex-col items-center gap-1 lg:hidden">
        {/* 1. Phone */}
        <div className="w-full max-w-[200px]">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-navy-800 to-navy-900 p-2.5 shadow-2xl">
            <div className="mx-auto mb-2 h-4 w-16 rounded-full bg-navy-950" />
            <div className="rounded-xl bg-navy-950 px-3 pb-4 pt-3">
              <div className="mt-2 flex items-center justify-center">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-gold-400/20" />
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gold-500">
                    <svg className="h-4 w-4 text-navy-950" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-center text-[9px] font-medium text-navy-300">Eingehender Anruf</p>
            </div>
          </div>
        </div>

        <Arrow vertical />

        {/* 2. SMS */}
        <div className="w-full max-w-[200px]">
          <div className="rounded-xl border border-navy-700 bg-navy-800/80 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500/20">
                <svg className="h-3 w-3 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p className="text-[10px] font-semibold text-gold-400">Weinberger AG</p>
            </div>
            <p className="mt-2 text-[9px] leading-relaxed text-navy-300">
              Ihre Meldung wurde aufgenommen.
            </p>
            <p className="mt-1 text-center text-[8px] text-gold-400/60">10 Sek. sp&auml;ter</p>
          </div>
        </div>

        <Arrow vertical />

        {/* 3. Leitstand mini */}
        <div className="w-full max-w-[220px]">
          <div className="overflow-hidden rounded-xl shadow-xl">
            <div className="flex items-center gap-1.5 bg-navy-800 px-2 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-navy-600" />
              <div className="flex-1 rounded bg-navy-700 px-1.5 py-0.5 text-center text-[7px] text-navy-400">
                flowsight.ch/ops
              </div>
            </div>
            <div className="bg-white p-3">
              <p className="text-[9px] font-bold text-navy-900">JW-0022 &middot; Rohrbruch</p>
              <div className="mt-2 space-y-1">
                {[
                  { l: "Ort", v: "8800 Thalwil" },
                  { l: "Status", v: "Neu" },
                ].map((f) => (
                  <div key={f.l} className="flex justify-between text-[8px]">
                    <span className="text-navy-400">{f.l}</span>
                    <span className="font-medium text-navy-900">{f.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
