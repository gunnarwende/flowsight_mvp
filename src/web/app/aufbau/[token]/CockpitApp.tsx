"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
 * Onboarding-Cockpit Co-Pilot (Phase 2, OC6) — der interaktive Client.
 * „Sie bauen Ihr System, wir führen Sie." confirm-not-create: die Felder sind
 * aus tenant_config vorbefüllt; der Betrieb bestätigt/feilt + ergänzt die
 * 🆕-Felder (echte Staff, Mails, Review-Link, Dispositionen). Autosave pro
 * Strang in `draft` (nie live — Go-live ist der separate Founder-Promote).
 * Reihenfolge: phase2_cockpit_structure.md (klein anfangen, groß enden).
 */

const NAVY = "#1e3a5f";
const GOLD = "#c8a24a";

// Die sechs „Fähigkeits"-Stränge (treiben das Fortschritts-Band). „finale" zählt nicht.
const STEPS = ["quickwin", "voice", "website", "vorort", "notify", "golive"] as const;
type StepKey = (typeof STEPS)[number];

// ── kleine UI-Bausteine ─────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-slate-400">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#c8a24a] focus:outline-none";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-[64px] resize-y leading-relaxed`} />;
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200"
    >
      <span>{label}</span>
      <span
        className="relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors"
        style={{ backgroundColor: on ? GOLD : "rgba(255,255,255,0.2)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
          style={{ left: on ? "1.125rem" : "0.125rem" }}
        />
      </span>
    </button>
  );
}

function RadioGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="flex w-full items-start gap-3 rounded-lg border bg-white/5 px-3 py-2 text-left"
            style={{ borderColor: active ? GOLD : "rgba(255,255,255,0.12)" }}
          >
            <span
              className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border"
              style={{ borderColor: active ? GOLD : "rgba(255,255,255,0.3)", backgroundColor: active ? GOLD : "transparent" }}
            />
            <span>
              <span className="block text-sm text-white">{o.label}</span>
              {o.hint ? <span className="block text-xs text-slate-400">{o.hint}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Hauptkomponente ─────────────────────────────────────────────────────────

export function CockpitApp({ session }: { session: CockpitSession }) {
  const { token, prefill } = session;
  const pf = prefill;

  // Effektiver Startwert = bereits gespeicherter Draft, sonst Vorbefüllung.
  const initDraft = session.draft ?? {};
  const [draft, setDraft] = useState<CockpitDraft>(() => ({
    branding: {
      brandColor: initDraft.branding?.brandColor ?? pf.branding.brandColor,
      caseIdPrefix: initDraft.branding?.caseIdPrefix ?? pf.branding.caseIdPrefix,
    },
    staff: initDraft.staff ?? [],
    voice: {
      greetingText: initDraft.voice?.greetingText ?? pf.voice.greetingSuggestion,
      kiDisclosure: initDraft.voice?.kiDisclosure ?? "",
      languages: initDraft.voice?.languages ?? pf.voice.languagesDefault,
      wissen: initDraft.voice?.wissen ?? {},
      dispositions: initDraft.voice?.dispositions ?? DISPOSITION_DEFAULTS,
      pickup: initDraft.voice?.pickup,
      notfallAlarm: initDraft.voice?.notfallAlarm ?? "push",
    },
    wizard: {
      categories: initDraft.wizard?.categories ?? pf.wizard.categories,
      distribution: initDraft.wizard?.distribution,
      replaceOldForm: initDraft.wizard?.replaceOldForm,
    },
    review: {
      notificationEmail: initDraft.review?.notificationEmail ?? "",
      googleReviewUrl: initDraft.review?.googleReviewUrl ?? "",
      smsSenderName: initDraft.review?.smsSenderName ?? pf.review.smsSenderName,
      chips: initDraft.review?.chips ?? pf.review.chipsDefault,
    },
    golive: {
      adminEmail: initDraft.golive?.adminEmail ?? "",
      avvAccepted: initDraft.golive?.avvAccepted ?? false,
    },
    stepDone: initDraft.stepDone ?? {},
  }));

  const [progress, setProgress] = useState<Record<string, boolean>>(session.progress ?? {});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Autosave (debounced, pro Strang) ──────────────────────────────────────
  const draftKeysForStep: Record<StepKey, (keyof CockpitDraft)[]> = useMemo(
    () => ({
      quickwin: ["branding", "staff"],
      voice: ["voice"],
      website: ["wizard"],
      vorort: [],
      notify: ["review"],
      golive: ["golive"],
    }),
    [],
  );

  const buildPatch = useCallback(
    (step: StepKey, d: CockpitDraft): CockpitDraft => {
      const patch: CockpitDraft = {};
      for (const k of draftKeysForStep[step]) {
        // @ts-expect-error — key-weiser Übertrag, Typen sind kompatibel
        patch[k] = d[k];
      }
      return patch;
    },
    [draftKeysForStep],
  );

  const post = useCallback(
    async (draftPatch: CockpitDraft, progressPatch?: Record<string, boolean>) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/aufbau/${token}/save`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ draftPatch, progressPatch }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        if (json.progress) setProgress(json.progress);
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    },
    [token],
  );

  // Debounce-Speichern: bei jeder Draft-Änderung den betroffenen Strang sichern.
  const dirtyStep = useRef<StepKey | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(
    (step: StepKey) => {
      dirtyStep.current = step;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (dirtyStep.current) post(buildPatch(dirtyStep.current, draftRef.current));
      }, 900);
    },
    [post, buildPatch],
  );

  // immer den aktuellsten Draft im Timer sehen
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Strang explizit abschliessen ("weiter"): sofort speichern + Fortschritt setzen.
  const completeStep = useCallback(
    (step: StepKey) => {
      const next = { ...draftRef.current, stepDone: { ...draftRef.current.stepDone, [step]: true } };
      setDraft(next);
      post(buildPatch(step, next), { [step]: true });
    },
    [post, buildPatch],
  );

  // Generischer Setter, der gleichzeitig Autosave triggert.
  const patchDraft = useCallback(
    (step: StepKey, updater: (d: CockpitDraft) => CockpitDraft) => {
      setDraft((prev) => updater(prev));
      scheduleSave(step);
    },
    [scheduleSave],
  );

  const doneCount = STEPS.filter((s) => progress[s]).length;

  return (
    <div className="flex min-h-dvh flex-col" style={{ backgroundColor: "#0b1f33", color: "#e8eef5" }}>
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-7 sm:py-12">
        {/* Eröffnung */}
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
            Ihr Leitsystem
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Bauen wir {session.company_name} auf
          </h1>
          <p className="mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-slate-300">
            Ich habe <span style={{ color: GOLD }}>80&nbsp;%</span> schon vorbereitet — Sie ergänzen
            die 20&nbsp;%, die nur Sie kennen. Kein IT-Wissen. Es speichert automatisch, Sie können
            jederzeit pausieren. <span className="text-slate-400">Nichts ist scharf, bis Sie es freigeben.</span>
          </p>
        </header>

        {/* Fortschritts-Band: gewonnene Fähigkeiten */}
        <div className="mx-auto mt-7 max-w-[560px] rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ihr System wächst</span>
            <span style={{ color: GOLD }}>{doneCount} von {STEPS.length} startklar</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(6, (doneCount / STEPS.length) * 100)}%`, backgroundColor: GOLD }}
            />
          </div>
          <SaveIndicator state={saveState} />
        </div>

        <div className="mt-9 space-y-4">
          <QuickWinSection pf={pf} draft={draft} done={!!progress.quickwin} onChange={patchDraft} onComplete={completeStep} />
          <VoiceSection pf={pf} draft={draft} done={!!progress.voice} token={token} onChange={patchDraft} onComplete={completeStep} />
          <WebsiteSection pf={pf} draft={draft} done={!!progress.website} onChange={patchDraft} onComplete={completeStep} />
          <VorOrtSection done={!!progress.vorort} onComplete={completeStep} />
          <NotifySection pf={pf} draft={draft} done={!!progress.notify} onChange={patchDraft} onComplete={completeStep} />
          <GoliveSection draft={draft} done={!!progress.golive} onChange={patchDraft} onComplete={completeStep} />
        </div>

        <FinaleSection token={token} companyName={session.company_name} progress={progress} />
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">FlowSight · Oberrieden</footer>
    </div>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const map = {
    saving: { t: "Speichert …", c: "#94a3b8" },
    saved: { t: "Gespeichert ✓", c: "#86c79a" },
    error: { t: "Speichern fehlgeschlagen — erneut versuchen", c: "#e2a0a0" },
  } as const;
  const m = map[state];
  return <p className="mt-2 text-right text-[11px]" style={{ color: m.c }}>{m.t}</p>;
}

