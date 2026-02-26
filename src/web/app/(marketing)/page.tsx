import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";
import { DashboardMockup, CaseDetailMockup } from "@/src/components/DashboardMockup";
import { DemoForm } from "@/src/components/DemoForm";

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

function ShieldIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function ClockIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}

function CalendarIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  );
}

function StarIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

function CameraIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 6.75v12a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function GlobeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.47.353-2.856.978-4.082" />
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────── */}
      <section className="overflow-hidden bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pb-24 sm:pt-28 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pb-32 lg:pt-36">
          {/* Text */}
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
              Für Sanitär- &amp; Heizungsbetriebe in der Schweiz
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Jeder Anruf wird{" "}
              <span className="text-gold-400">zum Auftrag.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-navy-200">
              Website, Telefonassistent und Ops-Dashboard — alles aus einer Hand.
              FlowSight nimmt Schadensmeldungen entgegen, erstellt strukturierte Fälle
              und liefert Ihnen alles ins Dashboard. 24/7, auch nachts und am Wochenende.
            </p>

            {/* Proof indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-200">
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                Inkl. Website
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                24/7 erreichbar
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                4 Sprachen
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#demo"
                className="rounded-lg bg-gold-500 px-8 py-3.5 text-center text-base font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
              >
                Demo vereinbaren
              </a>
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-base font-semibold text-navy-200 transition-colors hover:bg-white/5"
              >
                <PhoneIcon className="h-4 w-4" />
                {SITE.phone}
              </a>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-12 lg:mt-0">
            <DashboardMockup className="lg:translate-x-4" />
          </div>
        </div>
      </section>

      {/* ── 2. Problem → Solution ────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Das Problem kennen Sie.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Und so löst FlowSight es — ohne zusätzliche Arbeit für Sie.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              {
                problem: "Ihre Website stammt aus 2010 und schreckt Kunden ab.",
                solution: "Moderne Website in Ihrem Look — in einer Woche live.",
              },
              {
                problem: "Anrufe gehen abends und am Wochenende verloren.",
                solution: "24/7 erreichbar — der Voice Agent nimmt jeden Anruf an.",
              },
              {
                problem: "Zettelwirtschaft statt strukturierter Dokumentation.",
                solution: "Jede Meldung als Fall mit Ort, Kategorie und Dringlichkeit.",
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="group rounded-2xl border border-navy-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-error/10 text-status-error">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <p className="text-sm leading-relaxed text-navy-900/60 line-through decoration-navy-200">
                    {item.problem}
                  </p>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-navy-900">
                    {item.solution}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Dashboard showcase ────────────────────────── */}
      <section className="bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Alles auf einen Blick.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Ihr Ops-Dashboard — Fälle verwalten, Termine planen,
              Reviews anfragen. An einem Ort.
            </p>
          </div>

          <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
            {/* Placeholder for real screenshot */}
            <CaseDetailMockup className="shadow-lg" />

            <div className="space-y-8">
              {[
                {
                  icon: <CalendarIcon className="h-5 w-5" />,
                  title: "Terminplanung",
                  desc: "Termin direkt aus dem Fall setzen — der Melder erhält eine ICS-Einladung per E-Mail.",
                },
                {
                  icon: <CameraIcon className="h-5 w-5" />,
                  title: "Foto-Dokumentation",
                  desc: "Fotos zum Fall hochladen — direkt vom Handy auf der Baustelle.",
                },
                {
                  icon: <StarIcon className="h-5 w-5" />,
                  title: "Google-Reviews",
                  desc: "Nach erledigtem Auftrag eine Review-Anfrage senden — per Knopfdruck.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-navy-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-navy-900/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. How it works ──────────────────────────────── */}
      <section id="funktionen" className="scroll-mt-20 bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              So funktioniert&apos;s
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Drei Schritte — vom Anruf bis zur Google-Bewertung.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div className="absolute left-0 right-0 top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-navy-200 to-transparent sm:block" aria-hidden="true" />

            {[
              {
                step: "1",
                title: "Meldung geht ein",
                desc: "Per Anruf an Ihren Voice Agent oder über das Online-Meldeformular auf Ihrer Website.",
              },
              {
                step: "2",
                title: "Fall wird erstellt",
                desc: "PLZ, Ort, Kategorie, Dringlichkeit — alles strukturiert. Sie erhalten eine E-Mail, der Melder eine Bestätigung.",
              },
              {
                step: "3",
                title: "Sie übernehmen",
                desc: "Termin planen, Fotos anhängen, Fall abschliessen — und per Knopfdruck eine 5-Sterne-Review-Anfrage senden. Alles im Dashboard.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative rounded-2xl border border-navy-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-950 shadow-sm">
                  {item.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Features grid ─────────────────────────────── */}
      <section className="bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Was FlowSight kann.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Alles, was Ihr Betrieb braucht — in einem System.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <GlobeIcon className="h-5 w-5" />,
                title: "Moderne Website",
                desc: "Professionelle Website in Ihrem Firmenlook — mobil-optimiert, SEO-ready, inkl. Online-Schadenmelde-Formular.",
              },
              {
                icon: <PhoneIcon className="h-5 w-5" />,
                title: "Voice Agent",
                desc: "24/7 Anrufannahme — mehrsprachig. Versteht Schweizerdeutsch, Hochdeutsch, Englisch und Französisch.",
              },
              {
                icon: <ChatIcon className="h-5 w-5" />,
                title: "Online-Meldeformular",
                desc: "Branded Wizard auf Ihrer Website. Kunden melden Schäden rund um die Uhr — ohne Anruf.",
              },
              {
                icon: <ClockIcon className="h-5 w-5" />,
                title: "Ops-Dashboard",
                desc: "Alle Fälle auf einen Blick. Status, Termine, Anhänge — strukturiert und sofort einsatzbereit.",
              },
              {
                icon: <CalendarIcon className="h-5 w-5" />,
                title: "Terminplanung",
                desc: "Termin direkt aus dem Fall setzen. Der Melder erhält eine ICS-Einladung per E-Mail.",
              },
              {
                icon: <ShieldIcon className="h-5 w-5" />,
                title: "Datenschutz",
                desc: "Keine Gesprächsaufnahmen. Daten auf EU-Servern. DSGVO-konform. Schweizer Hosting.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-navy-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Trust / Swiss ─────────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldIcon className="mx-auto h-10 w-10 text-gold-500" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Entwickelt für die Schweiz.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Sicher, mehrsprachig und persönlich betreut.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: "Datenschutz",
                desc: "Keine Gesprächsaufnahmen. Daten auf Servern in der EU (Frankfurt). DSGVO-konform.",
              },
              {
                title: "Mehrsprachig",
                desc: "Hochdeutsch, Schweizerdeutsch, Englisch, Französisch — der Voice Agent versteht Ihre Kunden, egal welche Sprache.",
              },
              {
                title: "Persönliches Onboarding",
                desc: "Telefonnummer, Voice Agent, Dashboard — wir richten alles gemeinsam ein. Kein technisches Wissen nötig.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-navy-200/40 bg-navy-50/50 p-8 text-center">
                <h3 className="text-lg font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Pricing teaser — 3 Tiers ──────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Einfache, faire Preise.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Keine versteckten Kosten. Keine Bindung. Monatlich kündbar.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
            {/* Starter */}
            <div className="rounded-2xl border border-navy-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                Starter
              </p>
              <p className="mt-4">
                <span className="text-3xl font-bold text-navy-900">ab CHF 99</span>
                <span className="ml-1 text-base text-navy-400">/ Monat</span>
              </p>
              <p className="mt-2 text-sm text-navy-900/70">
                Website + Wizard
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Moderne Website im Firmenlook",
                  "Mobil-optimiert & SEO-ready",
                  "Online-Schadenmelde-Formular",
                  "E-Mail-Benachrichtigung",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#demo"
                className="mt-8 block w-full rounded-lg border border-navy-200 py-3 text-center text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
              >
                Demo vereinbaren
              </a>
            </div>

            {/* Professional — highlighted */}
            <div className="relative rounded-2xl border-2 border-gold-500 bg-white p-8 shadow-md">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">
                Beliebt
              </span>
              <p className="text-sm font-semibold uppercase tracking-wider text-gold-600">
                Professional
              </p>
              <p className="mt-4">
                <span className="text-3xl font-bold text-navy-900">ab CHF 249</span>
                <span className="ml-1 text-base text-navy-400">/ Monat</span>
              </p>
              <p className="mt-2 text-sm text-navy-900/70">
                + Voice + Ops Dashboard
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Alles aus Starter, plus:",
                  "KI-Telefonassistent (24/7, mehrsprachig)",
                  "Schweizer Telefonnummer inklusive",
                  "Ops-Dashboard mit Fall-Übersicht",
                  "Terminplanung mit ICS-Einladung",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#demo"
                className="mt-8 block w-full rounded-lg bg-gold-500 py-3 text-center text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
              >
                Demo vereinbaren
              </a>
            </div>

            {/* Premium */}
            <div className="rounded-2xl border border-navy-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">
                Premium
              </p>
              <p className="mt-4">
                <span className="text-3xl font-bold text-navy-900">ab CHF 349</span>
                <span className="ml-1 text-base text-navy-400">/ Monat</span>
              </p>
              <p className="mt-2 text-sm text-navy-900/70">
                + Reviews + Morning Report
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Alles aus Professional, plus:",
                  "Google-Review-Anfragen per Knopfdruck",
                  "Täglicher Statusbericht (Morning Report)",
                  "Prioritäts-Support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#demo"
                className="mt-8 block w-full rounded-lg border border-navy-200 py-3 text-center text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
              >
                Demo vereinbaren
              </a>
            </div>
          </div>

          <p className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
            >
              Alle Details zu den Preisen &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* ── 8. FAQ ───────────────────────────────────────── */}
      <section className="bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Häufige Fragen
          </h2>

          <div className="mt-12 divide-y divide-navy-200/60">
            {[
              {
                q: "Bekomme ich auch eine Website?",
                a: "Ja — im Starter-Paket ist eine moderne, mobil-optimierte Website im Firmenlook enthalten. In einer Woche live.",
              },
              {
                q: "Brauche ich technisches Wissen?",
                a: "Nein. Wir richten alles für Sie ein — Website, Telefonnummer, Voice Agent, Dashboard, E-Mail-Vorlagen. Sie brauchen nur einen Browser.",
              },
              {
                q: "Funktioniert das mit meiner bestehenden Nummer?",
                a: "Ja. Wir richten eine Rufumleitung ein, die greift, wenn Sie nicht erreichbar sind — abends, am Wochenende oder im Einsatz.",
              },
              {
                q: "Was passiert bei einem Notfall?",
                a: "Der Voice Agent erkennt die Dringlichkeit und markiert den Fall als Notfall. Sie erhalten sofort eine E-Mail mit allen Details.",
              },
              {
                q: "Können mehrere Mitarbeiter das Dashboard nutzen?",
                a: "Ja. Sie können beliebig viele Benutzer anlegen. Jeder sieht die gleichen Fälle und kann Termine planen, Fotos anhängen und Reviews anfragen.",
              },
              {
                q: "Wie sicher sind meine Daten?",
                a: "Alle Daten werden verschlüsselt übertragen und gespeichert. Es gibt keine Gesprächsaufnahmen. Die Verarbeitung ist DSGVO-konform, die Server stehen in der EU.",
              },
              {
                q: "Wie schnell bin ich einsatzbereit?",
                a: "Website in einer Woche. Voice Agent und Dashboard ebenfalls — wir übernehmen die komplette Einrichtung, persönlich und in Ihrem Tempo.",
              },
            ].map((item) => (
              <details key={item.q} className="group py-6">
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
                <p className="mt-4 pr-12 text-sm leading-relaxed text-navy-900/70">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Demo form (#demo) ─────────────────────────── */}
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
