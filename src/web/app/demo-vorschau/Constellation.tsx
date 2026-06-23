"use client";

import type { ReactNode } from "react";

// ── Konstellations-Komponente (M2: dieselbe visuelle Sprache wie das Cockpit) ──
// Faithful aus app/aufbau/[token]/CockpitApp.tsx übernommen (StarGlyph, LisaAvatar,
// Geometrie). Hier read-only: alle Sterne gesetzt = der konfigurierte Default-Zustand,
// den der Betrieb in der Demo sieht („so reagiert Lisa"). Das Cockpit kann diese Datei
// später mitnutzen, damit es nur EINE Konstellation gibt (M2-Dedup, mit Founder).

const GOLD = "#d4a843";

export type StarState = "empty" | "partial" | "done";
export type ConstellationStar = { key: string; label: string; note?: string; state?: StarState };

// 5er-Sternbild: PENTA = Stern-Positionen, INNER/OUTER = Strahl-Endpunkte (Avatar→Stern).
const PENTA = [{ x: 50, y: 15 }, { x: 87, y: 40 }, { x: 72, y: 83 }, { x: 28, y: 83 }, { x: 13, y: 40 }];
const INNER = [{ x: 50, y: 37 }, { x: 62.6, y: 46.6 }, { x: 57.2, y: 60.8 }, { x: 42.8, y: 60.8 }, { x: 37.4, y: 46.6 }];
const OUTER = [{ x: 50, y: 19 }, { x: 83.1, y: 41 }, { x: 69.8, y: 79.7 }, { x: 30.2, y: 79.7 }, { x: 16.9, y: 41 }];

