"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CockpitDraft,
  CockpitSession,
  DispositionsConfig,
  DispositionKorb,
  StaffMember,
  WizardCategory,
} from "@/src/lib/cockpit/types";
import { DISPOSITION_DEFAULTS } from "@/src/lib/cockpit/types";
import { AVV_TEXT, AVV_VERSION, AVV_SUBPROCESSORS } from "@/src/lib/cockpit/avv";

/**
 * Onboarding-Cockpit Co-Pilot — Redesign v2 (Phase 2, OC6).
 * Nicht ein Formular, sondern ein SICHTBARES SYSTEM, das man trainiert:
 * 3 Eingangs-Stränge (Vor-Ort · Lisa · Website) → ◆ Ihr Leitsystem → Output.
 * Progressive Disclosure: Klick auf Strang/Knoten → erst dann die Fragen.
 * Spec: docs/gtm/onboarding/phase2_cockpit_redesign.md
 */

const GOLD = "#c8a24a";

type View = "overview" | "vorort" | "lisa" | "website" | "system" | "freigabe";
const CAPABILITIES = ["vorort", "lisa", "website", "system"] as const;

// ── UI-Bausteine ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#c8a24a] focus:outline-none";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-slate-400">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-[64px] resize-y leading-relaxed`} />;
}
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200">
      <span>{label}</span>
      <span className="relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors" style={{ backgroundColor: on ? GOLD : "rgba(255,255,255,0.2)" }}>
        <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all" style={{ left: on ? "1.125rem" : "0.125rem" }} />
      </span>
    </button>
  );
}
function RadioGroup<T extends string>({ value, onChange, options }: {
  value: T | undefined; onChange: (v: T) => void; options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className="flex w-full items-start gap-3 rounded-lg border bg-white/5 px-3 py-2 text-left"
            style={{ borderColor: active ? GOLD : "rgba(255,255,255,0.12)" }}>
            <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border"
              style={{ borderColor: active ? GOLD : "rgba(255,255,255,0.3)", backgroundColor: active ? GOLD : "transparent" }} />
            <span><span className="block text-sm text-white">{o.label}</span>
              {o.hint ? <span className="block text-xs text-slate-400">{o.hint}</span> : null}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Ein-/ausklappbarer Hinweis (Q4-Regel: Erklär-Text default eingeklappt, Textdichte runter). */
function Disclosure({ summary, children }: { summary: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-white/10 bg-white/5">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-slate-300 hover:text-white">
        <span>{summary}</span>
        <span className="text-sm leading-none transition-transform" style={{ color: GOLD, transform: open ? "rotate(90deg)" : "none" }}>▸</span>
      </button>
      {open ? <div className="border-t border-white/10 px-3 py-2.5 text-xs leading-relaxed text-slate-300">{children}</div> : null}
    </div>
  );
}

/** Kompakter SMS/E-Mail-Schalter (L3/F: der Betrieb wählt den Kanal). */
function ChannelPick({ value, onChange }: { value: "sms" | "email"; onChange: (v: "sms" | "email") => void }) {
  return (
    <div className="inline-flex rounded-lg border border-white/15 p-0.5 text-xs">
      {(["email", "sms"] as const).map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)} className="rounded-md px-3 py-1 font-medium"
          style={value === c ? { backgroundColor: GOLD, color: "#1a1a1a" } : { color: "#cbd5e1" }}>
          {c === "email" ? "E-Mail" : "SMS"}
        </button>
      ))}
    </div>
  );
}

/** Trainings-Regler: was Lisa bei einer Anruf-Art tut (Fall/Nachricht/nichts). */
function KorbPick({ value, onChange }: { value: DispositionKorb; onChange: (v: DispositionKorb) => void }) {
  const opts: { v: DispositionKorb; label: string }[] = [
    { v: "fall", label: "Fall anlegen" }, { v: "nachricht", label: "Nur Nachricht" }, { v: "nichts", label: "Nichts" },
  ];
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-lg border border-white/15 p-0.5 text-xs">
      {opts.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)} className="rounded-md px-2.5 py-1 font-medium"
          style={value === o.v ? { backgroundColor: GOLD, color: "#1a1a1a" } : { color: "#cbd5e1" }}>{o.label}</button>
      ))}
    </div>
  );
}

/** „Kennen Sie das?" — legt dem Betrieb seine Alltagsschmerzen vor + zeigt je die Entlastung
 *  (Welle 2 / emotionaler Hebel: „die verstehen meinen Alltag"). Einklappbar (Q4). */
function PainHint({ items }: { items: { pain: string; relief: string }[] }) {
  return (
    <Disclosure summary="💡 Kennen Sie das?">
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="leading-relaxed">
            <span className="text-slate-200">„{it.pain}&quot;</span><br />
            <span style={{ color: GOLD }}>→ </span><span className="text-slate-300">{it.relief}</span>
          </li>
        ))}
      </ul>
    </Disclosure>
  );
}

// ── Konstellation (Welle 3): Knoten als 5-Sterne-Sternbild (Entität in der Mitte) ──
type StarState = "empty" | "partial" | "done";
const PENTA = [{ x: 50, y: 15 }, { x: 87, y: 40 }, { x: 72, y: 83 }, { x: 28, y: 83 }, { x: 13, y: 40 }];
// Innere Endpunkte am Avatar-Rand (gleicher Radius je Strahl → überall gleich, berührt sauber).
const INNER = [{ x: 50, y: 37 }, { x: 62.6, y: 46.6 }, { x: 57.2, y: 60.8 }, { x: 42.8, y: 60.8 }, { x: 37.4, y: 46.6 }];
// Äussere Endpunkte: kurz VOR der Stern-Mitte → Strahl endet am Stern-Rand (nicht in der Mitte).
const OUTER = [{ x: 50, y: 19 }, { x: 83.1, y: 41 }, { x: 69.8, y: 79.7 }, { x: 30.2, y: 79.7 }, { x: 16.9, y: 41 }];

