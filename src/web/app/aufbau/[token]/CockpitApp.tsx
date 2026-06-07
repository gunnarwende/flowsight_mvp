"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CockpitDraft,
  CockpitSession,
  DispositionsConfig,
  StaffMember,
  WizardCategory,
} from "@/src/lib/cockpit/types";
import { DISPOSITION_DEFAULTS } from "@/src/lib/cockpit/types";
import { startLisaTestCall, type TestCallPhase } from "./lisaTestCall";

/**
 * Onboarding-Cockpit Co-Pilot — Redesign v2 (Phase 2, OC6).
 * Nicht ein Formular, sondern ein SICHTBARES SYSTEM, das man trainiert:
 * 3 Eingangs-Stränge (Vor-Ort · Lisa · Website) → ◆ Ihr Leitsystem → Output.
 * Progressive Disclosure: Klick auf Strang/Knoten → erst dann die Fragen.
 * Spec: docs/gtm/onboarding/phase2_cockpit_redesign.md
 */

const GOLD = "#c8a24a";
const BG = "#0b1f33";

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

/** Das FlowSight-Leitsystem-App-Icon (Navy + Gold) — identisch zur Beweis-Seite. */
function BrandIcon({ size = 108 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" aria-hidden="true" className="drop-shadow-lg">
      <rect x="1.5" y="1.5" width="49" height="49" rx="13" fill="#1a2744" stroke="#d4a843" strokeWidth="1.5" />
      <circle cx="26" cy="26" r="11" fill="none" stroke="#d4a843" strokeWidth="1.2" opacity="0.5" />
      <circle cx="26" cy="26" r="6.5" fill="#d4a843" />
    </svg>
  );
}

// ── Strang-Definitionen (für die Karte) ──────────────────────────────────────
const STRANDS: { key: "vorort" | "lisa" | "website"; icon: string; titel: string; cta: string; unter: string }[] = [
  { key: "vorort", icon: "🚪", titel: "Vor Ort", cta: "ansehen", unter: "Fälle, die Sie selbst aufnehmen" },
  { key: "lisa", icon: "📞", titel: "Lisa", cta: "Lisa trainieren", unter: "Ihre Telefon-Assistentin" },
  { key: "website", icon: "🌐", titel: "Website", cta: "Strang öffnen", unter: "Online-Meldungen Ihrer Kunden" },
];

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
  { key: "priceDeflect", label: "Antwort auf Preisfragen" },
];

