"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Sanitär",
  "Heizung",
  "Lüftung",
  "Klima",
  "Allgemein",
] as const;

const URGENCIES = [
  { value: "normal", label: "Normal" },
  { value: "dringend", label: "Dringend" },
  { value: "notfall", label: "Notfall" },
] as const;

export function CreateCaseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [reporterName, setReporterName] = useState("");
  const [category, setCategory] = useState("Sanitär");
  const [urgency, setUrgency] = useState("normal");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plz, setPlz] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  function resetForm() {
    setReporterName("");
    setCategory("Sanitär");
    setUrgency("normal");
    setPhone("");
    setEmail("");
    setPlz("");
    setCity("");
    setStreet("");
    setHouseNumber("");
    setDescription("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          reporter_name: reporterName.trim() || undefined,
          contact_phone: phone.trim() || undefined,
          contact_email: email.trim() || undefined,
          plz: plz.trim(),
          city: city.trim(),
          category,
          urgency,
          description: description.trim(),
          street: street.trim() || undefined,
          house_number: houseNumber.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Fehler ${res.status}`);
      }

      resetForm();
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erstellen fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClasses = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full md:h-auto md:max-w-lg md:rounded-xl bg-white shadow-xl flex flex-col md:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Neuer Fall</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form id="create-case-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Reporter name */}
          <div>
            <label htmlFor="mc-name" className={labelClasses}>Name des Melders</label>
            <input
              id="mc-name"
              type="text"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="z.B. Hans Müller"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label htmlFor="mc-cat" className={labelClasses}>Kategorie</label>
              <select
                id="mc-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClasses}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="mc-urg" className={labelClasses}>Dringlichkeit</label>
              <select
                id="mc-urg"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className={inputClasses}
              >
                {URGENCIES.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone (required) */}
          <div>
            <label htmlFor="mc-phone" className={labelClasses}>Telefon *</label>
            <input
              id="mc-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+41 79 123 45 67"
              className={inputClasses}
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="mc-email" className={labelClasses}>E-Mail</label>
            <input
              id="mc-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.ch"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* PLZ */}
            <div>
              <label htmlFor="mc-plz" className={labelClasses}>PLZ *</label>
              <input
                id="mc-plz"
                type="text"
                required
                value={plz}
                onChange={(e) => setPlz(e.target.value)}
                placeholder="8001"
                className={inputClasses}
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="mc-city" className={labelClasses}>Ort *</label>
              <input
                id="mc-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Zürich"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Street */}
            <div className="col-span-2">
              <label htmlFor="mc-street" className={labelClasses}>Strasse</label>
              <input
                id="mc-street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Bahnhofstrasse"
                className={inputClasses}
              />
            </div>

            {/* House number */}
            <div>
              <label htmlFor="mc-house" className={labelClasses}>Nr.</label>
              <input
                id="mc-house"
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="12a"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="mc-desc" className={labelClasses}>Beschreibung *</label>
            <textarea
              id="mc-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was ist das Problem?"
              className={inputClasses}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            form="create-case-form"
            disabled={saving}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Erstelle..." : "Fall erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
