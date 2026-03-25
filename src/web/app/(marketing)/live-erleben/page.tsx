import type { Metadata } from "next";
import { DemoForm } from "@/src/components/DemoForm";

export const metadata: Metadata = {
  title: "Live erleben — FlowSight",
  description:
    "Sehen Sie, wie Ihr Leitsystem den Kundenkontakt in Ihrem Betrieb organisiert. Persönlich eingerichtet.",
};

export default function LiveErlebenPage() {
  return (
    <>
      {/* ── Video / Proof ─────────────────────────── */}
      <section className="bg-gradient-to-b from-navy-900 to-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
              So läuft Kundenkontakt mit Ihrem Leitsystem.
            </h1>
            <p className="mt-4 text-base text-navy-300 sm:text-lg">
              Der komplette Ablauf — vom Eingang bis zum Abschluss.
            </p>
          </div>

          {/* Live-erleben Video */}
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-navy-700/30 bg-navy-800/40">
              <video
                controls
                playsInline
                className="h-full w-full object-cover"
                src="/videos/live_erleben_v5.mp4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Detaillierter Ablauf ──────────────────── */}
      <section className="bg-warm-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            Was genau passiert — Schritt für Schritt.
          </h2>

          <div className="mt-12 space-y-10">
            {([
              {
                num: "1",
                title: "Anfrage geht ein",
                text: "Anrufe werden professionell entgegengenommen — rund um die Uhr, in 5 Sprachen. Parallel können Kunden Anliegen über Ihr Online-Formular melden. Beide Wege führen in denselben Ablauf.",
              },
              {
                num: "2",
                title: "Ihr Kunde bekommt Rückmeldung",
                text: "Innerhalb von Sekunden erhält Ihr Kunde eine Bestätigung — mit Ihrem Firmennamen als Absender. Er kann seine Angaben prüfen, korrigieren und Fotos ergänzen.",
              },
              {
                num: "3",
                title: "Alles an einem Ort",
                text: "Jeder Fall ist sofort da — mit Kategorie, Ort, Dringlichkeit und Kontaktdaten. Sie planen Termine, weisen Mitarbeiter zu und dokumentieren den Einsatz. Strukturiert statt Zettelwirtschaft.",
              },
              {
                num: "4",
                title: "Sauberer Abschluss",
                text: "Nach dem Einsatz laden Sie zufriedene Kunden gezielt zur Bewertung ein — einfach und direkt aus dem System.",
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

      {/* ── Formular ─────────────────────────────── */}
      <section id="formular" className="scroll-mt-20 bg-gradient-to-b from-navy-900 to-navy-950 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Persönlich für Ihren Betrieb eingerichtet.
            </h2>
            <p className="mt-4 text-base text-navy-300">
              Sagen Sie uns, wer Sie sind. Wir melden uns innerhalb von 24 Stunden
              persönlich bei Ihnen.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {([
              { num: "1", title: "Sie melden sich", desc: "Firma, Telefon, Region." },
              { num: "2", title: "Wir richten ein", desc: "Persönlich. In 48 Stunden." },
              { num: "3", title: "Sie erleben es", desc: "Ihr Betrieb. Ihr Ablauf. Monatlich kündbar." },
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

      {/* ── FAQ ───────────────────────────────────── */}
      <section className="bg-navy-50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-xl font-bold text-navy-900 sm:text-2xl">
            Häufige Fragen
          </h2>
          <div className="mt-8 divide-y divide-navy-200/60">
            {([
              { q: "Brauche ich technisches Wissen?", a: "Nein. Wir richten alles für Sie ein — persönlich. Sie brauchen nur einen Browser." },
              { q: "Funktioniert das mit meiner bestehenden Nummer?", a: "Ja. Wir richten eine Rufumleitung ein, die greift, wenn Sie nicht erreichbar sind." },
              { q: "Was passiert bei einem Notfall?", a: "Die Telefonassistentin erkennt die Dringlichkeit und markiert den Fall als Notfall. Sie erhalten sofort eine Benachrichtigung." },
              { q: "Wie sicher sind meine Daten?", a: "Alle Daten verschlüsselt. Keine Gesprächsaufnahmen. Server in der EU. DSGVO-konform." },
              { q: "Was kostet FlowSight?", a: "Standard ab CHF 299/Monat, Professional ab CHF 499. Monatlich kündbar, keine Bindung." },
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
