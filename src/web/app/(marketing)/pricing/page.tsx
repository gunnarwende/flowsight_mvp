import type { Metadata } from "next";
import Link from "next/link";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "Preise — FlowSight",
};

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

const TIERS = [
  {
    name: "Starter",
    price: "ab CHF 99",
    subtitle: "Website + Wizard",
    highlighted: false,
    features: [
      "Moderne Website im Firmenlook",
      "Mobil-optimiert & SEO-ready",
      "Online-Schadenmelde-Formular (Wizard)",
      "E-Mail-Benachrichtigung bei Meldung",
      "Bestätigungs-E-Mail an Melder",
      "Persönliches Onboarding",
    ],
  },
  {
    name: "Professional",
    price: "ab CHF 249",
    subtitle: "Website + Voice + Dashboard",
    highlighted: true,
    features: [
      "Alles aus Starter, plus:",
      "KI-Telefonassistent (24/7, mehrsprachig)",
      "Schweizer Telefonnummer inklusive",
      "Ops-Dashboard mit Fall-Übersicht",
      "Terminplanung mit ICS-Einladung",
      "Foto-Anhänge pro Fall",
    ],
  },
  {
    name: "Premium",
    price: "ab CHF 349",
    subtitle: "Das Komplettpaket",
    highlighted: false,
    features: [
      "Alles aus Professional, plus:",
      "Google-Review-Anfragen per Knopfdruck",
      "Täglicher Statusbericht (Morning Report)",
      "Prioritäts-Support",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────── */}
      <section className="bg-navy-50 pb-4 pt-24 lg:pt-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h1 className="text-center text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
            Einfache, faire Preise.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-navy-400">
            Keine versteckten Kosten. Keine Bindung.
            Monatlich kündbar.
          </p>
        </div>
      </section>

      {/* ── 3 Pricing cards ─────────────────────────────── */}
      <section className="bg-navy-50 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl bg-white p-8 shadow-sm ${
                  tier.highlighted
                    ? "border-2 border-gold-500 shadow-md"
                    : "border border-navy-200"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
                    Beliebt
                  </span>
                )}

                <p
                  className={`text-sm font-semibold uppercase tracking-wider ${
                    tier.highlighted ? "text-gold-600" : "text-navy-400"
                  }`}
                >
                  {tier.name}
                </p>
                <p className="mt-4">
                  <span className="text-3xl font-bold text-navy-900">
                    {tier.price}
                  </span>
                  <span className="ml-1 text-base text-navy-400">/ Monat</span>
                </p>
                <p className="mt-2 text-sm text-navy-900/70">{tier.subtitle}</p>

                <ul className="mt-8 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-navy-900/80"
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/demo"
                  className={`mt-8 block w-full rounded-lg py-3.5 text-center text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? "bg-gold-500 text-navy-950 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
                      : "border border-navy-200 text-navy-900 hover:bg-navy-50"
                  }`}
                >
                  Demo vereinbaren
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Voice-Minuten & Einrichtung ─────────────────── */}
      <section className="bg-warm-white py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-navy-200/60 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                Voice-Minuten
              </p>
              <p className="mt-3 text-lg font-semibold text-navy-900">
                Abrechnung nach Verbrauch
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                Nur bei Nutzung — keine Grundgebühr. Ein typischer Intake-Call
                dauert 2–4 Minuten. Der genaue Minutenpreis wird im persönlichen
                Gespräch besprochen.
              </p>
            </div>

            <div className="rounded-2xl border border-navy-200/60 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                Einrichtung
              </p>
              <p className="mt-3 text-lg font-semibold text-navy-900">
                Gemeinsam in einer Woche
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                Website, Telefonnummer, Telefonassistent, Dashboard-Zugang —
                persönlich eingerichtet. Keine Setup-Kosten in der Pilotphase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="bg-navy-50 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-navy-900">
            Häufige Fragen zu den Preisen
          </h2>

          <div className="mt-10 divide-y divide-navy-200/60">
            {[
              {
                q: "Kann ich später upgraden?",
                a: "Ja, jederzeit. Sie starten z.B. mit Starter und fügen Voice und Dashboard hinzu, sobald Sie bereit sind.",
              },
              {
                q: "Gibt es eine Mindestlaufzeit?",
                a: "Nein. Alle Pakete sind monatlich kündbar — ohne Bindung.",
              },
              {
                q: "Was kostet die Einrichtung?",
                a: "In der Pilotphase: nichts. Wir richten alles gemeinsam ein — Website, Telefonassistent und Dashboard.",
              },
              {
                q: "Wie werden Voice-Minuten abgerechnet?",
                a: "Nur bei Nutzung. Ein typischer Intake-Call dauert 2–4 Minuten. Den genauen Minutenpreis besprechen wir persönlich.",
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

      {/* ── Demo form (#demo) ─────────────────────────────── */}
      <section
        id="demo"
        className="scroll-mt-20 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Jetzt Demo vereinbaren.
            </h2>
            <p className="mt-4 text-lg text-navy-200">
              In 30 Minuten zeigen wir Ihnen, wie FlowSight Ihren Alltag
              vereinfacht — persönlich und unverbindlich.
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