// ── Hauptkomponente ──────────────────────────────────────────────────────────
export function CockpitApp({ session }: { session: CockpitSession }) {
  const { token, prefill: pf } = session;
  const init = session.draft ?? {};
  const [view, setView] = useState<View>("overview");
  const [draft, setDraft] = useState<CockpitDraft>(() => ({
    branding: { brandColor: init.branding?.brandColor ?? pf.branding.brandColor, caseIdPrefix: init.branding?.caseIdPrefix ?? pf.branding.caseIdPrefix },
    staff: init.staff ?? [],
    voice: {
      greetingText: init.voice?.greetingText ?? pf.voice.greetingSuggestion,
      languages: init.voice?.languages ?? pf.voice.languagesDefault,
      wissen: init.voice?.wissen ?? {},
      dispositions: init.voice?.dispositions ?? DISPOSITION_DEFAULTS,
      pickup: init.voice?.pickup,
    },
    wizard: { categories: init.wizard?.categories ?? pf.wizard.categories, distribution: init.wizard?.distribution, embedBy: init.wizard?.embedBy, hasWebsite: init.wizard?.hasWebsite },
    review: { notificationEmail: init.review?.notificationEmail ?? "", googleReviewUrl: init.review?.googleReviewUrl ?? "", smsSenderName: init.review?.smsSenderName ?? pf.review.smsSenderName, smsContent: init.review?.smsContent ?? "", notifyMessagesByEmail: init.review?.notifyMessagesByEmail ?? false },
    golive: { adminEmail: init.golive?.adminEmail ?? "", avvAccepted: init.golive?.avvAccepted ?? false },
    notes: init.notes ?? {},
    stepDone: init.stepDone ?? {},
  }));
  const [progress, setProgress] = useState<Record<string, boolean>>(session.progress ?? {});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const brandColor = draft.branding?.brandColor || pf.branding.brandColor;

  // ── Autosave: ganzen Draft (debounced) ─────────────────────────────────────
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const post = useCallback(async (draftPatch: CockpitDraft, progressPatch?: Record<string, boolean>) => {
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
  }, [token]);

  const update = useCallback((fn: (d: CockpitDraft) => CockpitDraft) => {
    setDraft((prev) => fn(prev));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => post(draftRef.current), 900);
  }, [post]);

  const markDone = useCallback((key: string) => {
    const next = { ...draftRef.current, stepDone: { ...draftRef.current.stepDone, [key]: true } };
    setDraft(next);
    post(next, { [key]: true });
    setView("overview");
  }, [post]);

  const doneCount = CAPABILITIES.filter((c) => progress[c]).length;

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: BG, color: "#e8eef5" }}>
      <main className="mx-auto w-full max-w-[1080px] flex-1 px-5 py-10 sm:py-16">
        {view === "overview" && (
          <Overview pf={pf} brandColor={brandColor} companyName={session.company_name} progress={progress} doneCount={doneCount} saveState={saveState} onOpen={setView} />
        )}
        {view === "vorort" && <VorOrt draft={draft} update={update} onDone={() => markDone("vorort")} onBack={() => setView("overview")} />}
        {view === "lisa" && <Lisa token={token} pf={pf} draft={draft} update={update} onDone={() => markDone("lisa")} onBack={() => setView("overview")} />}
        {view === "website" && <Website pf={pf} draft={draft} update={update} onDone={() => markDone("website")} onBack={() => setView("overview")} />}
        {view === "system" && <SystemNode pf={pf} draft={draft} brandColor={brandColor} update={update} onDone={() => markDone("system")} onBack={() => setView("overview")} />}
        {view === "freigabe" && <Freigabe token={token} draft={draft} update={update} onBack={() => setView("overview")} companyName={session.company_name} />}
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">FlowSight · Oberrieden · Kommen Sie nicht weiter? Schreiben Sie Gunnar direkt.</footer>
    </div>
  );
}

