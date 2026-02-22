import type { Metadata } from "next";
import { SITE } from "@/src/lib/marketing/constants";

export const metadata: Metadata = {
  title: "Preise",
};

export default function PricingPage() {
  return (
    <>
      {/* ── Header ───────────────────────────────────────── */}
      <section className="bg-slate-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h1 className="text-center text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Einfache, faire Preise.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-slate-500">
            Keine versteckten Kosten. Keine Mindestlaufzeit.
            Monatlich kündbar.
          </p>

          {/* ── Pricing card ──────────────────────────────── */}
          <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-8">
              <h2 className="text-lg font-semibold text-slate-900">
                FlowSight Pro
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Alles, was ein Sanitär- oder Heizungsbetrieb braucht.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Einrichtung
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    CHF XXX
                    <span className="text-base font-normal text-slate-500">
                      {" "}einmalig
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Konfiguration, Telefonnummer, Voice Agent, Dashboard-Zugang
                  </p>
                </div>

                <hr className="border-slate-200" />

                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Monatlich
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    CHF XXX
                    <span className="text-base font-normal text-slate-500">
                      {" "}/ Monat
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Dashboard, E-Mail-Benachrichtigungen, unlimitierte
                    Web-Meldungen, Review-Engine
                  </p>
                </div>

                <hr className="border-slate-200" />

                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-400">
                    Voice-Minuten
                  </p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    CHF X.XX
                    <span className="text-base font-normal text-slate-500">
                      {" "}/ Minute
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Nur bei Nutzung. Ein typischer Intake-Call dauert 2–4
                    Minuten.
                  </p>
                </div>
              </div>

              <a
                href={SITE.calendlyUrl}
                className="mt-10 block w-full rounded-lg bg-blue-600 py-3.5 text-center text-base font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Demo buchen
              </a>
            </div>
          </div>

          {/* ── What's included ────────────────────────────── */}
          <div className="mx-auto mt-20 max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-slate-900">
              Alles inklusive
            </h2>
            <div className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2">
              {[
                "Voice Agent — 24/7 Anrufannahme auf Hochdeutsch",
                "Online-Meldeformular mit Kunden-Branding",
                "Ops-Dashboard mit Fall-Übersicht",
                "E-Mail-Benachrichtigung bei jeder Meldung",
                "Bestätigungs-E-Mail an den Melder",
                "Terminplanung mit ICS-Einladung",
                "Foto-Anhänge pro Fall",
                "Google-Review-Anfrage per Knopfdruck",
                "Schweizer Telefonnummer inklusive",
                "Persönliches Onboarding",
              ].map((item) => (
                <div key={item} className="flex gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-base text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-bold text-white">
            Fragen zu den Preisen?
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Wir beraten Sie persönlich und unverbindlich.
          </p>
          <a
            href={SITE.calendlyUrl}
            className="mt-8 inline-block rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Gespräch vereinbaren
          </a>
        </div>
      </section>
    </>
  );
}
