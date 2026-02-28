"use client";

import { useState, type FormEvent, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { value: "Verstopfung", label: "Verstopfung", icon: <IconDrain />, hint: "Abfluss, WC, Leitung" },
  { value: "Leck", label: "Leck", icon: <IconDrop />, hint: "Tropft, feucht, nass" },
  { value: "Heizung", label: "Heizung", icon: <IconFlame />, hint: "Kalt, Ausfall, Störung" },
  { value: "Boiler", label: "Boiler", icon: <IconThermo />, hint: "Warmwasser, Speicher" },
  { value: "Rohrbruch", label: "Rohrbruch", icon: <IconBurst />, hint: "Akut, Wasseraustritt" },
  { value: "Sanitär allgemein", label: "Allgemein", icon: <IconWrench />, hint: "Sonstiges Anliegen" },
] as const;

const URGENCIES = [
  { value: "notfall", label: "Notfall", hint: "Sofort — Wasser läuft, Gefahr", color: "red" },
  { value: "dringend", label: "Dringend", hint: "Heute/morgen — funktioniert nicht", color: "amber" },
  { value: "normal", label: "Normal", hint: "Kann eingeplant werden", color: "blue" },
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiSuccess {
  id: string;
  tenant_id: string;
  source: string;
  urgency: string;
  category: string;
  city: string;
  created_at: string;
}

interface ApiError {
  error: string;
  missing_fields?: string[];
  allowed_values?: Record<string, string[]>;
}

type PageState =
  | { status: "form" }
  | { status: "submitting" }
  | { status: "success"; data: ApiSuccess }
  | { status: "error"; detail: ApiError };

// ---------------------------------------------------------------------------
// Icons (inline SVG, no deps)
// ---------------------------------------------------------------------------

function IconDrain() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
      <path d="M8 16c1-1 2.5-1.5 4-1.5s3 .5 4 1.5" />
    </svg>
  );
}
function IconDrop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path d="M12 3c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" />
    </svg>
  );
}
function IconFlame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path d="M12 2c0 4-4 6-4 10a4 4 0 0 0 8 0c0-4-4-6-4-10z" />
      <path d="M12 18a2 2 0 0 1-2-2c0-1 2-3 2-3s2 2 2 3a2 2 0 0 1-2 2z" />
    </svg>
  );
}
function IconThermo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path d="M14 14.76V3.5a2.5 2.5 0 1 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}
function IconBurst() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path d="M4 14h3l2-4 3 8 3-8 2 4h3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}
function IconWrench() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                active
                  ? "bg-white text-slate-900 shadow-lg shadow-white/20"
                  : done
                    ? "bg-emerald-500/80 text-white"
                    : "bg-white/10 text-white/40"
              }`}
            >
              {done ? <IconCheck /> : step}
            </div>
            {step < total && (
              <div className={`h-px w-8 ${done ? "bg-emerald-500/60" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-xl border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
        selected
          ? "border-white/40 bg-white/15 shadow-lg shadow-white/5"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function WizardForm({ initialCategory, tenantSlug }: { initialCategory?: string; tenantSlug?: string }) {
  const [step, setStep] = useState(1);
  const [pageState, setPageState] = useState<PageState>({ status: "form" });

  // Form data
  const [category, setCategory] = useState(initialCategory ?? "");
  const [urgency, setUrgency] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [plz, setPlz] = useState("");
  const [city, setCity] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");

  // Step validation
  const step1Valid = category !== "" && urgency !== "";
  const step2Valid = street.trim().length > 0 && houseNumber.trim().length > 0 && plz.trim().length > 0 && city.trim().length > 0;
  const hasContact = contactPhone.trim().length > 0 || contactEmail.trim().length > 0;
  const step3Valid = hasContact && description.trim().length > 0;

  function goNext() {
    if (step < 3) setStep(step + 1);
  }
  function goBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPageState({ status: "submitting" });

    const body: Record<string, string> = {
      source: "wizard",
      street: street.trim(),
      house_number: houseNumber.trim(),
      plz: plz.trim(),
      city: city.trim(),
      category,
      urgency,
      description: description.trim(),
    };
    if (contactPhone.trim()) body.contact_phone = contactPhone.trim();
    if (contactEmail.trim()) body.contact_email = contactEmail.trim();
    if (tenantSlug) body.tenant_slug = tenantSlug;

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.status === 201) {
        setPageState({ status: "success", data: json as ApiSuccess });
      } else {
        setPageState({ status: "error", detail: json as ApiError });
      }
    } catch {
      setPageState({
        status: "error",
        detail: { error: "Netzwerkfehler. Bitte erneut versuchen." },
      });
    }
  }

  function reset() {
    setStep(1);
    setPageState({ status: "form" });
    setCategory(initialCategory ?? "");
    setUrgency("");
    setStreet("");
    setHouseNumber("");
    setPlz("");
    setCity("");
    setContactPhone("");
    setContactEmail("");
    setDescription("");
  }

  // ── Success ────────────────────────────────────────────────────────
  if (pageState.status === "success") {
    const urgLabel = URGENCIES.find((u) => u.value === urgency)?.label ?? urgency;
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="mb-1 text-2xl font-semibold text-white">Meldung aufgenommen</h1>
          <p className="text-white/60">Vielen Dank — wir kümmern uns darum.</p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-white/50">Fall-Nr.</span>
              <span className="font-mono text-white/80">{pageState.data.id.slice(0, 8)}…</span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-white/50">Kategorie</span>
              <span className="text-white/80">{category}</span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-white/50">Dringlichkeit</span>
              <span className="text-white/80">{urgLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Ort</span>
              <span className="text-white/80">{plz} {city}</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/50">
            <p className="font-medium text-white/70">Nächster Schritt</p>
            <p className="mt-1">Wir melden uns schnellstmöglich bei Ihnen.</p>
            {urgency === "notfall" && (
              <p className="mt-1 text-amber-400/80">Notfälle werden sofort priorisiert.</p>
            )}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Neue Meldung erstellen
          </button>
        </div>
      </Shell>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────
  return (
    <Shell>
      <h1 className="mb-1 text-center text-2xl font-semibold text-white">Schadensmeldung</h1>
      <p className="mb-8 text-center text-sm text-white/50">
        Beschreiben Sie Ihr Anliegen in 3 kurzen Schritten.
      </p>

      <StepIndicator current={step} total={3} />

      <form onSubmit={handleSubmit}>
        {/* ── Step 1: Problem ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <StepLabel>Kategorie</StepLabel>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <Card key={c.value} selected={category === c.value} onClick={() => setCategory(c.value)}>
                    <div className={`mb-1 ${category === c.value ? "text-white" : "text-white/50"}`}>
                      {c.icon}
                    </div>
                    <div className={`text-sm font-medium ${category === c.value ? "text-white" : "text-white/80"}`}>
                      {c.label}
                    </div>
                    <div className="text-xs text-white/40">{c.hint}</div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <StepLabel>Dringlichkeit</StepLabel>
              <div className="grid grid-cols-3 gap-3">
                {URGENCIES.map((u) => {
                  const sel = urgency === u.value;
                  const accent =
                    u.color === "red"
                      ? sel ? "border-red-400/60 bg-red-500/15" : ""
                      : u.color === "amber"
                        ? sel ? "border-amber-400/60 bg-amber-500/15" : ""
                        : sel ? "border-blue-400/60 bg-blue-500/15" : "";
                  return (
                    <Card key={u.value} selected={sel} onClick={() => setUrgency(u.value)}>
                      <div className={`text-sm font-semibold ${sel ? "text-white" : "text-white/80"} ${accent ? "" : ""}`}>
                        {u.label}
                      </div>
                      <div className="mt-0.5 text-xs text-white/40">{u.hint}</div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <NavButtons onNext={goNext} nextDisabled={!step1Valid} />
          </div>
        )}

        {/* ── Step 2: Ort ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <StepLabel>Einsatzort</StepLabel>
              <p className="mb-4 text-xs text-white/40">Adresse, PLZ und Ort werden für die Einsatzplanung benötigt.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <FieldLabel htmlFor="street">Strasse</FieldLabel>
                    <Input id="street" type="text" required value={street} onChange={setStreet} placeholder="Bahnhofstrasse" />
                  </div>
                  <div>
                    <FieldLabel htmlFor="house_number">Nr.</FieldLabel>
                    <Input id="house_number" type="text" required value={houseNumber} onChange={setHouseNumber} placeholder="12a" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <FieldLabel htmlFor="plz">PLZ</FieldLabel>
                    <Input id="plz" type="text" required value={plz} onChange={setPlz} placeholder="8000" maxLength={5} />
                  </div>
                  <div className="col-span-2">
                    <FieldLabel htmlFor="city">Ort</FieldLabel>
                    <Input id="city" type="text" required value={city} onChange={setCity} placeholder="Zürich" />
                  </div>
                </div>
              </div>
            </div>
            <NavButtons onBack={goBack} onNext={goNext} nextDisabled={!step2Valid} />
          </div>
        )}

        {/* ── Step 3: Kontakt + Beschreibung ───────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <StepLabel>Kontaktdaten</StepLabel>
              <p className="mb-4 text-xs text-white/40">Mindestens Telefon oder E-Mail angeben.</p>
              <div className="space-y-3">
                <div>
                  <FieldLabel htmlFor="phone">Telefon</FieldLabel>
                  <Input id="phone" type="tel" value={contactPhone} onChange={setContactPhone} placeholder="+41 79 123 45 67" />
                </div>
                <div>
                  <FieldLabel htmlFor="email">E-Mail</FieldLabel>
                  <Input id="email" type="email" value={contactEmail} onChange={setContactEmail} placeholder="name@beispiel.ch" />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="desc">Beschreibung</FieldLabel>
              <textarea
                id="desc"
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreiben Sie das Problem kurz…"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
              />
            </div>

            {/* Review summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Zusammenfassung</p>
              <div className="grid grid-cols-2 gap-y-1.5 text-white/70">
                <span className="text-white/40">Kategorie</span>
                <span>{category || "—"}</span>
                <span className="text-white/40">Dringlichkeit</span>
                <span>{URGENCIES.find((u) => u.value === urgency)?.label || "—"}</span>
                <span className="text-white/40">Adresse</span>
                <span>{street && houseNumber ? `${street} ${houseNumber}` : "\u2014"}</span>
                <span className="text-white/40">Ort</span>
                <span>{plz && city ? `${plz} ${city}` : "\u2014"}</span>
                <span className="text-white/40">Kontakt</span>
                <span>{contactPhone ? `${contactPhone.slice(0, 7)}…` : contactEmail ? `${contactEmail.split("@")[0].slice(0, 4)}…@${contactEmail.split("@")[1]}` : "—"}</span>
              </div>
            </div>

            {/* Error */}
            {pageState.status === "error" && (
              <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                <p className="font-medium">{pageState.detail.error}</p>
                {pageState.detail.missing_fields && pageState.detail.missing_fields.length > 0 && (
                  <p className="mt-1 text-red-300/70">
                    Fehlende Felder: {pageState.detail.missing_fields.join(", ")}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={!step3Valid || pageState.status === "submitting"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:opacity-40"
                >
                  {pageState.status === "submitting" ? (
                    <>
                      <Spinner /> Wird gesendet…
                    </>
                  ) : (
                    "Meldung absenden"
                  )}
                </button>
              </div>

              {/* Trust copy */}
              <div className="space-y-1 text-center text-xs text-white/30">
                <p>Wir melden uns i.d.R. schnellstmöglich.</p>
                <p>Keine Aufzeichnung · Daten nur zur Bearbeitung Ihres Anliegens</p>
                {urgency === "notfall" && (
                  <p className="text-amber-400/60">Notfälle werden sofort priorisiert.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Shared UI primitives
// ---------------------------------------------------------------------------

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />
      <div className="relative mx-auto max-w-xl px-4 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
}

function StepLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm font-medium uppercase tracking-wider text-white/50">{children}</p>;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-white/70">
      {children}
    </label>
  );
}

function Input({
  id,
  type,
  required,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      id={id}
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
    />
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Zurück
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:opacity-40"
        >
          Weiter
        </button>
      )}
    </div>
  );
}
