"use client";

import { useEffect, useRef, useState } from "react";
import { bunnyEmbedUrl } from "@/src/lib/proof/bunny";

interface Props {
  token: string;
  slug: string;
  companyName: string;
  salutation: string | null;
  variant: "notruf" | "preis";
  libraryId: string;
  videos: { t1?: string; t2?: string; t2_portrait?: string; t3?: string; t4?: string };
}

/**
 * 16:10 responsive Bunny player (takes are 1440×900 desktop-format).
 * Optional posterUrl: ein selbst gewähltes Standbild liegt über dem Bunny-Player,
 * bis getippt wird — so kontrollieren wir den ersten Eindruck (statt Bunnys
 * Default-Poster, das eine unvorteilhafte Mimik treffen kann; FB30).
 */
function Player({
  libraryId,
  guid,
  title,
  lead = false,
  posterUrl,
  aspect = "1440 / 900",
}: {
  libraryId: string;
  guid?: string;
  title: string;
  lead?: boolean;
  posterUrl?: string;
  aspect?: string;
}) {
  const [started, setStarted] = useState(false);
  const [posterOk, setPosterOk] = useState(!!posterUrl);
  if (!guid) return null;
  const showPoster = !!posterUrl && posterOk && !started;
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black shadow-lg ${
        lead ? "ring-1 ring-amber-300/40" : "ring-1 ring-white/10"
      }`}
      style={{ aspectRatio: aspect }}
    >
      {showPoster ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="group absolute inset-0 h-full w-full"
          aria-label={`${title} abspielen`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={title}
            onError={() => setPosterOk(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 ring-2 ring-white/80 transition group-hover:scale-105">
              <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
            </span>
          </span>
        </button>
      ) : (
        <iframe
          src={bunnyEmbedUrl(libraryId, guid, { preload: lead, autoplay: started })}
          title={title}
          loading={lead ? "eager" : "lazy"}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
}

function Step({
  label,
  blurb,
  children,
}: {
  label: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-white">{label}</h2>
        <p className="text-sm text-slate-400">{blurb}</p>
      </div>
      {children}
    </section>
  );
}

export default function ProofClient({
  token,
  slug,
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

  // Selbst gewähltes Lead-Poster (public/proof-posters/<slug>-t1.jpg), falls vorhanden.
  // Fehlt es, fällt der Player still auf Bunnys Default zurück (img onError).
  const leadPoster = `/proof-posters/${slug}-t1.jpg`;
  const greeting = salutation ? `Grüezi ${salutation}` : "Grüezi";
  const callBlurb =
    variant === "notruf"
      ? "Ein Kunde ruft an, dringend — Lisa nimmt rund um die Uhr ab und macht sofort eine saubere Meldung daraus."
      : "Ein Kunde ruft an — Lisa nimmt ab, beantwortet die Frage und macht eine saubere Meldung daraus.";

  return (
    <div className="space-y-10">
      {/* Kopf */}
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-amber-300/80">
          Persönlich für {companyName}
        </p>
        <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
          {greeting} — schön, dass Sie reinschauen.
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-300">
          Das ist {companyName}, einmal komplett durchgespielt — vom ersten Anruf bis zur Bewertung.
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
        <Player
          libraryId={libraryId}
          guid={videos.t1}
          title={`${companyName} — Einblick`}
          lead
          posterUrl={leadPoster}
        />
      </section>

      {/* Lebenszyklus */}
      <Step label="Der Anruf" blurb={callBlurb}>
        {/* Geräteweiche: Desktop = Querformat (approved), Handy = Hochformat (mobil-optimiert).
            CSS-Toggle statt JS → kein Hydration-Flash, keine Bunny-Magie nötig. */}
        <div className={videos.t2_portrait ? "hidden sm:block" : ""}>
          <Player libraryId={libraryId} guid={videos.t2} title={`${companyName} — Der Anruf`} />
        </div>
        {videos.t2_portrait && (
          <div className="mx-auto max-w-[520px] sm:hidden">
            <Player
              libraryId={libraryId}
              guid={videos.t2_portrait}
              title={`${companyName} — Der Anruf`}
              aspect="600 / 900"
            />
          </div>
        )}
      </Step>

      <Step
        label="Die Online-Meldung"
        blurb="Eine Anfrage über das Formular landet direkt strukturiert im Leitsystem — nichts geht verloren."
      >
        <Player libraryId={libraryId} guid={videos.t3} title={`${companyName} — Online-Meldung`} />
      </Step>

      <Step
        label="Vom Auftrag zur Bewertung"
        blurb="Der Fall wird abgewickelt — und im richtigen Moment laden Sie den Kunden zur Google-Bewertung ein: nicht automatisch nach jedem Fall, sondern wenn es passt."
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
