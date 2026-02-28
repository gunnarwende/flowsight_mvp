import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";
import { HeroVisual } from "@/src/components/HeroVisual";
import { CaseDetailMockup } from "@/src/components/DashboardMockup";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "FlowSight — Jeder Anruf wird zum Auftrag",
  description:
    "KI-Telefonassistent, Ops-Dashboard und professionelle Website für Sanitär- und Heizungsbetriebe. 24/7 erreichbar, strukturierte Fälle, Google Reviews. Raum Zürich.",
  openGraph: {
    title: "FlowSight — Jeder Anruf wird zum Auftrag",
    description:
      "KI-Telefonassistent, Ops-Dashboard und professionelle Website für Sanitär- und Heizungsbetriebe. 24/7 erreichbar, strukturierte Fälle, Google Reviews. Raum Zürich.",
    url: "https://flowsight.ch",
  },
  alternates: {
    canonical: "https://flowsight.ch",
  },
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
              Website, KI-Telefonassistent und Ops-Dashboard — alles aus einer Hand.
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
                5 Sprachen
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/demo"
                className="rounded-lg bg-gold-500 px-8 py-3.5 text-center text-base font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
              >
                Demo vereinbaren
              </Link>
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-base font-semibold text-navy-200 transition-colors hover:bg-white/5"
              >
                <PhoneIcon className="h-4 w-4" />
                {SITE.phone}
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-12 lg:mt-0">
            <HeroVisual className="lg:translate-x-4" />
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

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                problem: "Ihre Website zeigt nicht, wie gut Sie wirklich sind.",
                solution: "Moderne Website in Ihrem Look — in einer Woche live.",
              },
              {
                problem: "Anrufe gehen abends und am Wochenende verloren.",
                solution: "24/7 erreichbar — der Telefonassistent nimmt jeden Anruf an.",
              },
              {
                problem: "Zettelwirtschaft statt strukturierter Dokumentation.",
                solution: "Jede Meldung als Fall mit Ort, Kategorie und Dringlichkeit.",
              },
              {
                problem: "Zufriedene Kunden — aber keine Bewertungen auf Google.",
                solution: "Per Knopfdruck eine Review-Anfrage senden. Mehr Sterne, mehr Aufträge.",
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

      {/* ── 3. Prozessflow — "So funktioniert FlowSight." ── */}
      <section id="funktionen" className="scroll-mt-20 bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              So funktioniert FlowSight.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Von der Meldung bis zur 5-Sterne-Bewertung — in vier Schritten.
            </p>
          </div>

          <div className="relative mt-16">
            {/* SVG Loop connector — desktop only */}
            <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none">
                <rect x="8" y="8" width="84" height="84" rx="4" stroke="rgb(var(--color-gold-400))" strokeWidth="0.4" strokeDasharray="2 1.5" fill="none" opacity="0.35" />
                {/* Arrow hints at corners */}
                <polygon points="50,7 51.5,10 48.5,10" fill="rgb(var(--color-gold-400))" opacity="0.4" />
                <polygon points="93,50 90,48.5 90,51.5" fill="rgb(var(--color-gold-400))" opacity="0.4" />
                <polygon points="50,93 48.5,90 51.5,90" fill="rgb(var(--color-gold-400))" opacity="0.4" />
                <polygon points="7,50 10,48.5 10,51.5" fill="rgb(var(--color-gold-400))" opacity="0.4" />
              </svg>
            </div>

            <div className="relative grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2">
              {[
                {
                  step: "1",
                  title: "Meldung geht ein",
                  desc: "Per Anruf an Ihren KI-Telefonassistenten oder über das Online-Formular auf Ihrer Website — 24/7, auch nachts und am Wochenende.",
                  icon: (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      <circle cx="20" cy="4" r="3.5" fill="currentColor" strokeWidth={0} opacity={0.3} />
                    </svg>
                  ),
                },
                {
                  step: "2",
                  title: "Fall wird erstellt",
                  desc: "PLZ, Ort, Kategorie, Dringlichkeit — alles strukturiert. Sie erhalten eine E-Mail, der Melder eine Bestätigung. Automatisch.",
                  icon: (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                    </svg>
                  ),
                },
                {
                  step: "3",
                  title: "Sie übernehmen",
                  desc: "Termin planen, Fotos anhängen, Fall abschliessen — alles im Ops-Dashboard. Kein Zettel, kein Chaos.",
                  icon: (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 14.25 2.25 2.25L15 12" />
                    </svg>
                  ),
                },
                {
                  step: "4",
                  title: "5-Sterne-Bewertung",
                  desc: "Per Knopfdruck eine Google-Review-Anfrage an den Kunden senden. Mehr Bewertungen, mehr Aufträge.",
                  icon: (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  ),
                },
              ].map((item, idx) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  {/* Mobile connecting arrow (between items) */}
                  {idx > 0 && (
                    <div className="mb-4 flex h-8 items-center text-gold-400 sm:hidden" aria-hidden="true">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                  )}

                  {/* Icon circle */}
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-navy-50 text-gold-500 ring-4 ring-warm-white">
                    {item.icon}
                  </div>

                  {/* Step number */}
                  <span className="mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">
                    {item.step}
                  </span>

                  <h3 className="mt-3 text-lg font-semibold text-navy-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-navy-900/70">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Dashboard showcase ────────────────────────── */}
      <section className="bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Alles kommt zu Ihnen.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Kein neues System lernen. Fälle kommen automatisch rein — Sie entscheiden, was wann erledigt wird.
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

      {/* ── 5. Trust / Swiss ─────────────────────────────── */}
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
                desc: "Hochdeutsch, Schweizerdeutsch, Englisch, Französisch und Italienisch — der Telefonassistent versteht Ihre Kunden, egal welche Sprache.",
              },
              {
                title: "Persönliches Onboarding",
                desc: "Telefonnummer, Telefonassistent, Dashboard — wir richten alles gemeinsam ein. Kein technisches Wissen nötig.",
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

      {/* ── 6. Pricing teaser — 3 Tiers + Garantie ────── */}
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
                  "Bestätigungs-E-Mail an Melder",
                  "Persönliches Onboarding",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/demo"
                className="mt-8 block w-full rounded-lg border border-navy-200 py-3 text-center text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
              >
                Demo vereinbaren
              </Link>
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
                Website + Telefonassistent + Dashboard
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Alles aus Starter, plus:",
                  "KI-Telefonassistent (24/7, mehrsprachig)",
                  "Schweizer Telefonnummer inklusive",
                  "Ops-Dashboard mit Fall-Übersicht",
                  "Terminplanung mit ICS-Einladung",
                  "Foto-Anhänge pro Fall",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/demo"
                className="mt-8 block w-full rounded-lg bg-gold-500 py-3 text-center text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
              >
                Demo vereinbaren
              </Link>
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
              <Link
                href="/demo"
                className="mt-8 block w-full rounded-lg border border-navy-200 py-3 text-center text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-50"
              >
                Demo vereinbaren
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-sm font-medium italic text-navy-900/60">
            Setup kostenfrei · Erster Monat gratis · 30-Tage-Versprechen
          </p>

          <p className="mt-4 text-center">
            <Link
              href="/pricing"
              className="text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
            >
              Alle Details zu den Preisen &rarr;
            </Link>
          </p>

          {/* Guarantee card (merged from No-Brainer section) */}
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-gold-300/60 bg-gradient-to-br from-navy-50 to-gold-100/30 p-8 text-center">
            <h3 className="text-xl font-bold text-navy-900">
              Testen Sie FlowSight — ohne Risiko.
            </h3>
            <p className="mt-2 text-base font-semibold text-gold-600">
              Setup kostenfrei. Erster Monat gratis.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-navy-900/70">
              Unser Versprechen: Wenn Sie nach 30&nbsp;Tagen nicht mindestens
              10&nbsp;Fälle strukturiert in Ihrem Dashboard haben und Ihre erste
              5-Sterne-Google-Bewertung erhalten haben — ist der gesamte erste
              Monat für Sie kostenfrei.
            </p>
            <Link
              href="/demo"
              className="mt-6 inline-block rounded-lg bg-gold-500 px-8 py-3 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
            >
              Demo vereinbaren
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ ───────────────────────────────────────── */}
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
                a: "Nein. Wir richten alles für Sie ein — Website, Telefonnummer, Telefonassistent, Dashboard, E-Mail-Vorlagen. Sie brauchen nur einen Browser.",
              },
              {
                q: "Funktioniert das mit meiner bestehenden Nummer?",
                a: "Ja. Wir richten eine Rufumleitung ein, die greift, wenn Sie nicht erreichbar sind — abends, am Wochenende oder im Einsatz.",
              },
              {
                q: "Was passiert bei einem Notfall?",
                a: "Der Telefonassistent erkennt die Dringlichkeit und markiert den Fall als Notfall. Sie erhalten sofort eine E-Mail mit allen Details.",
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
                a: "Website in einer Woche. Telefonassistent und Dashboard ebenfalls — wir übernehmen die komplette Einrichtung, persönlich und in Ihrem Tempo.",
              },
              {
                q: "Kann ich FlowSight risikofrei testen?",
                a: "Ja. Setup ist kostenfrei, der erste Monat gratis. Unser 30-Tage-Versprechen: Wenn Sie nicht mindestens 10 Fälle strukturiert im Dashboard haben und Ihre erste 5-Sterne-Bewertung erhalten haben — zahlen Sie nichts.",
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

      {/* ── 8. Demo form (#demo) ─────────────────────────── */}
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
