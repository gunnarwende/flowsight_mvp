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

const QUICK_TIMES = ["08:00", "10:00", "13:00", "16:00"] as const;

/** Convert any ISO/UTC date string to a datetime-local value in browser tz. */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Build a datetime-local string for a given day offset + time in browser tz. */
function quickDateTime(dayOffset: number, time: string): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return toDatetimeLocal(d.toISOString());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseDetailForm({ initialData }: { initialData: CaseDetail }) {
  const [status, setStatus] = useState(initialData.status);
  const [assigneeText, setAssigneeText] = useState(
    initialData.assignee_text ?? ""
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : ""
  );
  const [internalNotes, setInternalNotes] = useState(
    initialData.internal_notes ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialData.contact_email ?? ""
  );
  const [street, setStreet] = useState(initialData.street ?? "");
  const [houseNumber, setHouseNumber] = useState(initialData.house_number ?? "");
  const [quickDay, setQuickDay] = useState<0 | 1>(0);

  // Baseline for dirty-check — updated after each successful save
  const [baseline, setBaseline] = useState({
    status: initialData.status,
    assignee_text: initialData.assignee_text ?? "",
    scheduled_at: initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : "",
    internal_notes: initialData.internal_notes ?? "",
    contact_email: initialData.contact_email ?? "",
    street: initialData.street ?? "",
    house_number: initialData.house_number ?? "",
  });

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [inviteState, setInviteState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [inviteMsg, setInviteMsg] = useState("");

  const [reviewState, setReviewState] = useState<
    "idle" | "sending" | "sent" | "error"
  >(initialData.review_sent_at ? "sent" : "idle");
  const [reviewMsg, setReviewMsg] = useState("");

  // Dirty state: compare current values against last-saved baseline
  const isDirty =
    status !== baseline.status ||
    assigneeText !== baseline.assignee_text ||
    scheduledAt !== baseline.scheduled_at ||
    internalNotes !== baseline.internal_notes ||
    contactEmail !== baseline.contact_email ||
    street !== baseline.street ||
    houseNumber !== baseline.house_number;

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
          contact_email: contactEmail.trim() || null,
          street: street.trim() || null,
          house_number: houseNumber.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      // Update baseline so isDirty resets and actions unlock immediately
      setBaseline({
        status,
        assignee_text: assigneeText,
        scheduled_at: scheduledAt,
        internal_notes: internalNotes,
        contact_email: contactEmail,
        street,
        house_number: houseNumber,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  const canSendInvite = !isDirty && !!scheduledAt && inviteState !== "sending";

  // Review gate: status=done + email present + not yet sent + form saved
  const canRequestReview =
    !isDirty &&
    status === "done" &&
    !!contactEmail.trim() &&
    reviewState !== "sent" &&
    reviewState !== "sending";

  async function handleSendInvite() {
    setInviteState("sending");
    setInviteMsg("");

    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/send-invite`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setInviteState("sent");
      setTimeout(() => setInviteState("idle"), 3000);
    } catch (err) {
      setInviteState("error");
      setInviteMsg(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    }
  }

  async function handleRequestReview() {
    setReviewState("sending");
    setReviewMsg("");

    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/request-review`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setReviewState("sent");
    } catch (err) {
      setReviewState("error");
      setReviewMsg(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
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
          <InfoField label="Adresse" value={
            [initialData.street, initialData.house_number].filter(Boolean).join(" ") || "\u2014"
          } />
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

          {/* Contact Email (editable — Ops can add after callback) */}
          <div>
            <label
              htmlFor="contact_email"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Melder E-Mail
            </label>
            <input
              id="contact_email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="name@beispiel.ch"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Street + House Number (editable — Ops can add after callback) */}
          <div>
            <label
              htmlFor="street"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Strasse
            </label>
            <input
              id="street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Bahnhofstrasse"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="house_number"
              className="block text-xs font-medium text-slate-400 mb-1"
            >
              Hausnummer
            </label>
            <input
              id="house_number"
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="12a"
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

        {/* Quick Actions for scheduled_at */}
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-400 mb-2">Schnellwahl</p>
          <div className="flex items-center gap-3">
            {/* Day tabs */}
            <div className="flex rounded-lg border border-slate-700 overflow-hidden">
              {([0, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setQuickDay(d)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    quickDay === d
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {d === 0 ? "Heute" : "Morgen"}
                </button>
              ))}
            </div>
            {/* Time chips */}
            <div className="flex gap-1.5">
              {QUICK_TIMES.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setScheduledAt(quickDateTime(quickDay, time))}
                  className="rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:border-blue-500 hover:text-white transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
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

        {/* Actions */}
        <div className="mt-5 space-y-3">
          {/* Primary: Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!isDirty || saveState === "saving"}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

          {/* Secondary: Termin senden + Review anfragen */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-800 pt-3">
            <button
              onClick={handleSendInvite}
              disabled={!canSendInvite}
              title={
                isDirty
                  ? "Bitte zuerst speichern"
                  : !scheduledAt
                    ? "Kein Termin gesetzt"
                    : undefined
              }
              className="rounded-lg border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-medium text-slate-200 hover:border-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {inviteState === "sending" ? "Sende\u2026" : "Termin senden"}
            </button>

            {status === "done" && (
              <button
                onClick={handleRequestReview}
                disabled={!canRequestReview}
                title={
                  isDirty
                    ? "Bitte zuerst speichern"
                    : !contactEmail.trim()
                      ? "Keine Melder E-Mail vorhanden"
                      : reviewState === "sent"
                        ? "Review bereits angefragt"
                        : undefined
                }
                className="rounded-lg border border-emerald-700 bg-emerald-900/40 px-5 py-2 text-sm font-medium text-emerald-300 hover:border-emerald-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {reviewState === "sending"
                  ? "Sende\u2026"
                  : reviewState === "sent"
                    ? "Review angefragt"
                    : "Review anfragen"}
              </button>
            )}

            {inviteState === "sent" && (
              <span className="text-emerald-400 text-sm">Invite gesendet</span>
            )}
            {inviteState === "error" && (
              <span className="text-red-400 text-sm">{inviteMsg}</span>
            )}
            {reviewState === "sent" && (
              <span className="text-emerald-400 text-sm">
                {initialData.review_sent_at
                  ? `Gesendet am ${formatDate(initialData.review_sent_at)}`
                  : "Review-Anfrage gesendet"}
              </span>
            )}
            {reviewState === "error" && (
              <span className="text-red-400 text-sm">{reviewMsg}</span>
            )}
          </div>
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
    timeZone: "Europe/Zurich",
  });
}
