import type { Metadata } from "next";
import Link from "next/link";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "Preise — FlowSight",
  description:
    "FlowSight Preise: Standard ab CHF 299/Mo (120 Fälle), Professional ab CHF 499/Mo (250 Fälle). Monatlich kündbar.",
};

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

/* ================================================================
   /pricing — 3-Tier-Modell gemäss SSOT
   Quelle: docs/redesign/leitstand/pricing_und_marge.md (FINAL)
   Anker: Fallvolumen. NICHT Minuten. NICHT Module.
   ================================================================ */

const TIERS = [
  {
    name: "Standard",
    price: "CHF 299",
    target: "Für Betriebe bis 5 Mitarbeiter",
    cases: "120 Fälle pro Monat inklusive",
    overage: "Danach CHF 1.50 pro Fall",
    highlight: false,
    features: [
      "Komplettes Leitsystem für Ihren Betrieb",
      "Telefonassistentin — rund um die Uhr, mehrsprachig",
      "Online-Meldungsformular auf Ihrer Website",
      "Automatische Rückmeldung an Ihre Kunden",
      "Strukturierte Fallübersicht mit Terminplanung",
      "Bewertungsanfragen nach erledigtem Einsatz",
      "Persönliche Einrichtung inklusive",
    ],
  },
  {
    name: "Professional",
    price: "CHF 499",
    target: "Für Betriebe mit 6–15 Mitarbeitern",
    cases: "250 Fälle pro Monat inklusive",
    overage: "Danach CHF 1.00 pro Fall",
    highlight: true,
    features: [
      "Alles aus Standard",
      "Höheres Fallvolumen für serviceintensive Betriebe",
      "Eigene Ansicht pro Mitarbeiter",
      "Prioritäts-Support",
    ],
  },
  {
    name: "Enterprise",
    price: "Individuell",
    target: "Für grössere Betriebe oder besondere Anforderungen",
    cases: "Individuelles Fallvolumen",
    overage: "Individuelle Konditionen",
    highlight: false,
    features: [
      "Alles aus Professional",
      "Individuelles Fallvolumen",
      "Dedizierter Ansprechpartner",
      "Individuelle Anbindungen",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <>
      {/* ── Header ──────────────────────────────── */}
      <section className="bg-navy-50 pb-4 pt-24 lg:pt-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-5xl">
            Transparente Preise. Monatlich kündbar.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-navy-400">
            Ein Leitsystem — abgestimmt auf die Grösse Ihres Betriebs.
          </p>
        </div>
      </section>

      {/* ── 3-Tier Pricing ─────────────────────── */}
      <section className="bg-navy-50 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl bg-white p-8 shadow-sm ${
                  tier.highlight
                    ? "border-2 border-gold-500 shadow-md"
                    : "border border-navy-200/60"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
                    Empfohlen
                  </span>
                )}

                <p className={`text-sm font-semibold uppercase tracking-wider ${
                  tier.highlight ? "text-gold-600" : "text-navy-400"
                }`}>
                  {tier.name}
                </p>
                <p className="mt-4">
                  <span className="text-4xl font-bold text-navy-900">{tier.price}</span>
                  {tier.price !== "Individuell" && (
                    <span className="ml-1 text-base text-navy-400">/ Monat</span>
                  )}
                </p>
                <p className="mt-1 text-sm text-navy-900/70">{tier.target}</p>
                <p className="mt-1 text-xs text-navy-400">{tier.cases}</p>
                <p className="text-xs text-navy-400">{tier.overage}</p>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-navy-900/80">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/live-erleben#formular"
                  className={`mt-8 block w-full rounded-lg py-3.5 text-center text-sm font-semibold transition-all ${
                    tier.highlight
                      ? "bg-gold-500 text-navy-950 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
                      : "bg-navy-900 text-white hover:bg-navy-800"
                  }`}
                >
                  {tier.price === "Individuell" ? "Kontakt aufnehmen" : "Persönlich beraten lassen"}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-navy-400">
            Persönliche Einrichtung inklusive · Monatlich kündbar · Keine versteckten Kosten
          </p>
        </div>
      </section>

      {/* ── Einrichtung ────────────────────────── */}
      <section className="bg-warm-white py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            Persönlich eingerichtet. In einer Woche.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-navy-400">
            Kein Self-Service, kein IT-Projekt. Wir richten das Leitsystem
            gemeinsam für Ihren Betrieb ein — Website, Telefonassistentin und
            Leitstand. Persönlich und inklusive.
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section className="bg-navy-50 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-navy-900">
            Häufige Fragen
          </h2>

          <div className="mt-10 divide-y divide-navy-200/60">
            {[
              {
                q: "Was passiert, wenn ich mehr Fälle habe als im Paket enthalten?",
                a: "Jeder weitere Fall kostet CHF 1.50 (Standard) bzw. CHF 1.00 (Professional). Transparent und jederzeit im Leitstand sichtbar.",
              },
              {
                q: "Wann brauche ich Professional?",
                a: "Ab 6 Mitarbeitern oder wenn Ihr Betrieb mehr als 120 Fälle pro Monat erwartet. Betriebe mit Notdienst oder hoher Serviceintensität empfehlen wir grundsätzlich Professional.",
              },
              {
                q: "Gibt es eine Mindestlaufzeit?",
                a: "Nein. Monatlich kündbar — ohne Bindung.",
              },
              {
                q: "Was kostet die Einrichtung?",
                a: "Nichts. Die persönliche Einrichtung ist inklusive.",
              },
              {
                q: "Kann ich später wechseln?",
                a: "Jederzeit. Wenn Ihr Betrieb wächst, wechseln Sie einfach auf Professional oder Enterprise.",
              },
            ].map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg
                    className="ml-4 h-5 w-5 shrink-0 text-navy-400 transition-transform duration-200 group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <p className="mt-3 pr-12 text-sm leading-relaxed text-navy-900/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────── */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bereit? Wir richten alles für Sie ein.
            </h2>
            <p className="mt-4 text-lg text-navy-300">
              Sagen Sie uns, wer Sie sind — wir richten das Leitsystem persönlich
              für Ihren Betrieb ein.
            </p>
          </div>
          <div className="mt-12">
            <DemoForm />
          </div>
        </div>
      </section>
    </>
  );
}
