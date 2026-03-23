import type { Metadata } from "next";
import Link from "next/link";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "Preise — FlowSight",
  description: "FlowSight Preise: Standard ab CHF 299/Mo, Professional ab CHF 499/Mo. Monatlich kündbar, keine Bindung.",
};

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

const FEATURES = [
  "Moderne Website im Firmenlook (mobiloptimiert)",
  "Online-Meldungsformular auf Ihrer Website",
  "Telefonassistentin (24/7, mehrsprachig)",
  "Bestätigungs-SMS + Foto-Upload für Ihre Kunden",
  "Leitstand: alle F\u00e4lle an einem Ort",
  "E-Mail-Benachrichtigung bei jeder neuen Meldung",
  "Google-Bewertungen gezielt anfragen",
  "Persönliches Onboarding & Setup inklusive",
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

      {/* ── Single pricing card ─────────────────────────── */}
      <section className="bg-navy-50 py-16 lg:py-24">
        <div className="mx-auto max-w-xl px-6 lg:px-8">
          <div className="relative rounded-2xl border-2 border-gold-500 bg-white p-8 shadow-md">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
              Alles inklusive
            </span>

            <p className="text-sm font-semibold uppercase tracking-wider text-gold-600">
              FlowSight
            </p>
            <p className="mt-4">
              <span className="text-4xl font-bold text-navy-900">CHF 299</span>
              <span className="ml-1 text-base text-navy-400">/ Monat</span>
            </p>
            <p className="mt-2 text-sm text-navy-900/70">
              Website, Telefonassistentin, Leitstand, SMS, Bewertungen &mdash; ein Preis f&uuml;r alles.
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map((f) => (
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
              href="/live-erleben"
              className="mt-8 block w-full rounded-lg bg-gold-500 py-3.5 text-center text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
            >
              Pers\u00f6nlich beraten lassen
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-navy-400">
            Gr\u00f6sserer Betrieb oder spezielle Anforderungen?{" "}
            <Link href="/live-erleben#formular" className="font-semibold text-gold-600 hover:text-gold-500">
              Kontaktieren Sie uns
            </Link>{" "}
            &mdash; wir finden eine passende L\u00f6sung.
          </p>
        </div>
      </section>

      {/* ── Voice-Minuten & Einrichtung ─────────────────── */}
      <section className="bg-warm-white py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-navy-200/60 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                Telefonminuten
              </p>
              <p className="mt-3 text-lg font-semibold text-navy-900">
                Abrechnung nach Verbrauch
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                Nur bei Nutzung — keine Grundgebühr. Ein typisches Gespräch
                dauert 2–4 Minuten. Den genauen Minutenpreis besprechen wir
                persönlich.
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
                Website, Telefonnummer, Telefonassistentin, Leitstand &mdash;
                pers&ouml;nlich eingerichtet. Keine Setup-Kosten.
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
                q: "Was ist alles enthalten?",
                a: "Alles: Website, Telefonassistentin (24/7), Leitstand, SMS-Best\u00e4tigungen, Bewertungen, Mehrsprachig — ein Preis, keine versteckten Extras.",
              },
              {
                q: "Gibt es eine Mindestlaufzeit?",
                a: "Nein. Monatlich kündbar — ohne Bindung.",
              },
              {
                q: "Was kostet die Einrichtung?",
                a: "Nichts. Wir richten alles gemeinsam ein \u2014 Website, Telefonassistentin und Leitstand. Pers\u00f6nlich.",
              },
              {
                q: "Wie werden Telefonminuten abgerechnet?",
                a: "Nur bei Nutzung. Ein typisches Gespräch dauert 2–4 Minuten. Den genauen Minutenpreis besprechen wir persönlich.",
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
              Bereit? Wir richten alles f&uuml;r Sie ein.
            </h2>
            <p className="mt-4 text-lg text-navy-200">
              Sagen Sie uns, wer Sie sind &mdash; wir richten das System pers&ouml;nlich
              für Ihren Betrieb. In 48 Stunden. 14 Tage kostenlos.
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
