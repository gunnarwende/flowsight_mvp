import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";

export const metadata: Metadata = {
  title: "FlowSight \u2014 Das Leitsystem f\u00fcr Schweizer Handwerksbetriebe",
  description:
    "Vom ersten Kontakt bis zur Bewertung. Telefonassistentin, Online-Meldungen, Leitstand und Bewertungen \u2014 alles an einem Ort. Ab CHF 299/Mo.",
  openGraph: {
    title: "FlowSight \u2014 Das Leitsystem f\u00fcr Schweizer Handwerksbetriebe",
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
   HOMEPAGE \u2014 5-Akt-Struktur (Mobile-First)
   Akt 1: Versprechen (Hero)
   Akt 2: Empathie (Wiedererkennung)
   Akt 3: Beweis (Prozess \u2014 4 Schritte)
   Akt 4: Sicherheit (Pricing-Teaser + Vertrauen)
   Akt 5: Handlung (CTA)
   ================================================================ */

export default function HomePage() {
  return (
    <>
      {/* \u2500\u2500 AKT 1 \u2014 VERSPRECHEN (Hero) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-gold-400">
              F\u00fcr Schweizer Handwerksbetriebe
            </p>

            <h1 className="mt-6 text-[2rem] font-bold leading-[1.15] tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              Das Leitsystem f\u00fcr Ihren Betrieb &mdash;{" "}
              <span className="text-gold-400">
                vom ersten Kontakt bis zur Bewertung.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-navy-300 sm:text-lg">
              Anfragen werden aufgenommen, best\u00e4tigt und als klare F\u00e4lle
              weitergef\u00fchrt. Damit nichts liegen bleibt und im Betrieb alles
              sauber zusammenl\u00e4uft.
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
              {["Rund um die Uhr erreichbar", "Pers\u00f6nlich eingerichtet", "Monatlich k\u00fcndbar"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-gold-500" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Visual \u2014 Prozessfluss-Illustration (Motion-Slot f\u00fcr Phase E) */}
          <div className="mx-auto mt-16 max-w-3xl" aria-hidden="true">
            <div className="flex items-center justify-between gap-2 px-2 sm:gap-4 sm:px-8">
              {([
                { icon: "phone", label: "Kontakt" },
                { icon: "check", label: "Best\u00e4tigung" },
                { icon: "clipboard", label: "Fall" },
                { icon: "star", label: "Bewertung" },
              ] as const).map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 sm:gap-4">
                  {i > 0 && <div className="hidden h-px w-6 bg-gold-500/30 sm:block" />}
                  {i > 0 && (
                    <svg className="h-3 w-3 shrink-0 text-gold-500/40 sm:hidden" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 text-gold-400 sm:h-14 sm:w-14">
                      {step.icon === "phone" && (
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>
                      )}
                      {step.icon === "check" && (
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                      {step.icon === "clipboard" && (
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>
                      )}
                      {step.icon === "star" && (
                        <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-navy-400 sm:text-xs">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 AKT 2 \u2014 EMPATHIE (Wiedererkennung) \u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-warm-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <p className="text-lg font-medium leading-relaxed text-navy-900 sm:text-xl">
            Telefon klingelt. Sie sind auf der Baustelle.{" "}
            <br className="hidden sm:block" />
            Der Kunde wartet. Der Zettel liegt irgendwo.
          </p>
          <p className="mt-6 text-base leading-relaxed text-navy-400">
            FlowSight f\u00e4ngt auf, was im Alltag sonst verloren geht &mdash;
            und macht daraus einen sauberen, professionellen Prozess in Ihrem Namen.
          </p>
        </div>
      </section>

      {/* \u2500\u2500 AKT 3 \u2014 BEWEIS (Prozess \u2014 4 Schritte) \u2500\u2500\u2500\u2500 */}
      <section id="funktionen" className="scroll-mt-20 bg-navy-50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              So l\u00e4uft Kundenkontakt mit FlowSight.
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-10 sm:grid-cols-2">
            {([
              {
                num: "1",
                title: "Anfrage geht ein",
                text: "Per Anruf an Ihre Telefonassistentin oder \u00fcber das Online-Formular \u2014 rund um die Uhr, auch am Wochenende.",
              },
              {
                num: "2",
                title: "Ihr Kunde bekommt R\u00fcckmeldung",
                text: "Sofortige Best\u00e4tigung per SMS \u2014 in Ihrem Firmennamen. Der Kunde weiss, dass seine Meldung angekommen ist.",
              },
              {
                num: "3",
                title: "Sie behalten den \u00dcberblick",
                text: "Jeder Fall landet strukturiert in Ihrem Leitstand: Kategorie, Ort, Dringlichkeit. Termin setzen, Techniker zuweisen, Fotos anh\u00e4ngen.",
              },
              {
                num: "4",
                title: "Auftrag erledigt \u2014 Bewertung gesammelt",
                text: "Nach dem Einsatz senden Sie per Knopfdruck eine Bewertungsanfrage. Mehr Bewertungen, mehr Auftr\u00e4ge.",
              },
            ] as const).map((step) => (
              <div key={step.num} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-900/70">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 AKT 4 \u2014 SICHERHEIT (Pricing-Teaser + Trust) \u2500\u2500 */}
      <section className="bg-warm-white py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Ab CHF 299 / Monat.
            </h2>
            <p className="mt-3 text-base text-navy-400">
              Alles inklusive. Monatlich k\u00fcndbar. Keine versteckten Kosten.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-block text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
            >
              Alle Preise im Detail &rarr;
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
            {([
              { title: "Keine Gespr\u00e4chsaufnahmen", text: "Keine Aufzeichnungen. Keine versteckten Mitschnitte. Punkt." },
              { title: "Pers\u00f6nliche Einrichtung", text: "Wir richten das System gemeinsam ein. Kein Self-Service, kein IT-Projekt." },
              { title: "Server in der Schweiz und EU", text: "DSGVO-konform. Verschl\u00fcsselt. Daten auf Servern in Frankfurt." },
              { title: "5 Sprachen", text: "Deutsch, Schweizerdeutsch, Englisch, Franz\u00f6sisch, Italienisch." },
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

      {/* \u2500\u2500 AKT 5 \u2014 HANDLUNG (CTA) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Bereit? Erleben Sie, wie Ihr Betrieb mit FlowSight l\u00e4uft.
          </h2>
          <p className="mt-4 text-base text-navy-300">
            Sehen Sie in 2 Minuten, wie Kundenkontakt in Ihrem Betrieb aussehen kann.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
          <p className="mt-6 text-xs text-navy-400">
            Pers\u00f6nlicher Kontakt &middot; Kostenlose Einrichtung &middot; 14 Tage testen
          </p>
        </div>
      </section>
    </>
  );
}
