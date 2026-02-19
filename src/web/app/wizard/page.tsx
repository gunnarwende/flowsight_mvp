"use client";

import { useState, type FormEvent } from "react";

const CATEGORIES = [
  "Verstopfung",
  "Leck",
  "Heizung",
  "Boiler",
  "Rohrbruch",
  "Sanitär allgemein",
] as const;

const URGENCIES = [
  { value: "normal", label: "Normal" },
  { value: "dringend", label: "Dringend" },
  { value: "notfall", label: "Notfall" },
] as const;

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

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; data: ApiSuccess }
  | { status: "error"; detail: ApiError };

export default function WizardPage() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [plz, setPlz] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState({ status: "submitting" });

    const body: Record<string, string> = {
      source: "wizard",
      contact_phone: contactPhone.trim(),
      plz: plz.trim(),
      city: city.trim(),
      category,
      urgency,
      description: description.trim(),
    };
    if (contactEmail.trim()) {
      body.contact_email = contactEmail.trim();
    }

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.status === 201) {
        setState({ status: "success", data: json as ApiSuccess });
      } else {
        setState({ status: "error", detail: json as ApiError });
      }
    } catch {
      setState({
        status: "error",
        detail: { error: "Netzwerkfehler. Bitte erneut versuchen." },
      });
    }
  }

  if (state.status === "success") {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="rounded-lg border border-green-300 bg-green-50 p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-green-800">
            Meldung erfolgreich erstellt
          </h1>
          <p className="text-sm text-green-700">
            Fall-Nr: <span className="font-mono">{state.data.id}</span>
          </p>
          <p className="mt-1 text-sm text-green-700">
            {state.data.category} &middot; {state.data.urgency} &middot;{" "}
            {state.data.city}
          </p>
          <button
            type="button"
            className="mt-6 rounded bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800"
            onClick={() => {
              setState({ status: "idle" });
              setContactPhone("");
              setContactEmail("");
              setPlz("");
              setCity("");
              setCategory("");
              setUrgency("");
              setDescription("");
            }}
          >
            Neue Meldung
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">Schadensmeldung</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* contact_phone */}
        <div>
          <label htmlFor="contact_phone" className="mb-1 block text-sm font-medium">
            Telefonnummer *
          </label>
          <input
            id="contact_phone"
            type="tel"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+41 79 123 45 67"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* contact_email (optional) */}
        <div>
          <label htmlFor="contact_email" className="mb-1 block text-sm font-medium">
            E-Mail <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="contact_email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* plz + city */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="plz" className="mb-1 block text-sm font-medium">
              PLZ *
            </label>
            <input
              id="plz"
              type="text"
              required
              value={plz}
              onChange={(e) => setPlz(e.target.value)}
              placeholder="8000"
              maxLength={5}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="city" className="mb-1 block text-sm font-medium">
              Ort *
            </label>
            <input
              id="city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Zürich"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* category */}
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium">
            Kategorie *
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Bitte wählen…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* urgency */}
        <div>
          <label htmlFor="urgency" className="mb-1 block text-sm font-medium">
            Dringlichkeit *
          </label>
          <select
            id="urgency"
            required
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Bitte wählen…</option>
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* description */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Beschreibung *
          </label>
          <textarea
            id="description"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschreiben Sie das Problem kurz…"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* error display */}
        {state.status === "error" && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            <p className="font-medium">{state.detail.error}</p>
            {state.detail.missing_fields && state.detail.missing_fields.length > 0 && (
              <p className="mt-1">
                Fehlende Felder: {state.detail.missing_fields.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* submit */}
        <button
          type="submit"
          disabled={state.status === "submitting"}
          className="w-full rounded bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {state.status === "submitting" ? "Wird gesendet…" : "Meldung absenden"}
        </button>
      </form>
    </main>
  );
}
