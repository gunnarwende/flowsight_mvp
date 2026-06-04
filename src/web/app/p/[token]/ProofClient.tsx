"use client";

import { useEffect, useRef } from "react";
import { bunnyEmbedUrl } from "@/src/lib/proof/bunny";

interface Props {
  token: string;
  companyName: string;
  salutation: string | null;
  variant: "notruf" | "preis";
  libraryId: string;
  videos: { t1?: string; t2?: string; t3?: string; t4?: string };
}

/** 16:10 responsive Bunny player (takes are 1440×900 desktop-format). */
function Player({
  libraryId,
  guid,
  title,
  lead = false,
}: {
  libraryId: string;
  guid?: string;
  title: string;
  lead?: boolean;
}) {
  if (!guid) return null;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black shadow-lg ${
        lead ? "ring-1 ring-amber-300/40" : "ring-1 ring-white/10"
      }`}
      style={{ aspectRatio: "1440 / 900" }}
    >
      <iframe
        src={bunnyEmbedUrl(libraryId, guid, { preload: lead })}
        title={title}
        loading={lead ? "eager" : "lazy"}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

function Step({
  n,
  label,
  blurb,
  children,
}: {
  n: number;
  label: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-bold text-[#0b1f33]">
          {n}
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">{label}</h2>
          <p className="text-sm text-slate-400">{blurb}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ProofClient({
  token,
  companyName,
  salutation,
  variant,
  libraryId,
  videos,
}: Props) {
  // Page-Open-Tracking: einmal pro Mount (Bunny liefert die Watch-Detail-Analytik).
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch(`/api/p/${token}/track`, { method: "POST", keepalive: true }).catch(() => {});
  }, [token]);

  const greeting = salutation ? `Guten Tag ${salutation}` : "Guten Tag";
  const callBlurb =
    variant === "notruf"
      ? "Ein Notfall ruft an — Lisa nimmt rund um die Uhr ab und macht sofort eine saubere Meldung daraus."
      : "Jemand ruft an — Lisa nimmt ab, beantwortet die Frage und macht eine saubere Meldung daraus.";

  return (
    <div className="space-y-10">
      {/* Kopf */}
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-300/80">
          Persönlich für {companyName}
        </p>
        <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
          {greeting} — ich habe Ihr System einmal echt durchgespielt.
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-300">
          Kein Werbe-Mockup: Das ist Ihr Betrieb, live im FlowSight-Leitstand — vom ersten Anruf
          bis zur 5-Sterne-Bewertung. Schauen Sie in Ruhe rein.
        </p>
      </header>

      {/* Querformat-Hinweis (gehört auf die Seite, nicht in die Mail) */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-sm text-amber-100/90 sm:hidden">
        <span className="text-lg">📱</span>
        <span>
          Am Handy: <strong>quer halten</strong> und auf Vollbild tippen — dann sehen Sie alles in
          Ruhe.
        </span>
      </div>

      {/* T1 Lead */}
      <section className="space-y-3">
        <Player libraryId={libraryId} guid={videos.t1} title={`${companyName} — Einblick`} lead />
      </section>

      {/* Lebenszyklus */}
      <Step n={1} label="Der Anruf" blurb={callBlurb}>
        <Player libraryId={libraryId} guid={videos.t2} title={`${companyName} — Der Anruf`} />
      </Step>

      <Step
        n={2}
        label="Die Online-Meldung"
        blurb="Eine Anfrage über das Formular landet direkt strukturiert im Leitstand — nichts geht verloren."
      >
        <Player libraryId={libraryId} guid={videos.t3} title={`${companyName} — Online-Meldung`} />
      </Step>

      <Step
        n={3}
        label="Vom Auftrag zur Bewertung"
        blurb="Der Fall wird abgewickelt — und am Schluss steht automatisch eine Einladung zur Google-Bewertung."
      >
        <Player libraryId={libraryId} guid={videos.t4} title={`${companyName} — Bewertung`} />
      </Step>

      {/* Menschlicher Abschluss — kein glatter Verkaufs-CTA */}
      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-[15px] leading-relaxed text-slate-200">
          Wenn Sie an einer Stelle gedacht haben „das würde bei uns wirklich etwas bringen", dann
          sagen Sie mir das kurz. Und wenn Sie finden, das ist nichts für Sie — sagen Sie's mir bitte
          genauso ehrlich. Beides hilft mir weiter.
        </p>
        <div className="text-sm text-slate-400">
          <p className="font-semibold text-white">Gunnar Wende</p>
          <p>FlowSight, Oberrieden</p>
        </div>
      </section>
    </div>
  );
}