function SaveDot({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const m = { saving: ["Speichert …", "#94a3b8"], saved: ["Gespeichert ✓", "#86c79a"], error: ["Speichern fehlgeschlagen", "#e2a0a0"] } as const;
  return <span className="text-[11px]" style={{ color: m[state][1] }}>{m[state][0]}</span>;
}

// ── Overview = die System-Karte ──────────────────────────────────────────────
function Overview({ pf, brandColor, companyName, progress, doneCount, saveState, onOpen }: {
  pf: CockpitSession["prefill"]; brandColor: string; companyName: string;
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
          <span className="mt-1 block text-slate-400">Nichts ist live, bis Sie freigeben · Schweizer Datenschutz, keine Aufnahmen · jederzeit speicherbar, später änderbar.</span>
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
              className="rounded-2xl border bg-white/5 p-6 text-left transition hover:bg-white/10"
              style={{ borderColor: done ? `${GOLD}66` : "rgba(255,255,255,0.10)" }}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: done ? `${GOLD}22` : "rgba(255,255,255,0.08)", color: done ? GOLD : "#cbd5e1" }}>
                  {done ? "✓ startklar" : "○ offen"}
                </span>
              </div>
              <p className="mt-2 text-base font-bold text-white">{s.titel}</p>
              <p className="text-xs text-slate-400">{s.unter}</p>
              <p className="mt-3 text-sm font-semibold" style={{ color: GOLD }}>{s.cta} →</p>
            </button>
          );
        })}
      </div>

      <div className="my-6 text-center text-2xl text-slate-600">↓</div>

      {/* Leitsystem-Knoten (klickbar) — der Held der Karte */}
      <button type="button" onClick={() => onOpen("system")}
        className="mx-auto flex w-full max-w-[480px] flex-col items-center rounded-3xl border px-6 py-10 text-center transition hover:bg-white/[0.06]"
        style={{ borderColor: `${GOLD}55`, backgroundColor: "rgba(255,255,255,0.03)" }}>
        <BrandIcon size={116} />
        <p className="mt-5 text-xl font-bold text-white">Ihr Leitsystem</p>
        <p className="mt-0.5 text-base font-semibold" style={{ color: brandColor === "#0b1f33" ? GOLD : brandColor }}>{companyName}</p>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Marke · Team & Rollen · Benachrichtigung · Bewertung<br />
          {progress.system ? "✓ bestätigt" : "antippen zum Einstellen"}
        </p>
      </button>

      <div className="my-6 text-center text-2xl text-slate-600">↓</div>

      {/* Output */}
      <div className="mx-auto max-w-[480px] rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center text-sm text-slate-300">
        <p className="font-semibold text-white">📋 Ihre Fälle — sauber an einem Ort</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">Daraus entstehen Ihre nächsten Schritte (Weiterleitung · Formular platzieren · Freigabe).</p>
      </div>

      {/* Freigabe */}
      <div className="mt-12 text-center">
        <button type="button" onClick={() => onOpen("freigabe")} disabled={false}
          className="rounded-xl px-6 py-3 text-sm font-bold" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
          An Gunnar zum Freischalten senden
        </button>
        {!allDone ? <p className="mt-2 text-[11px] text-slate-400">Tipp: gehen Sie zuerst die drei Stränge + Ihr Leitsystem durch.</p> : null}
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
      <button type="button" onClick={onBack} className="text-sm text-slate-400 hover:text-white">← Übersicht</button>
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
      <NotesField value={draft.notes?.vorort ?? ""} onChange={(v) => update((d) => ({ ...d, notes: { ...d.notes, vorort: v } }))} />
    </Detail>
  );
}

