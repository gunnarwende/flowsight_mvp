"use client";

import { useCallback, useEffect, useState } from "react";
import type { CaseDetail } from "./page";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUSES = [
  { value: "new", label: "Neu" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "scheduled", label: "Geplant" },
  { value: "done", label: "Erledigt" },
] as const;

const URGENCY_COLORS: Record<string, string> = {
  notfall: "bg-red-900/40 text-red-300 border-red-700",
  dringend: "bg-amber-900/40 text-amber-300 border-amber-700",
  normal: "bg-blue-900/40 text-blue-300 border-blue-700",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseDetailForm({ initialData }: { initialData: CaseDetail }) {
  const [status, setStatus] = useState(initialData.status);
  const [assigneeText, setAssigneeText] = useState(
    initialData.assignee_text ?? ""
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData.scheduled_at
      ? initialData.scheduled_at.slice(0, 16) // datetime-local format
      : ""
  );
  const [internalNotes, setInternalNotes] = useState(
    initialData.internal_notes ?? ""
  );

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Dirty state: compare current values against initial
  const isDirty =
    status !== initialData.status ||
    assigneeText !== (initialData.assignee_text ?? "") ||
    scheduledAt !==
      (initialData.scheduled_at ? initialData.scheduled_at.slice(0, 16) : "") ||
    internalNotes !== (initialData.internal_notes ?? "");

  // Warn on tab close / navigate away with unsaved changes
  const onBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    },
    [isDirty],
  );
  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [onBeforeUnload]);

  async function handleSave() {
    setSaveState("saving");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          assignee_text: assigneeText || null,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          internal_notes: internalNotes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Case info (read-only) */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Falldaten</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoField label="Kategorie" value={initialData.category} />
          <InfoField label="Dringlichkeit">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${URGENCY_COLORS[initialData.urgency] ?? ""}`}
            >
              {initialData.urgency}
            </span>
          </InfoField>
          <InfoField label="PLZ / Ort" value={`${initialData.plz} ${initialData.city}`} />
          <InfoField label="Quelle" value={initialData.source} />
          <InfoField label="Erstellt" value={formatDate(initialData.created_at)} />
          <InfoField label="Case ID" value={initialData.id.slice(0, 8)} mono />
          {initialData.contact_phone && (
            <InfoField label="Telefon">
              <a
                href={`tel:${initialData.contact_phone}`}
                className="text-blue-400 hover:underline"
              >
                {initialData.contact_phone}
              </a>
            </InfoField>
          )}
          {initialData.contact_email && (
            <InfoField label="E-Mail">
              <a
                href={`mailto:${initialData.contact_email}`}
                className="text-blue-400 hover:underline"
              >
                {initialData.contact_email}
              </a>
            </InfoField>
          )}
        </div>

        {initialData.description && (
          <div className="mt-4">
            <p className="text-slate-400 text-xs font-medium mb-1">
              Beschreibung
            </p>
            <p className="text-slate-200 text-sm whitespace-pre-wrap bg-slate-800/50 rounded p-3">
              {initialData.description}
            </p>
          </div>
        )}
      </section>

      {/* Ops fields (editable) */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Bearbeitung</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label
              htmlFor="assignee"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Zuständig
            </label>
            <input
              id="assignee"
              type="text"
              value={assigneeText}
              onChange={(e) => setAssigneeText(e.target.value)}
              placeholder="z.B. Ramon D."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Scheduled at */}
          <div>
            <label
              htmlFor="scheduled"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Termin
            </label>
            <input
              id="scheduled"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Internal notes */}
        <div className="mt-4">
          <label
            htmlFor="notes"
            className="block text-xs font-medium text-slate-400 mb-1"
          >
            Interne Notizen
          </label>
          <textarea
            id="notes"
            rows={4}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Interne Notizen (nicht sichtbar für Kunden)..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Save button */}
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!isDirty || saveState === "saving"}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveState === "saving" ? "Speichern\u2026" : "Speichern"}
          </button>

          {saveState === "saved" && (
            <span className="text-emerald-400 text-sm">Gespeichert</span>
          )}
          {saveState === "error" && (
            <span className="text-red-400 text-sm">{errorMsg}</span>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoField({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-slate-400 text-xs font-medium mb-0.5">{label}</p>
      {children ?? (
        <p
          className={`text-slate-200 text-sm ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
