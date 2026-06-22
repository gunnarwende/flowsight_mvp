"use client";

import { useState } from "react";
import { Constellation, LisaAvatar, type ConstellationStar } from "./Constellation";

// ── Design-Vorschau der neuen Demo-Architektur (Stern 3–4) ───────────────────
// 3 Schichten: (1) Lead-Haken · (2) interaktive Karte 3 Eingänge → Leitsystem ·
// (3) Modul-Tiefe pro Knoten. Visuelle Sprache aus dem Cockpit (M2). Beispieldaten;
// später config-/tenant-getrieben (M5). Beide Ansichten high-end: Handy + Monitor.
// Sprache: 1–3-Mann-Sanitär — klar, konkret, kein Marketing-Sprech.

const GOLD = "#d4a843";

// Fixture — steht später in tenant_config (M5)
const DEMO = {
  companyName: "Muster Sanitär AG",
  salutation: "Herr Muster",
  brand: "#2b6cb0",
  variant: "notruf" as "notruf" | "preis",
};

type NodeKey = "lisa" | "website" | "vorort" | "leitsystem";
type IconKey = "phone" | "web" | "clipboard";

// Eigene Linien-Icons statt Emoji — konsistent in Gold, high-end auf beiden Geräten.
function ChannelIcon({ name, size = 30 }: { name: IconKey; size?: number }) {
  if (name === "phone") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.8 3.5c.9 0 1.7.6 1.9 1.5l.6 2.4c.1.6-.1 1.2-.5 1.6L7.5 10.2a12.5 12.5 0 0 0 6.3 6.3l1.2-1.3c.4-.4 1-.6 1.6-.5l2.4.6c.9.2 1.5 1 1.5 1.9v2.1c0 1.1-.9 2-2 1.9A16.5 16.5 0 0 1 4.8 4.6c-.1-1.1.8-2 1.9-2z" />
      </svg>
    );
  }
  if (name === "web") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.6 12h16.8" />
        <path d="M12 3.5c2.4 2.3 2.4 14.7 0 17M12 3.5c-2.4 2.3-2.4 14.7 0 17" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9.5 4.2V3.6A1.6 1.6 0 0 1 11 2h2a1.6 1.6 0 0 1 1.5 1.6v.6" />
      <path d="M9 10.5h6M9 14h6" />
    </svg>
  );
}

const CHANNELS: {
  key: Exclude<NodeKey, "leitsystem">;
  icon: IconKey;
  titel: string;
  unter: string;
  steuern: string;
  clip: string;
}[] = [
  {
    key: "lisa",
    icon: "phone",
    titel: "Lisa",
    unter: "Geht ans Telefon, wenn Sie nicht können",
    steuern: "Sie entscheiden, wie Lisa bei jedem Anliegen reagiert — neuer Auftrag, Frage, Notfall.",
    clip: "Lisa geht in Ihrem Namen ans Telefon, hält das Anliegen sauber fest und sagt einen Rückruf zur Wunschzeit zu.",
  },
  {
    key: "website",
    icon: "web",
    titel: "Website",
    unter: "Anfragen über Ihre Website — rund um die Uhr",
    steuern: "Sie legen fest, welche Angaben das Formular abfragt.",
    clip: "Eine Anfrage über das Formular landet direkt ordentlich aufgelistet in Ihrem Leitsystem.",
  },
  {
    key: "vorort",
    icon: "clipboard",
    titel: "Vor Ort",
    unter: "Aufträge, die Sie unterwegs aufnehmen",
    steuern: "Mit einem Tipp halten Sie einen Auftrag fest — kein Zettel geht mehr verloren.",
    clip: "Sie nehmen einen Auftrag direkt vor Ort auf — sofort sichtbar in Ihrem Leitsystem.",
  },
];

const LEITSYSTEM_NODE = {
  steuern: "Ihr Überblick: was offen ist, was läuft, was erledigt ist — auf Handy und Computer.",
  clip: "Jede Anfrage läuft hier sichtbar weiter, bis sie erledigt ist — plus ein Wochen-Rückblick: was reinkam und was Sie geschafft haben.",
};

