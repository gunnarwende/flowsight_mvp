"use client";

import { useState, useRef, type FormEvent, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WizardCategory {
  value: string;
  label: string;
  hint: string;
  iconKey: string;
  fixed?: boolean;
}

interface Props {
  companyName: string;
  companySlug: string;
  phone: string;
  phoneRaw: string;
  emergency?: { enabled: boolean; phone: string; phoneRaw: string; label: string };
  accent: string;
  categories: WizardCategory[];
  backUrl: string;
}

const URGENCIES = [
  { value: "notfall", label: "Notfall", hint: "Sofort — Wasser läuft, Gefahr", color: "red" as const },
  { value: "dringend", label: "Dringend", hint: "Heute/morgen — funktioniert nicht", color: "amber" as const },
  { value: "normal", label: "Normal", hint: "Kann eingeplant werden", color: "blue" as const },
];

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface ApiSuccess {
  id: string;
  tenant_id: string;
  source: string;
  urgency: string;
  category: string;
  city: string;
  created_at: string;
  verify_token?: string;
}

interface ApiError {
  error: string;
  missing_fields?: string[];
}

interface UploadedFile {
  name: string;
  status: "uploading" | "done" | "error";
  progress?: number;
}

type PageState =
  | { status: "form" }
  | { status: "submitting" }
  | { status: "success"; data: ApiSuccess }
  | { status: "error"; detail: ApiError };

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CustomerWizardForm({
  companyName,
  companySlug,
  phone,
  phoneRaw,
  emergency,
  accent,
  categories,
  backUrl,
}: Props) {
  const [step, setStep] = useState(1);
  const [pageState, setPageState] = useState<PageState>({ status: "form" });

  // Form data
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [plz, setPlz] = useState("");
  const [city, setCity] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");

  // Photo upload state (inline in Step 3, before submit)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Post-submit upload state
  const [uploads, setUploads] = useState<UploadedFile[]>([]);

  // Validation
  const step1Valid = category !== "" && urgency !== "";
  const step2Valid =
    street.trim().length > 0 &&
    houseNumber.trim().length > 0 &&
    plz.trim().length > 0 &&
    city.trim().length > 0;
  const hasContact = contactPhone.trim().length > 0 || contactEmail.trim().length > 0;
  const step3Valid = contactName.trim().length > 0 && hasContact && description.trim().length > 0;

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
      tenant_slug: companySlug,
      street: street.trim(),
      house_number: houseNumber.trim(),
      plz: plz.trim(),
      city: city.trim(),
      category,
      urgency,
      description: description.trim(),
    };
    if (contactName.trim()) body.reporter_name = contactName.trim();
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
          for (const file of pendingFiles) {
            uploadPhoto(file, data.id, data.verify_token);
          }
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

  // ── Photo upload ─────────────────────────────────────────────────
  async function uploadPhoto(file: File, caseId: string, token: string) {
    const idx = uploads.length;
    setUploads((prev) => [...prev, { name: file.name, status: "uploading" }]);

    try {
      // Step 1: Get presigned URL
      const reqRes = await fetch(`/api/verify/${caseId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-upload",
          token,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      });
      if (!reqRes.ok) throw new Error("Upload-URL fehlgeschlagen");
      const { upload_url, storage_path } = await reqRes.json();

      // Step 2: Upload to signed URL
      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload fehlgeschlagen");

      // Step 3: Confirm
      await fetch(`/api/verify/${caseId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          token,
          storage_path,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
        }),
      });

      setUploads((prev) =>
        prev.map((u, i) => (i === idx ? { ...u, status: "done" } : u))
      );
    } catch {
      setUploads((prev) =>
        prev.map((u, i) => (i === idx ? { ...u, status: "error" } : u))
      );
    }
  }

  function handleFileSelectPreSubmit(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const remaining = MAX_PHOTOS - pendingFiles.length;
    const toAdd = Array.from(files).slice(0, remaining).filter(
      (f) => f.size <= MAX_FILE_SIZE && (f.type.startsWith("image/") || f.type.startsWith("video/"))
    );
    setPendingFiles((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function removePendingFile(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function reset() {
    setStep(1);
    setPageState({ status: "form" });
    setCategory("");
    setUrgency("");
    setStreet("");
    setHouseNumber("");
    setPlz("");
    setCity("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setDescription("");
    setPendingFiles([]);
    setUploads([]);
  }

  // ── Success ────────────────────────────────────────────────────────
  if (pageState.status === "success") {
    const urgLabel = URGENCIES.find((u) => u.value === urgency)?.label ?? urgency;
    return (
      <Shell>
        <TopBar companyName={companyName} phone={phone} phoneRaw={phoneRaw} accent={accent} backUrl={backUrl} />
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: accent + "20", color: accent }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <h1 className="mb-1 text-2xl font-semibold text-gray-900">Meldung aufgenommen</h1>
          <p className="text-gray-500">{"Vielen Dank \u2014 wir kümmern uns darum."}</p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm">
            <Row label="Fall-Nr." value={pageState.data.id.slice(0, 8) + "\u2026"} />
            <Row label="Kategorie" value={category} />
            <Row label="Dringlichkeit" value={urgLabel} />
            <Row label="Ort" value={`${plz} ${city}`} />
          </div>

          {/* Upload progress (auto-uploaded from Step 3 selection) */}
          {uploads.length > 0 && (
            <div className="mx-auto mt-6 max-w-sm rounded-xl border border-gray-200 bg-white p-5 text-left">
              <p className="mb-3 text-sm font-semibold text-gray-900">Fotos</p>
              <div className="space-y-2">
                {uploads.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                    {u.status === "uploading" && <Spinner />}
                    {u.status === "done" && (
                      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                      </svg>
                    )}
                    {u.status === "error" && (
                      <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span className="truncate text-gray-600">{u.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
            <p className="font-medium text-gray-700">{"Nächster Schritt"}</p>
            <p className="mt-1">{"Wir melden uns schnellstmöglich bei Ihnen."}</p>
            {urgency === "notfall" && emergency?.enabled && (
              <p className="mt-2 text-sm">
                {"Für sofortige Hilfe: "}
                <a href={`tel:${emergency.phoneRaw}`} className="font-semibold underline" style={{ color: accent }}>
                  {emergency.phone}
                </a>
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <a
              href={backUrl}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              {"Zurück zur Website"}
            </a>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              Neue Meldung
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────
  const stepLabels = ["Anliegen", "Adresse", "Kontakt"];

  return (
    <Shell>
      <TopBar companyName={companyName} phone={phone} phoneRaw={phoneRaw} accent={accent} backUrl={backUrl} />

      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">Meldung erfassen</h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Beschreiben Sie Ihr Anliegen in 3 kurzen Schritten.
        </p>

        <StepIndicator current={step} total={3} labels={stepLabels} accent={accent} onStepClick={(s) => setStep(s)} />

        <form onSubmit={handleSubmit}>
          {/* ── Step 1: Problem ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <StepLabel>Was ist Ihr Anliegen?</StepLabel>
                {/* Top row: dynamic top-3 cases */}
                <div className="grid grid-cols-3 gap-3">
                  {categories.filter((c) => !c.fixed).map((c) => (
                    <CategoryCard
                      key={c.value}
                      selected={category === c.value}
                      onClick={() => setCategory(c.value)}
                      accent={accent}
                    >
                      <div className={`mb-1.5 ${category === c.value ? "" : "text-gray-400"}`} style={category === c.value ? { color: accent } : undefined}>
                        <CategoryIcon iconKey={c.iconKey} />
                      </div>
                      <div className={`text-sm font-medium ${category === c.value ? "text-gray-900" : "text-gray-700"}`}>
                        {c.label}
                      </div>
                      <div className="text-xs text-gray-400">{c.hint}</div>
                    </CategoryCard>
                  ))}
                </div>
                {/* Bottom row: fixed (Allgemein, Angebot, Kontakt) */}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {categories.filter((c) => c.fixed).map((c) => (
                    <CategoryCard
                      key={c.value}
                      selected={category === c.value}
                      onClick={() => setCategory(c.value)}
                      accent={accent}
                    >
                      <div className={`mb-1.5 ${category === c.value ? "" : "text-gray-400"}`} style={category === c.value ? { color: accent } : undefined}>
                        <CategoryIcon iconKey={c.iconKey} />
                      </div>
                      <div className={`text-sm font-medium ${category === c.value ? "text-gray-900" : "text-gray-700"}`}>
                        {c.label}
                      </div>
                      <div className="text-xs text-gray-400">{c.hint}</div>
                    </CategoryCard>
                  ))}
                </div>
              </div>

              <div>
                <StepLabel>Wie dringend?</StepLabel>
                <div className="grid grid-cols-3 gap-3">
                  {URGENCIES.map((u) => {
                    const sel = urgency === u.value;
                    return (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => setUrgency(u.value)}
                        className={`rounded-xl border px-3 py-3 text-left transition-all ${
                          sel
                            ? u.color === "red"
                              ? "border-red-300 bg-red-50"
                              : u.color === "amber"
                                ? "border-amber-300 bg-amber-50"
                                : "border-blue-300 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className={`text-sm font-semibold ${
                          sel
                            ? u.color === "red" ? "text-red-700" : u.color === "amber" ? "text-amber-700" : "text-blue-700"
                            : "text-gray-700"
                        }`}>
                          {u.label}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400">{u.hint}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Notfall-Screen (N1-N7) ─────────────────── */}
              {urgency === "notfall" && emergency?.enabled ? (
                <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5 space-y-4">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800">Notfall? Rufen Sie jetzt an.</h3>
                    <p className="mt-1 text-sm text-red-600">
                      Bei einem Notfall ist ein Anruf der schnellste Weg. {companyName} hilft Ihnen sofort.
                    </p>
                  </div>

                  {/* N2: Primary CTA = Phone call (largest button) */}
                  <a
                    href={`tel:${emergency.phoneRaw}`}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-red-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-red-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {companyName} anrufen — {emergency.phone}
                  </a>

                  {/* N3: Secondary = "Schriftlich melden" */}
                  {/* N4: Goes to Step 2 with Notfall pre-selected */}
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!category}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
                  >
                    Schriftlich melden {!category && "(bitte Anliegen wählen)"}
                  </button>
                </div>
              ) : urgency === "notfall" && (!emergency || !emergency.enabled) ? (
                /* N5: emergency not enabled → inline warning, normal flow */
                <div>
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    <span className="font-medium">Hinweis:</span> Bei akuten Notfällen empfehlen wir einen direkten Anruf bei {companyName}: <a href={`tel:${phoneRaw}`} className="font-semibold underline">{phone}</a>
                  </div>
                  <NavButtons accent={accent} onNext={goNext} nextDisabled={!step1Valid} />
                </div>
              ) : (
                <NavButtons accent={accent} onNext={goNext} nextDisabled={!step1Valid} />
              )}
            </div>
          )}

          {/* ── Step 2: Ort ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <StepLabel>Einsatzort</StepLabel>
                <p className="mb-4 text-xs text-gray-400">{"Adresse, PLZ und Ort werden für die Einsatzplanung benötigt."}</p>
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
                      <Input id="city" type="text" required value={city} onChange={setCity} placeholder={"Zürich"} />
                    </div>
                  </div>
                </div>
              </div>
              <NavButtons accent={accent} onBack={goBack} onNext={goNext} nextDisabled={!step2Valid} />
            </div>
          )}

          {/* ── Step 3: Kontakt + Beschreibung ──────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <StepLabel>Kontaktdaten</StepLabel>
                <p className="mb-4 text-xs text-gray-400">Damit der Techniker Sie vor Ort findet.</p>
                <div className="space-y-3">
                  <div>
                    <FieldLabel htmlFor="name">Ihr Name *</FieldLabel>
                    <Input id="name" type="text" required value={contactName} onChange={setContactName} placeholder="Max Muster" />
                  </div>
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
                  placeholder={"Beschreiben Sie Ihr Anliegen kurz\u2026"}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Photo upload (pre-submit) */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-1 text-sm font-semibold text-gray-900">Fotos (optional)</p>
                <p className="mb-3 text-xs text-gray-400">{"Bis zu 5 Fotos \u2014 hilft bei der Einschätzung."}</p>
                {pendingFiles.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                        <span className="truncate text-gray-600">{f.name}</span>
                        <button type="button" onClick={() => removePendingFile(i)} className="ml-2 text-xs text-gray-400 hover:text-red-500">&#10005;</button>
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
                      onChange={handleFileSelectPreSubmit}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm font-medium text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                      </svg>
                      Foto hinzuf&uuml;gen {pendingFiles.length > 0 && `(${MAX_PHOTOS - pendingFiles.length} verbleibend)`}
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
                    className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    {"Zurück"}
                  </button>
                  <button
                    type="submit"
                    disabled={!step3Valid || pageState.status === "submitting"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: accent }}
                  >
                    {pageState.status === "submitting" ? (
                      <>
                        <Spinner /> {"Wird gesendet\u2026"}
                      </>
                    ) : (
                      "Meldung absenden"
                    )}
                  </button>
                </div>

                <div className="space-y-1 text-center text-xs text-gray-400">
                  <p>{companyName} meldet sich schnellstmöglich.</p>
                  <p>Keine Aufzeichnung · Daten nur zur Bearbeitung Ihres Anliegens</p>
                  {urgency === "notfall" && emergency?.enabled && (
                    <p className="font-medium" style={{ color: accent }}>
                      {"Notfall? Direkt anrufen: "}
                      <a href={`tel:${emergency.phoneRaw}`} className="underline">{emergency.phone}</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        {"Website powered by "}
        <a href="https://flowsight.ch" className="text-gray-500 hover:text-gray-700">FlowSight</a>
      </footer>
    </div>
  );
}

function TopBar({ companyName, phone, phoneRaw, accent, backUrl }: { companyName: string; phone: string; phoneRaw: string; accent: string; backUrl: string }) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <a href={backUrl} className="text-lg font-bold" style={{ color: accent }}>
          {companyName}
        </a>
        <a
          href={`tel:${phoneRaw}`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          {phone}
        </a>
      </div>
    </div>
  );
}

function StepIndicator({
  current, total, labels, accent, onStepClick,
}: {
  current: number; total: number; labels: string[]; accent: string; onStepClick?: (step: number) => void;
}) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => {
        const s = i + 1;
        const done = s < current;
        const active = s === current;
        const canClick = done && onStepClick;
        return (
          <div key={s} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick(s)}
              className={`flex flex-col items-center ${canClick ? "cursor-pointer" : "cursor-default"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  active ? "text-white shadow-md" : done ? "text-white" : "bg-gray-200 text-gray-400"
                }`}
                style={active || done ? { backgroundColor: accent } : undefined}
              >
                {done ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M5 12l5 5L20 7" />
                  </svg>
                ) : s}
              </div>
              <span className={`mt-1 text-[10px] font-medium ${active ? "text-gray-700" : "text-gray-400"}`}>
                {labels[i]}
              </span>
            </button>
            {s < total && (
              <div className={`h-px w-8 ${done ? "" : "bg-gray-200"}`} style={done ? { backgroundColor: accent } : undefined} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoryCard({ selected, onClick, accent, children }: { selected: boolean; onClick: () => void; accent: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition-all ${
        selected ? "shadow-sm" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      style={selected ? { borderColor: accent, backgroundColor: accent + "08" } : undefined}
    >
      {children}
    </button>
  );
}

function CategoryIcon({ iconKey }: { iconKey: string }) {
  const cls = "h-7 w-7";
  switch (iconKey) {
    /* ── Problem-specific icons ──────────────────────── */
    case "drain": // Verstopfung — funnel/drain
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 21v-1.5M9.75 4.5l.75 3h3l.75-3M7.5 9h9l-1.5 6H9L7.5 9zM10.5 15v3a1.5 1.5 0 003 0v-3" /></svg>);
    case "drop": // Leck / Wasserschaden — water drop
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c0 0-6.75 7.5-6.75 11.25a6.75 6.75 0 0013.5 0C18.75 11.25 12 3.75 12 3.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 16.5a2.25 2.25 0 01-2.25 2.25" /></svg>);
    case "burst": // Rohrbruch — exploding pipe
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h4.5m7.5 0h4.5M11.25 12l-2.25-3m0 6l2.25-3m1.5 0l2.25-3m0 6l-2.25-3" /></svg>);
    case "thermo": // Kein Warmwasser — thermometer
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9V3.75M12 9a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM12 16.5V21M9 3.75h6" /></svg>);
    case "bolt": // Blitzschutz — lightning bolt
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>);
    case "pipe": // Leitungsschaden — pipes
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h6m0 0v6m0-6l3 3M21 18h-6m0 0v-6m0 6l-3-3M3 18h4.5M21 6h-4.5" /></svg>);
    case "clipboard": // Allgemein — clipboard
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>);
    case "document": // Angebot — document/file
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>);
    case "chat": // Kontakt — chat bubble
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>);
    /* ── Service icons (kept for compatibility) ──────── */
    case "bath":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M3.75 12a2.25 2.25 0 01-2.25-2.25V6a2.25 2.25 0 012.25-2.25h.386c.51 0 .983.273 1.237.718L6.75 6.75M3.75 12v4.5a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25V12" /></svg>);
    case "wrench":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" /></svg>);
    case "water":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c0 0-6.75 7.5-6.75 11.25a6.75 6.75 0 0013.5 0C18.75 11.25 12 3.75 12 3.75z" /></svg>);
    case "roof":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>);
    case "facade":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>);
    case "flame": case "heating":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>);
    case "leaf": case "solar":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>);
    case "snowflake": // Lüftung / Klima
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18m-18 0l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" /></svg>);
    default:
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1" /></svg>);
  }
}

function StepLabel({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">{children}</p>;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-gray-700">{children}</label>;
}

function Input({ id, type, required, value, onChange, placeholder, maxLength }: {
  id: string; type: string; required?: boolean; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number;
}) {
  return (
    <input
      id={id} type={type} required={required} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
    />
  );
}

function NavButtons({ accent, onBack, onNext, nextDisabled }: { accent: string; onBack?: () => void; onNext?: () => void; nextDisabled?: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button type="button" onClick={onBack}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          {"Zurück"}
        </button>
      )}
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled}
          className="flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: accent }}
        >
          Weiter
        </button>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex items-center justify-between last:mb-0">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
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