// ── Strang: Lisa ─────────────────────────────────────────────────────────────
function Lisa({ token, pf, draft, update, onDone, onBack }: {
  token: string; pf: CockpitSession["prefill"]; draft: CockpitDraft;
  update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [phase, setPhase] = useState<TestCallPhase>("idle");
  const v = draft.voice ?? {};
  const disp = v.dispositions ?? DISPOSITION_DEFAULTS;
  const setDisp = (k: keyof DispositionsConfig, notify: "push" | "board") =>
    update((d) => ({ ...d, voice: { ...d.voice, dispositions: { ...(d.voice?.dispositions ?? DISPOSITION_DEFAULTS), [k]: { ...(d.voice?.dispositions ?? DISPOSITION_DEFAULTS)[k], notify } } } }));

  const pickupLabel: Record<string, string> = { sofort: "Sofort", nach_10s: "Nach ~10 Sek.", nach_15s: "Nach ~15 Sek.", nach_20s: "Nach ~20 Sek.", nach_30s: "Nach ~30 Sek." };

  return (
    <Detail icon="📞" title="Ihre Lisa" claim="Ihre Mitarbeiterin, die nie ein Gespräch verpasst — und jeden Auftrag festhält." onBack={onBack} onDone={onDone}>
      <Field label="Begrüssung" hint="So meldet sich Lisa. Muss erkennbar machen, dass sie eine digitale Assistentin ist.">
        <TextArea value={v.greetingText ?? pf.voice.greetingSuggestion} onChange={(e) => update((d) => ({ ...d, voice: { ...d.voice, greetingText: e.target.value } }))} />
      </Field>

      {/* Das sagt Ihre Lisa — Accordion, eine Karte offen */}
      <div>
        <p className="text-sm font-medium text-slate-200">Das sagt Ihre Lisa</p>
        <p className="mt-0.5 text-xs text-slate-400">Aus Ihrer Website vorbereitet — bitte überfliegen und korrigieren.</p>
        <div className="mt-2 space-y-2">
          {WISSEN_FIELDS.map((f) => {
            const isOpen = open === f.key;
            return (
              <div key={f.key} className="rounded-lg border border-white/10 bg-white/5">
                <button type="button" onClick={() => setOpen(isOpen ? null : f.key)} className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-white">
                  <span>{f.label}</span><span className="text-lg leading-none" style={{ color: GOLD }}>{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? (
                  <div className="px-3 pb-3">
                    <TextArea value={v.wissen?.[f.key] ?? pf.voice.wissen[f.key]} onChange={(e) => update((d) => ({ ...d, voice: { ...d.voice, wissen: { ...d.voice?.wissen, [f.key]: e.target.value } } }))} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispositionen mit Info-Weg */}
      <div>
        <p className="text-sm font-medium text-slate-200">Was Lisa bei welchem Anruf tut</p>
        <p className="mt-0.5 text-xs text-slate-400">Sinnvoll vorbelegt — Sie bestätigen oder passen an. Jede Karte zeigt, wohin es geht.</p>
        <div className="mt-2 space-y-2">
          {DISPOSITION_CARDS.map((c) => (
            <div key={c.key} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">{c.titel}</p>
              <p className="text-xs text-slate-400">{c.szenario}</p>
              <p className="mt-1 text-xs text-slate-300">{c.weg}</p>
              {(c.key === "d1_auftrag" || c.key === "d5_reklamation") ? (
                <div className="mt-2"><Toggle on={disp[c.key].notify === "push"} onChange={(on) => setDisp(c.key, on ? "push" : "board")} label={c.key === "d1_auftrag" ? "Bei Notfall sofort an mich melden" : "Sofort an mich melden"} /></div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <Field label="Wann soll Lisa rangehen?" hint="Daraus ergibt sich Ihre Weiterleitung (ein kurzer Schritt am Ende).">
        <RadioGroup value={v.pickup} onChange={(val) => update((d) => ({ ...d, voice: { ...d.voice, pickup: val } }))}
          options={(["sofort", "nach_10s", "nach_15s", "nach_20s", "nach_30s"] as const).map((p) => ({ value: p, label: pickupLabel[p] }))} />
      </Field>

      <div className="rounded-xl border p-4 text-center" style={{ borderColor: `${GOLD}55`, backgroundColor: "rgba(255,255,255,0.03)" }}>
        <p className="text-sm font-semibold text-white">Hören Sie Ihre Lisa</p>
        <p className="mx-auto mt-1 max-w-[440px] text-xs text-slate-300">Rufen Sie jetzt an — ein Testfall, er landet nicht in Ihrer echten Liste.</p>
        <button type="button" onClick={() => startLisaTestCall(token, setPhase)} disabled={phase === "connecting" || phase === "active"}
          className="mt-3 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-70" style={{ backgroundColor: GOLD, color: "#1a1a1a" }}>
          {({ idle: "📞 Lisa jetzt anrufen", connecting: "Verbinde …", active: "🔴 Im Gespräch", ended: "Nochmal anrufen", error: "Fehlgeschlagen — nochmal" } as Record<TestCallPhase, string>)[phase]}
        </button>
      </div>

      <NotesField value={draft.notes?.voice ?? ""} onChange={(val) => update((d) => ({ ...d, notes: { ...d.notes, voice: val } }))} />
    </Detail>
  );
}

// ── Strang: Website ──────────────────────────────────────────────────────────
function Website({ pf, draft, update, onDone, onBack }: { pf: CockpitSession["prefill"]; draft: CockpitDraft; update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void }) {
  const cats = draft.wizard?.categories ?? pf.wizard.categories;
  const hasWebsite = draft.wizard?.hasWebsite;
  return (
    <Detail icon="🌐" title="Ihr Online-Meldeformular" claim="Wie Anfragen von draussen sauber bei Ihnen landen — in Ihrem Look." onBack={onBack} onDone={onDone}>
      <Field label="Anliegen-Kategorien" hint="Die ersten drei sind Ihre — die letzten drei sind Standard. Tippen zum Ändern.">
        <div className="space-y-2">
          {cats.map((c: WizardCategory, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput value={c.label} disabled={c.fixed}
                onChange={(e) => update((d) => ({ ...d, wizard: { ...d.wizard, categories: (d.wizard?.categories ?? cats).map((x, j) => j === i ? { ...x, label: e.target.value, value: e.target.value } : x) } }))} />
              {c.fixed ? <span className="text-[10px] text-slate-500">fix</span> : null}
            </div>
          ))}
        </div>
      </Field>

      <Field label="Haben Sie eine eigene Website?" hint="Davon hängt ab, wie wir das Formular ausspielen.">
        <RadioGroup value={hasWebsite === undefined ? undefined : hasWebsite ? "ja" : "nein"} onChange={(val) => update((d) => ({ ...d, wizard: { ...d.wizard, hasWebsite: val === "ja" } }))}
          options={[{ value: "ja", label: "Ja, wir haben eine Website" }, { value: "nein", label: "Nein / veraltet" }]} />
      </Field>

      {hasWebsite === true ? (
        <Field label="Wo soll das Formular leben?">
          <RadioGroup value={draft.wizard?.distribution} onChange={(val) => update((d) => ({ ...d, wizard: { ...d.wizard, distribution: val } }))}
            options={[
              { value: "gbp_button", label: "Button im Google-Profil", hint: "Schaltfläche „Termin anfragen“ direkt bei Google" },
              { value: "embed", label: "In meine Website einbauen", hint: "als eingebettetes Formular" },
              { value: "agentur_mail", label: "Meine Web-Agentur baut es ein", hint: "wir schicken die fertige Anleitung" },
            ]} />
        </Field>
      ) : hasWebsite === false ? (
        <Field label="Verteilung ohne Website">
          <RadioGroup value={draft.wizard?.distribution} onChange={(val) => update((d) => ({ ...d, wizard: { ...d.wizard, distribution: val } }))}
            options={[
              { value: "gbp_button", label: "Button im Google-Profil", hint: "der wichtigste Kanal ohne Website" },
              { value: "qr", label: "QR-Code / Kurzlink", hint: "fürs Servicefahrzeug, Rechnung, Theke" },
            ]} />
        </Field>
      ) : null}

      {draft.wizard?.distribution === "embed" ? (
        <Field label="Wer baut es in die Website ein?">
          <RadioGroup value={draft.wizard?.embedBy} onChange={(val) => update((d) => ({ ...d, wizard: { ...d.wizard, embedBy: val } }))}
            options={[{ value: "intern", label: "Wir intern (wir haben Zugriff)" }, { value: "agentur", label: "Unsere Web-Agentur" }]} />
        </Field>
      ) : null}

      <a href={`/start/${pf.branding.companyName ? "" : ""}`} onClick={(e) => e.preventDefault()} className="block rounded-lg border border-dashed border-white/20 px-3 py-2 text-center text-sm text-slate-300">
        👁 Ihr gebrandetes Formular ansehen (Vorschau)
      </a>
      <NotesField value={draft.notes?.website ?? ""} onChange={(val) => update((d) => ({ ...d, notes: { ...d.notes, website: val } }))} />
    </Detail>
  );
}

// ── Leitsystem-Knoten (Settings) ─────────────────────────────────────────────
function SystemNode({ pf, draft, brandColor, update, onDone, onBack }: {
  pf: CockpitSession["prefill"]; draft: CockpitDraft; brandColor: string;
  update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onDone: () => void; onBack: () => void;
}) {
  const staff = draft.staff ?? [];
  const setStaff = (next: StaffMember[]) => update((d) => ({ ...d, staff: next }));
  const sms = draft.review?.smsContent ?? "";
  return (
    <Detail icon="◆" title="Ihr Leitsystem — Einstellungen" claim="Marke, Team, Benachrichtigungen und Bewertungen — das Herz Ihres Systems." onBack={onBack} onDone={onDone} doneLabel="Einstellungen bestätigen">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ihre Farbe">
          <div className="flex items-center gap-2">
            <input type="color" value={brandColor} onChange={(e) => update((d) => ({ ...d, branding: { ...d.branding, brandColor: e.target.value } }))} className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-transparent" />
            <TextInput value={brandColor} onChange={(e) => update((d) => ({ ...d, branding: { ...d.branding, brandColor: e.target.value } }))} />
          </div>
        </Field>
        <Field label="Fall-Kürzel" hint="z. B. DA-0042">
          <TextInput maxLength={4} value={draft.branding?.caseIdPrefix ?? pf.branding.caseIdPrefix} onChange={(e) => update((d) => ({ ...d, branding: { ...d.branding, caseIdPrefix: e.target.value.toUpperCase() } }))} />
        </Field>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-200">Team & Rollen</p>
        <p className="mt-0.5 text-xs text-slate-400">Leitung sieht alle Fälle, Techniker nur die eigenen.{pf.hints.dummyStaffNames.length ? " (Demo-Namen werden nicht übernommen.)" : ""}</p>
        <div className="mt-2 space-y-2">
          {staff.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <TextInput placeholder="Name" value={s.name} onChange={(e) => setStaff(staff.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
              <select value={s.role} onChange={(e) => setStaff(staff.map((x, j) => j === i ? { ...x, role: e.target.value as StaffMember["role"] } : x))} className={`${inputCls} w-auto`}>
                <option value="admin">Leitung</option><option value="techniker">Techniker</option>
              </select>
              <button type="button" onClick={() => setStaff(staff.filter((_, j) => j !== i))} className="px-2 text-slate-400 hover:text-white">✕</button>
              <div className="col-span-3"><TextInput type="email" placeholder="E-Mail" value={s.email} onChange={(e) => setStaff(staff.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} /></div>
            </div>
          ))}
          <button type="button" onClick={() => setStaff([...staff, { name: "", role: staff.length === 0 ? "admin" : "techniker", email: "" }])} className="rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-slate-300 hover:border-white/40">+ Mitarbeiter hinzufügen</button>
        </div>
      </div>

      <Field label="Wohin sollen neue Fälle gemeldet werden?" hint="Ihre echte Geschäfts-E-Mail (nicht aus dem Demo).">
        <TextInput type="email" placeholder={pf.hints.crawledEmail ?? "ihre@firma.ch"} value={draft.review?.notificationEmail ?? ""} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, notificationEmail: e.target.value } }))} />
      </Field>
      <Toggle on={!!draft.review?.notifyMessagesByEmail} onChange={(on) => update((d) => ({ ...d, review: { ...d.review, notifyMessagesByEmail: on } }))} label="Auch Rückruf-Nachrichten zusätzlich per E-Mail melden" />

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold text-white">⭐ Bewertungen — Ihre Aussenwirkung</p>
        <p className="mt-1 text-xs text-slate-400">Aus zufriedenen Kunden werden mit einem Klick öffentliche 5-Sterne-Bewertungen — das stärkste Signal für neue Aufträge.</p>
        <div className="mt-3 space-y-3">
          <Field label="Ihr Google-Bewertungslink" hint="Google-Unternehmensprofil → Rezensionen → „Rezensionen erhalten“ → Link kopieren. Unsicher? Tragen Sie hier Ihren Firmennamen ein, wir finden ihn.">
            <TextInput placeholder="https://g.page/r/… oder Firmenname" value={draft.review?.googleReviewUrl ?? ""} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, googleReviewUrl: e.target.value } }))} />
          </Field>
          <Field label={`SMS-Absender (max. 11 Zeichen)`}>
            <TextInput maxLength={11} value={draft.review?.smsSenderName ?? pf.review.smsSenderName} onChange={(e) => update((d) => ({ ...d, review: { ...d.review, smsSenderName: e.target.value } }))} />
          </Field>
          <Field label={`SMS-Text (optional anpassen)`} hint={`${sms.length}/160 Zeichen · leer = unser bewährter Standard`}>
            <TextArea maxLength={160} value={sms} placeholder="Leer lassen für Standard-Text" onChange={(e) => update((d) => ({ ...d, review: { ...d.review, smsContent: e.target.value.slice(0, 160) } }))} />
          </Field>
        </div>
      </div>
      <NotesField value={draft.notes?.system ?? ""} onChange={(val) => update((d) => ({ ...d, notes: { ...d.notes, system: val } }))} />
    </Detail>
  );
}

// ── Freigabe ─────────────────────────────────────────────────────────────────
const MISSING_LABEL: Record<string, string> = {
  staff: "Mindestens ein Mitarbeiter (mit E-Mail)", staff_admin: "Eine Person als Leitung",
  notification_email: "Geschäfts-E-Mail für neue Fälle", google_review_url: "Google-Bewertungslink",
  admin_email: "Login-E-Mail", avv: "AVV akzeptieren", greeting: "Begrüssung für Lisa", wizard_distribution: "Wo das Meldeformular lebt",
};

function Freigabe({ token, draft, update, onBack, companyName }: {
  token: string; draft: CockpitDraft; update: (fn: (d: CockpitDraft) => CockpitDraft) => void; onBack: () => void; companyName: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [missing, setMissing] = useState<string[]>([]);
  const submit = async () => {
    setState("sending"); setMissing([]);
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
        <p className="text-sm text-slate-300">Sie haben {companyName} aufgebaut. Gunnar schaut es kurz durch und meldet sich — dann gehen Sie live. Nichts ist verloren.</p>
      </Detail>
    );
  }
  return (
    <Detail icon="🚀" title="Zugang & Freigabe" claim="Der letzte Schritt — danach schaut Gunnar drüber und Sie gehen gemeinsam live." onBack={onBack}>
      <Field label="Ihre E-Mail für den Login" hint="Damit melden Sie sich im Leitsystem an (Code per E-Mail).">
        <TextInput type="email" placeholder="ihre@firma.ch" value={draft.golive?.adminEmail ?? ""} onChange={(e) => update((d) => ({ ...d, golive: { ...d.golive, adminEmail: e.target.value } }))} />
      </Field>
      <button type="button" onClick={() => update((d) => ({ ...d, golive: { ...d.golive, avvAccepted: !d.golive?.avvAccepted } }))}
        className="flex w-full items-start gap-3 rounded-lg border bg-white/5 px-3 py-3 text-left" style={{ borderColor: draft.golive?.avvAccepted ? GOLD : "rgba(255,255,255,0.12)" }}>
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs" style={{ borderColor: draft.golive?.avvAccepted ? GOLD : "rgba(255,255,255,0.3)", backgroundColor: draft.golive?.avvAccepted ? GOLD : "transparent", color: "#1a1a1a" }}>{draft.golive?.avvAccepted ? "✓" : ""}</span>
        <span className="text-sm text-slate-200">Ich akzeptiere die <span className="underline">Auftragsdaten­verarbeitungs-Vereinbarung (AVV)</span>. Schweizer Datenschutz (revDSG), Server in Frankfurt, keine Gesprächsaufnahmen.</span>
      </button>

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
