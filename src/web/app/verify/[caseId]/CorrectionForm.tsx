"use client";

import { useState, useRef, type FormEvent } from "react";

interface CorrectionFormProps {
  caseId: string;
  token: string;
  initialPlz: string;
  initialCity: string;
  initialStreet: string;
  initialHouseNumber: string;
}

interface PendingFile {
  file: File;
  preview: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = "image/*,video/*";

export default function CorrectionForm({
  caseId,
  token,
  initialPlz,
  initialCity,
  initialStreet,
  initialHouseNumber,
}: CorrectionFormProps) {
  const [plz, setPlz] = useState(initialPlz);
  const [city, setCity] = useState(initialCity);
  const [street, setStreet] = useState(initialStreet);
  const [houseNumber, setHouseNumber] = useState(initialHouseNumber);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = /^\d{4}$/.test(plz) && city.trim().length > 0;

  // ── File handling ─────────────────────────────────────────────────
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const remaining = MAX_FILES - files.length;
    if (remaining <= 0) {
      setErrorMsg(`Max ${MAX_FILES} Dateien erlaubt.`);
      e.target.value = "";
      return;
    }

    const newFiles: PendingFile[] = [];
    for (const f of Array.from(selected).slice(0, remaining)) {
      if (f.size > MAX_FILE_SIZE) {
        setErrorMsg(`"${f.name}" ist zu gross (max 10 MB).`);
        e.target.value = "";
        return;
      }
      newFiles.push({ file: f, preview: URL.createObjectURL(f) });
    }

    setErrorMsg("");
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].preview);
      copy.splice(index, 1);
      return copy;
    });
  }

  // ── Upload a single file via HMAC-protected endpoint ──────────────
  async function uploadFile(pf: PendingFile): Promise<void> {
    // 1. Request signed upload URL
    const urlRes = await fetch(`/api/verify/${caseId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "request-upload",
        file_name: pf.file.name,
        mime_type: pf.file.type,
        size_bytes: pf.file.size,
      }),
    });

    if (!urlRes.ok) {
      const data = await urlRes.json().catch(() => ({}));
      throw new Error(
        (data as Record<string, string>).error ??
          `Upload-URL fehlgeschlagen (${urlRes.status})`,
      );
    }

    const { upload_url, storage_path } = await urlRes.json();

    // 2. PUT file to signed URL
    const putRes = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": pf.file.type },
      body: pf.file,
    });

    if (!putRes.ok) {
      throw new Error(`Upload fehlgeschlagen: "${pf.file.name}"`);
    }

    // 3. Confirm
    const confirmRes = await fetch(`/api/verify/${caseId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        action: "confirm",
        storage_path,
        file_name: pf.file.name,
        mime_type: pf.file.type,
        size_bytes: pf.file.size,
      }),
    });

    if (!confirmRes.ok) {
      const data = await confirmRes.json().catch(() => ({}));
      throw new Error(
        (data as Record<string, string>).error ?? "Bestätigung fehlgeschlagen.",
      );
    }
  }

  // ── Submit: address correction + photo upload ─────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      // 1. Upload photos (if any)
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Foto ${i + 1}/${files.length} wird hochgeladen...`);
          await uploadFile(files[i]);
        }
        setUploadProgress("");
      }

      // 2. Update address
      const res = await fetch(`/api/verify/${caseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          plz: plz.trim(),
          city: city.trim(),
          street: street.trim(),
          house_number: houseNumber.trim(),
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = (await res.json().catch(() => ({}))) as Record<
          string,
          string
        >;
        setErrorMsg(
          data.detail ||
            "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
        );
        setStatus("error");
      }
    } catch (err) {
      setUploadProgress("");
      setErrorMsg(
        err instanceof Error ? err.message : "Netzwerkfehler.",
      );
      setStatus("error");
    }
  }

  // ── Success state ─────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-semibold text-emerald-800">Vielen Dank!</p>
        <p className="mt-1 text-sm text-emerald-700">
          {files.length > 0
            ? "Ihre Daten und Fotos wurden gespeichert. Unser Team meldet sich bei Ihnen."
            : "Ihre Adresse wurde aktualisiert. Unser Team meldet sich bei Ihnen."}
        </p>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Address section ─────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-800">
          Adresse pruefen
        </legend>

        {/* Street + House Number */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label
              htmlFor="street"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Strasse
            </label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Seestrasse"
              maxLength={120}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-600 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="house_number"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Nr.
            </label>
            <input
              id="house_number"
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="12"
              maxLength={10}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>

        {/* PLZ + City */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label
              htmlFor="plz"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              PLZ *
            </label>
            <input
              id="plz"
              type="text"
              inputMode="numeric"
              value={plz}
              onChange={(e) =>
                setPlz(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="8942"
              maxLength={4}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-600 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label
              htmlFor="city"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Ort *
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Oberrieden"
              maxLength={80}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-teal-600 focus:outline-none"
            />
          </div>
        </div>
      </fieldset>

      {/* ── Photo section ───────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-gray-800">
          Fotos vom Schaden (optional)
        </legend>
        <p className="text-xs text-gray-500">
          Fotos helfen dem Techniker, sich vorzubereiten. Max {MAX_FILES}{" "}
          Dateien, je 10 MB.
        </p>

        {/* Thumbnails */}
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((pf, i) => (
              <div key={i} className="group relative">
                {pf.file.type.startsWith("video/") ? (
                  <div className="flex h-24 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
                    Video
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pf.preview}
                    alt={pf.file.name}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow"
                  aria-label={`${pf.file.name} entfernen`}
                >
                  X
                </button>
                <p className="mt-0.5 truncate text-[10px] text-gray-400">
                  {pf.file.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        {files.length < MAX_FILES && (
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-teal-500 hover:text-teal-700 ${status === "submitting" ? "pointer-events-none opacity-40" : ""}`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            Foto aufnehmen / auswaehlen
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              capture="environment"
              multiple
              disabled={status === "submitting"}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </fieldset>

      {/* ── Upload progress ─────────────────────────────────────────── */}
      {uploadProgress && (
        <div className="flex items-center gap-2 text-sm text-teal-700">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {uploadProgress}
        </div>
      )}

      {/* ── Error message ───────────────────────────────────────────── */}
      {status === "error" && errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* ── Submit ──────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={!isValid || status === "submitting"}
        className="w-full rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-800 disabled:opacity-40"
      >
        {status === "submitting" ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Wird gespeichert...
          </span>
        ) : (
          "Absenden"
        )}
      </button>

      <p className="text-center text-xs text-gray-400">* Pflichtfelder</p>
    </form>
  );
}