function StarGlyph({ state, size = 30 }: { state: StarState; size?: number }) {
  const fill = state === "done" ? GOLD : state === "partial" ? "rgba(200,162,74,0.35)" : "transparent";
  const stroke = state === "empty" ? "rgba(255,255,255,0.4)" : GOLD;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={state === "done" ? { filter: "drop-shadow(0 0 6px rgba(212,168,67,0.85))" } : undefined}>
      <path d="M12 2.2l2.85 6.2 6.75.7-5 4.55 1.4 6.65L12 17.6 5.6 20.3 7 13.65l-5-4.55 6.75-.7z" fill={fill} stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/** Lisa als Team — progressives Gesicht: pro gesetztem Stern erscheint ein Zug
 *  (1★ Haare · 2★ Augen · 3★ Nase · 4★ Mund · 5★ Team mit Headset). Spielerischer
 *  Onboarding-Moment: man baut Lisa Schritt für Schritt zur Kollegin. Kein Headset vorn. */
function LisaAvatar({ size = 118, stars = 0 }: { size?: number; stars?: number }) {
  const awake = stars >= 5;
  const skin = "#f2d3bd", hair = "#5a3b27", lip = "#c87f6e", ink = "#3a2c25";
  return (
    <span className="inline-block leading-none transition-all duration-300" style={{ filter: awake ? "drop-shadow(0 0 22px rgba(212,168,67,0.85))" : "drop-shadow(0 0 13px rgba(212,168,67,0.42))" }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" fill="#0e2336" stroke="#d4a843" strokeWidth="2.5" />
        {/* Team dahinter — bei 5★ mit Headset */}
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
        {/* Schultern */}
        <path d="M36 99c0-15 11-24 24-24s24 9 24 24z" fill="#28395a" stroke="#d4a843" strokeWidth="1.4" />
        {/* Haare hinten (1★) — rahmt das Gesicht */}
        {stars >= 1 ? <path d="M40 54c0-15 9-25 20-25s20 10 20 25c0 8-1 15-3 21l-4-1c1-7 1-15 0-21-2 5-2 13-3 19H50c-1-6-1-14-3-19-1 6-1 14 0 21l-4 1c-2-6-3-13-3-21z" fill={hair} /> : null}
        {/* Gesicht */}
        <ellipse cx="60" cy="51" rx="14" ry="16" fill={skin} />
        {/* Pony (1★) */}
        {stars >= 1 ? <path d="M46 50c1-10 6.5-16 14-16s13 6 14 16c-3-6-8-8.5-14-8.5S49 44 46 50z" fill={hair} /> : null}
        {/* Brauen + Augen (2★) */}
        {stars >= 2 ? (
          <g>
            <path d="M51 46.3q3-1.6 6 0M63 46.3q3-1.6 6 0" stroke={hair} strokeWidth="1.1" fill="none" strokeLinecap="round" />
            <ellipse cx="54" cy="50" rx="2.5" ry="1.8" fill="#fff" /><ellipse cx="66" cy="50" rx="2.5" ry="1.8" fill="#fff" />
            <circle cx="54" cy="50" r="1.45" fill={ink} /><circle cx="66" cy="50" r="1.45" fill={ink} />
          </g>
        ) : null}
        {/* Nase (3★) */}
        {stars >= 3 ? <path d="M60 52q-1.6 3 -2 4.4q1 1 2 1t2-1q-0.4-1.4-2-4.4z" fill="#e6b89f" /> : null}
        {/* Mund + Wangen (4★) */}
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

function Constellation({ center, centerLabel, awakeLabel, stars, onOpen }: {
  center: React.ReactNode; centerLabel: string; awakeLabel: string;
  stars: { key: string; label: string; state: StarState }[];
  onOpen: (key: string) => void;
}) {
  const doneCount = stars.filter((s) => s.state === "done").length;
  const allDone = doneCount === stars.length;
  const counter = allDone
    ? <p className="text-[11px] font-semibold" style={{ color: GOLD }}>★ {awakeLabel}</p>
    : <p className="text-[11px] text-slate-400">{doneCount}/{stars.length} Sterne</p>;
  return (
    <div>
      {/* Desktop: radiale Konstellation */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[420px] sm:block">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {stars.map((s, i) => (
            <line key={s.key} x1={INNER[i].x} y1={INNER[i].y} x2={OUTER[i].x} y2={OUTER[i].y} stroke={GOLD} strokeWidth="0.4" strokeOpacity={s.state === "done" ? 0.65 : 0.18} />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          {center}
          <p className="mt-2 text-sm font-bold text-white">{centerLabel}</p>
          {counter}
        </div>
        {stars.map((s, i) => {
          const below = PENTA[i].y > 70; // untere zwei Sterne: Label unterhalb
          return (
            <button key={s.key} type="button" onClick={() => onOpen(s.key)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-transform duration-200 hover:scale-110"
              style={{ left: `${PENTA[i].x}%`, top: `${PENTA[i].y}%` }}>
              <span className={`absolute ${below ? "top-[calc(100%+3px)]" : "bottom-[calc(100%+3px)]"} w-[132px] text-center text-[11px] font-medium leading-tight text-slate-200`}>{s.label}</span>
              <StarGlyph state={s.state} />
            </button>
          );
        })}
      </div>
      {/* Handy: Sternen-Leiter */}
      <div className="sm:hidden">
        <div className="mb-4 flex flex-col items-center">{center}<p className="mt-2 text-sm font-bold text-white">{centerLabel}</p>{counter}</div>
        <div className="space-y-2">
          {stars.map((s) => (
            <button key={s.key} type="button" onClick={() => onOpen(s.key)}
              className="flex w-full items-center gap-3 rounded-xl border bg-white/5 px-3 py-2.5 text-left" style={{ borderColor: s.state === "done" ? `${GOLD}55` : "rgba(255,255,255,0.1)" }}>
              <StarGlyph state={s.state} size={24} />
              <span className="flex-1 text-sm text-white">{s.label}</span>
              <span className="text-slate-500">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Das FlowSight-Leitsystem-App-Icon (Navy + Gold) — identisch zur Beweis-Seite: nur Quadrat + Punkt. */
function BrandIcon({ size = 108 }: { size?: number }) {
  return (
    <span className="fs-iconglow inline-block leading-none">
      <style>{`@keyframes fsglow{0%,100%{filter:drop-shadow(0 0 12px rgba(212,168,67,.55)) drop-shadow(0 0 30px rgba(212,168,67,.28))}50%{filter:drop-shadow(0 0 22px rgba(212,168,67,.9)) drop-shadow(0 0 48px rgba(212,168,67,.5))}}.fs-iconglow svg{animation:fsglow 4.5s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.fs-iconglow svg{animation:none;filter:drop-shadow(0 0 16px rgba(212,168,67,.75)) drop-shadow(0 0 36px rgba(212,168,67,.45))}}`}</style>
      <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true">
        <rect x="1.5" y="1.5" width="49" height="49" rx="13" fill="#1a2744" stroke="#d4a843" strokeWidth="1.5" />
        <circle cx="26" cy="26" r="6.5" fill="#d4a843" />
      </svg>
    </span>
  );
}

// ── Strang-Definitionen (für die Karte) ──────────────────────────────────────
const STRANDS: { key: "vorort" | "lisa" | "website"; icon: string; titel: string; cta: string; unter: string; nutzen: string }[] = [
  { key: "vorort", icon: "🚪", titel: "Vor Ort", cta: "ansehen", unter: "Fälle, die Sie selbst aufnehmen", nutzen: "Kein Zettel geht verloren" },
  { key: "lisa", icon: "📞", titel: "Lisa", cta: "Lisa trainieren", unter: "Ihre Telefon-Assistentin", nutzen: "Anrufe werden aufgenommen und sichtbar gemacht" },
  { key: "website", icon: "🌐", titel: "Online-Anfragen", cta: "Strang öffnen", unter: "Anfragen über Ihr Formular", nutzen: "Rund um die Uhr, ohne Mail-Chaos" },
];

// Per-Stern „Was läuft bei Ihnen noch?"-Beispiele — STRANG-SPEZIFISCH + konkret
// (2 knackige Sani-Fälle je Stern, keine vagen). „begruessung" ist die Ausnahme:
// minimal (nur „Hinweis (optional)", kein Beispiel) — siehe Drill-in-Render.
const LISA_STAR_NOTE_PLACEHOLDER: Record<string, string> = {
  telefonie: `z. B. „Notfall-Handy (zweite Nummer) NICHT umleiten", „Festnetz läuft über die Zentrale im Laden"`,
  notfall: `z. B. „Am Wochenende nur Heizungsausfälle als Notfall", „Samstag bis 12 Uhr besetzt, danach Notdienst"`,
  wissen: `z. B. „Wir machen keine Ölheizungen mehr", „Service-Abo-Kunden haben bei Terminen Vorrang"`,
  anruflogik: `z. B. „Heizungsausfall im Winter immer als Notfall behandeln", „Stammkunde Meier immer direkt an den Chef"`,
};

// Per-Leitsystem-Stern strang-spezifische Beispiele (R8/L-6). „marke" = minimal (s. Drill-in).
const SYSTEM_STAR_NOTE_PLACEHOLDER: Record<string, string> = {
  team: `z. B. „Lehrling Sven darf keine Notfälle übernehmen", „Chef sieht alles, Monteure nur die eigene Region"`,
  kalender: `z. B. „Wir nutzen keinen Kalender", „Nur der Chef-Kalender ist massgeblich"`,
  nachrichten: `z. B. „Rechnungen immer CC an die Buchhaltung", „Notfälle zusätzlich aufs Privat-Handy"`,
  bewertungen: `z. B. „Wir arbeiten nie mit Anbieter X", „Stammkunden fragen wir nicht aktiv nach Bewertung"`,
};

// ── Dispositions-Karten (mit INFO-WEG) ───────────────────────────────────────
const DISPOSITION_CARDS: { key: keyof DispositionsConfig; titel: string; szenario: string; weg: string }[] = [
  { key: "d1_auftrag", titel: "Neuer Auftrag", szenario: "Schaden / Termin.", weg: "→ Fall im Leitsystem. Bei Notfall: sofort Push + E-Mail an Sie (Lisa stellt NICHT durch — sie hält den Fall fest)." },
  { key: "d2_info", titel: "Reine Info-Frage", szenario: "z. B. Frage nach Öffnungszeiten.", weg: "→ Lisa beantwortet, kein Fall. Riecht es nach Auftrag/Offerte → Kontakt aufnehmen (Fall)." },
  { key: "d3_rueckruf", titel: "Rückruf / Lieferant / Chef sprechen", szenario: "Will Sie persönlich.", weg: "→ in Ihre Liste Nachrichten (Rückruf-Flag), kein Auftrag. Optional zusätzlich E-Mail." },
  { key: "d4_nachfrage", titel: "Nachfrage zu laufendem Auftrag", szenario: "z. B. wo der Techniker bleibt.", weg: "→ in Ihre Liste Nachrichten als Rückfrage. Lisa erfindet keinen Status, kein Doppel-Fall." },
  { key: "d5_reklamation", titel: "Reklamation", szenario: "Beschwerde.", weg: "→ Fall, hohe Prio, sofort Push + E-Mail an Sie. Lisa verspricht nichts." },
  { key: "d6_privat", titel: "Privat / Werbung / falsch verbunden", szenario: "Nicht-geschäftlich.", weg: "→ freundlich tschüss, kein Fall." },
];

const WISSEN_FIELDS: { key: keyof CockpitSession["prefill"]["voice"]["wissen"]; label: string }[] = [
  { key: "openingHours", label: "Öffnungszeiten" },
  { key: "serviceArea", label: "Einzugsgebiet" },
  { key: "servicesList", label: "Leistungen" },
  { key: "emergencyPolicy", label: "Notfall-Regelung" },
];

// T1: gängige CH-Telefonanbieter (steuert die Weiterleitungs-Anleitung).
const TELCO_OPTIONS = [
  { value: "swisscom" as const, label: "Swisscom" },
  { value: "sunrise" as const, label: "Sunrise" },
  { value: "salt" as const, label: "Salt" },
  { value: "quickline" as const, label: "Quickline" },
  { value: "yallo" as const, label: "Yallo" },
  { value: "other" as const, label: "Anderer Anbieter" },
];
// L3: die echten Default-Wortlaute der 3 automatischen Nachrichten (zum Vorausfüllen).
const MSG_DEFAULTS = {
  confirm: "{Absender}: Ihre Meldung wurde aufgenommen. Hier können Sie Angaben ergänzen oder Fotos anfügen: [Link]",
  reminder: "Erinnerung an Ihren Termin morgen — wir freuen uns auf Sie. {Firma}",
  review: "Vielen Dank für Ihren Auftrag! Über eine kurze Bewertung würden wir uns sehr freuen (30 Sek.): [Link]",
};

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export function CockpitApp({ session, preview = false }: { session: CockpitSession; preview?: boolean }) {
  const { token, prefill: pf } = session;
  const init = session.draft ?? {};
  const [view, setView] = useState<View>("overview");
  const [draft, setDraft] = useState<CockpitDraft>(() => ({
    // WICHTIG: gespeicherte Felder ZUERST spreaden, damit ALLE (auch neue wie assistantName,
    // telco, emergency*, holidays*, agency*, googlePlaceId, internalThreshold, calendar,
    // messages, starNotes) einen Reload überleben — danach nur die paar Default-Felder überschreiben.
    ...init,
    branding: { brandColor: init.branding?.brandColor ?? pf.branding.brandColor, caseIdPrefix: init.branding?.caseIdPrefix ?? pf.branding.caseIdPrefix },
    staff: init.staff ?? [],
    voice: {
      ...init.voice,
      greetingText: init.voice?.greetingText ?? pf.voice.greetingSuggestion,
      languages: init.voice?.languages ?? pf.voice.languagesDefault,
      wissen: init.voice?.wissen ?? {},
      dispositions: init.voice?.dispositions ?? DISPOSITION_DEFAULTS,
      pickup: init.voice?.pickup,
    },
    wizard: { ...init.wizard, categories: init.wizard?.categories ?? pf.wizard.categories, distribution: init.wizard?.distribution, embedBy: init.wizard?.embedBy, hasWebsite: init.wizard?.hasWebsite },
    review: { ...init.review, notificationEmail: init.review?.notificationEmail ?? "", googleReviewUrl: init.review?.googleReviewUrl ?? "", smsSenderName: init.review?.smsSenderName ?? pf.review.smsSenderName, smsContent: init.review?.smsContent ?? "", notifyMessagesByEmail: init.review?.notifyMessagesByEmail ?? false },
    golive: { ...init.golive, adminEmail: init.golive?.adminEmail ?? "", avvAccepted: init.golive?.avvAccepted ?? false },
    notes: init.notes ?? {},
    stepDone: init.stepDone ?? {},
  }));
  const [progress, setProgress] = useState<Record<string, boolean>>(session.progress ?? {});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const brandColor = draft.branding?.brandColor || pf.branding.brandColor;

  // Beim Ansichtswechsel immer oben starten — sonst landet der Inhaber mitten auf
  // der Seite (die Scroll-Position der Übersicht bleibt sonst stehen).
  useEffect(() => { if (typeof window !== "undefined") window.scrollTo({ top: 0 }); }, [view]);

  // ── Autosave: ganzen Draft (debounced) ─────────────────────────────────────
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const post = useCallback(async (draftPatch: CockpitDraft, progressPatch?: Record<string, boolean>) => {
    // Vorschau-Modus: nichts an den Server schicken (kein DB-Session) — der Stand
    // lebt rein im Browser, damit die Betriebe das Cockpit gefahrlos durchklicken können.
    if (preview) { setSaveState("saved"); return; }
    setSaveState("saving");
    try {
      const res = await fetch(`/api/aufbau/${token}/save`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ draftPatch, progressPatch }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const j = await res.json();
      if (j.progress) setProgress(j.progress);
      setSaveState("saved");
    } catch { setSaveState("error"); }
  }, [token, preview]);

  const update = useCallback((fn: (d: CockpitDraft) => CockpitDraft) => {
    setDraft((prev) => fn(prev));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => post(draftRef.current), 900);
  }, [post]);

  const markDone = useCallback((key: string) => {
    const next = { ...draftRef.current, stepDone: { ...draftRef.current.stepDone, [key]: true } };
    setDraft(next);
    if (preview) setProgress((p) => ({ ...p, [key]: true })); // ohne Server: Fortschritt lokal mitführen
    post(next, { [key]: true });
    setView("overview");
  }, [post, preview]);

  const doneCount = CAPABILITIES.filter((c) => progress[c]).length;

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: "radial-gradient(1000px circle at 50% 54%, #18374f 0%, #0b1f33 56%)", color: "#e8eef5" }}>
      {preview ? (
        <div className="sticky top-0 z-50 px-4 py-1.5 text-center text-[11px] font-semibold" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
          Vorschau · So erleben Ihre Betriebe das Cockpit — Eingaben werden hier nicht gespeichert
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-10 sm:py-16">
        {view === "overview" && (
          <Overview token={token} preview={preview} brandColor={brandColor} companyName={session.company_name} assistantName={(draft.voice?.assistantName ?? "").trim() || "Lisa"} progress={progress} doneCount={doneCount} saveState={saveState} onOpen={setView} />
        )}
        {view === "vorort" && <VorOrt draft={draft} update={update} onDone={() => markDone("vorort")} onBack={() => setView("overview")} />}
        {view === "lisa" && <Lisa pf={pf} draft={draft} update={update} onDone={() => markDone("lisa")} onBack={() => setView("overview")} />}
        {view === "website" && <Website pf={pf} draft={draft} update={update} onDone={() => markDone("website")} onBack={() => setView("overview")} />}
        {view === "system" && <SystemNode pf={pf} draft={draft} brandColor={brandColor} update={update} onDone={() => markDone("system")} onBack={() => setView("overview")} />}
        {view === "freigabe" && <Freigabe token={token} preview={preview} draft={draft} update={update} onBack={() => setView("overview")} companyName={session.company_name} />}
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        FlowSight · Oberrieden · Kommen Sie nicht weiter? Schreiben Sie Gunnar direkt:{" "}
        <a href="mailto:gunnar.wende@flowsight.ch" className="underline" style={{ color: GOLD }}>gunnar.wende@flowsight.ch</a>
      </footer>
    </div>
  );
}

function SaveDot({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const m = { saving: ["Speichert …", "#94a3b8"], saved: ["Gespeichert ✓", "#86c79a"], error: ["Speichern fehlgeschlagen", "#e2a0a0"] } as const;
  return <span className="text-[11px]" style={{ color: m[state][1] }}>{m[state][0]}</span>;
}

// ── Overview = die System-Karte ──────────────────────────────────────────────
function Overview({ token, preview, brandColor, companyName, assistantName, progress, doneCount, saveState, onOpen }: {
  token: string; preview: boolean; brandColor: string; companyName: string; assistantName: string;
  progress: Record<string, boolean>; doneCount: number; saveState: "idle" | "saving" | "saved" | "error";
  onOpen: (v: View) => void;
}) {
  const allDone = CAPABILITIES.every((c) => progress[c]);
  return (
    <>
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Ihr Leitsystem</p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Bauen wir {companyName} auf</h1>
        <p className="mx-auto mt-3 max-w-[620px] text-sm leading-relaxed text-slate-300">
          80 % ist vorbereitet — Sie ergänzen die 20 %, die nur Sie kennen.
          <span className="mt-1 block text-slate-400">Nichts ist live, bis Sie freigeben · jederzeit speicherbar, später änderbar.</span>
        </p>
        <div className="mt-3"><SaveDot state={saveState} /></div>
      </header>

      {/* Fortschritt = Fähigkeiten */}
      <div className="mx-auto mt-6 max-w-[560px] rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Ihr System wächst</span><span style={{ color: GOLD }}>{doneCount} von {CAPABILITIES.length} startklar</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(6, (doneCount / CAPABILITIES.length) * 100)}%`, backgroundColor: GOLD }} />
        </div>
      </div>

      {/* 3 Eingangs-Stränge */}
      <p className="mt-14 text-center text-[11px] uppercase tracking-[0.18em] text-slate-500">Diese drei Eingänge speisen Ihr Leitsystem</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {STRANDS.map((s) => {
          const done = !!progress[s.key];
          return (
            <button key={s.key} type="button" onClick={() => onOpen(s.key)}
              className="group rounded-2xl border bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-white/[0.12] hover:shadow-lg hover:shadow-black/20"
              style={{ borderColor: done ? `${GOLD}66` : "rgba(255,255,255,0.10)" }}>
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: done ? `${GOLD}1f` : "rgba(255,255,255,0.06)" }}>{s.icon}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: done ? `${GOLD}22` : "rgba(255,255,255,0.08)", color: done ? GOLD : "#cbd5e1" }}>
                  {done ? "✓ startklar" : "○ offen"}
                </span>
              </div>
              <p className="mt-3 text-base font-bold text-white">{s.key === "lisa" ? assistantName : s.titel}</p>
              <p className="text-xs text-slate-400">{s.unter}</p>
              <p className="mt-2 text-[11px] font-medium" style={{ color: `${GOLD}cc` }}>✓ {s.nutzen}</p>
              <p className="mt-3 text-sm font-semibold transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: GOLD }}>{s.cta} →</p>
            </button>
          );
        })}
      </div>

      {/* Pfeile: je ein Strang fliesst in den Hub (Desktop 3-spaltig, Handy einer) */}
      <div className="my-5 hidden sm:grid sm:grid-cols-3 sm:gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center text-2xl" style={{ color: `${GOLD}99` }}>
            <span className="inline-block" style={{ transform: i === 0 ? "rotate(-32deg)" : i === 2 ? "rotate(32deg)" : "none" }}>↓</span>
          </div>
        ))}
      </div>
      <div className="my-5 text-center text-2xl sm:hidden" style={{ color: `${GOLD}99` }}>↓</div>

      {/* Leitsystem-Knoten (klickbar) — der Held der Karte. L-13: goldener Umriss wenn bestätigt. */}
      <button type="button" onClick={() => onOpen("system")}
        className="mx-auto flex w-full max-w-[480px] flex-col items-center rounded-3xl border px-6 py-10 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/30"
        style={{ borderColor: progress.system ? `${GOLD}66` : "rgba(255,255,255,0.10)", backgroundColor: progress.system ? `${GOLD}0f` : "rgba(255,255,255,0.03)" }}>
        <BrandIcon size={116} />
        <p className="mt-5 text-xl font-bold text-white">Ihr Leitsystem</p>
        <p className="mt-0.5 text-base font-semibold" style={{ color: brandColor === "#0b1f33" ? GOLD : brandColor }}>{companyName}</p>
        <p className="mt-4 text-xs leading-relaxed" style={{ color: progress.system ? GOLD : undefined }}>
          <span className="text-slate-400">Marke · Team & Rollen · Benachrichtigung · Bewertung</span><br />
          {progress.system ? "✓ bestätigt" : "antippen zum Einstellen"}
        </p>
      </button>

      {/* L-14: goldener Pfeil zeigt direkt auf den Freigabe-Button (statische Output-Card entfernt). */}
      <div className="my-6 text-center text-2xl" style={{ color: `${GOLD}99` }}>↓</div>

      {/* Freigabe */}
      <div className="mt-4 text-center">
        <button type="button" onClick={() => onOpen("freigabe")} disabled={false}
          className="rounded-xl px-6 py-3 text-sm font-bold" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
          An Gunnar zum Freischalten senden
        </button>
        {!allDone ? <p className="mt-2 text-[11px] text-slate-400">Tipp: gehen Sie zuerst die drei Stränge + Ihr Leitsystem durch.</p> : null}
        {/* L-18: PDF-Auszug auch direkt von der Hauptseite ziehbar. */}
        {!preview ? (
          <p className="mt-5">
            <a href={`/aufbau/${token}/zusammenfassung`} target="_blank" rel="noopener" className="text-xs font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 transition hover:text-slate-200">📄 Ihren Setup-Stand als PDF sichern</a>
          </p>
        ) : null}
      </div>
    </>
  );
}

// ── Detail-View-Rahmen ───────────────────────────────────────────────────────
function Detail({ icon, title, claim, onBack, children, onDone, doneLabel = "Als startklar markieren" }: {
  icon: string; title: string; claim?: string; onBack: () => void; children: React.ReactNode; onDone?: () => void; doneLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-[680px]">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white"><span style={{ color: GOLD }}>‹</span> Übersicht</button>
      <h2 className="mt-3 flex items-center gap-2 text-xl font-bold text-white"><span>{icon}</span>{title}</h2>
      {claim ? <p className="mt-1 text-sm text-slate-300">{claim}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
      {onDone ? (
        <button type="button" onClick={onDone} className="mt-6 rounded-xl px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
          ✓ {doneLabel}
        </button>
      ) : null}
    </div>
  );
}

function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field label="Ihre Hinweise an uns (optional)" hint="Was sollen wir wissen, das oben nicht passt? Geht direkt an Gunnar.">
      <TextArea value={value} onChange={(e) => onChange(e.target.value)} placeholder="z. B. Besonderheiten, Wünsche, Ausnahmen …" />
    </Field>
  );
}

// ── Strang: Vor Ort ──────────────────────────────────────────────────────────
function VorOrt({ draft, update, onDone, onBack }: { draft: CockpitDraft; update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void }) {
  return (
    <Detail icon="🚪" title="Vor Ort & manuell" claim="Anliegen, die Sie selbst auf der Baustelle aufnehmen." onBack={onBack} onDone={onDone} doneLabel="Passt — bestätigen">
      <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
        Sie können jederzeit selbst einen Fall im Leitsystem erfassen — z. B. direkt beim Kunden. Nichts weiter einzustellen.
      </p>
      <PainHint items={[
        { pain: "Beim Kunden schnell etwas notiert — und vergessen, es einzutragen", relief: "Erfassen Sie den Fall direkt im Leitsystem, auch unterwegs vom Handy." },
      ]} />
      <NotesField value={draft.notes?.vorort ?? ""} onChange={(v) => update((d) => ({ ...d, notes: { ...d.notes, vorort: v } }))} />
    </Detail>
  );
}

// ── Schablone-Bausteine (Stern-6-Neubau: default-first, Lisa-Stimme) ─────────
/** Status-Plakette: „✓ steht"/„✓ aus Website" (vorbereitet) · „○ braucht Sie" · „✓ bestätigt". */
function StatusBadge({ tone, label }: { tone: "ready" | "needs" | "done" | "optional"; label: string }) {
  const s = tone === "done"
    ? { bg: "rgba(134,199,154,0.16)", color: "#86c79a" }
    : tone === "ready"
      ? { bg: "rgba(200,162,74,0.15)", color: GOLD }
      : { bg: "rgba(255,255,255,0.08)", color: "#cbd5e1" };
  return <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: s.bg, color: s.color }}>{label}</span>;
}

