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

const URGENCY_LABELS: Record<string, string> = {
  notfall: "Hoch",
  dringend: "Mittel",
  normal: "Normal",
};

const URGENCY_DOT: Record<string, string> = {
  notfall: "bg-red-500",
  dringend: "bg-amber-500",
  normal: "bg-gray-400",
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-sky-100 text-sky-700",
  scheduled: "bg-violet-100 text-violet-700",
  done: "bg-emerald-100 text-emerald-700",
  archived: "bg-gray-100 text-gray-500",
};

const SOURCE_LABELS: Record<string, string> = {
  voice: "Voice Agent",
  wizard: "Website-Formular",
  manual: "Manuell erfasst",
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseDetailForm({ initialData }: { initialData: CaseDetail }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(initialData.status);
  const [assigneeText, setAssigneeText] = useState(initialData.assignee_text ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : ""
  );
  const [internalNotes, setInternalNotes] = useState(initialData.internal_notes ?? "");
  const [contactEmail, setContactEmail] = useState(initialData.contact_email ?? "");
  const [street, setStreet] = useState(initialData.street ?? "");
  const [houseNumber, setHouseNumber] = useState(initialData.house_number ?? "");
  const [reporterName, setReporterName] = useState(initialData.reporter_name ?? "");
  const [quickDay, setQuickDay] = useState<0 | 1>(0);

  // Baseline for dirty-check
  const [baseline, setBaseline] = useState({
    status: initialData.status,
    assignee_text: initialData.assignee_text ?? "",
    scheduled_at: initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : "",
    internal_notes: initialData.internal_notes ?? "",
    contact_email: initialData.contact_email ?? "",
    street: initialData.street ?? "",
    house_number: initialData.house_number ?? "",
    reporter_name: initialData.reporter_name ?? "",
  });

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteState, setInviteState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [inviteMsg, setInviteMsg] = useState("");
  const [reviewState, setReviewState] = useState<"idle" | "sending" | "sent" | "error">(
    initialData.review_sent_at ? "sent" : "idle"
  );
  const [reviewMsg, setReviewMsg] = useState("");

  const isDirty =
    status !== baseline.status ||
    assigneeText !== baseline.assignee_text ||
    scheduledAt !== baseline.scheduled_at ||
    internalNotes !== baseline.internal_notes ||
    contactEmail !== baseline.contact_email ||
    street !== baseline.street ||
    houseNumber !== baseline.house_number ||
    reporterName !== baseline.reporter_name;

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
          reporter_name: reporterName.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setBaseline({
        status,
        assignee_text: assigneeText,
        scheduled_at: scheduledAt,
        internal_notes: internalNotes,
        contact_email: contactEmail,
        street,
        house_number: houseNumber,
        reporter_name: reporterName,
      });
      setSaveState("saved");
      setEditing(false);
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  async function handleQuickDone() {
    setStatus("done");
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setBaseline((prev) => ({ ...prev, status: "done" }));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    }
  }

  const canSendInvite = !isDirty && !!scheduledAt && inviteState !== "sending";
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
      const res = await fetch(`/api/ops/cases/${initialData.id}/send-invite`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
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
      const res = await fetch(`/api/ops/cases/${initialData.id}/request-review`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setReviewState("sent");
    } catch (err) {
      setReviewState("error");
      setReviewMsg(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
  const labelClasses = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="space-y-6">
      {/* Case info + description */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Falldetails</h2>
          <div className="flex items-center gap-2">
            {!editing && status !== "done" && (
              <button
                onClick={handleQuickDone}
                disabled={saveState === "saving"}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
              >
                Als erledigt markieren
              </button>
            )}
            <button
              onClick={() => setEditing(!editing)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm ${
                editing
                  ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  : "bg-slate-800 text-white hover:bg-slate-700"
              }`}
            >
              {editing ? "Abbrechen" : "Bearbeiten"}
            </button>
          </div>
        </div>

        {/* Read-only info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Status</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-500"}`}>
              {STATUSES.find((s) => s.value === status)?.label ?? status}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Dringlichkeit</p>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-900">
              <span className={`w-2 h-2 rounded-full ${URGENCY_DOT[initialData.urgency] ?? "bg-gray-300"}`} />
              {URGENCY_LABELS[initialData.urgency] ?? initialData.urgency}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Kategorie</p>
            <p className="text-gray-900">{initialData.category}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Quelle</p>
            <p className="text-gray-900">{SOURCE_LABELS[initialData.source] ?? initialData.source}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Zuständig</p>
            <p className="text-gray-900">{assigneeText || <span className="text-gray-400">&mdash;</span>}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">Termin</p>
            <p className="text-gray-900">{scheduledAt ? formatDate(new Date(scheduledAt).toISOString()) : <span className="text-gray-400">&mdash;</span>}</p>
          </div>
        </div>

        {/* Description */}
        {initialData.description && (
          <div>
            <p className="text-gray-400 text-xs font-medium mb-1">Beschreibung</p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
              {initialData.description}
            </p>
          </div>
        )}
      </section>

      {/* Editable fields — only shown in edit mode */}
      {editing && (
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Bearbeiten</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className={labelClasses}>Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label htmlFor="assignee" className={labelClasses}>Zuständig</label>
              <input
                id="assignee"
                type="text"
                value={assigneeText}
                onChange={(e) => setAssigneeText(e.target.value)}
                placeholder="z.B. Ramon D."
                className={inputClasses}
              />
            </div>

            {/* Reporter name */}
            <div>
              <label htmlFor="reporter_name" className={labelClasses}>Name des Melders</label>
              <input
                id="reporter_name"
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="z.B. Hans Müller"
                className={inputClasses}
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contact_email" className={labelClasses}>Melder E-Mail</label>
              <input
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="name@beispiel.ch"
                className={inputClasses}
              />
            </div>

            {/* Street */}
            <div>
              <label htmlFor="street" className={labelClasses}>Strasse</label>
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Bahnhofstrasse"
                className={inputClasses}
              />
            </div>

            {/* House number */}
            <div>
              <label htmlFor="house_number" className={labelClasses}>Hausnummer</label>
              <input
                id="house_number"
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="12a"
                className={inputClasses}
              />
            </div>

            {/* Scheduled at */}
            <div>
              <label htmlFor="scheduled" className={labelClasses}>Termin</label>
              <input
                id="scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Quick actions for scheduled_at */}
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Schnellwahl Termin</p>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                {([0, 1] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setQuickDay(d)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      quickDay === d
                        ? "bg-amber-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {d === 0 ? "Heute" : "Morgen"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {QUICK_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setScheduledAt(quickDateTime(quickDay, time))}
                    className="rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:border-amber-500 hover:text-amber-600 transition-colors"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Internal notes */}
          <div className="mt-4">
            <label htmlFor="notes" className={labelClasses}>Interne Notizen</label>
            <textarea
              id="notes"
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Interne Notizen (nicht sichtbar für Kunden)..."
              className={inputClasses}
            />
          </div>

          {/* Save + Actions */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!isDirty || saveState === "saving"}
                className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saveState === "saving" ? "Speichern\u2026" : "Speichern"}
              </button>
              {saveState === "saved" && (
                <span className="text-emerald-600 text-sm">Gespeichert</span>
              )}
              {saveState === "error" && (
                <span className="text-red-600 text-sm">{errorMsg}</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3">
              <button
                onClick={handleSendInvite}
                disabled={!canSendInvite}
                title={isDirty ? "Bitte zuerst speichern" : !scheduledAt ? "Kein Termin gesetzt" : undefined}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {inviteState === "sending" ? "Sende\u2026" : "Termin senden"}
              </button>

              {status === "done" && (
                <button
                  onClick={handleRequestReview}
                  disabled={!canRequestReview}
                  title={
                    isDirty ? "Bitte zuerst speichern"
                      : !contactEmail.trim() ? "Keine Melder E-Mail vorhanden"
                        : reviewState === "sent" ? "Review bereits angefragt"
                          : undefined
                  }
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {reviewState === "sending" ? "Sende\u2026" : reviewState === "sent" ? "Review angefragt" : "Review anfragen"}
                </button>
              )}

              {inviteState === "sent" && <span className="text-emerald-600 text-sm">Invite gesendet</span>}
              {inviteState === "error" && <span className="text-red-600 text-sm">{inviteMsg}</span>}
              {reviewState === "sent" && (
                <span className="text-emerald-600 text-sm">
                  {initialData.review_sent_at ? `Gesendet am ${formatDate(initialData.review_sent_at)}` : "Review-Anfrage gesendet"}
                </span>
              )}
              {reviewState === "error" && <span className="text-red-600 text-sm">{reviewMsg}</span>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