// ── Strang-Karte (Wrapper) ──────────────────────────────────────────────────

function Strang({
  n,
  title,
  unter,
  done,
  children,
  ctaLabel = "Weiter",
  onComplete,
  completable = true,
}: {
  n: number | string;
  title: string;
  unter: string;
  done: boolean;
  children: React.ReactNode;
  ctaLabel?: string;
  onComplete?: () => void;
  completable?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: done ? `${GOLD}33` : "rgba(255,255,255,0.08)", color: done ? GOLD : "#cbd5e1" }}
        >
          {done ? "✓ startklar" : `Schritt ${n}`}
        </span>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-slate-300">{unter}</p>
      <div className="mt-4 space-y-4">{children}</div>
      {completable && onComplete ? (
        <button
          type="button"
          onClick={onComplete}
          className="mt-5 rounded-xl px-5 py-2.5 text-sm font-bold"
          style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
        >
          {done ? "Gespeichert ✓ · erneut bestätigen" : ctaLabel}
        </button>
      ) : null}
    </section>
  );
}

// ── 1 · Quick-Win: Leitsystem-Look ──────────────────────────────────────────

function QuickWinSection({
  pf,
  draft,
  done,
  onChange,
  onComplete,
}: SectionProps) {
  const staff = draft.staff ?? [];
  const setStaff = (next: StaffMember[]) => onChange("quickwin", (d) => ({ ...d, staff: next }));
  return (
    <Strang n={1} title="Ihr Leitsystem-Look" unter="Ihre Farbe, Ihr Kürzel, Ihr Team — sofort sichtbar." done={done} onComplete={() => onComplete("quickwin")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ihre Farbe" hint="Buttons, Kalender, Akzente im Leitsystem">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draft.branding?.brandColor ?? pf.branding.brandColor}
              onChange={(e) => onChange("quickwin", (d) => ({ ...d, branding: { ...d.branding, brandColor: e.target.value } }))}
              className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-transparent"
            />
            <TextInput
              value={draft.branding?.brandColor ?? pf.branding.brandColor}
              onChange={(e) => onChange("quickwin", (d) => ({ ...d, branding: { ...d.branding, brandColor: e.target.value } }))}
            />
          </div>
        </Field>
        <Field label="Fall-Kürzel" hint="Vor jeder Fall-Nummer, z. B. DA-0042">
          <TextInput
            maxLength={4}
            value={draft.branding?.caseIdPrefix ?? pf.branding.caseIdPrefix}
            onChange={(e) => onChange("quickwin", (d) => ({ ...d, branding: { ...d.branding, caseIdPrefix: e.target.value.toUpperCase() } }))}
          />
        </Field>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-200">Ihr Team</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Wer sieht die Fälle? Tragen Sie Ihre <span className="text-slate-200">echten</span> Mitarbeiter ein.
          {pf.hints.dummyStaffNames.length ? " (Die Beispielnamen aus dem Demo-Video werden nicht übernommen.)" : ""}
        </p>
        <div className="mt-3 space-y-2">
          {staff.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
              <TextInput
                placeholder="Name"
                value={s.name}
                onChange={(e) => setStaff(staff.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <select
                value={s.role}
                onChange={(e) => setStaff(staff.map((x, j) => (j === i ? { ...x, role: e.target.value as StaffMember["role"] } : x)))}
                className={`${inputCls} w-auto`}
              >
                <option value="admin">Leitung</option>
                <option value="techniker">Techniker</option>
              </select>
              <button type="button" onClick={() => setStaff(staff.filter((_, j) => j !== i))} className="px-2 text-slate-400 hover:text-white" aria-label="entfernen">✕</button>
              <div className="col-span-3">
                <TextInput
                  type="email"
                  placeholder="E-Mail (für Benachrichtigungen)"
                  value={s.email}
                  onChange={(e) => setStaff(staff.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setStaff([...staff, { name: "", role: staff.length === 0 ? "admin" : "techniker", email: "" }])}
            className="rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-slate-300 hover:border-white/40"
          >
            + Mitarbeiter hinzufügen
          </button>
        </div>
      </div>
    </Strang>
  );
}

// ── 2 · Voice: Ihre Lisa ─────────────────────────────────────────────────────

const WISSEN_FIELDS: { key: keyof CockpitSession["prefill"]["voice"]["wissen"]; label: string }[] = [
  { key: "openingHours", label: "Öffnungszeiten" },
  { key: "serviceArea", label: "Einzugsgebiet" },
  { key: "servicesList", label: "Leistungen" },
  { key: "emergencyPolicy", label: "Notfall-Regelung" },
  { key: "priceDeflect", label: "Antwort auf Preisfragen" },
  { key: "memberships", label: "Mitgliedschaften" },
  { key: "jobsSpoken", label: "Antwort auf Bewerbungen" },
];

const DISPOSITION_CARDS: { key: keyof DispositionsConfig; titel: string; szenario: string; ergebnis: string }[] = [
  { key: "d1_auftrag", titel: "Neuer Auftrag", szenario: "Jemand meldet einen Schaden / will einen Termin.", ergebnis: "→ Fall im Leitsystem. Bei Notfall sofort eine Meldung an Sie." },
  { key: "d2_info", titel: "Reine Info-Frage", szenario: "„Wann habt ihr offen?\" — nur eine Auskunft.", ergebnis: "→ Lisa beantwortet, kein Fall. Riecht es nach Auftrag/Offerte → Lisa nimmt Kontakt auf (Fall)." },
  { key: "d3_rueckruf", titel: "Rückruf / Lieferant / „den Chef\"", szenario: "Will mit Ihnen persönlich sprechen.", ergebnis: "→ Nachricht mit Rückruf-Flag, kein Auftrag." },
  { key: "d4_nachfrage", titel: "Nachfrage zu laufendem Auftrag", szenario: "„Wo bleibt der Techniker?\"", ergebnis: "→ Lisa sagt ehrlich „kein Zugriff\", nimmt Nachricht auf. Kein Doppel-Fall." },
  { key: "d5_reklamation", titel: "Reklamation", szenario: "Beschwerde über eine Arbeit.", ergebnis: "→ Fall, hohe Priorität, sofort eine Meldung an Sie. Lisa verspricht nichts." },
  { key: "d6_privat", titel: "Privat / Werbung / falsch verbunden", szenario: "Nicht-geschäftlich.", ergebnis: "→ freundlich tschüss, kein Fall." },
];

function VoiceSection({ pf, draft, done, token, onChange, onComplete }: SectionProps & { token: string }) {
  const [showWissen, setShowWissen] = useState(false);
  const [testPhase, setTestPhase] = useState<TestCallPhase>("idle");
  const v = draft.voice ?? {};
  const disp = v.dispositions ?? DISPOSITION_DEFAULTS;

  const setDisp = (key: keyof DispositionsConfig, patch: Partial<DispositionsConfig[typeof key]>) =>
    onChange("voice", (d) => ({
      ...d,
      voice: { ...d.voice, dispositions: { ...(d.voice?.dispositions ?? DISPOSITION_DEFAULTS), [key]: { ...(d.voice?.dispositions ?? DISPOSITION_DEFAULTS)[key], ...patch } } },
    }));

  const runTest = async () => {
    await startLisaTestCall(token, setTestPhase);
  };

  return (
    <Strang n={2} title="Ihre Lisa" unter="Wie Lisa rangeht — und was sie bei welchem Anruf tut. Der grösste Strang." done={done} onComplete={() => onComplete("voice")}>
      {/* Begrüssung */}
      <Field label="Begrüssung" hint="So meldet sich Lisa. Bitte so, dass klar ist: hier spricht eine digitale Assistentin.">
        <TextArea
          value={v.greetingText ?? pf.voice.greetingSuggestion}
          onChange={(e) => onChange("voice", (d) => ({ ...d, voice: { ...d.voice, greetingText: e.target.value } }))}
        />
      </Field>
      <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
        ℹ️ {pf.voice.kiDisclosureMin}
      </p>

      {/* Das sagt Ihre Lisa (confirm) */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <button type="button" onClick={() => setShowWissen((s) => !s)} className="flex w-full items-center justify-between text-left">
          <span className="text-sm font-medium text-slate-200">Das sagt Ihre Lisa</span>
          <span className="text-xs text-slate-400">{showWissen ? "einklappen" : "ansehen & anpassen"}</span>
        </button>
        <p className="mt-1 text-xs text-slate-400">Aus Ihrer Website vorbereitet — bitte überfliegen und korrigieren, falls etwas nicht stimmt.</p>
        {showWissen ? (
          <div className="mt-3 space-y-3">
            {WISSEN_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <TextArea
                  value={v.wissen?.[f.key] ?? pf.voice.wissen[f.key]}
                  onChange={(e) => onChange("voice", (d) => ({ ...d, voice: { ...d.voice, wissen: { ...d.voice?.wissen, [f.key]: e.target.value } } }))}
                />
              </Field>
            ))}
          </div>
        ) : null}
      </div>

      {/* 7 Dispositionen */}
      <div>
        <p className="text-sm font-medium text-slate-200">Was Lisa bei welchem Anruf tut</p>
        <p className="mt-0.5 text-xs text-slate-400">Wir haben es sinnvoll vorbelegt — Sie bestätigen oder passen an.</p>
        <div className="mt-3 space-y-2">
          {DISPOSITION_CARDS.map((c) => (
            <div key={c.key} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold text-white">{c.titel}</p>
              <p className="text-xs text-slate-400">{c.szenario}</p>
              <p className="mt-1 text-xs text-slate-300">{c.ergebnis}</p>
              {(c.key === "d1_auftrag" || c.key === "d5_reklamation") ? (
                <div className="mt-2">
                  <Toggle
                    on={disp[c.key].notify === "push"}
                    onChange={(on) => setDisp(c.key, { notify: on ? "push" : "board" })}
                    label={c.key === "d1_auftrag" ? "Bei Notfall sofort melden" : "Sofort melden"}
                  />
                </div>
              ) : null}
              {c.key === "d2_info" ? (
                <div className="mt-2">
                  <Toggle
                    on={disp.d2_info.korb === "fall"}
                    onChange={(on) => setDisp("d2_info", { korb: on ? "fall" : "nichts" })}
                    label="Auch reine Infos als Fall festhalten"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Erreichbarkeit / Pickup */}
      <Field label="Wann soll Lisa rangehen?" hint="Daraus ergibt sich später Ihre Weiterleitung (ein kurzer Schritt).">
        <RadioGroup
          value={v.pickup}
          onChange={(val) => onChange("voice", (d) => ({ ...d, voice: { ...d.voice, pickup: val } }))}
          options={[
            { value: "sofort", label: "Sofort", hint: "Lisa nimmt alle Anrufe entgegen" },
            { value: "nach_15s", label: "Nach ~15 Sekunden", hint: "Erst wenn niemand rangeht" },
            { value: "nach_30s", label: "Nach ~30 Sekunden", hint: "Mehr Zeit für Sie selbst" },
          ]}
        />
      </Field>

      {/* Lisa-Testanruf (Beweis-Loop) */}
      <div className="rounded-xl border p-4 text-center" style={{ borderColor: `${GOLD}55`, backgroundColor: NAVY }}>
        <p className="text-sm font-semibold text-white">Hören Sie Ihre Lisa</p>
        <p className="mx-auto mt-1 max-w-[440px] text-xs text-slate-300">
          Rufen Sie jetzt an und erleben Sie, wie Lisa Ihren Betrieb begrüsst. Ein Testfall — er landet nicht in Ihrer echten Liste.
        </p>
        <TestCallButton phase={testPhase} onStart={runTest} />
      </div>
    </Strang>
  );
}

function TestCallButton({ phase, onStart }: { phase: TestCallPhase; onStart: () => void }) {
  const label: Record<TestCallPhase, string> = {
    idle: "📞 Lisa jetzt anrufen",
    connecting: "Verbinde …",
    active: "🔴 Im Gespräch — auflegen über das Telefon-Symbol",
    ended: "Nochmal anrufen",
    error: "Verbindung fehlgeschlagen — nochmal",
  };
  return (
    <button
      type="button"
      onClick={onStart}
      disabled={phase === "connecting" || phase === "active"}
      className="mt-3 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-70"
      style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
    >
      {label[phase]}
    </button>
  );
}

// ── 3 · Website / Wizard ─────────────────────────────────────────────────────

function WebsiteSection({ pf, draft, done, onChange, onComplete }: SectionProps) {
  const cats = draft.wizard?.categories ?? pf.wizard.categories;
  return (
    <Strang n={3} title="Ihr Online-Meldeformular" unter="Welche Anliegen Ihre Kunden online melden — in Ihrem Look." done={done} onComplete={() => onComplete("website")}>
      <Field label="Anliegen-Kategorien" hint="Die ersten drei sind Ihre — die letzten drei sind Standard.">
        <div className="flex flex-wrap gap-2">
          {cats.map((c: WizardCategory) => (
            <span key={c.value} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200">
              {c.label}{c.fixed ? <span className="text-slate-500"> ·fix</span> : null}
            </span>
          ))}
        </div>
      </Field>
      <Field label="Wo soll das Formular leben?" hint="Damit Ihre Kunden es finden.">
        <RadioGroup
          value={draft.wizard?.distribution}
          onChange={(val) => onChange("website", (d) => ({ ...d, wizard: { ...d.wizard, distribution: val } }))}
          options={[
            { value: "gbp_button", label: "Button im Google-Profil", hint: "„Termin anfragen\" direkt bei Google" },
            { value: "link", label: "Einfacher Link", hint: "Den Sie teilen / verschicken können" },
            { value: "embed", label: "In meine Website einbauen", hint: "Als eingebettetes Formular" },
            { value: "agentur_mail", label: "Meine Web-Agentur soll es einbauen", hint: "Wir schicken die fertige Anleitung" },
          ]}
        />
      </Field>
    </Strang>
  );
}

// ── 4 · Vor-Ort ──────────────────────────────────────────────────────────────

function VorOrtSection({ done, onComplete }: { done: boolean; onComplete: (s: StepKey) => void }) {
  return (
    <Strang n={4} title="Vor Ort & manuell" unter="Anliegen, die Sie selbst auf der Baustelle aufnehmen." done={done} ctaLabel="Passt — bestätigen" onComplete={() => onComplete("vorort")}>
      <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
        Sie können jederzeit selbst einen Fall im Leitsystem erfassen — z. B. wenn Sie direkt beim Kunden sind. Nichts weiter einzustellen.
      </p>
    </Strang>
  );
}

// ── 5 · Benachrichtigung & Bewertung ─────────────────────────────────────────

function NotifySection({ pf, draft, done, onChange, onComplete }: SectionProps) {
  return (
    <Strang n={5} title="Benachrichtigung & Bewertung" unter="Wohin neue Fälle gemeldet werden — und wie aus guter Arbeit Bewertungen werden." done={done} onComplete={() => onComplete("notify")}>
      <Field label="Wohin sollen neue Fälle gemeldet werden?" hint="Ihre echte Geschäfts-E-Mail (nicht die aus dem Demo).">
        <TextInput
          type="email"
          placeholder={pf.hints.crawledEmail ?? "ihre@firma.ch"}
          value={draft.review?.notificationEmail ?? ""}
          onChange={(e) => onChange("notify", (d) => ({ ...d, review: { ...d.review, notificationEmail: e.target.value } }))}
        />
      </Field>
      <Field label="Ihr Google-Bewertungslink" hint="Dahin schicken wir zufriedene Kunden mit einem Klick.">
        <TextInput
          placeholder="https://g.page/r/…"
          value={draft.review?.googleReviewUrl ?? ""}
          onChange={(e) => onChange("notify", (d) => ({ ...d, review: { ...d.review, googleReviewUrl: e.target.value } }))}
        />
      </Field>
      <Field label="SMS-Absender" hint="So erscheint der Name in der SMS an Ihre Kunden (max. 11 Zeichen).">
        <TextInput
          maxLength={11}
          value={draft.review?.smsSenderName ?? pf.review.smsSenderName}
          onChange={(e) => onChange("notify", (d) => ({ ...d, review: { ...d.review, smsSenderName: e.target.value } }))}
        />
      </Field>
    </Strang>
  );
}

// ── 6 · Go-live & Recht ──────────────────────────────────────────────────────

function GoliveSection({ draft, done, onChange, onComplete }: Omit<SectionProps, "pf">) {
  return (
    <Strang n={6} title="Zugang & Einverständnis" unter="Ihr Login fürs Leitsystem — und die Datenschutz-Vereinbarung." done={done} onComplete={() => onComplete("golive")}>
      <Field label="Ihre E-Mail für den Login" hint="Damit melden Sie sich später im Leitsystem an (Code per E-Mail).">
        <TextInput
          type="email"
          placeholder="ihre@firma.ch"
          value={draft.golive?.adminEmail ?? ""}
          onChange={(e) => onChange("golive", (d) => ({ ...d, golive: { ...d.golive, adminEmail: e.target.value } }))}
        />
      </Field>
      <button
        type="button"
        onClick={() => onChange("golive", (d) => ({ ...d, golive: { ...d.golive, avvAccepted: !d.golive?.avvAccepted } }))}
        className="flex w-full items-start gap-3 rounded-lg border bg-white/5 px-3 py-3 text-left"
        style={{ borderColor: draft.golive?.avvAccepted ? GOLD : "rgba(255,255,255,0.12)" }}
      >
        <span
          className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs"
          style={{ borderColor: draft.golive?.avvAccepted ? GOLD : "rgba(255,255,255,0.3)", backgroundColor: draft.golive?.avvAccepted ? GOLD : "transparent", color: "#1a1a1a" }}
        >
          {draft.golive?.avvAccepted ? "✓" : ""}
        </span>
        <span className="text-sm text-slate-200">
          Ich akzeptiere die <span className="underline">Auftragsdaten­verarbeitungs-Vereinbarung (AVV)</span>. Schweizer Datenschutz (revDSG), Server in Frankfurt, keine Gesprächsaufnahmen.
        </span>
      </button>
    </Strang>
  );
}

// ── Finale ───────────────────────────────────────────────────────────────────

const MISSING_LABEL: Record<string, string> = {
  staff: "Mindestens ein Mitarbeiter (mit E-Mail)",
  staff_admin: "Eine Person als „Leitung\"",
  notification_email: "Geschäfts-E-Mail für neue Fälle",
  google_review_url: "Google-Bewertungslink",
  admin_email: "Login-E-Mail",
  avv: "AVV akzeptieren",
  greeting: "Begrüssung für Lisa",
  wizard_distribution: "Wo das Meldeformular lebt",
};

function FinaleSection({ token, companyName, progress }: { token: string; companyName: string; progress: Record<string, boolean> }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [missing, setMissing] = useState<string[]>([]);
  const allDone = STEPS.every((s) => progress[s]);

  const submit = async () => {
    setState("sending");
    setMissing([]);
    try {
      const res = await fetch(`/api/aufbau/${token}/submit`, { method: "POST" });
      if (res.status === 422) {
        const j = await res.json();
        setMissing(j.missing ?? []);
        setState("idle");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <section className="mt-10 rounded-2xl border p-6 text-center" style={{ borderColor: `${GOLD}55`, backgroundColor: NAVY }}>
        <h2 className="text-xl font-bold text-white">Geschafft. 🎉</h2>
        <p className="mx-auto mt-2 max-w-[520px] text-sm text-slate-300">
          Sie haben {companyName} aufgebaut. Gunnar schaut es jetzt kurz durch und meldet sich — dann gehen Sie live.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 rounded-2xl border p-6 text-center" style={{ borderColor: `${GOLD}55`, backgroundColor: NAVY }}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Am Ende</p>
      <h2 className="mt-2 text-xl font-bold text-white">Schauen Sie, was Sie gebaut haben</h2>
      <p className="mx-auto mt-2 max-w-[520px] text-sm text-slate-300">
        Ihre Stränge fügen sich zu einem lebenden System: Anruf → Meldung → Fall → Bewertung. Dann schaue ich kurz drüber, und wir gehen gemeinsam live.
      </p>
      {missing.length > 0 ? (
        <div className="mx-auto mt-4 max-w-[440px] rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-left">
          <p className="text-sm font-medium text-amber-200">Fast — es fehlt noch:</p>
          <ul className="mt-1 space-y-0.5 text-sm text-amber-100/90">
            {missing.map((m) => <li key={m}>• {MISSING_LABEL[m] ?? m}</li>)}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={state === "sending"}
        className="mt-5 rounded-xl px-6 py-3 text-sm font-bold disabled:opacity-60"
        style={{ backgroundColor: GOLD, color: "#1a1a1a" }}
      >
        {state === "sending" ? "Senden …" : "An Gunnar zum Freischalten senden"}
      </button>
      {!allDone ? <p className="mt-2 text-[11px] text-slate-400">Tipp: Gehen Sie zuerst alle Stränge oben durch.</p> : null}
      {state === "error" ? <p className="mt-2 text-[11px] text-red-300">Senden fehlgeschlagen — bitte erneut versuchen.</p> : null}
    </section>
  );
}

// ── geteilte Section-Props ───────────────────────────────────────────────────

interface SectionProps {
  pf: CockpitSession["prefill"];
  draft: CockpitDraft;
  done: boolean;
  onChange: (step: StepKey, updater: (d: CockpitDraft) => CockpitDraft) => void;
  onComplete: (step: StepKey) => void;
}
