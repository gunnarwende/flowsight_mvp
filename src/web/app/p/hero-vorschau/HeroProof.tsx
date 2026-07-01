"use client";

import { useEffect, useRef, useState } from "react";
import { bunnyEmbedUrl } from "@/src/lib/proof/bunny";

/**
 * „1 Hero + Knoten" — die neue Beweis-Seite (Stern 3).
 *
 * Ein 90-Sek-Hero oben, darunter vier anklickbare Knoten, die als Fragen des
 * Inhabers auftreten (nicht als Features). Peek-Regel: der oberste Knoten lugt
 * schon während des Heros ins Bild. Reveal: wenn das Hero-Versprechen landet
 * (Hero endet) — oder beim Reinscrollen / nach Fallback — gleiten die Knoten ein.
 *
 * Bewusst self-contained (fasst die live 4-Video-`ProofClient` nicht an). Ohne
 * echte Video-GUIDs rendert alles als Platzhalter → als Struktur-Vorschau nutzbar.
 */

export interface Knoten {
  key: "k1" | "k2" | "k3" | "k4";
  frage: string;
  unter: string;
  guid?: string;
}

interface Props {
  companyName: string;
  libraryId?: string;
  heroGuid?: string;
  knoten: Knoten[];
  /** Vorschau: kein Tracking, Platzhalter erlaubt. */
  demo?: boolean;
}

function HeroFrame({
  libraryId,
  guid,
  title,
  demo,
  onEnded,
}: {
  libraryId?: string;
  guid?: string;
  title: string;
  demo?: boolean;
  onEnded: () => void;
}) {
  const [started, setStarted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // player.js „ended" → Reveal auslösen (nur bei echtem Bunny-Player).
  useEffect(() => {
    if (!started || !guid) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const post = (method: string, value: string) => {
      try {
        iframe.contentWindow?.postMessage(
          JSON.stringify({ context: "player.js", version: "0.0.1", method, value }),
          "*"
        );
      } catch {
        /* never break */
      }
    };
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return;
      let d: { context?: string; event?: string } | null = null;
      try {
        d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (d?.context !== "player.js") return;
      if (d.event === "ready") post("addEventListener", "ended");
      else if (d.event === "ended") onEnded();
    };
    window.addEventListener("message", onMessage);
    const t = window.setTimeout(() => post("addEventListener", "ended"), 1500);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(t);
    };
  }, [started, guid, onEnded]);

  const start = () => {
    setStarted(true);
    // Vorschau ohne echtes Video: Reveal nach kurzer „Spielzeit" simulieren.
    if (demo && !guid) window.setTimeout(onEnded, 1400);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-black shadow-lg ring-1 ring-[#d4a843]/40"
      style={{ aspectRatio: "1440 / 900" }}
    >
      {started && guid ? (
        <iframe
          ref={iframeRef}
          src={bunnyEmbedUrl(libraryId || "", guid, { preload: true, autoplay: true })}
          title={title}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={start}
          className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#12314f] to-[#0b1f33]"
          aria-label={`${title} abspielen`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 ring-2 ring-[#d4a843] transition group-hover:scale-105">
            {started ? (
              <span className="text-xs font-medium text-[#d4a843]">läuft…</span>
            ) : (
              <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-[#d4a843]" />
            )}
          </span>
          <span className="text-sm text-slate-300">
            {guid ? title : "Hero — 90 Sekunden (in Produktion)"}
          </span>
        </button>
      )}
    </div>
  );
}

function KnotenCard({
  k,
  libraryId,
  index,
  revealed,
  isOpen,
  onToggle,
  demo,
}: {
  k: Knoten;
  libraryId?: string;
  index: number;
  revealed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  demo?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-500 ${
        revealed ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{ transitionDelay: revealed ? `${index * 90}ms` : "0ms" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex-1">
          <span className="block text-[15px] font-semibold text-white">{k.frage}</span>
          <span className="mt-0.5 block text-sm text-slate-400">{k.unter}</span>
        </span>
        <span
          className={`shrink-0 text-[#d4a843] transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-5">
            {k.guid ? (
              <div
                className="relative w-full overflow-hidden rounded-lg bg-black ring-1 ring-white/10"
                style={{ aspectRatio: "1440 / 900" }}
              >
                <iframe
                  src={bunnyEmbedUrl(libraryId || "", k.guid, { preload: false, autoplay: isOpen })}
                  title={k.frage}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center text-sm text-slate-400">
                {demo ? "Knoten-Video — in Produktion" : "Wird gerade fertig — schauen Sie gleich nochmal rein."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroProof({ companyName, libraryId, heroGuid, knoten, demo }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reveal-Auslöser: Reinscrollen (Peek → Engagement) + Fallback-Timer.
  // Hero-Ende setzt ebenfalls revealed (via onEnded unten).
  useEffect(() => {
    if (revealed) return;
    const el = sentinelRef.current;
    let io: IntersectionObserver | null = null;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) setRevealed(true);
        },
        { threshold: 0.4 }
      );
      io.observe(el);
    }
    const t = window.setTimeout(() => setRevealed(true), 8000);
    return () => {
      io?.disconnect();
      window.clearTimeout(t);
    };
  }, [revealed]);

  const peek = knoten[0];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[#d4a843]/90">
          Persönlich für {companyName}
        </p>
        <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
          Schauen Sie — in 90 Sekunden.
        </h1>
      </header>

      <section className="space-y-3">
        <HeroFrame
          libraryId={libraryId}
          guid={heroGuid}
          title={`${companyName} — Einblick`}
          demo={demo}
          onEnded={() => setRevealed(true)}
        />
      </section>

      {/* Peek: der oberste Knoten lugt schon rein, solange nicht enthüllt. */}
      {!revealed && peek && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-[#d4a843]/25 bg-[#d4a843]/[0.06] px-5 py-3 text-left"
        >
          <span className="text-[#d4a843]">▾</span>
          <span className="flex-1 text-sm text-slate-300">
            Noch Fragen? Z. B.: <span className="font-medium text-white">{peek.frage}</span>
          </span>
        </button>
      )}

      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      {/* Knoten-Stack */}
      <section className={`space-y-3 ${revealed ? "" : "hidden"}`} aria-label="Ihre Fragen">
        {knoten.map((k, i) => (
          <KnotenCard
            key={k.key}
            k={k}
            index={i}
            libraryId={libraryId}
            revealed={revealed}
            isOpen={open === k.key}
            onToggle={() => setOpen((cur) => (cur === k.key ? null : k.key))}
            demo={demo}
          />
        ))}
      </section>

      {/* Warmer Abschluss — Founder-Signatur, kein Ask (der CTA lebt in der Mail). */}
      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-[15px] leading-relaxed text-slate-200">
          Das ist {companyName} — mit Sorgfalt gebaut, hier aus Oberrieden.
        </p>
        <p className="text-sm font-semibold text-white">— Gunnar Wende</p>
      </section>
    </div>
  );
}
