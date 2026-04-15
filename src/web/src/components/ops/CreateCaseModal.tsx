"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PLZ_CITY_MAP } from "@/src/lib/plz/plzCityMap";
import { normalizeSwissPhone } from "@/src/lib/phone/normalizeSwissPhone";

const FALLBACK_CATEGORIES = [
  { value: "Sanitär", label: "Sanitär" },
  { value: "Heizung", label: "Heizung" },
  { value: "Allgemein", label: "Allgemein" },
];

const URGENCIES = [
  { value: "normal", label: "Normal" },
  { value: "dringend", label: "Dringend" },
  { value: "notfall", label: "Notfall" },
] as const;

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = "image/*,.pdf";

interface SelectedFile {
  file: File;
  previewUrl: string | null;
}

export function CreateCaseModal({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories?: { value: string; label: string }[];
}) {
  const effectiveCategories = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [reporterName, setReporterName] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plz, setPlz] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [description, setDescription] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function resetForm() {
    setReporterName("");
    setCategory("");
    setUrgency("normal");
    setPhone("");
    setEmail("");
    setPlz("");
    setCity("");
    setStreet("");
    setHouseNumber("");
    setDescription("");
    setError("");
    setSubmitAttempted(false);
    // Revoke preview URLs to free memory
    for (const sf of selectedFiles) {
      if (sf.previewUrl) URL.revokeObjectURL(sf.previewUrl);
    }
    setSelectedFiles([]);
    setUploadStatus("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const totalCount = selectedFiles.length + newFiles.length;

    if (totalCount > MAX_FILES) {
      setError(`Maximal ${MAX_FILES} Dateien erlaubt.`);
      e.target.value = "";
      return;
    }

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" ist zu gross (max 10 MB).`);
        e.target.value = "";
        return;
      }
    }

    setError("");
    const additions: SelectedFile[] = newFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setSelectedFiles((prev) => [...prev, ...additions]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadFilesToCase(caseId: string): Promise<boolean> {
    if (selectedFiles.length === 0) return true;

    setUploadStatus("Dateien werden hochgeladen...");

    try {
      for (const { file } of selectedFiles) {
        // 1. Request signed upload URL
        const urlRes = await fetch(`/api/ops/cases/${caseId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "request-upload",
            file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
          }),
        });

        if (!urlRes.ok) {
          throw new Error(`Upload-URL fehlgeschlagen für "${file.name}"`);
        }

        const { upload_url, storage_path } = await urlRes.json();

        // 2. Upload file to signed URL
        const putRes = await fetch(upload_url, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!putRes.ok) {
          throw new Error(`Upload fehlgeschlagen für "${file.name}"`);
        }

        // 3. Confirm upload
        const confirmRes = await fetch(`/api/ops/cases/${caseId}/attachments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "confirm",
            storage_path,
            file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
          }),
        });

        if (!confirmRes.ok) {
          throw new Error(`Bestätigung fehlgeschlagen für "${file.name}"`);
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  function handlePlzChange(value: string) {
    setPlz(value);
    // Auto-fill city when PLZ is 4 digits and found in map
    if (value.length === 4 && PLZ_CITY_MAP[value]) {
      setCity(PLZ_CITY_MAP[value]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          reporter_name: reporterName.trim() || undefined,
          contact_phone: (normalizeSwissPhone(phone.trim()) ?? phone.trim()) || undefined,
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

      const caseData = await res.json();

      // Upload files if any were selected (case already created at this point)
      let uploadFailed = false;
      if (selectedFiles.length > 0 && caseData.id) {
        const uploadOk = await uploadFilesToCase(caseData.id);
        if (!uploadOk) uploadFailed = true;
      }

      resetForm();
      onClose();
      router.refresh();

      // Show warning after closing if upload failed (case was still created)
      if (uploadFailed) {
        // Use setTimeout so the modal closes first, then alert appears
        setTimeout(() => {
          window.alert("Fall wurde erstellt, aber Dateien konnten nicht hochgeladen werden. Bitte im Fall nachträglich hochladen.");
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erstellen fehlgeschlagen.");
    } finally {
      setSaving(false);
      setUploadStatus("");
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500";
  const labelClasses = "block text-xs font-medium text-gray-600 mb-1";
  const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

  /** Red border + light bg on empty required fields after first submit attempt */
  function reqClass(value: string) {
    return submitAttempted && !value.trim()
      ? "w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
      : inputClasses;
  }

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
            <label htmlFor="mc-name" className={labelClasses}>Name des Kunden</label>
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
                <option value="">Kategorie wählen</option>
                {effectiveCategories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor="mc-urg" className={labelClasses}>Priorität</label>
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
            <label htmlFor="mc-phone" className={labelClasses}>Telefon{requiredMark}</label>
            <input
              id="mc-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="076 123 45 67"
              className={reqClass(phone)}
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
              <label htmlFor="mc-plz" className={labelClasses}>PLZ{requiredMark}</label>
              <input
                id="mc-plz"
                type="text"
                required
                value={plz}
                onChange={(e) => handlePlzChange(e.target.value)}
                placeholder="8001"
                maxLength={4}
                className={reqClass(plz)}
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="mc-city" className={labelClasses}>Ort{requiredMark}</label>
              <input
                id="mc-city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Zürich"
                className={reqClass(city)}
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
            <label htmlFor="mc-desc" className={labelClasses}>Beschreibung{requiredMark}</label>
            <textarea
              id="mc-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Was ist das Problem?"
              className={reqClass(description)}
            />
          </div>

          {/* File upload */}
          <div>
            <label className={labelClasses}>Fotos / Anhänge</label>
            <div className="flex items-center gap-3">
              <label
                className={`inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${selectedFiles.length >= MAX_FILES ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
                Dateien auswählen
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT}
                  multiple
                  disabled={selectedFiles.length >= MAX_FILES}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <span className="text-gray-400 text-xs">
                Bilder / PDF, max 10 MB, max {MAX_FILES}
              </span>
            </div>

            {/* File previews */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {selectedFiles.map((sf, idx) => (
                  <div
                    key={`${sf.file.name}-${idx}`}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
                  >
                    {/* Thumbnail for images */}
                    {sf.previewUrl ? (
                      <img
                        src={sf.previewUrl}
                        alt={sf.file.name}
                        className="h-10 w-10 rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 truncate">{sf.file.name}</p>
                      <p className="text-xs text-gray-400">
                        {sf.file.size < 1024 * 1024
                          ? `${(sf.file.size / 1024).toFixed(0)} KB`
                          : `${(sf.file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Entfernen"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploadStatus && (
            <p className="text-slate-600 text-sm">{uploadStatus}</p>
          )}

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
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (uploadStatus || "Erstelle...") : "Fall erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
}
