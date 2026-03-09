"use client";

import { useState, useRef, type FormEvent, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Theme (matches demo page)
// ---------------------------------------------------------------------------
const BRAND = {
  primary: "#0f4c54",
  accent: "#0d7377",
  lightBg: "#f0fafa",
  name: "Brunner Haustechnik AG",
  phone: "044 720 31 42",
  phoneHref: "tel:+41447203142",
} as const;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Top row: dynamic top-3 cases for Brunner */
const TOP_CATEGORIES = [
  { value: "Verstopfung", label: "Verstopfung", icon: <IconDrain />, hint: "Abfluss, WC, Leitung" },
  { value: "Leck", label: "Leck", icon: <IconDrop />, hint: "Tropft, feucht, nass" },
  { value: "Heizung", label: "Heizung", icon: <IconFlame />, hint: "Kalt, Ausfall, Störung" },
] as const;

/** Bottom row: fixed for all wizards */
const FIXED_CATEGORIES = [
  { value: "Allgemein", label: "Allgemein", icon: <IconClipboard />, hint: "Sonstiges Anliegen" },
  { value: "Angebot", label: "Angebot", icon: <IconDocument />, hint: "Offerte, Beratung" },
  { value: "Kontakt", label: "Kontakt", icon: <IconChat />, hint: "Frage, Rückruf" },
] as const;

const ALL_CATEGORIES = [...TOP_CATEGORIES, ...FIXED_CATEGORIES];

const URGENCIES = [
  { value: "notfall", label: "Notfall", hint: "Sofort — Wasser läuft, Gefahr", color: "red" },
  { value: "dringend", label: "Dringend", hint: "Heute/morgen — funktioniert nicht", color: "amber" },
  { value: "normal", label: "Normal", hint: "Kann eingeplant werden", color: "teal" },
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
  verify_token: string;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
// Icons (inline SVG)
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
function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}
function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
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
function StepIndicator({ current, total, onStepClick }: { current: number; total: number; onStepClick?: (step: number) => void }) {
  const labels = ["Anliegen", "Adresse", "Kontakt"];
  return (
    <div className="mb-8 flex items-center justify-center gap-1 sm:gap-2">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        const canClick = done && onStepClick;
        return (
          <div key={step} className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick(step)}
              className={`flex items-center gap-1.5 ${canClick ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  active
                    ? "text-white shadow-lg"
                    : done
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
                style={active ? { backgroundColor: BRAND.accent } : undefined}
              >
                {done ? <IconCheck /> : step}
              </div>
              <span className={`hidden text-xs font-medium sm:block ${active ? "text-gray-900" : done ? "text-emerald-600" : "text-gray-400"}`}>
                {labels[i]}
              </span>
            </button>
            {step < total && (
              <div className={`h-px w-6 sm:w-10 ${done ? "bg-emerald-500" : "bg-gray-200"}`} />
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
      className={`group relative rounded-xl border-2 px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        selected
          ? "border-current bg-[#f0fafa] shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      style={selected ? { borderColor: BRAND.accent, color: BRAND.accent } : undefined}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function BrunnerWizardForm({ initialCategory }: { initialCategory?: string }) {
  const [step, setStep] = useState(1);
  const [pageState, setPageState] = useState<PageState>({ status: "form" });

  // Photo pre-submit state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function goNext() { if (step < 3) setStep(step + 1); }
  function goBack() { if (step > 1) setStep(step - 1); }

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
      tenant_slug: "brunner-haustechnik",
    };
    if (contactPhone.trim()) body.contact_phone = contactPhone.trim();
    if (contactEmail.trim()) body.contact_email = contactEmail.trim();

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.status === 201) {
        const data = json as ApiSuccess;
        setPageState({ status: "success", data });
        // Auto-upload pending photos in background
        if (data.verify_token && pendingFiles.length > 0) {
          autoUploadPhotos(data.id, data.verify_token, pendingFiles);
        }
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
    setPendingFiles([]);
  }

  // ── Success ────────────────────────────────────────────────────────
  if (pageState.status === "success") {
    const urgLabel = URGENCIES.find((u) => u.value === urgency)?.label ?? urgency;
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="mb-1 text-2xl font-bold" style={{ color: BRAND.primary }}>Meldung aufgenommen</h1>
          <p className="text-gray-500">Vielen Dank — wir kümmern uns darum.</p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-5 text-left text-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-gray-500">Fall-Nr.</span>
              <span className="font-mono font-medium text-gray-700">{pageState.data.id.slice(0, 8)}…</span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-gray-500">Kategorie</span>
              <span className="font-medium text-gray-700">{category}</span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-gray-500">Dringlichkeit</span>
              <span className="font-medium text-gray-700">{urgLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ort</span>
              <span className="font-medium text-gray-700">{plz} {city}</span>
            </div>
          </div>

          {/* Photo upload status (auto-uploaded from Step 3) */}
          {pendingFiles.length > 0 && (
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {pendingFiles.length} {pendingFiles.length === 1 ? "Foto wird" : "Fotos werden"} hochgeladen…
            </div>
          )}

          <div className="mt-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            <p className="font-semibold" style={{ color: BRAND.primary }}>Nächster Schritt</p>
            <p className="mt-1">Wir melden uns schnellstmöglich bei Ihnen.</p>
            {urgency === "notfall" && (
              <p className="mt-1 font-medium text-red-600">Notfälle werden sofort priorisiert.</p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/brunner-haustechnik"
              className="rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: BRAND.accent, color: BRAND.accent }}
            >
              Zurück zur Website
            </a>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Neue Meldung
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────
  return (
    <Shell>
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: BRAND.primary }}>Meldung erfassen</h1>
        <p className="mt-1 text-sm text-gray-500">
          Beschreiben Sie Ihr Anliegen in 3 kurzen Schritten.
        </p>
      </div>

      <StepIndicator current={step} total={3} onStepClick={(s) => setStep(s)} />

      <form onSubmit={handleSubmit}>
        {/* ── Step 1: Problem ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <StepLabel>Was ist Ihr Anliegen?</StepLabel>
              {/* Top row: dynamic top-3 cases */}
              <div className="grid grid-cols-3 gap-3">
                {TOP_CATEGORIES.map((c) => (
                  <Card key={c.value} selected={category === c.value} onClick={() => setCategory(c.value)}>
                    <div className={`mb-1 ${category === c.value ? "" : "text-gray-400"}`} style={category === c.value ? { color: BRAND.accent } : undefined}>
                      {c.icon}
                    </div>
                    <div className={`text-sm font-semibold ${category === c.value ? "text-gray-900" : "text-gray-700"}`}>
                      {c.label}
                    </div>
                    <div className="text-xs text-gray-400">{c.hint}</div>
                  </Card>
                ))}
              </div>
              {/* Bottom row: fixed (Allgemein, Angebot, Kontakt) */}
              <div className="mt-3 grid grid-cols-3 gap-3">
                {FIXED_CATEGORIES.map((c) => (
                  <Card key={c.value} selected={category === c.value} onClick={() => setCategory(c.value)}>
                    <div className={`mb-1 ${category === c.value ? "" : "text-gray-400"}`} style={category === c.value ? { color: BRAND.accent } : undefined}>
                      {c.icon}
                    </div>
                    <div className={`text-sm font-semibold ${category === c.value ? "text-gray-900" : "text-gray-700"}`}>
                      {c.label}
                    </div>
                    <div className="text-xs text-gray-400">{c.hint}</div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <StepLabel>Wie dringend ist es?</StepLabel>
              <div className="grid grid-cols-3 gap-3">
                {URGENCIES.map((u) => {
                  const sel = urgency === u.value;
                  const colorMap = { red: "border-red-400 bg-red-50", amber: "border-amber-400 bg-amber-50", teal: "border-teal-400 bg-teal-50" };
                  return (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUrgency(u.value)}
                      className={`rounded-xl border-2 px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        sel ? colorMap[u.color] : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className={`text-sm font-semibold ${sel ? "text-gray-900" : "text-gray-700"}`}>
                        {u.label}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400">{u.hint}</div>
                    </button>
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
              <StepLabel>Wo ist der Einsatzort?</StepLabel>
              <p className="mb-4 text-xs text-gray-400">Adresse, PLZ und Ort für die Einsatzplanung.</p>
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
              <StepLabel>Wie erreichen wir Sie?</StepLabel>
              <p className="mb-4 text-xs text-gray-400">Mindestens Telefon oder E-Mail angeben.</p>
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
                placeholder="Beschreiben Sie Ihr Anliegen kurz…"
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-current focus:outline-none"
                style={{ "--tw-ring-color": BRAND.accent } as React.CSSProperties}
              />
            </div>

            {/* Photo upload (pre-submit) */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>Fotos (optional)</p>
              <p className="mt-1 mb-3 text-xs text-gray-400">Bis zu 5 Fotos — hilft bei der Einschätzung.</p>
              {pendingFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <span className="truncate text-gray-600">{f.name}</span>
                      <button type="button" onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))} className="ml-2 text-xs text-gray-400 hover:text-red-500">&#10005;</button>
                    </div>
                  ))}
                </div>
              )}
              {pendingFiles.length < MAX_PHOTOS && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      const remaining = MAX_PHOTOS - pendingFiles.length;
                      const toAdd = Array.from(files).slice(0, remaining).filter(
                        (f) => f.size <= MAX_FILE_SIZE && (f.type.startsWith("image/") || f.type.startsWith("video/"))
                      );
                      setPendingFiles((prev) => [...prev, ...toAdd]);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-teal-500 hover:text-teal-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                    Foto hinzufügen {pendingFiles.length > 0 && `(${MAX_PHOTOS - pendingFiles.length} verbleibend)`}
                  </button>
                </>
              )}
            </div>

            {/* Error */}
            {pageState.status === "error" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">{pageState.detail.error}</p>
                {pageState.detail.missing_fields && pageState.detail.missing_fields.length > 0 && (
                  <p className="mt-1 text-red-500">
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
                  className="rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Zurück
                </button>
                <button
                  type="submit"
                  disabled={!step3Valid || pageState.status === "submitting"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40"
                  style={{ backgroundColor: BRAND.accent }}
                >
                  {pageState.status === "submitting" ? (
                    <><Spinner /> Wird gesendet…</>
                  ) : (
                    "Meldung absenden"
                  )}
                </button>
              </div>

              {/* Trust copy */}
              <div className="space-y-1 text-center text-xs text-gray-400">
                <p>Wir melden uns schnellstmöglich bei Ihnen.</p>
                <p>Keine Aufzeichnung · Daten nur zur Bearbeitung Ihres Anliegens</p>
                {urgency === "notfall" && (
                  <p className="font-medium text-red-500">Notfälle werden sofort priorisiert.</p>
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
// Auto-upload photos (fires after successful case creation)
// ---------------------------------------------------------------------------
async function autoUploadPhotos(caseId: string, token: string, files: File[]) {
  for (const file of files) {
    try {
      const urlRes = await fetch(`/api/verify/${caseId}/attachments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "request-upload", file_name: file.name, mime_type: file.type, size_bytes: file.size }),
      });
      if (!urlRes.ok) continue;
      const { upload_url, storage_path } = await urlRes.json();

      const putRes = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!putRes.ok) continue;

      await fetch(`/api/verify/${caseId}/attachments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action: "confirm", storage_path, file_name: file.name, mime_type: file.type, size_bytes: file.size }),
      });
    } catch {
      // Best-effort upload, don't block the success screen
    }
  }
}

// ---------------------------------------------------------------------------
// Shared UI primitives
// ---------------------------------------------------------------------------
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar with branding */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <a href="/brunner-haustechnik" className="text-base font-bold" style={{ color: BRAND.primary }}>
            {BRAND.name}
          </a>
          <a href={BRAND.phoneHref} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND.accent }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {BRAND.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        {children}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-200 bg-white py-4">
        <p className="text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {BRAND.name} · Powered by <a href="https://flowsight.ch" className="text-gray-500 hover:underline">FlowSight</a>
        </p>
      </div>
    </div>
  );
}

function StepLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: BRAND.primary }}>{children}</p>;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">
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
      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-current focus:outline-none"
      style={{ "--tw-ring-color": BRAND.accent } as React.CSSProperties}
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
          className="rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Zurück
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40"
          style={{ backgroundColor: BRAND.accent }}
        >
          Weiter
        </button>
      )}
    </div>
  );
}
