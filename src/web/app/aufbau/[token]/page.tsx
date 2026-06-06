import type { Metadata } from "next";

/**
 * /aufbau/[token] — das Onboarding-COCKPIT (Phase 2, OC5).
 *
 * ⚠️ STRUKTURELLES GERÜST (kein Voll-Feinschliff). Diese Datei zeigt Aufbau +
 * Optik der Cockpit-Schale zum Founder-Review. Der Co-Pilot, in dem der Betrieb
 * sein System in ~1h selbst aufsetzt: „Sie bauen Ihr System, wir führen Sie."
 *
 * TODO (founder-involvierter Folge-Schritt, NICHT in diesem PR):
 *  - Token → `cockpit_sessions`-Lookup + Vorbefüllung aus `tenant_config` (confirm-not-create)
 *  - interaktive Frage-für-Frage-Flows je Strang + Beweis-Loops (Lisa-Testanruf, Wizard-Vorschau)
 *  - Schreiben in DB (`tenants.modules` inkl. `voice_dispositions`, `staff`) + Retell-Prompt
 *  - „An Gunnar senden" → Founder-Review-Gate (Phase 3)
 * Spec: docs/gtm/onboarding/phase2_cockpit_structure.md + phase2_cockpit_manifest.md
 */

interface PageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

// Privat: NIE indexieren (token-geschützt, ein Link pro Betrieb).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Ihr Leitsystem aufbauen",
};

const NAVY = "#1e3a5f";
const GOLD = "#c8a24a";

// --- Gerüst-Daten (Platzhalter; später aus tenant_config vorbefüllt) ---------
const STRAENGE = [
  {
    key: "telefon",
    icon: "📞",
    titel: "Ihre Telefon-Assistentin",
    unter: "Wie Lisa rangeht — und was sie bei welchem Anruf tut.",
    faehigkeiten: [
      "Begrüssung & Sprachen",
      "Notfälle erkennen",
      "Termin-Anliegen aufnehmen",
      "Rückrufe & Lieferanten notieren",
      "Reklamationen sofort melden",
    ],
  },
  {
    key: "website",
    icon: "🌐",
    titel: "Ihr Online-Meldeformular",
    unter: "Welche Anliegen Ihre Kunden melden — in Ihrem Look.",
    faehigkeiten: ["Anliegen-Kategorien", "Ihre Farbe & Logo", "Wo das Formular lebt"],
  },
  {
    key: "vorort",
    icon: "🚪",
    titel: "Vor Ort & manuell",
    unter: "Anliegen, die Sie selbst auf der Baustelle aufnehmen.",
    faehigkeiten: ["Manuelle Erfassung im Leitsystem"],
  },
];

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: "#0b1f33", color: "#e8eef5" }}>
      <main className="mx-auto w-full max-w-[820px] flex-1 px-4 py-7 sm:py-12">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">FlowSight · Oberrieden</footer>
    </div>
  );
}

export default async function AufbauPage({ params }: PageProps) {
  await params; // token (TODO: cockpit_sessions-Lookup + Vorbefüllung)
  const companyName = "Ihr Betrieb"; // TODO: aus Session/tenant_config

  return (
    <Shell>
      {/* 0 · Eröffnung / Co-Pilot-Frame */}
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          Ihr Leitsystem
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Bauen wir {companyName} auf
        </h1>
        <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-slate-300">
          Ich habe <span style={{ color: GOLD }}>80&nbsp;%</span> schon vorbereitet. Sie ergänzen die
          20&nbsp;%, die nur Sie kennen — Schritt für Schritt, in etwa einer Stunde. Kein
          IT-Wissen. Nichts ist scharf, bis Sie es freigeben.
        </p>
      </header>

      {/* 1 · Fortschritts-Band (gewonnene Fähigkeiten, nicht Fragen) */}
      <div className="mx-auto mt-7 max-w-[560px] rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Ihr System wächst</span>
          <span style={{ color: GOLD }}>0 von 3 Strängen startklar</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full" style={{ width: "6%", backgroundColor: GOLD }} />
        </div>
      </div>

      {/* 2 · Die Karte: 3 Stränge → Leitsystem → Next-Steps */}
      <section className="mt-9">
        <div className="grid gap-3 sm:grid-cols-3">
          {STRAENGE.map((s) => (
            <div key={s.key} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <div className="text-2xl">{s.icon}</div>
              <p className="mt-1 text-sm font-semibold text-white">{s.titel.split(" ").slice(-1)}</p>
            </div>
          ))}
        </div>
        <div className="my-2 text-center text-slate-500">↓</div>
        <div
          className="rounded-2xl p-5 text-center font-semibold text-white"
          style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}55` }}
        >
          Ihr Leitsystem — alles an einem Ort
        </div>
        <div className="my-2 text-center text-slate-500">↓</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-slate-300">
          <span style={{ color: GOLD }}>Nächste Schritte</span> — was Sie danach noch tun (z. B. Telefon-Weiterleitung)
        </div>
      </section>

      {/* 3 · Strang-Sektionen (Platzhalter, confirm-not-create) */}
      <section className="mt-10 space-y-4">
        {STRAENGE.map((s, i) => (
          <div key={s.key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{s.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${GOLD}22`, color: GOLD }}
                  >
                    Strang {i + 1}
                  </span>
                  <h2 className="text-base font-bold text-white">{s.titel}</h2>
                </div>
                <p className="mt-1 text-sm text-slate-300">{s.unter}</p>
                <ul className="mt-3 space-y-1.5">
                  {s.faehigkeiten.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-200">
                      <span className="inline-block h-4 w-4 rounded-full border border-white/25" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-500">
                  Am Ende testen Sie es sofort — und sehen, dass es läuft.
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 4 · Finale */}
      <section className="mt-10 rounded-2xl border p-6 text-center" style={{ borderColor: `${GOLD}55`, backgroundColor: NAVY }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          Am Ende
        </p>
        <h2 className="mt-2 text-xl font-bold text-white">Schauen Sie, was Sie gebaut haben</h2>
        <p className="mx-auto mt-2 max-w-[520px] text-sm text-slate-300">
          Ihre drei Stränge fügen sich zu einem lebenden System: Anruf → Meldung → Fall →
          Bewertung. Dann schaue ich kurz drüber, und wir gehen gemeinsam live.
        </p>
        <button
          type="button"
          disabled
          className="mt-5 cursor-not-allowed rounded-xl px-6 py-3 text-sm font-bold text-white opacity-60"
          style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
        >
          An Gunnar zum Freischalten senden
        </button>
        <p className="mt-2 text-[11px] text-slate-500">(Gerüst — Aktion folgt mit dem Daten-Layer.)</p>
      </section>
    </Shell>
  );
}
