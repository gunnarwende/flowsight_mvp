import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HANDOUTS, PACKAGES, type HandoutData } from "@/src/lib/marketing/handouts";
import { SITE } from "@/src/lib/marketing/constants";
import { generateQrSvg } from "@/src/lib/marketing/qr";
import { PrintButton } from "./PrintButton";

/* ── Static generation ────────────────────────────────────────────── */
export function generateStaticParams() {
  return Object.keys(HANDOUTS).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = HANDOUTS[id];
  if (!data) return { title: "Nicht gefunden" };
  return {
    title: `Ihr FlowSight-Fahrplan — ${data.companyName}`,
    robots: { index: false, follow: false },
  };
}

/* ── Helpers ───────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Initials({ name }: { name: string }) {
  const letters = name
    .split(/[\s-]+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-navy-900 text-xl font-bold text-gold-400 print:bg-navy-900 print:text-gold-400">
      {letters}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white print:border print:border-navy-900">
      {n}
    </span>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */
export default async function HandoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data: HandoutData | undefined = HANDOUTS[id];
  if (!data) notFound();

  const recommended = PACKAGES.find((p) => p.id === data.recommendedPackage)!;
  const qrUrl = data.demoWebsiteUrl ?? `${SITE.url}`;
  const qrSvg = generateQrSvg(qrUrl);

  return (
    <>
      {/* Print-optimized styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 12mm 14mm; size: A4; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="mx-auto max-w-[680px] px-6 py-10 font-sans text-navy-900 print:max-w-none print:px-0 print:py-0">
        {/* Print button (screen only) */}
        <PrintButton />

        {/* ── HEADER ──────────────────────────────────────────── */}
        <header className="flex items-start justify-between border-b-2 border-navy-900 pb-5">
          <div className="flex items-center gap-4">
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt={data.companyName}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <Initials name={data.companyName} />
            )}
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight">
                {data.companyName}
              </h1>
              <p className="text-sm text-navy-400">
                Ihr FlowSight-Fahrplan
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-navy-400 leading-relaxed">
            <p>{formatDate(data.demoDate)}</p>
            <p>{data.location}</p>
            <p className="mt-1 font-medium text-navy-900">{SITE.founderName}</p>
            <p>{SITE.phone}</p>
          </div>
        </header>

        {/* ── A: WAS SIE GESEHEN HABEN ────────────────────────── */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy-400">
            Was Sie heute gesehen haben
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
            {[
              {
                title: "Website & Startseite",
                desc: "In 5 Sekunden finden Kunden den richtigen Weg",
              },
              {
                title: "Online-Schadenmeldung",
                desc: "Problem, Dringlichkeit, Adresse, Kontakt — in 3 Schritten",
              },
              {
                title: "Telefonassistentin",
                desc: "Nimmt Anrufe entgegen, wenn der Betrieb nicht kann",
              },
              {
                title: "Fallübersicht",
                desc: "Alles landet als strukturierter Fall inkl. SMS & Fotos",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-2">
                <CheckIcon />
                <div>
                  <p className="text-sm font-semibold leading-tight">{item.title}</p>
                  <p className="text-xs text-navy-400 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── B: PAKETE ───────────────────────────────────────── */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy-400">
            Pakete & Preise
          </h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {PACKAGES.map((pkg) => {
              const isRec = pkg.id === data.recommendedPackage;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-xl p-4 ${
                    isRec
                      ? "border-2 border-gold-500 bg-gold-100/40 print:border-2 print:border-gold-500"
                      : "border border-navy-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isRec ? "text-gold-600" : "text-navy-400"}`}>
                      {pkg.name}
                    </p>
                    {isRec && (
                      <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-950">
                        Empfohlen
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-lg font-bold">{pkg.price}<span className="text-xs font-normal text-navy-400"> / Mt.</span></p>
                  <p className="mt-0.5 text-[11px] text-navy-400">{pkg.subtitle}</p>
                  <ul className="mt-2.5 space-y-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[11px] leading-snug text-navy-900/80">
                        <CheckIcon />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── C: EMPFEHLUNG ───────────────────────────────────── */}
        <section className="mt-6">
          <div className="rounded-xl border-2 border-gold-500 bg-gradient-to-r from-navy-900 to-navy-800 px-5 py-4 text-white print:bg-navy-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gold-400">
                  Empfehlung für {data.companyName}
                </p>
                <p className="mt-1 text-lg font-bold">
                  Paket {recommended.name}
                </p>
                <p className="mt-0.5 text-sm text-navy-200 leading-snug">
                  {data.recommendationReason}
                </p>
              </div>
              <p className="text-2xl font-bold text-gold-400 whitespace-nowrap pl-4">
                {recommended.price}
                <span className="block text-xs font-normal text-navy-300 text-right">/ Monat</span>
              </p>
            </div>
          </div>
        </section>

        {/* ── D: NÄCHSTE SCHRITTE ─────────────────────────────── */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy-400">
            Nächste Schritte
          </h2>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-3">
              <StepNumber n={1} />
              <div>
                <p className="text-sm font-semibold">Von Ihnen (5 Minuten)</p>
                <p className="text-xs text-navy-400 leading-snug">
                  Logo, Öffnungszeiten, Einzugsgebiet, Notdienst ja/nein, wann soll die Telefonassistentin rangehen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={2} />
              <div>
                <p className="text-sm font-semibold">Von uns (3–5 Werktage)</p>
                <p className="text-xs text-navy-400 leading-snug">
                  Setup Website, Online-Meldung, Telefonassistentin, SMS-Bestätigung, Fallübersicht — alles inklusive
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={3} />
              <div>
                <p className="text-sm font-semibold">Test & Live</p>
                <p className="text-xs text-navy-400 leading-snug">
                  1x Online-Test, 1x Telefon-Test — dann live. Abhängig davon, wie schnell wir Logo & Infos erhalten.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer className="mt-6 flex items-end justify-between border-t border-navy-200 pt-4">
          <div className="flex items-center gap-4">
            {data.demoWebsiteUrl && (
              <div
                className="text-navy-900"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}
            <div className="text-xs text-navy-400 leading-relaxed">
              {data.demoWebsiteUrl && (
                <p>
                  <span className="font-medium text-navy-900">Ihre Demo-Website:</span>{" "}
                  <span className="text-navy-400">{data.demoWebsiteUrl}</span>
                </p>
              )}
              {data.wizardUrl && (
                <p>
                  <span className="font-medium text-navy-900">Online-Meldung:</span>{" "}
                  <span className="text-navy-400">{data.wizardUrl}</span>
                </p>
              )}
              <p className="mt-2">
                <span className="font-medium text-navy-900">Fragen?</span>{" "}
                {SITE.founderName} — {SITE.phone} — {SITE.founderEmail}
              </p>
            </div>
          </div>
          <div className="text-right text-[10px] text-navy-300 leading-snug">
            <p>Monatlich kündbar</p>
            <p>Keine Gesprächsaufnahmen</p>
            <p>Daten in der Schweiz</p>
          </div>
        </footer>
      </main>
    </>
  );
}