export function StarGlyph({ state, size = 30 }: { state: StarState; size?: number }) {
  const fill = state === "done" ? GOLD : state === "partial" ? "rgba(200,162,74,0.35)" : "transparent";
  const stroke = state === "empty" ? "rgba(255,255,255,0.4)" : GOLD;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={state === "done" ? { filter: "drop-shadow(0 0 6px rgba(212,168,67,0.85))" } : undefined}>
      <path d="M12 2.2l2.85 6.2 6.75.7-5 4.55 1.4 6.65L12 17.6 5.6 20.3 7 13.65l-5-4.55 6.75-.7z" fill={fill} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/** Lisa als Team — progressives Gesicht (1★ Haare · 2★ Augen · 3★ Nase · 4★ Mund · 5★ Team mit Headset). */
export function LisaAvatar({ size = 108, stars = 0 }: { size?: number; stars?: number }) {
  const awake = stars >= 5;
  const skin = "#f2d3bd", hair = "#5a3b27", lip = "#c87f6e", ink = "#3a2c25";
  return (
    <span className="inline-block leading-none transition-all duration-300" style={{ filter: awake ? "drop-shadow(0 0 22px rgba(212,168,67,0.85))" : "drop-shadow(0 0 13px rgba(212,168,67,0.42))" }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="#0e2336" stroke="#d4a843" strokeWidth="2.5" />
        <g opacity="0.4">
          <circle cx="34" cy="62" r="10.5" fill="#5a6b88" /><path d="M19 96c0-12 7-18 15-18s15 6 15 18z" fill="#3c4d6c" />
          <circle cx="86" cy="62" r="10.5" fill="#5a6b88" /><path d="M71 96c0-12 7-18 15-18s15 6 15 18z" fill="#3c4d6c" />
          {stars >= 5 ? (
            <g stroke="#d4a843" strokeWidth="1.5" fill="none" strokeLinecap="round">
              <path d="M25 62a9 9 0 0 1 18 0" /><path d="M42 62v4.5" />
              <path d="M77 62a9 9 0 0 1 18 0" /><path d="M78 62v4.5" />
            </g>
          ) : null}
        </g>
        <path d="M36 99c0-15 11-24 24-24s24 9 24 24z" fill="#28395a" stroke="#d4a843" strokeWidth="1.4" />
        {stars >= 1 ? <path d="M40 54c0-15 9-25 20-25s20 10 20 25c0 8-1 15-3 21l-4-1c1-7 1-15 0-21-2 5-2 13-3 19H50c-1-6-1-14-3-19-1 6-1 14 0 21l-4 1c-2-6-3-13-3-21z" fill={hair} /> : null}
        <ellipse cx="60" cy="51" rx="14" ry="16" fill={skin} />
        {stars >= 1 ? <path d="M46 50c1-10 6.5-16 14-16s13 6 14 16c-3-6-8-8.5-14-8.5S49 44 46 50z" fill={hair} /> : null}
        {stars >= 2 ? (
          <g>
            <path d="M51 46.3q3-1.6 6 0M63 46.3q3-1.6 6 0" stroke={hair} strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <ellipse cx="54" cy="50" rx="2.5" ry="1.8" fill="#fff" /><ellipse cx="66" cy="50" rx="2.5" ry="1.8" fill="#fff" />
            <circle cx="54" cy="50" r="1.45" fill={ink} /><circle cx="66" cy="50" r="1.45" fill={ink} />
          </g>
        ) : null}
        {stars >= 3 ? <path d="M60 52q-1.6 3 -2 4.4q1 1 2 1t2-1q-0.4-1.4-2-4.4z" fill="#e6b89f" /> : null}
        {stars >= 4 ? (
          <g>
            <path d="M55 59q5 4.5 10 0q-5 2.2 -10 0z" fill={lip} />
            <circle cx="49.5" cy="55" r="2.4" fill="#e89b87" opacity="0.45" /><circle cx="70.5" cy="55" r="2.4" fill="#e89b87" opacity="0.45" />
          </g>
        ) : null}
      </svg>
    </span>
  );
}

/**
 * Read-only Konstellation für die Demo: zeigt den konfigurierten Default-Zustand.
 * Desktop = radiales Sternbild + Erklär-Liste · Handy = Avatar + Sternen-Leiter mit Notiz.
 */
export function Constellation({ center, centerLabel, awakeLabel = "bereit ab Tag 1", stars }: {
  center: ReactNode;
  centerLabel: string;
  awakeLabel?: string;
  stars: ConstellationStar[];
}) {
  const norm = stars.slice(0, 5).map((s) => ({ ...s, state: s.state ?? ("done" as StarState) }));

  return (
    <div>
      {/* ── Desktop: radiales Sternbild ── */}
      <div className="hidden sm:block">
        <div className="relative mx-auto aspect-square w-full max-w-[380px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {norm.map((s, i) => (
              <line key={s.key} x1={INNER[i].x} y1={INNER[i].y} x2={OUTER[i].x} y2={OUTER[i].y} stroke={GOLD} strokeWidth="0.4" strokeOpacity={s.state === "done" ? 0.65 : 0.18} />
            ))}
          </svg>
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            {center}
            <p className="mt-2 text-sm font-bold text-white">{centerLabel}</p>
            <p className="text-[11px] font-semibold" style={{ color: GOLD }}>★ {awakeLabel}</p>
          </div>
          {norm.map((s, i) => {
            const below = PENTA[i].y > 70;
            return (
              <div key={s.key} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${PENTA[i].x}%`, top: `${PENTA[i].y}%` }}>
                <span className={`absolute ${below ? "top-[calc(100%+4px)]" : "bottom-[calc(100%+4px)]"} w-[140px] text-center text-[11px] font-medium leading-tight text-slate-200`}>{s.label}</span>
                <StarGlyph state={s.state} />
              </div>
            );
          })}
        </div>
        {/* Erklär-Liste (Desktop) */}
        <ul className="mt-6 space-y-2.5">
          {norm.map((s) => (
            <li key={s.key} className="flex gap-3">
              <span className="mt-0.5 shrink-0"><StarGlyph state={s.state} size={18} /></span>
              <span className="text-sm text-slate-300"><strong className="text-white">{s.label}.</strong> {s.note}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Handy: Avatar + Sternen-Leiter mit Notiz ── */}
      <div className="sm:hidden">
        <div className="mb-5 flex flex-col items-center">
          {center}
          <p className="mt-2 text-sm font-bold text-white">{centerLabel}</p>
          <p className="text-[11px] font-semibold" style={{ color: GOLD }}>★ {awakeLabel}</p>
        </div>
        <ul className="space-y-2.5">
          {norm.map((s) => (
            <li key={s.key} className="flex gap-3 rounded-xl border bg-white/[0.04] px-3 py-2.5" style={{ borderColor: `${GOLD}33` }}>
              <span className="mt-0.5 shrink-0"><StarGlyph state={s.state} size={22} /></span>
              <span className="text-sm text-slate-200"><strong className="text-white">{s.label}.</strong> {s.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