// Lisas 5 Sterne — Reihenfolge + Labels 1:1 aus dem Cockpit (M2). Hier read-only
// als Default-Vorschau: „so reagiert Lisa", bevor der Betrieb selbst nachjustiert.
const LISA_STARS: ConstellationStar[] = [
  { key: "begruessung", label: "So meldet sich Lisa", note: "Meldet sich mit Ihrem Firmennamen — freundlich, in Ihrem Namen." },
  { key: "wissen", label: "Das soll Lisa wissen", note: "Kennt Öffnungszeiten, Einzugsgebiet und Leistungen — beantwortet einfache Fragen direkt." },
  { key: "anruflogik", label: "So soll Lisa reagieren", note: "Folgt Ihren Regeln: Preisfragen, Stammkunden, Dringlichkeit — Sie geben den Takt vor." },
  { key: "notfall", label: "Wann Lisa erreichbar ist", note: "Erkennt Notfälle und alarmiert Sie sofort — stellt nicht blind durch, sondern hält die Anfrage fest." },
  { key: "telefonie", label: "So kommt der Anruf zu Lisa", note: "Springt erst ein, wenn Sie nicht drangehen — erst nach der Zeit, die Sie festlegen." },
];

function LeitsystemIcon({ size = 64, glow = false }: { size?: number; glow?: boolean }) {
  const svg = (
    <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true">
      <rect x="1.5" y="1.5" width="49" height="49" rx="13" fill="#1a2744" stroke={GOLD} strokeWidth="1.5" />
      <circle cx="26" cy="26" r="6.5" fill={GOLD} />
    </svg>
  );
  if (!glow) return svg;
  // Pulsierendes Gold-Glow — identisch zum Cockpit-App-Icon (high-end Touch).
  return (
    <span className="fs-iconglow inline-block leading-none">
      <style>{`@keyframes fsglow{0%,100%{filter:drop-shadow(0 0 12px rgba(212,168,67,.55)) drop-shadow(0 0 30px rgba(212,168,67,.28))}50%{filter:drop-shadow(0 0 22px rgba(212,168,67,.9)) drop-shadow(0 0 48px rgba(212,168,67,.5))}}.fs-iconglow svg{animation:fsglow 4.5s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.fs-iconglow svg{animation:none;filter:drop-shadow(0 0 16px rgba(212,168,67,.75))}}`}</style>
      {svg}
    </span>
  );
}

function SteuerBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: `${GOLD}1a`, color: GOLD }}
    >
      Sie steuern das
    </span>
  );
}

