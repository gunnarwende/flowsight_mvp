import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";
import AudioPlayer from "@/src/components/AudioPlayer";

export const metadata: Metadata = {
  title: "FlowSight — Das Leitsystem für Schweizer Handwerksbetriebe",
  description:
    "Vom ersten Kontakt bis zur Bewertung. Telefonassistentin, Online-Meldungen, Leitstand und Bewertungen — alles an einem Ort. Ab CHF 299/Mo.",
  openGraph: {
    title: "FlowSight — Das Leitsystem für Schweizer Handwerksbetriebe",
    description:
      "Vom ersten Kontakt bis zur Bewertung. Ihr Betrieb, sauber organisiert.",
    url: "https://flowsight.ch",
    type: "website",
    locale: "de_CH",
    siteName: "FlowSight",
  },
  alternates: { canonical: "https://flowsight.ch" },
};

/* ================================================================
   HOMEPAGE — 5-Akt-Struktur (Mobile-First)
   ================================================================ */

export default function HomePage() {
  return (
    <>
      {/* ── AKT 1 — VERSPRECHEN (Hero) ──────────────── */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold-400">
              Für Schweizer Handwerksbetriebe
            </p>

            <h1 className="mt-6 text-[2rem] font-bold leading-[1.15] tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              <span className="sm:inline">Das Leitsystem für{" "}
              <span className="inline-block sm:inline">Ihren Betrieb —</span></span>{" "}
              <br className="sm:hidden" />
              <span className="text-gold-400">
                vom ersten Kontakt bis zur 5★ Bewertung.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-navy-300 sm:text-lg">
              Jede Anfrage wird erfasst. Ihre Kunden bekommen Rückmeldung.{" "}
              <span className="inline-block">Und im Betrieb bleibt nichts liegen.</span>
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/live-erleben"
                className="w-full rounded-lg bg-gold-500 px-8 py-4 text-center text-base font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20 sm:w-auto"
              >
                Live erleben
              </Link>
              <a
                href={`tel:${SITE.phoneRaw}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-8 py-4 text-base font-medium text-navy-300 transition-colors hover:bg-white/5 sm:w-auto"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                {SITE.phone}
              </a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy-400">
              {[
                { label: "Keine Anfrage geht verloren", flag: false },
                { label: "Schweizer System", flag: true },
                { label: "Monatlich kündbar", flag: false },
              ].map((t) => (
                <span key={t.label} className="flex items-center gap-1.5">
                  {t.flag ? (
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 32 32" aria-label="Schweiz" role="img">
                      <rect width="32" height="32" rx="4" fill="#D52B1E" />
                      <path d="M14 8h4v16h-4z" fill="#fff" />
                      <path d="M8 14h16v4H8z" fill="#fff" />
                    </svg>
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-gold-500" aria-hidden="true" />
                  )}
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Proof-Block: Leitzentrale Screen + Voice ── */}
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-10">
              {/* Leitzentrale Screenshot — Phone-sized */}
              <div className="w-48 shrink-0 sm:w-56">
                <div className="overflow-hidden rounded-2xl border border-navy-700/20 bg-navy-800/50 shadow-2xl shadow-navy-950/50">
                  <img
                    src="/images/proof/leitzentrale.png"
                    alt="Leitzentrale — Gebäudetechnik GmbH: 4 neue Fälle, 3 in Arbeit, 15 erledigt, 4.8 Sterne Bewertung. Eva Brunner, Problem vor Ort, Wollishofen."
                    className="w-full"
                    loading="eager"
                  />
                </div>
              </div>

              {/* Voice + Text */}
              <div className="flex flex-col items-center text-center sm:items-start sm:pt-6 sm:text-left">
                <p className="text-base font-medium leading-relaxed text-navy-300 sm:text-lg">
                  Vom Eingang bis zum Abschluss —{" "}
                  <span className="text-white">Ihr Betriebsablauf im Überblick.</span>
                </p>

                <div className="mt-6">
                  <AudioPlayer
                    src="/audio/voice_lang.mp3"
                    label="Live erleben"
                    duration="2 Min."
                    variant="hero"
                  />
                </div>

                <p className="mt-4 text-xs italic text-navy-500">
                  Video in Vorbereitung
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AKT 2 — EMPATHIE ───────────────────────── */}
      <section className="bg-warm-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <div className="mx-auto mb-8 h-px w-12 bg-gold-500" />
          <p className="text-lg font-medium leading-relaxed text-navy-900 sm:text-xl">
            Im Handwerk kommen Anfragen selten dann,{" "}
            <br className="hidden sm:block" />
            wenn man am Schreibtisch sitzt.
          </p>
          <p className="mt-6 text-base leading-relaxed text-navy-400">
            Ihr Leitsystem sorgt dafür, dass trotzdem nichts liegen bleibt —
            und Ihre Kunden zuverlässig Rückmeldung bekommen.
          </p>
        </div>
      </section>

      {/* ── AKT 3 — Funktionen-Anker ────────────── */}
      <div id="funktionen" className="scroll-mt-20" />

      {/* ── AKT 4 — SICHERHEIT (Pricing + Trust) ──── */}
      <section className="bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-2xl border border-navy-200/60 bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Ab CHF 299 / Monat
            </h2>
            <p className="mt-3 text-sm text-navy-400">
              Monatlich kündbar. Absolut transparent.{" "}
              <span className="inline-block">Keine versteckten Kosten.</span>
            </p>
            <Link
              href="/pricing"
              className="mt-5 inline-block rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800"
            >
              Alle Preise im Detail
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
            {([
              { title: "Keine Gesprächsaufnahmen", text: "Keine Aufzeichnungen. Keine versteckten Mitschnitte. Punkt." },
              { title: "Persönliche Einrichtung", text: "Wir richten das System gemeinsam ein. Kein Self-Service, kein IT-Projekt." },
              { title: "DSGVO-konform, EU-Server", text: "Verschlüsselt. Daten in Frankfurt (EU). 100\u00A0% DSGVO-konform." },
              { title: "5 Sprachen", text: "Deutsch, Schweizerdeutsch, Englisch, Französisch, Italienisch." },
            ] as const).map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-gold-500" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-navy-900/60">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AKT 5 — HANDLUNG (CTA) ─────────────────── */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Bereit? Erleben Sie, wie Ihr Betrieb mit FlowSight läuft.
          </h2>
          <p className="mt-4 text-base text-navy-300">
            Sehen Sie in 2 Minuten, wie Kundenkontakt in Ihrem Betrieb aussehen kann.
          </p>
          <Link
            href="/live-erleben"
            className="mt-8 inline-block rounded-lg bg-gold-500 px-10 py-4 text-base font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
          >
            Live erleben
          </Link>
          <p className="mt-5 text-xs text-navy-400">
            Persönlicher Kontakt · Persönliche Einrichtung · Monatlich kündbar
          </p>
        </div>
      </section>
    </>
  );
}