/** „Kleine Lisa" — Sprach-Hilfe pro Abschnitt (≈20 s). Audio folgt; bis dahin steht
 *  derselbe Wortlaut lesbar da, damit der Schritt sofort verständlich ist (Hilfe, die sitzt). */
function LisaHelp({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-[#0e2336]/70 px-3 py-2.5">
      <span className="shrink-0 self-start"><LisaAvatar size={36} stars={5} /></span>
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: GOLD }} title="Sprachhilfe folgt in Kürze">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px]" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>▶</span>
          Lisa erklärt diesen Schritt
        </span>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-300">„{text}&quot;</p>
      </div>
    </div>
  );
}

/** TTS-Schutz: Lisa ist eine deutsche Stimme — was hier steht, spricht sie wörtlich. */
function HochdeutschGuard({ name }: { name: string }) {
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
      <span style={{ color: GOLD }}>🗣</span>
      <span>Was Sie hier schreiben, sagt {name} <span className="text-slate-300">wortwörtlich</span> — bitte Hochdeutsch: „Guten Tag&quot; statt „Grüezi&quot; (Schweizer Mundart spricht sie sonst falsch aus).</span>
    </p>
  );
}

// Reihenfolge + Plaketten der Lisa-Karten (Schablone, default-first). „ready" = vorbereitet,
// nur bestätigen · „needs" = nur der Inhaber weiss es. Audio = Gist der „kleinen Lisa" (Hochdeutsch).
const LISA_CARD_ORDER = ["begruessung", "wissen", "anruflogik", "notfall", "telefonie"] as const;
const LISA_CARD_META: Record<string, { sub: string; tone: "ready" | "needs"; badge: string; audio: string }> = {
  begruessung: { sub: "Der erste Satz bei jedem Anruf", tone: "ready", badge: "✓ steht", audio: "So melde ich mich. In der Schweiz ist Pflicht, dass ich offen sage, dass ich digital bin. Passt das für Sie, bestätigen Sie einfach." },
  wissen: { sub: "Aus Ihrer Website vorbereitet", tone: "ready", badge: "✓ aus Website", audio: "Das habe ich aus Ihrer Website vorbereitet. Korrigieren Sie, was nicht stimmt. Je besser ich Sie kenne, desto echter klinge ich." },
  anruflogik: { sub: "Bei jeder Anruf-Art das Richtige", tone: "ready", badge: "✓ steht", audio: "Ich behandle jeden Anruf passend, und bei einem Notfall alarmiere ich sofort. Alles ist vorbelegt, schauen Sie nur rein, wenn Sie etwas anders möchten." },
  notfall: { sub: "Notdienst & Erreichbarkeit", tone: "needs", badge: "○ braucht Sie", audio: "Sagen Sie mir, ob Sie einen Notdienst anbieten, dann alarmiere ich die richtige Person. Sonst nehme ich den Fall trotzdem auf." },
  telefonie: { sub: "Das Sicherheitsnetz für verpasste Anrufe", tone: "needs", badge: "○ braucht Sie", audio: "Ihre Nummer bleibt Ihre Nummer. Wir leiten nur um, was Sie nicht selbst abnehmen. Wählen Sie Ihren Anbieter, dann zeige ich Ihnen die Tastenkombination mit Bild." },
};

