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
        lead ? "ring-1 ring-[#d4a843]/40" : "ring-1 ring-white/10"
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
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 ring-2 ring-[#d4a843] transition group-hover:scale-105">
              <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-[#d4a843]" />
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

  // T1 ist canonical (betriebsübergreifend identisch) → EIN Gesichts-Standbild für alle
  // (public/proof-posters/_canonical-t1.jpg). Fehlt es, Bunny-Default via img onError.
  const leadPoster = "/proof-posters/_canonical-t1.jpg";
  const greeting = salutation ? `Grüezi ${salutation}` : "Grüezi";
  const callBlurb =
    variant === "notruf"
      ? "Ein Kunde ruft an, dringend — Lisa nimmt rund um die Uhr ab und macht sofort eine saubere Meldung daraus."
      : "Ein Kunde ruft an — Lisa nimmt ab, beantwortet die Frage und macht eine saubere Meldung daraus.";

  return (
    <div className="space-y-10">
      {/* Kopf */}
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[#d4a843]/90">
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
      <div className="flex items-center gap-3 rounded-xl border border-[#d4a843]/25 bg-[#d4a843]/[0.08] px-4 py-3 text-sm text-[#d4a843] sm:hidden">
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

      {/* Warmer Abschluss — Founder-Signatur, KEIN Ask. Der CTA lebt in der E-Mail
          (founder-getrieben + No-oriented, siehe CTA.md); die Seite ist die Schatztruhe,
          nicht eine zweite, schwächere CTA-Fläche. Kein Duplikat des T4-Video-Schlusses. */}
      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-[15px] leading-relaxed text-slate-200">
          Das war {companyName}, einmal komplett durchgespielt — von der ersten Anfrage bis zur
          Bewertung. Mit Sorgfalt gebaut, hier aus Oberrieden.
        </p>
        <p className="text-sm font-semibold text-white">— Gunnar Wende</p>
      </section>

      {/* Marken-Connector: App-Icon (Navy + Gold) → „Ihr Leitsystem".
          Belegt visuell die „eigene App" aus der Mail. FlowSight bleibt unsichtbar
          (Label tenant-framed). Gold nur als Akzent (Ring + Punkt + Haarlinie). */}
      <div className="flex flex-col items-center gap-2 pb-2 pt-2">
        <span className="h-px w-16 bg-[#d4a843]/50" />
        <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true" className="mt-1">
          <rect x="1.5" y="1.5" width="49" height="49" rx="12" fill="#1a2744" stroke="#d4a843" strokeWidth="1.5" />
          <circle cx="26" cy="26" r="6.5" fill="#d4a843" />
        </svg>
        <p className="text-sm font-semibold text-slate-200">Ihr Leitsystem</p>
        <p className="text-xs text-slate-500">auf Handy und Computer</p>
      </div>
    </div>
  );
}
