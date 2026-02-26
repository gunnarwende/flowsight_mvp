import type { Metadata } from "next";
import { SITE } from "@/src/lib/marketing/constants";

export const metadata: Metadata = {
  title: "FlowSight — Jeder Anruf wird zum Auftrag",
};

/* ── Inline SVG icons (no deps) ─────────────────────────── */

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function XIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ArrowRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function ShieldIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

/* ── Signal Dot indicator ────────────────────────────────── */

function ProofDot() {
  return (
    <span className="inline-block h-2 w-2 rounded-full bg-gold-500" aria-hidden="true" />
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-950">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32 lg:px-8 lg:py-40">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
            Für Sanitär- &amp; Heizungsbetriebe in der Schweiz
          </p>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Jeder Anruf wird zum Auftrag.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-200 sm:text-xl">
            {SITE.subtitle} Voice-Intake, Einsatzplanung und Ops Dashboard
            — kein Anruf geht verloren, auch nachts und am Wochenende.
          </p>

          {/* Proof indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-navy-300">
            <span className="flex items-center gap-2"><ProofDot /> 24/7 erreichbar</span>
            <span className="flex items-center gap-2"><ProofDot /> 4 Sprachen</span>
            <span className="flex items-center gap-2"><ProofDot /> Keine Aufnahmen</span>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={SITE.demoUrl}
              className="w-full rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-400 sm:w-auto"
            >
              Demo vereinbaren
            </a>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold-500/30 px-8 py-3.5 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-500/10 sm:w-auto"
            >
              <PhoneIcon className="h-4 w-4" />
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. Problem → Outcome ─────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Das Problem kennen Sie.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-navy-400">
            Und so löst FlowSight es.
          </p>

          <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* Problems */}
            <div className="space-y-6">
              {[
                "Anrufe gehen abends und am Wochenende verloren.",
                "Zettelwirtschaft statt strukturierter Falldokumentation.",
                "Kunden hinterlassen keine Google-Bewertungen.",
              ].map((text) => (
                <div key={text} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-error/10 text-status-error">
                    <XIcon className="h-4 w-4" />
                  </div>
                  <p className="text-base leading-relaxed text-navy-900/80">{text}</p>
                </div>
              ))}
            </div>

            {/* Arrow */}
            <div className="hidden items-center lg:flex">
              <ArrowRightIcon className="h-8 w-8 text-navy-200" />
            </div>
            <div className="flex justify-center lg:hidden">
              <svg className="h-8 w-8 text-navy-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0 6.75-6.75M12 19.5l-6.75-6.75" />
              </svg>
            </div>

            {/* Outcomes */}
            <div className="space-y-6">
              {[
                "24/7 erreichbar — auch um 2 Uhr nachts.",
                "Jede Meldung als strukturierter Fall mit Ort, Kategorie und Dringlichkeit.",
                "Automatische Review-Anfrage nach erledigtem Auftrag.",
              ].map((text) => (
                <div key={text} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-500">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <p className="text-base leading-relaxed text-navy-900/80">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. How it works ──────────────────────────────── */}
      <section id="funktionen" className="scroll-mt-20 bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            So funktioniert&apos;s
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-navy-400">
            Drei Schritte — vom Anruf bis zur Google-Bewertung.
          </p>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Meldung geht ein",
                desc: "Per Anruf an Ihren Voice Agent oder über das Online-Formular. Der Melder beschreibt das Problem — FlowSight erfasst alle Details.",
              },
              {
                step: "2",
                title: "Fall wird erstellt",
                desc: "Postleitzahl, Ort, Kategorie, Dringlichkeit — alles strukturiert. Sie erhalten eine E-Mail, der Melder eine Bestätigung.",
              },
              {
                step: "3",
                title: "Sie übernehmen",
                desc: "Im Dashboard: Termin planen, Fotos anhängen, Fall abschliessen, Google-Review anfragen. Alles an einem Ort.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-navy-200 bg-white p-8 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">
                  {item.step}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Trust / Swiss ─────────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldIcon className="mx-auto h-10 w-10 text-gold-500" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Entwickelt für die Schweiz.
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Datenschutz",
                desc: "Keine Gesprächsaufnahmen. Daten auf Servern in der EU. DSGVO-konform.",
              },
              {
                title: "Hochdeutsch & mehr",
                desc: "Der Voice Agent spricht Hochdeutsch, versteht Schweizerdeutsch und wechselt bei Bedarf auf Englisch oder Französisch.",
              },
              {
                title: "Persönliches Onboarding",
                desc: "Telefonnummer, Voice Agent, Dashboard — gemeinsam eingerichtet. Kein technisches Wissen nötig.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-lg font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Pricing teaser ────────────────────────────── */}
      <section className="bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Einfache Preise.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-navy-400">
            Keine versteckten Kosten. Keine Bindung. Monatlich kündbar.
          </p>

          <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-navy-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold-500">
              FlowSight Pilot
            </p>
            <p className="mt-4">
              <span className="text-4xl font-bold text-navy-900">ab CHF 299</span>
              <span className="ml-2 text-base text-navy-400">/ Monat</span>
            </p>
            <p className="mt-2 text-sm text-navy-900/70">
              Voice + Wizard + Ops Dashboard + E-Mail
            </p>
            <p className="mt-1 text-sm text-navy-400">
              Einrichtung: Gemeinsam in der Pilotphase.
            </p>

            <a
              href={SITE.demoUrl}
              className="mt-8 block w-full rounded-lg bg-gold-500 py-3.5 text-center text-base font-semibold text-navy-950 transition-colors hover:bg-gold-400"
            >
              Demo vereinbaren
            </a>
          </div>

          <p className="mt-8 text-center">
            <a
              href="/pricing"
              className="text-sm font-semibold text-gold-500 hover:text-gold-400"
            >
              Alle Details zu den Preisen &rarr;
            </a>
          </p>
        </div>
      </section>

      {/* ── 6. FAQ ───────────────────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Häufige Fragen
          </h2>

          <div className="mt-12 divide-y divide-navy-200">
            {[
              {
                q: "Brauche ich technisches Wissen?",
                a: "Nein. Wir richten alles für Sie ein. Sie brauchen nur einen Browser und eine E-Mail-Adresse.",
              },
              {
                q: "Funktioniert das mit meiner bestehenden Telefonnummer?",
                a: "Ja. Wir richten eine Weiterleitung ein, die greift, wenn Sie nicht erreichbar sind — abends, am Wochenende oder im Einsatz.",
              },
              {
                q: "Was passiert bei einem Notfall-Anruf?",
                a: "Der Voice Agent erkennt die Dringlichkeit und markiert den Fall als Notfall. Sie erhalten sofort eine E-Mail mit allen Details.",
              },
              {
                q: "Können meine Mitarbeiter das Dashboard nutzen?",
                a: "Ja. Sie können beliebig viele Benutzer anlegen. Jeder sieht die gleichen Fälle und kann Termine planen, Fotos anhängen und Reviews anfragen.",
              },
              {
                q: "Wie sicher sind die Daten?",
                a: "Alle Daten werden verschlüsselt übertragen und gespeichert. Es gibt keine Gesprächsaufnahmen. Die Verarbeitung ist DSGVO-konform.",
              },
            ].map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-navy-900">
                  {item.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-navy-400 transition-transform group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <p className="mt-4 text-base leading-relaxed text-navy-900/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Final CTA ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy-900 to-navy-950 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bereit für weniger Admin und mehr Aufträge?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-navy-200">
            In 30 Minuten zeigen wir Ihnen, wie FlowSight Ihren Alltag
            vereinfacht — persönlich und unverbindlich.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={SITE.demoUrl}
              className="w-full rounded-lg bg-gold-500 px-8 py-3.5 text-base font-semibold text-navy-950 transition-colors hover:bg-gold-400 sm:w-auto"
            >
              Demo vereinbaren
            </a>
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold-500/30 px-8 py-3.5 text-base font-semibold text-gold-300 transition-colors hover:bg-gold-500/10 sm:w-auto"
            >
              <PhoneIcon className="h-4 w-4" />
              {SITE.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
