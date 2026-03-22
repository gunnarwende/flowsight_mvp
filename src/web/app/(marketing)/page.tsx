import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/src/lib/marketing/constants";
import { HeroVisual } from "@/src/components/HeroVisual";
import { DashboardShowcase } from "@/src/components/DashboardMockup";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "FlowSight — Das Leitsystem für Schweizer Handwerksbetriebe",
  description:
    "Vom ersten Kontakt bis zur Bewertung. Telefonassistentin, Online-Meldungen, Leitstand und Bewertungen — alles an einem Ort. 24/7 erreichbar, ab CHF 299/Mo.",
  openGraph: {
    title: "FlowSight — Das Leitsystem für Schweizer Handwerksbetriebe",
    description:
      "Vom ersten Kontakt bis zur Bewertung. Telefonassistentin, Online-Meldungen, Leitstand und Bewertungen — alles an einem Ort.",
    url: "https://flowsight.ch",
    type: "website",
    locale: "de_CH",
    siteName: "FlowSight",
  },
  alternates: {
    canonical: "https://flowsight.ch",
  },
};

/* ── Inline SVG icons ──────────────────────────────────── */

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

/* ── Page ──────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── S1: Hero ───────────────────────────────────── */}
      <section className="overflow-hidden bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-20 sm:pb-24 sm:pt-28 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pb-32 lg:pt-36">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-400">
              F&uuml;r Schweizer Handwerksbetriebe
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Das Leitsystem f&uuml;r Ihren Betrieb &mdash;{" "}
              <span className="text-gold-400">vom ersten Kontakt bis zur Bewertung.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-navy-200">
              Anfragen werden aufgenommen, best&auml;tigt und als klare F&auml;lle
              weitergef&uuml;hrt. Damit nichts liegen bleibt und im Betrieb alles
              sauber zusammenl&auml;uft.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-navy-200">
              {["24/7 erreichbar", "Alles an einem Ort", "In einer Woche live"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/live-erleben"
                className="rounded-lg bg-gold-500 px-8 py-3.5 text-center text-base font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20"
              >
                Live erleben
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

          <div className="mt-12 lg:mt-0">
            <HeroVisual className="lg:translate-x-4" />
          </div>
        </div>
      </section>

      {/* ── S2: Social Proof ───────────────────────────── */}
      <section className="bg-warm-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-navy-400/60">
            Im Einsatz bei Betrieben in Ihrer Region
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "D\u00f6rfler AG",
              "Jul. Weinberger AG",
              "Walter Leuthold",
              "Orlandini Sanit\u00e4r",
              "Widmer H. & Co. AG",
            ].map((name) => (
              <span
                key={name}
                className="text-base font-semibold text-navy-900/40 transition-colors hover:text-navy-900/70"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-navy-400">
            Region Z&uuml;rich &middot; Linkes Z&uuml;richseeufer &middot; Seit 2026
          </p>
        </div>
      </section>

      {/* ── S3: So funktioniert FlowSight ──────────────── */}
      <section id="funktionen" className="scroll-mt-20 bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              So funktioniert FlowSight.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              F&uuml;nf Schritte. Ein System. Vom Eingang bis zum Abschluss.
            </p>
          </div>

          <div className="relative mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            {([
              {
                step: "1",
                title: "Anfrage geht ein",
                desc: "Per Anruf an Ihre Telefonassistentin oder \u00fcber das Online-Formular \u2014 rund um die Uhr.",
              },
              {
                step: "2",
                title: "Fall wird erfasst",
                desc: "Kategorie, Ort, Dringlichkeit \u2014 alles strukturiert. Automatisch als klarer Fall angelegt.",
              },
              {
                step: "3",
                title: "Sie werden informiert",
                desc: "E-Mail an den Betrieb, Best\u00e4tigung an den Kunden \u2014 mit Ihrem Firmennamen. Sofort.",
              },
              {
                step: "4",
                title: "Sie planen und erledigen",
                desc: "Termin setzen, Techniker zuweisen, Fotos anh\u00e4ngen. Alles im Leitstand.",
              },
              {
                step: "5",
                title: "Kunde bewertet",
                desc: "Nach erledigtem Auftrag: Bewertungsanfrage per Knopfdruck. Mehr Bewertungen, mehr Auftr\u00e4ge.",
              },
            ] as const).map((item, idx) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {idx > 0 && (
                  <div className="mb-4 flex h-8 items-center text-gold-400 sm:hidden" aria-hidden="true">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                    </svg>
                  </div>
                )}
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-lg font-bold text-navy-950">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-navy-900/70">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S4: Leitstand ──────────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Alles an einem Ort. Kein Zettel. Kein Chaos.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Meldungen kommen automatisch rein. Sie entscheiden, was wann erledigt wird.
            </p>
          </div>

          <div className="mt-16">
            <DashboardShowcase className="shadow-2xl" />
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {([
              {
                title: "Termin direkt setzen",
                desc: "Termin aus dem Fall heraus planen \u2014 der Melder erh\u00e4lt eine Best\u00e4tigung per E-Mail oder SMS.",
              },
              {
                title: "Fotos vom Einsatz",
                desc: "Fotos direkt zum Fall hochladen \u2014 vom Handy auf der Baustelle.",
              },
              {
                title: "Bewertungen sammeln",
                desc: "Nach erledigtem Auftrag eine Bewertungsanfrage senden \u2014 per Knopfdruck.",
              },
            ] as const).map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                  <CheckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-900/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S5: Vertrauen ──────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldIcon className="mx-auto h-10 w-10 text-gold-500" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Schweizer Qualit&auml;t. F&uuml;r Schweizer Betriebe.
            </h2>
            <p className="mt-4 text-lg text-navy-300">
              Sicher, mehrsprachig und pers&ouml;nlich betreut.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { title: "Keine Aufnahmen", desc: "Gespr\u00e4che werden nicht aufgezeichnet. Punkt." },
              { title: "Server in der EU", desc: "Daten auf Servern in Frankfurt. DSGVO-konform. Verschl\u00fcsselt." },
              { title: "5 Sprachen", desc: "Deutsch, Schweizerdeutsch, Englisch, Franz\u00f6sisch und Italienisch." },
              { title: "Pers\u00f6nliche Einrichtung", desc: "Kein Self-Service. Wir richten alles gemeinsam ein \u2014 in einer Woche live." },
            ] as const).map((item) => (
              <div key={item.title} className="rounded-2xl border border-navy-700/50 bg-navy-800/50 p-6 text-center">
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── S6: Preise ─────────────────────────────────── */}
      <section className="bg-warm-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Einfache, faire Preise.
            </h2>
            <p className="mt-4 text-lg text-navy-400">
              Keine versteckten Kosten. Keine Bindung. Monatlich k&uuml;ndbar.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-3">
            {/* Standard */}
            <div className="rounded-2xl border border-navy-200/60 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">Standard</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-navy-900">CHF 299</span>
                <span className="ml-1 text-base text-navy-400">/ Monat</span>
              </p>
              <p className="mt-2 text-sm text-navy-900/70">F&uuml;r Betriebe bis 5 Mitarbeiter. 120 F&auml;lle inklusive.</p>
              <ul className="mt-6 space-y-3">
                {["Website im Firmenlook", "Online-Meldungsformular", "Telefonassistentin (24/7, mehrsprachig)", "Best\u00e4tigungs-SMS + Foto-Upload", "Leitstand: alle F\u00e4lle an einem Ort", "Bewertungen gezielt anfragen", "Pers\u00f6nliche Einrichtung inklusive"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/live-erleben" className="mt-8 block w-full rounded-lg bg-navy-900 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-navy-800">
                14 Tage kostenlos testen
              </Link>
            </div>

            {/* Professional */}
            <div className="relative rounded-2xl border-2 border-gold-500 bg-white p-8 shadow-md">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-navy-950">Empfohlen</span>
              <p className="text-sm font-semibold uppercase tracking-wider text-gold-600">Professional</p>
              <p className="mt-4">
                <span className="text-4xl font-bold text-navy-900">CHF 499</span>
                <span className="ml-1 text-base text-navy-400">/ Monat</span>
              </p>
              <p className="mt-2 text-sm text-navy-900/70">F&uuml;r Betriebe mit 6&ndash;15 Mitarbeitern. 250 F&auml;lle inklusive.</p>
              <ul className="mt-6 space-y-3">
                {["Alles aus Standard", "H\u00f6heres Fallvolumen (250 F\u00e4lle)", "Techniker-Ansicht pro Mitarbeiter", "Priorit\u00e4ts-Support", "St\u00e4rkeres Google-Profil"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/live-erleben" className="mt-8 block w-full rounded-lg bg-gold-500 py-3 text-center text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/20">
                14 Tage kostenlos testen
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border border-navy-200/60 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wider text-navy-400">Enterprise</p>
              <p className="mt-4"><span className="text-4xl font-bold text-navy-900">Individuell</span></p>
              <p className="mt-2 text-sm text-navy-900/70">F&uuml;r gr&ouml;ssere Betriebe oder spezielle Anforderungen.</p>
              <ul className="mt-6 space-y-3">
                {["Alles aus Professional", "Individuelles Fallvolumen", "Dedizierter Ansprechpartner", "Individuelle Integrationen"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-navy-900/70">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/live-erleben" className="mt-8 block w-full rounded-lg border border-navy-200 bg-white py-3 text-center text-sm font-semibold text-navy-900 transition-all hover:bg-navy-50">
                Sprechen Sie mit uns
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-sm font-medium italic text-navy-900/60">
            Setup kostenfrei &middot; 14 Tage kostenlos &middot; Monatlich k&uuml;ndbar &middot; Telefonminuten nach Verbrauch
          </p>
          <p className="mt-4 text-center">
            <Link href="/pricing" className="text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500">
              Alle Details zum Preis &rarr;
            </Link>
          </p>
        </div>
      </section>

      {/* ── S7: FAQ ────────────────────────────────────── */}
      <section className="bg-navy-50 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            H&auml;ufige Fragen
          </h2>
          <div className="mt-12 divide-y divide-navy-200/60">
            {([
              { q: "Brauche ich technisches Wissen?", a: "Nein. Wir richten alles f\u00fcr Sie ein \u2014 Website, Telefonnummer, Telefonassistentin, Leitstand. Sie brauchen nur einen Browser." },
              { q: "Funktioniert das mit meiner bestehenden Nummer?", a: "Ja. Wir richten eine Rufumleitung ein, die greift, wenn Sie nicht erreichbar sind \u2014 abends, am Wochenende oder im Einsatz." },
              { q: "Was passiert bei einem Notfall?", a: "Die Telefonassistentin erkennt die Dringlichkeit und markiert den Fall als Notfall. Sie erhalten sofort eine E-Mail mit allen Details." },
              { q: "K\u00f6nnen mehrere Mitarbeiter den Leitstand nutzen?", a: "Ja. Sie k\u00f6nnen beliebig viele Benutzer anlegen. Jeder sieht die F\u00e4lle und kann Termine planen, Fotos anh\u00e4ngen und Bewertungen anfragen." },
              { q: "Wie sicher sind meine Daten?", a: "Alle Daten werden verschl\u00fcsselt \u00fcbertragen und gespeichert. Keine Gespr\u00e4chsaufnahmen. Server in der EU (Frankfurt). DSGVO-konform." },
              { q: "Was kostet FlowSight?", a: "Ab CHF 299/Monat (bis 5 MA, 120 F\u00e4lle inklusive). Gr\u00f6ssere Betriebe: CHF 499/Monat (bis 15 MA, 250 F\u00e4lle). Monatlich k\u00fcndbar, keine Bindung." },
            ] as const).map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg className="ml-4 h-5 w-5 shrink-0 text-navy-400 transition-transform duration-200 group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <p className="mt-4 pr-12 text-sm leading-relaxed text-navy-900/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── S8: CTA / Demo Form ────────────────────────── */}
      <section id="demo" className="scroll-mt-20 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bereit? Wir richten alles f&uuml;r Sie ein.
            </h2>
            <p className="mt-4 text-lg text-navy-200">
              Sagen Sie uns, wer Sie sind &mdash; in 48 Stunden ist Ihr System live. 14 Tage kostenlos.
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
