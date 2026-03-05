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
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-500 text-lg font-bold text-navy-950">
      {letters}
    </div>
  );
}

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
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

  const qrUrl = data.demoWebsiteUrl ?? SITE.url;
  const qrSvg = await generateQrSvg(qrUrl, 100);

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 10mm 12mm; size: A4; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="mx-auto max-w-[700px] px-6 py-8 font-sans text-navy-900 print:max-w-none print:px-0 print:py-0">
        <PrintButton />

        {/* ━━━ HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <header className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            {data.logoUrl ? (
              <img src={data.logoUrl} alt={data.companyName} className="h-12 w-auto object-contain" />
            ) : (
              <Initials name={data.companyName} />
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight">{data.companyName}</h1>
              <p className="text-xs text-navy-400">Ihr FlowSight-Fahrplan</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-navy-400 leading-relaxed">
            <p className="font-medium text-navy-700">{formatDate(data.demoDate)} · {data.location}</p>
            <p>{SITE.founderName} · {SITE.phone}</p>
          </div>
        </header>

        {/* ━━━ LEITSYSTEM DIAGRAM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="rounded-2xl bg-navy-950 px-6 py-6 text-white">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">
            Das Leitsystem — was Sie heute gesehen haben
          </p>

          {/* Flow diagram */}
          <div className="mt-5 flex items-start justify-center gap-0">
            {/* Entry: Website + Anruf */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <FlowNode icon="globe" label="Website" />
                <FlowNode icon="phone" label="Anruf" />
              </div>
              <p className="mt-2 max-w-[160px] text-center text-[10px] leading-tight text-navy-300">
                In 5 Sekunden finden Kunden den richtigen Weg — online oder per Telefon
              </p>
            </div>

            {/* Arrow */}
            <FlowArrow />

            {/* Ticket */}
            <div className="flex flex-col items-center">
              <FlowNode icon="ticket" label="Fall" />
              <p className="mt-2 max-w-[120px] text-center text-[10px] leading-tight text-navy-300">
                Strukturierter Fall mit SMS-Bestätigung + Foto-Upload
              </p>
            </div>

            {/* Arrow */}
            <FlowArrow />

            {/* Einsatz */}
            <div className="flex flex-col items-center">
              <FlowNode icon="tool" label="Einsatz" />
              <p className="mt-2 max-w-[110px] text-center text-[10px] leading-tight text-navy-300">
                Betrieb sieht alles auf einen Blick — keine Zettelwirtschaft
              </p>
            </div>

            {/* Arrow */}
            <FlowArrow />

            {/* Bewertungen */}
            <div className="flex flex-col items-center">
              <FlowNode icon="star" label="Bewertung" />
              <p className="mt-2 max-w-[110px] text-center text-[10px] leading-tight text-navy-300">
                Zufriedene Kunden bewerten — automatisch zum richtigen Zeitpunkt
              </p>
            </div>
          </div>
        </section>

        {/* ━━━ PAKETE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="mt-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-400">
            Pakete & Preise
          </h2>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            {PACKAGES.map((pkg) => {
              const isRec = pkg.id === data.recommendedPackage;
              return (
                <div
                  key={pkg.id}
                  className={`rounded-xl p-3.5 ${
                    isRec
                      ? "border-2 border-gold-500 bg-gold-100/30 shadow-sm"
                      : "border border-navy-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isRec ? "text-gold-600" : "text-navy-400"}`}>
                      {pkg.name}
                    </p>
                    {isRec && (
                      <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[8px] font-bold uppercase text-navy-950">
                        Empfohlen
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-base font-bold">
                    {pkg.price}
                    <span className="text-[10px] font-normal text-navy-400"> / Mt.</span>
                  </p>
                  <p className="text-[10px] text-navy-400">{pkg.subtitle}</p>
                  <ul className="mt-2 space-y-0.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-1 text-[10px] leading-snug text-navy-900/80">
                        <Check />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ━━━ NÄCHSTE SCHRITTE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="mt-5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.15em] text-navy-400">
            Nächste Schritte
          </h2>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            <StepCard
              n={1}
              title="Von Ihnen (5 Min)"
              items={[
                "Logo & Firmenfarben",
                "Öffnungszeiten & Einzugsgebiet",
                "Notdienst ja/nein",
                "Wann soll die Telefonassistentin rangehen",
              ]}
            />
            <StepCard
              n={2}
              title="Von uns (3–5 Werktage)"
              items={[
                "Setup Website & Online-Meldung",
                "Telefonassistentin konfigurieren",
                "SMS-Bestätigung & Fallübersicht",
                "Alles inklusive — keine Setup-Kosten",
              ]}
            />
            <StepCard
              n={3}
              title="Test & Live"
              items={[
                "1x Online-Test, 1x Telefon-Test",
                "Dann live — abhängig davon, wie schnell wir Ihre Infos erhalten",
                "Komplett remote möglich — kein Vorort-Termin nötig",
              ]}
            />
          </div>
        </section>

        {/* ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer className="mt-5 flex items-end justify-between border-t border-navy-200 pt-3">
          <div className="flex items-start gap-3">
            {data.demoWebsiteUrl && (
              <div
                className="shrink-0 rounded-lg border border-navy-200 bg-white p-1"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            )}
            <div className="text-[10px] text-navy-400 leading-relaxed">
              {data.demoWebsiteUrl && (
                <p><span className="font-semibold text-navy-700">Ihre Demo-Website</span>  {data.demoWebsiteUrl}</p>
              )}
              {data.wizardUrl && (
                <p><span className="font-semibold text-navy-700">Online-Meldung</span>  {data.wizardUrl}</p>
              )}
              <p className="mt-1.5">
                <span className="font-semibold text-navy-700">Fragen?</span>{" "}
                {SITE.founderName} — {SITE.phone} — {SITE.founderEmail}
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-navy-300 leading-snug shrink-0 pl-4">
            <p>Monatlich kündbar · Setup inklusive</p>
            <p>Keine Gesprächsaufnahmen</p>
            <p>100 % DSGVO-konform · Daten in der Schweiz</p>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ── Leitsystem Flow Components ───────────────────────────────────── */
function FlowNode({ icon, label, highlighted }: { icon: string; label: string; highlighted?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${highlighted ? "bg-gold-500 text-navy-950" : "bg-navy-800 text-gold-400"} `}>
        {icon === "globe" && <GlobeIcon />}
        {icon === "phone" && <PhoneIcon />}
        {icon === "ticket" && <TicketIcon />}
        {icon === "tool" && <ToolIcon />}
        {icon === "star" && <StarIcon />}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${highlighted ? "text-gold-400" : "text-navy-200"}`}>
        {label}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="mt-4 flex items-center px-1">
      <div className="h-px w-6 bg-gold-500/40" />
      <svg className="h-2.5 w-2.5 text-gold-500/60" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
      </svg>
    </div>
  );
}

function StepCard({ n, title, items }: { n: number; title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-navy-200 p-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
          {n}
        </span>
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <ul className="mt-2 space-y-0.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1 text-[10px] leading-snug text-navy-400">
            <span className="mt-0.5 text-gold-500">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Icons (inline SVG, no deps) ──────────────────────────────────── */
function GlobeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.193-.14 1.743" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