// ── Strang: Lisa ─────────────────────────────────────────────────────────────
function Lisa({ pf, draft, update, onDone, onBack }: {
  pf: CockpitSession["prefill"]; draft: CockpitDraft;
  update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void;
}) {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null); // Wissen-Unterfelder
  const v = draft.voice ?? {};
  const lisaName = (v.assistantName ?? "").trim() || "Lisa";
  const disp = v.dispositions ?? DISPOSITION_DEFAULTS;
  const setDisp = (k: keyof DispositionsConfig, patch: Partial<DispositionsConfig[keyof DispositionsConfig]>) =>
    update((d) => ({ ...d, voice: { ...d.voice, dispositions: { ...(d.voice?.dispositions ?? DISPOSITION_DEFAULTS), [k]: { ...(d.voice?.dispositions ?? DISPOSITION_DEFAULTS)[k], ...patch } } } }));

  const pickupLabel: Record<string, string> = { sofort: "Sofort", nach_10s: "Nach ~10 Sek.", nach_15s: "Nach ~15 Sek.", nach_20s: "Nach ~20 Sek.", nach_30s: "Nach ~30 Sek." };
  const provLabel: Record<string, string> = { swisscom: "Swisscom", sunrise: "Sunrise", salt: "Salt", quickline: "Quickline", yallo: "Ihrem Anbieter", other: "Ihrem Anbieter" };
  const setV = (patch: Partial<NonNullable<CockpitDraft["voice"]>>) => update((d) => ({ ...d, voice: { ...d.voice, ...patch } }));
  const isDone = (k: string) => !!draft.stepDone?.[`lisa_${k}`];
  const markStar = (k: string) => update((d) => ({ ...d, stepDone: { ...d.stepDone, [`lisa_${k}`]: true } }));

  // L-17: Pflichtfelder pro Karte (spiegelt /api/aufbau/[token]/submit). Eine Karte wird
  // NUR „✓ bestätigt", wenn missing() leer ist — sonst bleibt sie offen + Inline-Hinweis.
  const CATS: { key: string; star: string; icon: string; title: string; touched: boolean; missing?: () => string[]; render: () => React.ReactNode }[] = [
    {
      key: "begruessung", star: `So meldet sich ${lisaName}`, icon: "🗣", title: `So meldet sich ${lisaName}`,
      touched: !!(v.greetingText && v.greetingText !== pf.voice.greetingSuggestion),
      missing: () => (v.greetingText ?? pf.voice.greetingSuggestion).trim() ? [] : ["eine Begrüssung"],
      render: () => (
        <>
          <Field label="Wie soll Ihre Telefon-Assistentin heissen?" hint={`Standard ist „Lisa“ — Sie können ihr aber jeden Namen geben. Er gilt dann überall: im Cockpit und am Telefon.`}>
            <TextInput placeholder="Lisa" maxLength={24} value={v.assistantName ?? ""} onChange={(e) => setV({ assistantName: e.target.value })} />
          </Field>
          <Field label="Begrüssung" hint={`Der erste Satz bei jedem Anruf — er macht erkennbar, dass ${lisaName} eine digitale Assistentin ist (in der Schweiz Pflicht).`}>
            <TextArea value={v.greetingText ?? pf.voice.greetingSuggestion} onChange={(e) => setV({ greetingText: e.target.value })} />
            <HochdeutschGuard name={lisaName} />
          </Field>
        </>
      ),
    },
    {
      key: "telefonie", star: `So kommt der Anruf zu ${lisaName}`, icon: "☎️", title: `So kommt der Anruf zu ${lisaName}`,
      touched: !!v.telco?.provider,
      missing: () => v.telco?.provider ? [] : ["Ihren Telefonanbieter"],
      render: () => (
        <>
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            <span className="text-slate-200">Ihre Nummer bleibt Ihre Nummer.</span> {lisaName} ist ein Sicherheitsnetz — sie fängt nur die Anrufe, die Sie gerade <span className="text-slate-200">nicht selbst abnehmen</span>. Sie telefonieren weiter wie bisher; es wird nichts gekündigt und nichts umgestellt.
          </p>
          <Field label="Ihr Telefonanbieter" hint="Bestimmt die passende Weiterleitungs-Anleitung — Ihre Rufnummer behalten Sie.">
            <RadioGroup value={v.telco?.provider} onChange={(val) => setV({ telco: { ...v.telco, provider: val } })} options={TELCO_OPTIONS} />
          </Field>
          {v.telco?.provider === "other" ? (
            <Field label="Wie heisst Ihr Anbieter?">
              <TextInput placeholder="z. B. Wingo, Lebara, iWay …" value={v.telco?.otherName ?? ""} onChange={(e) => setV({ telco: { ...v.telco, otherName: e.target.value } })} />
            </Field>
          ) : null}
          <Field label={`Wann soll ${lisaName} rangehen?`} hint={`Ab wann ein unbeantworteter Anruf zu ${lisaName} läuft. Standard: nach ein paar Mal Klingeln.`}>
            <RadioGroup value={v.pickup} onChange={(val) => setV({ pickup: val })}
              options={(["sofort", "nach_10s", "nach_15s", "nach_20s", "nach_30s"] as const).map((p) => ({ value: p, label: pickupLabel[p] }))} />
          </Field>
          <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-white/15 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
            <span className="shrink-0 text-base leading-none">📷</span>
            <span>Sobald Sie Ihren Anbieter gewählt haben, zeigen wir Ihnen die Weiterleitung <span className="text-slate-300">Schritt für Schritt mit Bildern</span> — passend zu {provLabel[v.telco?.provider ?? ""] ?? "Ihrem Anbieter"}. Meist eine kurze Tastenkombination am Telefon, rund 2 Minuten.</span>
          </div>
          <Disclosure summary="Wie richte ich die Weiterleitung ein?">
            Nach dem Freischalten erhalten Sie von uns die <span className="text-slate-200">genaue, auf {provLabel[v.telco?.provider ?? ""] ?? "Ihren Anbieter"} zugeschnittene Anleitung</span> — meist eine kurze Tastenkombination auf Ihrem Telefon (~2 Minuten). Ihre bisherige Nummer bleibt unverändert; nur nicht angenommene Anrufe übernimmt {lisaName}.
          </Disclosure>
        </>
      ),
    },
    {
      key: "notfall", star: `Wann ${lisaName} erreichbar ist`, icon: "🚨", title: `Wann ${lisaName} erreichbar ist`,
      touched: v.emergencyService !== undefined || !!(v.vacationNote ?? "").trim(),
      missing: () => v.emergencyService === true && !(v.emergencyContact?.name ?? "").trim() ? ["den Notfall-Empfänger (Name)"] : [],
      render: () => (
        <>
          <Field label="Bieten Sie einen Notdienst an?">
            <RadioGroup value={v.emergencyService === undefined ? undefined : v.emergencyService ? "ja" : "nein"}
              onChange={(val) => setV({ emergencyService: val === "ja" })}
              options={[{ value: "ja", label: "Ja — wir sind im Notfall erreichbar" }, { value: "nein", label: "Nein — keinen Notdienst" }]} />
          </Field>
          {v.emergencyService === true ? (
            <>
              <Field label="Wer wird im Notfall sofort alarmiert?">
                <TextInput placeholder="Name (z. B. Ramon Dörfler)" value={v.emergencyContact?.name ?? ""} onChange={(e) => setV({ emergencyContact: { ...v.emergencyContact, name: e.target.value } })} />
              </Field>
              <Field label="Unter welcher Nummer?">
                <TextInput placeholder="+41 …" value={v.emergencyContact?.phone ?? ""} onChange={(e) => setV({ emergencyContact: { ...v.emergencyContact, phone: e.target.value } })} />
              </Field>
            </>
          ) : v.emergencyService === false ? (
            <p className="text-xs leading-relaxed text-slate-400">Ausserhalb der Öffnungszeiten nimmt {lisaName} den Fall trotzdem auf und sagt: „Wir melden uns am nächsten Werktag.&quot; Niemand wird nachts gestört.</p>
          ) : null}
          <div className="border-t border-white/10 pt-3">
            <Toggle on={v.holidaysClosed ?? true} onChange={(on) => setV({ holidaysClosed: on })} label="An Schweizer Feiertagen & ausserhalb der Öffnungszeiten gilt: geschlossen" />
            <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
              Auch dann nimmt {lisaName} jeden Fall <span className="text-slate-200">trotzdem auf</span> — nichts geht verloren.{v.emergencyService ? " Bei einem Notfall wird Ihr Pikett-Dienst sofort informiert." : ""}
            </p>
          </div>
          <Field label="Geplante Betriebsferien? (optional)" hint={`z. B. „Betriebsferien 21.7.–4.8.“ — ${lisaName} weist Anrufer dann aktiv darauf hin.`}>
            <TextInput placeholder="Zeitraum oder leer lassen" value={v.vacationNote ?? ""} onChange={(e) => setV({ vacationNote: e.target.value })} />
            <HochdeutschGuard name={lisaName} />
          </Field>
        </>
      ),
    },
    {
      key: "wissen", star: `Das soll ${lisaName} wissen`, icon: "📚", title: `Das soll ${lisaName} wissen`,
      touched: !!(v.wissen && Object.keys(v.wissen).length),
      render: () => (
        <>
          <p className="text-xs text-slate-400">Aus Ihrer Website vorbereitet — bitte überfliegen und korrigieren. Tippen zum Aufklappen.</p>
          <div className="space-y-2">
            {WISSEN_FIELDS.map((f) => {
              const isOpen = open === f.key;
              return (
                <div key={f.key} className="rounded-lg border border-white/10 bg-white/5">
                  <button type="button" onClick={() => setOpen(isOpen ? null : f.key)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-white">
                    <span>{f.label}</span><span className="text-lg leading-none" style={{ color: GOLD }}>{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen ? (
                    <div className="px-3 pb-3">
                      {f.key === "serviceArea" ? <p className="mb-2 text-[11px] leading-relaxed text-slate-400">Nur als Info — <span className="text-slate-300">kein Filter</span>. {lisaName} lehnt Anfragen von ausserhalb NICHT ab, sondern nimmt sie ganz normal auf — Sie entscheiden danach, ob sich der Weg lohnt.</p> : null}
                      <TextArea rows={f.key === "servicesList" ? 8 : 3} value={v.wissen?.[f.key] ?? pf.voice.wissen[f.key]} onChange={(e) => update((d) => ({ ...d, voice: { ...d.voice, wissen: { ...d.voice?.wissen, [f.key]: e.target.value } } }))} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <HochdeutschGuard name={lisaName} />
        </>
      ),
    },
    {
      key: "anruflogik", star: `So soll ${lisaName} reagieren`, icon: "🎧", title: `So soll ${lisaName} reagieren`,
      touched: false,
      render: () => (
        <>
          <p className="text-xs leading-relaxed text-slate-400">Trainieren Sie, was {lisaName} bei welcher Anruf-Art tut. Sinnvoll vorbelegt — Sie schauen nur rein, wenn Sie etwas anders möchten.</p>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            🛡 <span className="text-slate-200">{lisaName}s feste Grenzen (zu Ihrem Schutz):</span> nie Preise, nie ein verbindlicher Termin, keine Ferndiagnose, keine Garantie.
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            💪 <span className="text-slate-200">Nie besetzt:</span> Kommen zwei Anrufe gleichzeitig, übernimmt automatisch eine zweite {lisaName} — niemand hört das Besetztzeichen, kein Auftrag geht verloren.
          </div>
          <Field label={`Was ${lisaName} auf Preisfragen antwortet`} hint="Keine Zahlen nennen — höflich auf eine Besichtigung/Offerte lenken.">
            <TextArea value={v.wissen?.priceDeflect ?? pf.voice.wissen.priceDeflect} onChange={(e) => update((d) => ({ ...d, voice: { ...d.voice, wissen: { ...d.voice?.wissen, priceDeflect: e.target.value } } }))} />
            <HochdeutschGuard name={lisaName} />
          </Field>
          {DISPOSITION_CARDS.map((c, i) => {
            const k = disp[c.key].korb;
            const push = disp[c.key].notify === "push";
            const result = k === "fall"
              ? `→ Fall im Leitsystem + E-Mail an Sie${push ? " + sofort Push aufs Handy" : ""}`
              : k === "nachricht"
                ? `→ Nachricht im Leitsystem + E-Mail an Sie${push ? " + Push" : ""}`
                : "→ kein Eintrag — erledigt sich am Telefon";
            return (
              <div key={c.key} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="text-sm font-semibold text-white"><span style={{ color: GOLD }}>{i + 1}.</span> {c.titel}</p>
                <p className="text-xs text-slate-400">{c.szenario}</p>
                <div className="mt-2.5 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-[11px] text-slate-400">{lisaName}:</span><KorbPick value={k} onChange={(v) => setDisp(c.key, { korb: v })} /></div>
                  {k !== "nichts" ? (
                    <Toggle on={push} onChange={(on) => setDisp(c.key, { notify: on ? "push" : "board" })} label="Sofort aufs Handy melden (Push) — E-Mail kommt ohnehin" />
                  ) : null}
                  <p className="text-[11px] font-medium" style={{ color: `${GOLD}cc` }}>{result}</p>
                </div>
              </div>
            );
          })}
          <p className="text-[11px] leading-relaxed text-slate-500">An Sie geht es per <span className="text-slate-300">E-Mail</span> (und optional <span className="text-slate-300">Push</span> aufs Handy) — <span className="text-slate-300">nie per SMS</span>. SMS gehen nur an Ihre Kunden.</p>
        </>
      ),
    },
  ];

  const doneN = CATS.filter((c) => isDone(c.key)).length;
  const allDone = doneN === CATS.length;

  return (
    <Detail
      icon="📞"
      title={`Bauen wir ${lisaName}`}
      claim="Ihre neue Mitarbeiterin am Telefon."
      onBack={onBack}
      onDone={allDone ? onDone : undefined}
      doneLabel={`${lisaName} ist startklar`}
    >
      {/* Avatar erwacht Karte um Karte — „seine neue Mitarbeiterin anlernen" */}
      <div className="flex flex-col items-center text-center">
        <LisaAvatar stars={doneN} />
        <p className="mt-2 text-base font-bold text-white">{lisaName}</p>
        {allDone
          ? <p className="text-xs font-semibold" style={{ color: GOLD }}>★ startklar</p>
          : <p className="text-xs text-slate-400">{doneN} von {CATS.length} bestätigt — sie erwacht Schritt für Schritt</p>}
      </div>

      <p className="text-sm leading-relaxed text-slate-200">
        Tippen Sie eine Karte an. <span className="font-semibold" style={{ color: GOLD }}>✓ steht</span> = nur kurz bestätigen · <span className="font-semibold text-white">○ braucht Sie</span> = das wissen nur Sie.
      </p>

      {/* Vertikale Karten-Liste — eine Metapher, default-first (Schablone) */}
      <div className="space-y-2.5">
        {LISA_CARD_ORDER.map((key) => {
          const c = CATS.find((x) => x.key === key);
          if (!c) return null;
          const meta = LISA_CARD_META[key];
          const expanded = openCard === key;
          const done = isDone(key);
          const miss = c.missing?.() ?? [];
          const badgeTone: "ready" | "needs" | "done" = done ? "done" : meta.tone;
          const badgeLabel = done ? "✓ bestätigt" : meta.badge;
          return (
            <div key={key} className="overflow-hidden rounded-xl border bg-white/[0.03]" style={{ borderColor: done ? `${GOLD}55` : "rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={() => setOpenCard(expanded ? null : key)} aria-expanded={expanded}
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03]">
                <span className="mt-0.5 text-2xl leading-none">{c.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-semibold leading-snug text-white">{c.title}</span>
                    <span className="mt-0.5 shrink-0 text-lg leading-none text-slate-500 transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>›</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">{meta.sub}</span>
                  <span className="mt-2 block"><StatusBadge tone={badgeTone} label={badgeLabel} /></span>
                </span>
              </button>
              {expanded ? (
                <div className="space-y-4 border-t border-white/10 px-4 py-4">
                  <LisaHelp text={meta.audio} />
                  {c.render()}
                  <div className="rounded-xl border border-dashed p-3" style={{ borderColor: `${GOLD}44` }}>
                    <Field
                      label={key === "begruessung" ? "Hinweis an uns (optional)" : `Läuft bei Ihnen etwas anders, das ${lisaName} wissen sollte? (optional)`}
                      hint={key === "begruessung" ? "Geht direkt an Gunnar." : "Ihre Besonderheiten, Ausnahmen, typischen Fälle. Je mehr wir wissen, desto runder läuft es ab Tag 1 — geht direkt an Gunnar."}
                    >
                      <TextArea placeholder={key === "begruessung" ? "" : (LISA_STAR_NOTE_PLACEHOLDER[key] ?? "")} value={draft.starNotes?.[`lisa_${key}`] ?? ""} onChange={(e) => update((d) => ({ ...d, starNotes: { ...d.starNotes, [`lisa_${key}`]: e.target.value } }))} />
                    </Field>
                  </div>
                  {miss.length > 0 ? (
                    <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/90">Damit dieser Punkt sitzt, fehlt noch: {miss.join(", ")}.</p>
                  ) : null}
                  <button type="button" disabled={miss.length > 0} onClick={() => { markStar(key); setOpenCard(null); }}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
                    {done ? "✓ Gespeichert — zuklappen" : meta.tone === "ready" ? "✓ Passt so — bestätigen" : "✓ Dieser Punkt passt"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <PainHint items={[
        { pain: "Ich bin auf der Baustelle und komme nicht ans Telefon", relief: `${lisaName} nimmt jeden Anruf an — kein Auftrag geht mehr verloren.` },
        { pain: "Ein Lieferant meldet sich oder ein Kunde hat eine Rückfrage", relief: `${lisaName} nimmt die Nachricht auf und meldet sie Ihnen — kein Rückruf geht unter.` },
        { pain: "Werbe- und Spam-Anrufe kosten mich ständig Zeit", relief: `${lisaName} wimmelt Werbung freundlich ab — die kommt gar nicht erst zu Ihnen.` },
      ]} />

      <NotesField value={draft.notes?.voice ?? ""} onChange={(val) => update((d) => ({ ...d, notes: { ...d.notes, voice: val } }))} />
    </Detail>
  );
}

// ── Strang: Website ──────────────────────────────────────────────────────────
// Audio-Gist der „kleinen Lisa" pro Online-Anfragen-Karte (Hochdeutsch).
const WEB_CARD_AUDIO: Record<string, string> = {
  formular: "Ihr Formular ist startklar, in Ihrem Look. Es ersetzt das E-Mail-Hin-und-Her — aus jeder Anfrage wird ein sauberer Fall, samt Foto vom Schaden.",
  kategorien: "Womit Ihre Kunden starten: drei aus Ihrem Gewerk, drei Standard. Tippen Sie rein, was nicht passt — fertig.",
  website: "Das ist optional — zum Starten brauchen Sie's nicht, der Link läuft schon. Wenn Sie wollen, verankern wir das Formular fest auf Ihrer Website; sagen Sie nur, wer sie betreut.",
};

function Website({ pf, draft, update, onDone, onBack }: { pf: CockpitSession["prefill"]; draft: CockpitDraft; update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void }) {
  const [openCard, setOpenCard] = useState<string | null>(null);
  const w = draft.wizard ?? {};
  const cats = w.categories ?? pf.wizard.categories;
  // Default = Ja. Nur explizites „Nein" (in Karte 1 versteckt) blendet die Folgekarten aus.
  const formRelevant = w.formRelevant !== false;
  const atAgency = w.integrationLocation === "agentur" || w.caretaker === "agentur";
  const emailOk = (e?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e ?? "");
  const setW = (patch: Partial<NonNullable<CockpitDraft["wizard"]>>) => update((d) => ({ ...d, wizard: { ...d.wizard, ...patch } }));
  const isDone = (k: string) => !!draft.stepDone?.[`website_${k}`];
  const markCard = (k: string) => update((d) => ({ ...d, stepDone: { ...d.stepDone, [`website_${k}`]: true } }));

  type Tone = "ready" | "optional";
  const CARDS: { key: string; icon: string; title: string; sub: string; tone: Tone; badge: string; render: () => React.ReactNode }[] = [
    {
      key: "formular", icon: "💬", title: "Ihr Anfrage-Formular", sub: "Statt E-Mail-Pingpong — eine saubere Anfrage", tone: "ready", badge: "✓ steht",
      render: () => (
        <>
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            <span className="text-slate-200">Sofort nutzbar — als Link.</span> Teilen Sie ihn auf Google, Visitenkarte oder per WhatsApp; er funktioniert, ganz ohne Einbau auf der Website. Kunden melden sich rund um die Uhr, jede Meldung landet als <span className="text-slate-200">sauberer Fall</span> im Leitsystem — kein Mail-Chaos.
          </p>
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            📷 <span className="text-slate-200">Foto vom Schaden</span> automatisch dabei — Sie sehen ihn, bevor Sie hinfahren (richtiges Material, weniger Leerfahrten). Nichts einzustellen.
          </p>
          <a href="#" onClick={(e) => e.preventDefault()} className="block rounded-lg border border-dashed border-white/20 px-3 py-2 text-center text-sm text-slate-300">
            👁 Ihr gebrandetes Formular ansehen
          </a>
          <Disclosure summary="Ich möchte gar kein Online-Formular">
            <RadioGroup value={formRelevant ? "ja" : "nein"} onChange={(val) => setW({ formRelevant: val === "ja" })}
              options={[
                { value: "ja", label: "Doch — Anfragen sollen online reinkommen" },
                { value: "nein", label: "Nein — Lisa am Telefon + Leitsystem genügen mir", hint: "Wir lassen das Formular weg. Jederzeit wieder einschaltbar." },
              ]} />
            {!formRelevant ? <p className="mt-2 text-[11px] leading-relaxed text-slate-400">Alles klar — kein Online-Formular. Ihre Anfragen laufen über Lisa + Leitsystem. Dieser Strang ist damit fertig.</p> : null}
          </Disclosure>
        </>
      ),
    },
    {
      key: "kategorien", icon: "🧩", title: "Womit Kunden starten", sub: "Die Auswahl im Formular", tone: "ready", badge: "✓ vorbereitet",
      render: () => (
        <>
          <p className="text-xs leading-relaxed text-slate-400">Die ersten drei sind aus Ihrem Gewerk, die letzten drei Standard. Tippen zum Ändern.</p>
          <div className="space-y-2">
            {cats.map((c: WizardCategory, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput value={c.label} disabled={c.fixed}
                  onChange={(e) => update((d) => ({ ...d, wizard: { ...d.wizard, categories: (d.wizard?.categories ?? cats).map((x, j) => j === i ? { ...x, label: e.target.value, value: e.target.value } : x) } }))} />
                {c.fixed ? <span className="text-[10px] text-slate-500">fix</span> : null}
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      key: "website", icon: "🌐", title: "Aufs Ihre Website bringen", sub: "Optional — blockt den Start nicht", tone: "optional", badge: "⚪ optional",
      render: () => (
        <>
          <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            Zum <span className="text-slate-200">Starten nicht nötig</span> — das Formular läuft schon als Link. Wenn Sie wollen, binden wir es <span className="text-slate-200">fest auf Ihrer Website</span> ein.
          </p>
          <Field label="Wer betreut Ihre Website?">
            <RadioGroup value={w.integrationLocation} onChange={(val) => setW({ integrationLocation: val })}
              options={[
                { value: "intern", label: "Wir selbst", hint: "Sie bekommen den fertigen Einbau-Schnipsel + Foto-Anleitung." },
                { value: "agentur", label: "Eine Web-Agentur", hint: "Wir schicken der Agentur die fertige Anleitung." },
              ]} />
          </Field>
          {atAgency ? (
            <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs leading-relaxed text-slate-300">Damit wir Ihrer Agentur die Anleitung schicken können, brauchen wir deren Kontakt.</p>
              <Field label="Name der Web-Agentur">
                <TextInput placeholder="z. B. Muster Web GmbH" value={w.agencyName ?? ""} onChange={(e) => setW({ agencyName: e.target.value })} />
              </Field>
              <Field label="E-Mail der Agentur">
                <TextInput type="email" placeholder="kontakt@agentur.ch" value={w.agencyEmail ?? ""} onChange={(e) => setW({ agencyEmail: e.target.value })} />
              </Field>
              {!emailOk(w.agencyEmail) ? <p className="text-[11px] leading-relaxed text-slate-400">Ohne E-Mail können wir die Anleitung später nicht direkt schicken — Sie können sie aber jederzeit nachreichen.</p> : null}
            </div>
          ) : null}
          <Field label="Haben Sie schon ein Formular auf der Website?">
            <RadioGroup value={w.formMode} onChange={(val) => setW({ formMode: val })}
              options={[
                { value: "ersetzen", label: "Ja — das neue ersetzt das alte" },
                { value: "ergaenzen", label: "Es kommt ergänzend dazu" },
              ]} />
          </Field>
        </>
      ),
    },
  ];

  const ORDER = formRelevant ? ["formular", "kategorien", "website"] : ["formular"];
  const visible = ORDER.map((k) => CARDS.find((c) => c.key === k)!);
  const doneN = visible.filter((c) => isDone(c.key)).length;
  const allDone = doneN === visible.length;

  return (
    <Detail icon="🌐" title="Online-Anfragen" claim="Statt E-Mail-Pingpong — eine saubere Anfrage." onBack={onBack} onDone={allDone ? onDone : undefined} doneLabel="Online-Anfragen sind startklar">
      <PainHint items={[
        { pain: "Anfragen kommen nachts oder am Wochenende", relief: "Das Formular nimmt sie rund um die Uhr auf — Sie sehen sie am Morgen." },
        { pain: "Mail-hin-und-her, bis eine Anfrage komplett ist", relief: "Geführte Fragen + Foto → eine saubere Anfrage, alles am selben Ort." },
      ]} />

      <p className="text-sm leading-relaxed text-slate-200">
        Tippen Sie eine Karte an. <span className="font-semibold" style={{ color: GOLD }}>✓ steht</span> = nur kurz bestätigen · <span className="font-semibold text-white">⚪ optional</span> = nicht nötig zum Starten.
      </p>

      <div className="space-y-2.5">
        {visible.map((c) => {
          const expanded = openCard === c.key;
          const done = isDone(c.key);
          const badgeTone: "ready" | "optional" | "done" = done ? "done" : c.tone;
          const badgeLabel = done ? "✓ bestätigt" : c.badge;
          return (
            <div key={c.key} className="overflow-hidden rounded-xl border bg-white/[0.03]" style={{ borderColor: done ? `${GOLD}55` : "rgba(255,255,255,0.1)" }}>
              <button type="button" onClick={() => setOpenCard(expanded ? null : c.key)} aria-expanded={expanded}
                className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-white/[0.03]">
                <span className="mt-0.5 text-2xl leading-none">{c.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-[15px] font-semibold leading-snug text-white">{c.title}</span>
                    <span className="mt-0.5 shrink-0 text-lg leading-none text-slate-500 transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>›</span>
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">{c.sub}</span>
                  <span className="mt-2 block"><StatusBadge tone={badgeTone} label={badgeLabel} /></span>
                </span>
              </button>
              {expanded ? (
                <div className="space-y-4 border-t border-white/10 px-4 py-4">
                  <LisaHelp text={WEB_CARD_AUDIO[c.key]} />
                  {c.render()}
                  <button type="button" onClick={() => { markCard(c.key); setOpenCard(null); }}
                    className="rounded-xl px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
                    {done ? "✓ Gespeichert — zuklappen" : c.tone === "optional" ? "✓ Gesehen — weiter" : "✓ Passt so — bestätigen"}
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <NotesField value={draft.notes?.website ?? ""} onChange={(val) => update((d) => ({ ...d, notes: { ...d.notes, website: val } }))} />
    </Detail>
  );
}

// ── Leitsystem-Knoten (Settings) ─────────────────────────────────────────────
function SystemNode({ pf, draft, brandColor, update, onDone, onBack }: {
  pf: CockpitSession["prefill"]; draft: CockpitDraft; brandColor: string;
  update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void;
}) {
  const [star, setStar] = useState<string | null>(null);
  const staff = draft.staff ?? [];
  const setStaff = (next: StaffMember[]) => update((d) => ({ ...d, staff: next }));
  const rThr = draft.review?.internalThreshold ?? 3;
  const isDone = (k: string) => !!draft.stepDone?.[`system_${k}`];
  const markStar = (k: string) => update((d) => ({ ...d, stepDone: { ...d.stepDone, [`system_${k}`]: true } }));
  const stateOf = (k: string, touched: boolean): StarState => (isDone(k) ? "done" : touched ? "partial" : "empty");

  // L-17: Pflichtfelder pro Stern (spiegelt /api/aufbau/[token]/submit).
  const emailOk = (e?: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e ?? "");
  const CATS: { key: string; star: string; icon: string; title: string; touched: boolean; missing?: () => string[]; render: () => React.ReactNode }[] = [
    {
      key: "marke", star: "Marke", icon: "🎨", title: "Ihre Marke",
      touched: !!(draft.branding?.brandColor || draft.branding?.caseIdPrefix),
      render: () => (
        <div className="space-y-4">
          <Field label="Ihre Farbe" hint="Trägt jeden Fall, jede SMS und jede E-Mail Ihres Systems.">
            <div className="flex items-center gap-2">
              <input type="color" value={brandColor} onChange={(e) => update((d) => ({ ...d, branding: { ...d.branding, brandColor: e.target.value } }))} className="h-10 w-14 cursor-pointer rounded border border-white/15 bg-transparent" />
              <TextInput value={brandColor} onChange={(e) => update((d) => ({ ...d, branding: { ...d.branding, brandColor: e.target.value } }))} />
            </div>
          </Field>
          <Field label="Fall-Kürzel" hint="Vor jeder Fallnummer — z. B. DA-0042.">
            <TextInput maxLength={4} value={draft.branding?.caseIdPrefix ?? pf.branding.caseIdPrefix} onChange={(e) => update((d) => ({ ...d, branding: { ...d.branding, caseIdPrefix: e.target.value.toUpperCase() } }))} />
          </Field>
        </div>
      ),
    },
    {
      key: "team", star: "Team", icon: "👥", title: "Ihr Team & Rollen",
      touched: staff.length > 0,
      missing: () => {
        const valid = staff.filter((s) => s?.name?.trim() && emailOk(s.email));
        if (valid.length === 0) return ["mindestens eine Person mit Name + E-Mail"];
        if (!valid.some((s) => s.role === "admin")) return ["eine Person als Leitung"];
        return [];
      },
      render: () => (
        <>
          <p className="text-xs text-slate-400">Wer arbeitet mit dem Leitsystem? Die Leitung sieht alle Fälle, Techniker nur die eigenen.</p>
          {staff.length <= 1 ? <p className="text-xs text-slate-400">Allein im Betrieb? Tragen Sie nur sich selbst als Leitung ein — mehr braucht es nicht. Wächst Ihr Team, fügen Sie jederzeit weitere Personen hinzu.</p> : null}
          <div className="space-y-2">
            {staff.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                <TextInput placeholder="Name" value={s.name} onChange={(e) => setStaff(staff.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <select value={s.role} onChange={(e) => setStaff(staff.map((x, j) => j === i ? { ...x, role: e.target.value as StaffMember["role"] } : x))} className={`${inputCls} w-auto`} style={{ colorScheme: "dark" }}>
                  <option value="admin" style={{ backgroundColor: "#0b1f33", color: "#fff" }}>Leitung</option><option value="techniker" style={{ backgroundColor: "#0b1f33", color: "#fff" }}>Techniker</option>
                </select>
                <button type="button" onClick={() => setStaff(staff.filter((_, j) => j !== i))} className="px-2 text-slate-400 hover:text-white">✕</button>
                <div className="col-span-3"><TextInput type="email" placeholder="E-Mail" value={s.email} onChange={(e) => setStaff(staff.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} /></div>
              </div>
            ))}
            <button type="button" onClick={() => setStaff([...staff, { name: "", role: staff.length === 0 ? "admin" : "techniker", email: "" }])} className="rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-slate-300 hover:border-white/40">+ Mitarbeiter hinzufügen</button>
          </div>
        </>
      ),
    },
    {
      key: "kalender", star: "Kalender", icon: "📅", title: "Kalender & Verfügbarkeit",
      touched: draft.calendar?.connect !== undefined,
      render: () => (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Kalender anbinden → beim Terminsetzen sofort sehen, ob jemand schon belegt ist. So überplanen Sie niemanden.</p>
          <Field label="Kalender anbinden?">
            <RadioGroup value={draft.calendar?.connect === undefined ? undefined : draft.calendar.connect ? "ja" : "nein"}
              onChange={(v) => update((d) => ({ ...d, calendar: { ...d.calendar, connect: v === "ja", provider: v === "nein" ? "none" : d.calendar?.provider } }))}
              options={[{ value: "ja", label: "Ja — Belegung sehen, niemanden überplanen" }, { value: "nein", label: "(Noch) nicht — Termine ohne Belegungs-Anzeige" }]} />
          </Field>
          {draft.calendar?.connect ? (
            <Field label="Welcher Kalender-Anbieter?">
              <RadioGroup value={(draft.calendar?.provider === "outlook" || draft.calendar?.provider === "google") ? draft.calendar.provider : undefined}
                onChange={(v) => update((d) => ({ ...d, calendar: { ...d.calendar, provider: v } }))}
                options={[{ value: "outlook", label: "Microsoft 365 / Outlook", hint: "voll unterstützt" }, { value: "google", label: "Google Kalender", hint: "richten wir für Sie ein" }]} />
            </Field>
          ) : null}
          {draft.calendar?.connect && draft.calendar?.provider === "outlook" ? (
            <>
              <Field label="Wer richtet die Verbindung ein (Ihr Microsoft-365-Administrator)?" hint="Die Person, die sich einmalig bei Microsoft anmeldet und die Freigabe bestätigt — oft Sie selbst oder Ihr IT-Betreuer.">
                <TextInput placeholder="Name" value={draft.calendar?.adminName ?? ""} onChange={(e) => update((d) => ({ ...d, calendar: { ...d.calendar, adminName: e.target.value } }))} />
              </Field>
              <Field label="Dessen Microsoft-365-E-Mail">
                <TextInput type="email" placeholder="admin@ihre-firma.ch" value={draft.calendar?.adminEmail ?? ""} onChange={(e) => update((d) => ({ ...d, calendar: { ...d.calendar, adminEmail: e.target.value } }))} />
              </Field>
              <Disclosure summary="Wie läuft die Verbindung ab? (1 Klick — nichts heraussuchen)">
                Nach dem Freischalten öffnen Sie im Leitsystem <span className="text-slate-200">Einstellungen → Kalender</span> und klicken <span className="text-slate-200">„Mit Microsoft verbinden&quot;</span>. Die oben genannte Person meldet sich <span className="text-slate-200">einmal</span> mit ihrer Microsoft-365-E-Mail an und bestätigt die Freigabe — fertig. Wir prüfen dann die Kalender Ihrer Mitarbeiter (Team-Stern) auf Belegung. Voraussetzung: Microsoft 365 mit Postfach je Mitarbeiter. Eine „Tenant-ID&quot; o. Ä. müssen Sie <span className="text-slate-200">nicht</span> heraussuchen.
              </Disclosure>
            </>
          ) : null}
          {draft.calendar?.connect && draft.calendar?.provider === "google" ? (
            <>
              <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
                ✓ <span className="text-slate-200">Perfekt.</span> Ihre Google-Kalender-Anbindung richten <span className="text-slate-200">wir</span> nach dem Freischalten für Sie ein — Sie müssen nichts weiter tun. Falls wir etwas brauchen, melden wir uns kurz.
              </p>
              <Field label="Welches Google-Konto sollen wir anbinden? (optional)" hint="Die geschäftliche Google-/Gmail-Adresse, deren Kalender wir auf Belegung prüfen sollen.">
                <TextInput type="email" placeholder="kalender@ihre-firma.ch" value={draft.calendar?.googleAccountEmail ?? ""} onChange={(e) => update((d) => ({ ...d, calendar: { ...d.calendar, googleAccountEmail: e.target.value } }))} />
              </Field>
            </>
          ) : null}
        </div>
      ),
    },
    {
      key: "nachrichten", star: "Benachrichtigungen", icon: "📨", title: "Benachrichtigungen & E-Mail",
      touched: !!draft.review?.notificationEmail,
      missing: () => emailOk(draft.review?.notificationEmail) ? [] : ["die Geschäfts-E-Mail für neue Fälle"],
      render: () => (
        <>
          <Field label="Wohin sollen neue Fälle gemeldet werden?" hint="Ihre echte Geschäfts-E-Mail.">
            <TextInput type="email" placeholder={pf.hints.crawledEmail ?? "ihre@firma.ch"} value={draft.review?.notificationEmail ?? ""} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, notificationEmail: e.target.value } }))} />
          </Field>
          <Toggle on={!!draft.review?.notifyMessagesByEmail} onChange={(on) => update((d) => ({ ...d, review: { ...d.review, notifyMessagesByEmail: on } }))} label="Rückruf-Nachrichten zusätzlich per E-Mail an mich (sonst nur in der Nachrichten-Liste)" />
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold text-slate-100">Diese 3 Nachrichten gehen an Ihre Kunden</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">Wortlaut und Kanal bestimmen <span className="text-slate-300">Sie</span> — was hier steht, geht so an Ihre Kunden. Sie haben es gesehen, Sie verantworten es.</p>
            <div className="mt-3 space-y-3.5">
              <div>
                <p className="text-xs font-semibold text-white">📩 Empfangsbestätigung <span className="font-normal text-slate-400">· SMS, direkt nach jedem Fall</span></p>
                <div className="mt-1"><TextArea maxLength={160} value={draft.messages?.confirmSms ?? MSG_DEFAULTS.confirm} onChange={(e) => update((d) => ({ ...d, messages: { ...d.messages, confirmSms: e.target.value.slice(0, 160) } }))} /></div>
                <p className="mt-0.5 text-[11px] text-slate-500">{(draft.messages?.confirmSms ?? MSG_DEFAULTS.confirm).length}/160 Zeichen · {"{Absender}"} und [Link] setzen wir automatisch ein</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">⏰ Termin-Erinnerung <span className="font-normal text-slate-400">· rund 24 h vorher</span></p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">„{MSG_DEFAULTS.reminder}&quot;</p>
                <div className="mt-1.5 flex items-center gap-2"><span className="text-[11px] text-slate-400">Kanal:</span><ChannelPick value={draft.messages?.reminderChannel ?? "email"} onChange={(c) => update((d) => ({ ...d, messages: { ...d.messages, reminderChannel: c } }))} /></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">⭐ Bewertungsanfrage <span className="font-normal text-slate-400">· Sie lösen sie aus (1 Klick im Leitsystem)</span></p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">„{MSG_DEFAULTS.review}&quot;</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">Nicht automatisch — Sie entscheiden pro erledigtem Auftrag. Höchstens 2× pro Kunde, mit 7 Tagen Abstand (kein Spam).</p>
                <div className="mt-1.5 flex items-center gap-2"><span className="text-[11px] text-slate-400">Kanal:</span><ChannelPick value={draft.messages?.reviewChannel ?? "email"} onChange={(c) => update((d) => ({ ...d, messages: { ...d.messages, reviewChannel: c } }))} /></div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">💡 SMS kommt sicher an (auch ohne dass jemand Mails liest), kostet aber pro Versand. E-Mail ist gratis. Ihre Wahl — Ihre Verantwortung, dass die Nachricht ankommt.</p>
          </div>
        </>
      ),
    },
    {
      key: "bewertungen", star: "Bewertungen", icon: "⭐", title: "Bewertungen — Ihre Aussenwirkung",
      touched: !!draft.review?.googleReviewUrl,
      missing: () => (draft.review?.googleReviewUrl ?? "").trim() ? [] : ["Ihren Google-Bewertungslink (oder Firmenname)"],
      render: () => (
        <>
          <Field label="Ihr Google-Bewertungslink" hint="Unsicher? Tragen Sie einfach Ihren Firmennamen ein — wir finden ihn.">
            <TextInput placeholder="https://g.page/r/… oder Firmenname" value={draft.review?.googleReviewUrl ?? ""} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, googleReviewUrl: e.target.value } }))} />
          </Field>
          <Disclosure summary="Wo finde ich meinen Bewertungslink?">
            Öffnen Sie Ihr <span className="text-slate-200">Google-Unternehmensprofil</span> → <span className="text-slate-200">Rezensionen</span> → <span className="text-slate-200">„Mehr Rezensionen erhalten&quot;</span> → Link kopieren und hier einfügen. Kein Profil zur Hand? Firmenname genügt, wir finden ihn.
          </Disclosure>
          <Field label="Google Place-ID / Profilname (optional)" hint="Für die automatische, wöchentliche Aktualisierung Ihrer Sterne — nur ein Komfort-Extra.">
            <TextInput placeholder="z. B. ChIJ… oder exakter Profilname" value={draft.review?.googlePlaceId ?? ""} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, googlePlaceId: e.target.value } }))} />
          </Field>
          <Disclosure summary="Was ist die Place-ID — und wo finde ich sie?">
            Die Place-ID ist Googles eindeutige Kennung Ihres Profils (beginnt meist mit <span className="text-slate-200">„ChIJ…&quot;</span>). Am einfachsten: Google nach <span className="text-slate-200">„Place ID Finder&quot;</span> suchen, dort Ihren Firmennamen eingeben → die ID erscheint. <span className="text-slate-200">Sie müssen das nicht selbst suchen</span> — lassen Sie das Feld ruhig leer, der Bewertungslink oder Firmenname oben genügt vollkommen. Den Rest erledigen wir.
          </Disclosure>
          <Field label="Welche Bewertungen sollen intern bleiben?" hint="Schwächere Bewertungen landen NICHT öffentlich auf Google, sondern als internes Feedback bei Ihnen.">
            <RadioGroup value={String(rThr)} onChange={(val) => update((d) => ({ ...d, review: { ...d.review, internalThreshold: Number(val) as 0 | 2 | 3 | 4 } }))}
              options={[
                { value: "2", label: "Nur ≤ 2 Sterne intern" },
                { value: "3", label: "≤ 3 Sterne intern", hint: "unsere Empfehlung" },
                { value: "4", label: "≤ 4 Sterne intern", hint: "nur 5★ gehen öffentlich" },
                { value: "0", label: "Alle öffentlich", hint: "jede Bewertung geht direkt zu Google" },
              ]} />
          </Field>
          <Disclosure summary="Was erlebt mein Kunde — und wann landet es auf Google?">
            {rThr === 0
              ? "Der Kunde tippt auf Sterne und wird bei jeder Bewertung direkt zu Ihrem Google-Profil geleitet — alles landet öffentlich."
              : `Der Kunde bekommt einen Link und tippt auf Sterne. Bei mehr als ${rThr} Sternen sieht er „Auf Google bewerten" und wird direkt zu Ihrem Profil geleitet (stärkt Ihre Sichtbarkeit). Bei ${rThr} oder weniger sieht er stattdessen „Was können wir besser machen?" — dieses Feedback bleibt intern bei Ihnen. So sammeln Sie öffentlich 5★ und lernen aus Kritik unter vier Augen.`}
          </Disclosure>
          <Field label={`SMS-Absender (max. 11 Zeichen)`} hint="Erscheint als Absender Ihrer SMS (z. B. Empfangsbestätigung, Bewertungslink).">
            <TextInput maxLength={11} value={draft.review?.smsSenderName ?? pf.review.smsSenderName} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, smsSenderName: e.target.value } }))} />
          </Field>
        </>
      ),
    },
  ];

  if (star) {
    const cat = CATS.find((c) => c.key === star);
    if (cat) {
      const miss = cat.missing?.() ?? [];
      return (
        <div className="mx-auto max-w-[680px]">
          <button type="button" onClick={() => setStar(null)} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/30 hover:text-white"><span style={{ color: GOLD }}>‹</span> Zurück zum Sternbild</button>
          <h2 className="mt-4 flex items-center gap-2 text-xl font-bold text-white"><span>{cat.icon}</span>{cat.title}</h2>
          <div className="mt-5 space-y-4">{cat.render()}</div>
          <div className="mt-5 rounded-xl border border-dashed p-3" style={{ borderColor: `${GOLD}44` }}>
            <Field
              label={cat.key === "marke" ? "Hinweis (optional)" : "Was läuft bei Ihnen noch, das wir unbedingt wissen sollten,"}
              hint={cat.key === "marke" ? undefined : "Ihre Besonderheiten, Ausnahmen, Wünsche. Je mehr Sie uns verraten, desto reibungsloser läuft es ab Tag 1 — geht direkt an Gunnar."}
            >
              <TextArea placeholder={cat.key === "marke" ? "" : (SYSTEM_STAR_NOTE_PLACEHOLDER[cat.key] ?? "")} value={draft.starNotes?.[`system_${cat.key}`] ?? ""} onChange={(e) => update((d) => ({ ...d, starNotes: { ...d.starNotes, [`system_${cat.key}`]: e.target.value } }))} />
            </Field>
          </div>
          {miss.length > 0 ? (
            <p className="mt-5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/90">Damit dieser Stern gold wird, fehlt noch: {miss.join(", ")}.</p>
          ) : null}
          <button type="button" disabled={miss.length > 0} onClick={() => { markStar(cat.key); setStar(null); }} className="mt-3 rounded-xl px-5 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
            {isDone(cat.key) ? "✓ Speichern und zurück" : "✓ Dieser Punkt passt — Stern setzen"}
          </button>
        </div>
      );
    }
  }

  const doneN = CATS.filter((c) => isDone(c.key)).length;
  const allDone = doneN === CATS.length;
  return (
    <Detail icon="🤍" title="Ihr Leitsystem — Einstellungen" claim="Bauen Sie Stern für Stern Ihr Leitsystem — das Herz Ihres Betriebs." onBack={onBack} onDone={allDone ? onDone : undefined} doneLabel="Leitsystem ist startklar">
      <PainHint items={[
        { pain: "Zettel, Anrufe und Mails gehen im Alltag unter", relief: "Jeder Fall landet sauber an einem Ort — nichts geht mehr verloren." },
        { pain: "Kunden vergessen den vereinbarten Termin", relief: "Automatische Erinnerung — weniger Leerfahrten, weniger Ärger." },
      ]} />
      <Constellation
        center={<span style={{ filter: allDone ? "drop-shadow(0 0 18px rgba(212,168,67,0.7))" : undefined }}><BrandIcon size={96} /></span>}
        centerLabel="Ihr Leitsystem"
        awakeLabel="startklar"
        stars={CATS.map((c) => ({ key: c.key, label: c.star, state: stateOf(c.key, c.touched) }))}
        onOpen={setStar}
      />
      <p className="text-center text-xs text-slate-400">Tippen Sie einen Stern an, füllen Sie ihn aus — er leuchtet gold, wenn er sitzt.</p>
      <NotesField value={draft.notes?.system ?? ""} onChange={(val) => update((d) => ({ ...d, notes: { ...d.notes, system: val } }))} />
    </Detail>
  );
}

// ── Freigabe ─────────────────────────────────────────────────────────────────
const MISSING_LABEL: Record<string, string> = {
  staff: "Mindestens ein Mitarbeiter (mit E-Mail)", staff_admin: "Eine Person als Leitung",
  notification_email: "Geschäfts-E-Mail für neue Fälle", google_review_url: "Google-Bewertungslink",
  admin_email: "Login-E-Mail", avv: "AVV akzeptieren", greeting: "Begrüssung für Lisa", wizard_integration: "Wer Ihre Website betreut (Online-Formular)",
  telco: "Ihr Telefonanbieter (Lisa-Strang)", emergency_contact: "Notfall-Empfänger (Name) — bei aktivem Notdienst", agency_email: "E-Mail der Web-Agentur",
};

function Freigabe({ token, preview, draft, update, onBack, companyName }: {
  token: string; preview: boolean; draft: CockpitDraft; update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onBack: () => void; companyName: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [missing, setMissing] = useState<string[]>([]);
  const [showAvv, setShowAvv] = useState(false);
  const toggleAvv = () => update((d) => {
    const on = !d.golive?.avvAccepted;
    return { ...d, golive: { ...d.golive, avvAccepted: on, avvVersion: on ? AVV_VERSION : undefined, avvAcceptedAt: on ? new Date().toISOString() : undefined } };
  });
  const submit = async () => {
    setState("sending"); setMissing([]);
    if (preview) { setState("sent"); return; } // Vorschau: nur den Abschluss-Screen zeigen, nichts senden
    try {
      const res = await fetch(`/api/aufbau/${token}/submit`, { method: "POST" });
      if (res.status === 422) { const j = await res.json(); setMissing(j.missing ?? []); setState("idle"); return; }
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
    } catch { setState("error"); }
  };

  if (state === "sent") {
    return (
      <Detail icon="🎉" title="Geschafft." onBack={onBack}>
        <p className="text-sm text-slate-300">Sie haben {companyName} aufgebaut. Gunnar schaut es kurz durch und meldet sich — dann gehen Sie gemeinsam live. Nichts ist verloren.</p>
        {!preview ? (
          <a href={`/aufbau/${token}/zusammenfassung`} target="_blank" rel="noopener" className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-bold" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>📄 Ihr Setup als PDF sichern</a>
        ) : null}
      </Detail>
    );
  }
  return (
    <Detail icon="🚀" title="Zugang & Freigabe" claim="Der letzte Schritt — danach schaut Gunnar drüber und Sie gehen gemeinsam live." onBack={onBack}>
      <Field label="Ihre E-Mail für den Login" hint="Damit melden Sie sich im Leitsystem an (Code per E-Mail).">
        <TextInput type="email" placeholder="ihre@firma.ch" value={draft.golive?.adminEmail ?? ""} onChange={(e) => update((d) => ({ ...d, golive: { ...d.golive, adminEmail: e.target.value } }))} />
      </Field>
      {/* AVV: Dokument anzeigen + versionierte Zustimmung */}
      <div className="rounded-xl border border-white/10 bg-white/5">
        <button type="button" onClick={() => setShowAvv((s) => !s)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-slate-200">
          <span>Auftragsdaten­verarbeitungs-Vereinbarung (AVV) ansehen</span>
          <span className="text-lg leading-none" style={{ color: GOLD }}>{showAvv ? "−" : "+"}</span>
        </button>
        {showAvv ? (
          <div className="border-t border-white/10 px-3 py-3">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{AVV_TEXT}</pre>
            {/* L-16: dezent untergemischt, nicht als hervorgehobener Block (keine Pflicht-Hervorhebung). */}
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              <span className="text-slate-400">Eingesetzte Dienstleister:</span>{" "}
              {AVV_SUBPROCESSORS.map((s) => `${s.name} (${s.zweck}, ${s.ort})`).join(" · ")}
            </p>
          </div>
        ) : null}
      </div>
      <button type="button" onClick={toggleAvv}
        className="flex w-full items-start gap-3 rounded-lg border bg-white/5 px-3 py-3 text-left" style={{ borderColor: draft.golive?.avvAccepted ? GOLD : "rgba(255,255,255,0.12)" }}>
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs" style={{ borderColor: draft.golive?.avvAccepted ? GOLD : "rgba(255,255,255,0.3)", backgroundColor: draft.golive?.avvAccepted ? GOLD : "transparent", color: "#1a1a1a" }}>{draft.golive?.avvAccepted ? "✓" : ""}</span>
        <span className="text-sm text-slate-200">Ich akzeptiere die AVV. Schweizer Datenschutz (revDSG), Server in Frankfurt, keine Gesprächsaufnahmen.{draft.golive?.avvAccepted && draft.golive?.avvAcceptedAt ? <span className="mt-0.5 block text-[11px] text-slate-500">Akzeptiert · Version {draft.golive.avvVersion}</span> : null}</span>
      </button>

      <Disclosure summary="Was passiert nach dem Freischalten?">
        <ul className="space-y-1.5">
          <li>🧪 Die <span className="text-slate-200">Demo-Fälle aus dem Video verschwinden</span> — Ihr erster echter Anruf wird Ihr erster Fall.</li>
          <li>📍 Jeder Fall durchläuft: <span className="text-slate-200">Neu → Geplant → In Arbeit → Erledigt</span> — Sie sehen jederzeit, wo er steht.</li>
          <li>📱 Installieren Sie das Leitsystem als <span className="text-slate-200">App aufs Handy</span> — jeder Fall ist auch unterwegs auf der Baustelle dabei.</li>
          <li>📊 Jeden Montag bekommen Sie automatisch einen kurzen <span className="text-slate-200">Wochen-Rapport</span> (Fälle, Bewertungen) an Ihre Login-E-Mail.</li>
          <li>🔒 Bis zum gemeinsamen Go-live ist nichts scharf — Gunnar schaut drüber, dann gehen Sie live.</li>
        </ul>
      </Disclosure>

      {missing.length > 0 ? (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
          <p className="text-sm font-medium text-amber-200">Fast — es fehlt noch:</p>
          <ul className="mt-1 space-y-0.5 text-sm text-amber-100/90">{missing.map((m) => <li key={m}>• {MISSING_LABEL[m] ?? m}</li>)}</ul>
        </div>
      ) : null}

      <button type="button" onClick={submit} disabled={state === "sending"} className="rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-60" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
        {state === "sending" ? "Senden …" : "An Gunnar zum Freischalten senden"}
      </button>
      {state === "error" ? <p className="text-[11px] text-red-300">Senden fehlgeschlagen — bitte erneut.</p> : null}
    </Detail>
  );
}
