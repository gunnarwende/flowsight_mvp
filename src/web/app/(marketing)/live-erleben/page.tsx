import type { Metadata } from "next";
import { SITE } from "@/src/lib/marketing/constants";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "Live erleben \u2014 FlowSight",
  description:
    "Sehen Sie, wie FlowSight Ihren Betrieb unterst\u00fctzt. Pers\u00f6nliche Einrichtung in 48 Stunden. 14 Tage kostenlos.",
};

/* ================================================================
   /live-erleben \u2014 Tieferer Proof + n\u00e4chster Schritt
   Rolle: Beweisen + Handlung erm\u00f6glichen
   NICHT: Homepage-Kopie. Keine Redundanz.
   ================================================================ */

export default function LiveErlebenPage() {
  return (
    <>
      {/* \u2500\u2500 Video / Proof Section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
              So l\u00e4uft Kundenkontakt mit FlowSight.
            </h1>
            <p className="mt-4 text-base text-navy-300 sm:text-lg">
              2 Minuten. Ein Betrieb. Der komplette Ablauf.
            </p>
          </div>

          {/* Video Slot \u2014 Platzhalter bis echtes Video produziert wird */}
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-navy-700/50 bg-navy-800/50">
              {/* Placeholder: wird durch <video> oder <iframe> ersetzt wenn Video fertig */}
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10">
                  <svg className="h-8 w-8 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-navy-300">
                  Video wird vorbereitet
                </p>
                <p className="text-xs text-navy-400">
                  In K\u00fcrze sehen Sie hier den kompletten Ablauf \u2014 vom Anruf bis zur Bewertung.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* \u2500\u2500 Detaillierter Ablauf \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-warm-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            Was genau passiert \u2014 Schritt f\u00fcr Schritt.
          </h2>

          <div className="mt-12 space-y-10">
            {([
              {
                num: "1",
                title: "Ihr Kunde meldet sich",
                text: "Per Anruf oder \u00fcber Ihr Online-Formular. Die Telefonassistentin nimmt das Anliegen strukturiert auf: Kategorie, Ort, Dringlichkeit, Kontaktdaten. Rund um die Uhr.",
              },
              {
                num: "2",
                title: "Sofortige R\u00fcckmeldung in Ihrem Namen",
                text: "Ihr Kunde erh\u00e4lt innerhalb von Sekunden eine SMS-Best\u00e4tigung \u2014 mit Ihrem Firmennamen als Absender. Er weiss: Die Meldung ist angekommen. Professionell.",
              },
              {
                num: "3",
                title: "Alles landet in Ihrem Leitstand",
                text: "Jeder Fall erscheint strukturiert: Was wurde gemeldet, wo, wie dringend. Sie setzen Termine, weisen Techniker zu, h\u00e4ngen Fotos an. Alles an einem Ort.",
              },
              {
                num: "4",
                title: "Auftrag erledigt \u2014 Bewertung gesammelt",
                text: "Nach dem Einsatz senden Sie per Knopfdruck eine Bewertungsanfrage. Zufriedene Kunden bewerten Sie auf Google. Mehr Sterne, mehr Anfragen.",
              },
            ] as const).map((step) => (
              <div key={step.num} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-base font-bold text-navy-950">
                  {step.num}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-900/70">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* \u2500\u2500 Pers\u00f6nlicher Kontakt / Formular \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pers\u00f6nlich f\u00fcr Ihren Betrieb eingerichtet.
            </h2>
            <p className="mt-4 text-base text-navy-300">
              Sagen Sie uns, wer Sie sind. Wir melden uns innerhalb von 24 Stunden
              pers\u00f6nlich bei Ihnen.
            </p>
          </div>

          {/* 3 Schritte */}
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {([
              { num: "1", title: "Sie melden sich", desc: "Firma, Telefon, Region." },
              { num: "2", title: "Wir richten ein", desc: "Pers\u00f6nlich. In 48 Stunden." },
              { num: "3", title: "Sie testen", desc: "14 Tage. Kein Vertrag." },
            ] as const).map((s) => (
              <div key={s.num} className="rounded-xl border border-navy-700/40 bg-navy-800/30 p-5 text-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-950">
                  {s.num}
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{s.title}</p>
                <p className="mt-1 text-xs text-navy-400">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <DemoForm />
          </div>
        </div>
      </section>

      {/* \u2500\u2500 FAQ (kompakt, echte H\u00fcrden) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
      <section className="bg-navy-50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-xl font-bold text-navy-900 sm:text-2xl">
            H\u00e4ufige Fragen
          </h2>
          <div className="mt-8 divide-y divide-navy-200/60">
            {([
              { q: "Brauche ich technisches Wissen?", a: "Nein. Wir richten alles f\u00fcr Sie ein \u2014 pers\u00f6nlich. Sie brauchen nur einen Browser." },
              { q: "Funktioniert das mit meiner bestehenden Nummer?", a: "Ja. Wir richten eine Rufumleitung ein, die greift, wenn Sie nicht erreichbar sind." },
              { q: "Was passiert bei einem Notfall?", a: "Die Telefonassistentin erkennt die Dringlichkeit und markiert den Fall als Notfall. Sie erhalten sofort eine Benachrichtigung." },
              { q: "Wie sicher sind meine Daten?", a: "Alle Daten verschl\u00fcsselt. Keine Gespr\u00e4chsaufnahmen. Server in der EU. DSGVO-konform." },
              { q: "Was kostet FlowSight?", a: "Ab CHF 299/Monat. Alles inklusive. Monatlich k\u00fcndbar, keine Bindung." },
            ] as const).map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg className="ml-3 h-4 w-4 shrink-0 text-navy-400 transition-transform duration-200 group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <p className="mt-2 pr-8 text-sm leading-relaxed text-navy-900/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