/** Platzhalter für die echten Clips (kommen pro Betriebstyp, M5). */
function ClipPlaceholder({ caption, portrait = false }: { caption: string; portrait?: boolean }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10"
      style={{ aspectRatio: portrait ? "9 / 16" : "16 / 9" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 ring-2" style={{ borderColor: GOLD }}>
          <span className="ml-1 border-y-[9px] border-l-[15px] border-y-transparent" style={{ borderLeftColor: GOLD }} />
        </span>
        <p className="text-sm text-slate-300">{caption}</p>
        <p className="text-[11px] uppercase tracking-wider text-slate-500">Vorschau — Clip folgt</p>
      </div>
    </div>
  );
}

export default function DemoVorschau() {
  const [openNode, setOpenNode] = useState<NodeKey | null>(null);

  const greeting = `Grüezi ${DEMO.salutation}`;
  const node = openNode === "leitsystem" ? null : CHANNELS.find((c) => c.key === openNode) ?? null;
  const detail =
    openNode === "leitsystem"
      ? { titel: "Ihr Leitsystem", icon: null as IconKey | null, ...LEITSYSTEM_NODE }
      : node
        ? { titel: node.titel, icon: node.icon as IconKey | null, steuern: node.steuern, clip: node.clip }
        : null;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <div className="mx-auto w-full max-w-[860px] px-5 py-10 sm:py-14">
        {/* ── Schicht 1: Der Haken ── */}
        <header className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: `${GOLD}e6` }}>
            Persönlich für {DEMO.companyName}
          </p>
          <h1 className="text-2xl font-bold leading-snug sm:text-4xl">
            {greeting} — bei Ihnen geht kein Auftrag mehr verloren.
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Auch wenn Sie gerade nicht ans Telefon kommen — jede Anfrage wird sauber festgehalten, und Sie
            sehen jederzeit, was noch offen ist. In 90 Sekunden sehen Sie, wie das für {DEMO.companyName} aussieht.
          </p>
        </header>

        <div className="mt-6">
          <ClipPlaceholder caption={`${DEMO.companyName} — eine Kundenanfrage, sauber festgehalten`} />
        </div>

        {/* ── Schicht 2: Die interaktive Karte ── */}
        <section className="mt-14">
          <p className="text-center text-[11px] uppercase tracking-[0.18em] text-slate-500">
            So funktioniert Ihr System — öffnen Sie jeden Eingang
          </p>
          <h2 className="mt-2 text-center text-xl font-bold sm:text-2xl">Drei Eingänge, ein Überblick</h2>

          {/* 3 Eingänge — Handy: gestapelt · Monitor: 3 Spalten */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setOpenNode(c.key)}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <ChannelIcon name={c.icon} />
                <span className="mt-3 text-base font-semibold text-white">{c.titel}</span>
                <span className="mt-0.5 text-sm text-slate-400">{c.unter}</span>
                <span className="mt-3"><SteuerBadge /></span>
                <span className="mt-3 text-sm font-medium" style={{ color: GOLD }}>
                  Ansehen <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </button>
            ))}
          </div>

          {/* Fluss in den Hub — Monitor: 3 Pfeile · Handy: ein Pfeil */}
          <div className="my-5 hidden grid-cols-3 gap-5 sm:grid">
            {CHANNELS.map((c) => (
              <div key={c.key} className="text-center text-2xl" style={{ color: `${GOLD}99` }}>↓</div>
            ))}
          </div>
          <div className="my-5 text-center text-2xl sm:hidden" style={{ color: `${GOLD}99` }}>↓</div>

          {/* Hub: Leitsystem (klickbar → M4) */}
          <button
            type="button"
            onClick={() => setOpenNode("leitsystem")}
            className="mx-auto flex w-full max-w-[420px] flex-col items-center rounded-2xl border p-6 text-center transition hover:bg-white/[0.04]"
            style={{ borderColor: `${GOLD}55` }}
          >
            <LeitsystemIcon glow />
            <span className="mt-3 text-lg font-bold text-white">Ihr Leitsystem</span>
            <span className="mt-1 text-sm text-slate-400">auf Handy und Computer — alles sichtbar an einem Ort</span>
            <span className="mt-3"><SteuerBadge /></span>
          </button>
        </section>

        {/* ── Schluss-Beat: Eigentum ── */}
        <section className="mt-14 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-[15px] leading-relaxed text-slate-200">
            Und das Beste: Sie bestimmen selbst, wie Ihre Eingänge ins <strong className="text-white">Leitsystem</strong>{" "}
            laufen — welche Anfrage wie festgehalten wird und was damit passiert. Eingerichtet ist es schnell —
            kein IT-Projekt, alles läuft auf Ihrem Handy. Falsch machen können Sie dabei nichts. Es bleibt{" "}
            <strong className="text-white">Ihr</strong> System, nach Ihren Regeln.
          </p>
          <p className="mt-3 text-sm font-semibold text-white">— Gunnar Wende, Oberrieden</p>
        </section>
      </div>

      {/* ── Schicht 3: Modul-Tiefe (Knoten-Detail) ── */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6"
          onClick={() => setOpenNode(null)}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-t-2xl bg-[#0f172a] p-6 ring-1 ring-white/10 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={detail.titel}
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                {detail.icon ? <ChannelIcon name={detail.icon} size={26} /> : <LeitsystemIcon size={28} />}
                {detail.titel}
              </h3>
              <button
                type="button"
                onClick={() => setOpenNode(null)}
                className="rounded-full px-2 text-2xl leading-none text-slate-400 hover:text-white"
                aria-label="Schließen"
              >
                ×
              </button>
            </div>

            {openNode === "lisa" ? (
              // Lisa-Tiefe: ihre 5 Sterne (read-only Default-Vorschau) — der Beweis,
              // dass sie kontrolliert reagiert. Entschärft Einwände vorab (M3).
              <>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Lisa ist kein starrer Anrufbeantworter. Sie reagiert in fünf Situationen — alle nach
                  Ihren Vorgaben. So ist sie von Anfang an eingestellt:
                </p>
                <div className="mt-5">
                  <Constellation center={<LisaAvatar stars={5} />} centerLabel="Lisa" stars={LISA_STARS} />
                </div>
              </>
            ) : (
              <div className="mt-4">
                <ClipPlaceholder caption={detail.clip} />
              </div>
            )}

            <div className="mt-5 rounded-xl p-4" style={{ background: `${GOLD}12` }}>
              <p className="text-sm font-semibold" style={{ color: GOLD }}>So steuern Sie das</p>
              <p className="mt-1 text-sm text-slate-200">{detail.steuern}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
