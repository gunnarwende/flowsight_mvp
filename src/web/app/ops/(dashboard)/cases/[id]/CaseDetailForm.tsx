"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CaseDetail } from "./page";
import { deriveReviewStatus } from "@/src/lib/reviews/deriveReviewStatus";
import type { CaseEvent } from "@/src/components/ops/CaseTimeline";
import { AttachmentsSection } from "./AttachmentsSection";
import { AppointmentPicker } from "@/src/components/ops/AppointmentPicker";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUSES = [
  { value: "new", label: "Neu" },
  { value: "scheduled", label: "Geplant" },
  { value: "in_arbeit", label: "In Arbeit" },
  { value: "warten", label: "Warten" },
  { value: "done", label: "Erledigt" },
] as const;

const STATUS_LABELS: Record<string, string> = Object.fromEntries(STATUSES.map(s => [s.value, s.label]));

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  scheduled: "bg-violet-100 text-violet-700",
  in_arbeit: "bg-indigo-100 text-indigo-700",
  warten: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

const URGENCIES = [
  { value: "notfall", label: "Notfall" },
  { value: "dringend", label: "Dringend" },
  { value: "normal", label: "Normal" },
] as const;

const URGENCY_LABELS: Record<string, string> = Object.fromEntries(URGENCIES.map(u => [u.value, u.label]));

const NEXT_STEP: Record<string, string> = {
  new: "Sichten und einordnen",
  scheduled: "Einsatz durchführen",
  in_arbeit: "Arbeit erledigen",
  warten: "Rückmeldung prüfen",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

/** Strip trailing period from weekday abbreviation (de-CH: "Mo." → "Mo") */
function shortDay(d: Date): string {
  return d.toLocaleDateString("de-CH", { weekday: "short", timeZone: "Europe/Zurich" }).replace(/\.$/, "");
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
}

function formatTerminRange(startIso: string, endIso: string | null): string {
  const s = new Date(startIso);

  if (!endIso) {
    return `${shortDay(s)} ${fmtDate(s)}, ${fmtTime(s)}`;
  }

  const e = new Date(endIso);
  const sameDay = fmtDate(s) === fmtDate(e) &&
    s.getFullYear() === e.getFullYear();

  if (sameDay) {
    return `${shortDay(s)} ${fmtDate(s)} · ${fmtTime(s)}–${fmtTime(e)}`;
  }
  // Multi-day: "Mo 02.03. 11:00 – Fr 06.03. 09:00"
  return `${shortDay(s)} ${fmtDate(s)} ${fmtTime(s)} – ${shortDay(e)} ${fmtDate(e)} ${fmtTime(e)}`;
}

function googleMapsUrl(street: string | null, houseNumber: string | null, plz: string, city: string): string {
  const parts = [street, houseNumber, plz, city, "Schweiz"].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(" "))}`;
}

/** Humanize legacy timeline titles stored with raw field names */
const LEGACY_FIELD_MAP: Record<string, string> = {
  urgency: "Priorität", category: "Kategorie", description: "Beschreibung",
  plz: "PLZ", city: "Ort", street: "Strasse", house_number: "Hausnummer",
  assignee_text: "Zuständig", scheduled_at: "Termin", internal_notes: "Notizen",
  contact_email: "E-Mail", contact_phone: "Telefon", reporter_name: "Kunde",
};

function humanizeTitle(title: string): string {
  const fieldsMatch = title.match(/^Felder aktualisiert:\s*(.+)$/);
  if (fieldsMatch) {
    const fields = fieldsMatch[1].split(",").map(f => f.trim());
    const humanFields = fields.map(f => LEGACY_FIELD_MAP[f] ?? f);
    return humanFields.length === 1
      ? `${humanFields[0]} aktualisiert`
      : `${humanFields.join(", ")} aktualisiert`;
  }
  return title;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const inp = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30 transition-colors";
const lbl = "block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1";
const sectionTitle = "text-xs font-bold text-gray-700 uppercase tracking-wider";
const sectionPad = "px-5 py-4";
const editBtnClass = "p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

// ---------------------------------------------------------------------------
// Section type
// ---------------------------------------------------------------------------

type Section = "steuerung" | "kontakt" | "beschreibung" | "notizen" | null;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseDetailForm({
  initialData,
  isProspect = false,
  caseEvents = [],
  brandColor = "#64748b",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentStaffName,
  staffRole,
}: {
  initialData: CaseDetail;
  isProspect?: boolean;
  caseEvents?: CaseEvent[];
  brandColor?: string;
  /** Staff display_name matching logged-in user's email (kept for future use) */
  currentStaffName?: string | null;
  /** Role-based access: "admin" | "techniker" | undefined (full access) */
  staffRole?: "admin" | "techniker";
}) {
  // ── Field state ──────────────────────────────────────────────────────
  const [status, setStatus] = useState(initialData.status);
  const [urgency, setUrgency] = useState(initialData.urgency);
  const [category, setCategory] = useState(initialData.category);
  const [plz, setPlz] = useState(initialData.plz);
  const [city, setCity] = useState(initialData.city);
  const [description, setDescription] = useState(initialData.description);
  const [assigneeText, setAssigneeText] = useState(initialData.assignee_text ?? "");
  const [scheduledAt, setScheduledAt] = useState(initialData.scheduled_at ?? "");
  const [scheduledEndAt, setScheduledEndAt] = useState(initialData.scheduled_end_at ?? "");
  const [internalNotes, setInternalNotes] = useState(initialData.internal_notes ?? "");
  const [reporterName, setReporterName] = useState(initialData.reporter_name ?? "");
  const [contactPhone, setContactPhone] = useState(initialData.contact_phone ?? "");
  const [contactEmail, setContactEmail] = useState(initialData.contact_email ?? "");
  const [street, setStreet] = useState(initialData.street ?? "");
  const [houseNumber, setHouseNumber] = useState(initialData.house_number ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  // ── Steuerung notification state (edit-mode inline buttons) ────────
  const [assigneeNotifyState, setAssigneeNotifyState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [terminSendState, setTerminSendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showCloseWarning, setShowCloseWarning] = useState(false);

  const [baseline, setBaseline] = useState({
    status: initialData.status,
    urgency: initialData.urgency,
    category: initialData.category,
    plz: initialData.plz,
    city: initialData.city,
    description: initialData.description,
    assignee_text: initialData.assignee_text ?? "",
    scheduled_at: initialData.scheduled_at ?? "",
    scheduled_end_at: initialData.scheduled_end_at ?? "",
    internal_notes: initialData.internal_notes ?? "",
    reporter_name: initialData.reporter_name ?? "",
    contact_phone: initialData.contact_phone ?? "",
    contact_email: initialData.contact_email ?? "",
    street: initialData.street ?? "",
    house_number: initialData.house_number ?? "",
  });

  // ── UI state ─────────────────────────────────────────────────────────
  const [editingSection, setEditingSection] = useState<Section>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [reviewState, setReviewState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reviewMsg, setReviewMsg] = useState("");
  const [localEvents, setLocalEvents] = useState(caseEvents);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  // ── Staff for assignee dropdown ──────────────────────────────────────
  const [staffMembers, setStaffMembers] = useState<{ display_name: string; role: string }[]>([]);
  useEffect(() => {
    fetch("/api/ops/staff")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { display_name: string; role: string }[]) => setStaffMembers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Assignee multi-select helpers ────────────────────────────────────
  /** Parse comma-separated assignee_text into an array of names */
  function parseAssignees(text: string): string[] {
    return text.split(",").map(s => s.trim()).filter(Boolean);
  }
  const selectedAssignees = parseAssignees(assigneeText);

  function addAssignee(name: string) {
    if (!name || selectedAssignees.includes(name)) return;
    const next = [...selectedAssignees, name];
    setAssigneeText(next.join(", "));
  }

  function removeAssignee(name: string) {
    const next = selectedAssignees.filter(n => n !== name);
    setAssigneeText(next.join(", "));
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: "Admin",
    techniker: "Techniker",
  };

  // ── Per-section dirty checks ─────────────────────────────────────────
  const steuerungDirty =
    status !== baseline.status || urgency !== baseline.urgency ||
    assigneeText !== baseline.assignee_text || scheduledAt !== baseline.scheduled_at ||
    scheduledEndAt !== baseline.scheduled_end_at;

  // ── Live dirty: new assignees + termin changed (for inline notification buttons)
  const liveNewAssignees = selectedAssignees.filter(a => !parseAssignees(baseline.assignee_text).includes(a));
  const liveTerminChanged = (scheduledAt !== baseline.scheduled_at || scheduledEndAt !== baseline.scheduled_end_at) && !!scheduledAt;

  const kontaktDirty =
    street !== baseline.street || houseNumber !== baseline.house_number ||
    plz !== baseline.plz || city !== baseline.city ||
    reporterName !== baseline.reporter_name || contactPhone !== baseline.contact_phone ||
    contactEmail !== baseline.contact_email;

  const beschreibungDirty = category !== baseline.category || description !== baseline.description;
  const notizenDirty = internalNotes !== baseline.internal_notes;

  const currentDirty =
    editingSection === "steuerung" ? steuerungDirty :
    editingSection === "kontakt" ? kontaktDirty :
    editingSection === "beschreibung" ? beschreibungDirty :
    editingSection === "notizen" ? notizenDirty : false;

  // ── Beforeunload ─────────────────────────────────────────────────────
  const onBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (currentDirty) e.preventDefault();
  }, [currentDirty]);
  useEffect(() => {
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [onBeforeUnload]);

  // ── Save helpers ─────────────────────────────────────────────────────
  async function saveFields(fields: Record<string, unknown>, opts?: { keepEditing?: boolean }): Promise<boolean> {
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setBaseline(prev => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(fields)) {
          const key = k as keyof typeof next;
          if (key in next) {
            (next as Record<string, unknown>)[key] = v ?? "";
          }
        }
        return next;
      });
      if (!opts?.keepEditing) setEditingSection(null);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      return true;
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
      return false;
    }
  }

  /** Save steuerung and close — warns if notification-worthy changes exist */
  async function saveSteuerungAndClose() {
    if (liveNewAssignees.length > 0 || liveTerminChanged) {
      setShowCloseWarning(true);
      return;
    }
    const ok = await saveFields({
      status, urgency,
      assignee_text: assigneeText || null,
      scheduled_at: scheduledAt || null,
      scheduled_end_at: scheduledEndAt || null,
    });
    if (ok) {
      setAssigneeNotifyState("idle");
      setTerminSendState("idle");
    }
  }

  /** Force-save without sending notifications */
  async function forceSaveSteuerung() {
    setShowCloseWarning(false);
    await saveFields({
      status, urgency,
      assignee_text: assigneeText || null,
      scheduled_at: scheduledAt || null,
      scheduled_end_at: scheduledEndAt || null,
      _skip_assignee_notify: true,
    });
  }

  /** Save + notify new assignees in one step */
  async function handleSaveAndNotifyAssignees() {
    const namesToNotify = [...liveNewAssignees]; // capture before save updates baseline
    setAssigneeNotifyState("sending");
    const ok = await saveFields({
      status, urgency,
      assignee_text: assigneeText || null,
      scheduled_at: scheduledAt || null,
      scheduled_end_at: scheduledEndAt || null,
      _skip_assignee_notify: true,
    }, { keepEditing: true });
    if (!ok) { setAssigneeNotifyState("error"); setTimeout(() => setAssigneeNotifyState("idle"), 4000); return; }
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/notify-assignees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: namesToNotify }),
      });
      if (!res.ok) throw new Error("Benachrichtigung fehlgeschlagen");
      setAssigneeNotifyState("sent");
      setTimeout(() => setAssigneeNotifyState("idle"), 3000);
      setLocalEvents(prev => [...prev, {
        id: crypto.randomUUID(), event_type: "assignee_notified",
        title: `Zuständige benachrichtigt: ${namesToNotify.join(", ")}`,
        created_at: new Date().toISOString(),
      }]);
    } catch {
      setAssigneeNotifyState("error");
      setTimeout(() => setAssigneeNotifyState("idle"), 4000);
    }
  }

  /** Save + send termin to all assignees + customer in one step */
  async function handleSaveAndSendTermin() {
    setTerminSendState("sending");
    const ok = await saveFields({
      status, urgency,
      assignee_text: assigneeText || null,
      scheduled_at: scheduledAt || null,
      scheduled_end_at: scheduledEndAt || null,
      _skip_assignee_notify: true,
    }, { keepEditing: true });
    if (!ok) { setTerminSendState("error"); setTimeout(() => setTerminSendState("idle"), 4000); return; }
    try {
      const inviteRes = await fetch(`/api/ops/cases/${initialData.id}/send-invite`, { method: "POST" });
      if (!inviteRes.ok) throw new Error("Mitarbeiter-Einladung fehlgeschlagen");
      const hasContact = !!(contactEmail.trim() || contactPhone.trim());
      if (hasContact) {
        const melderRes = await fetch(`/api/ops/cases/${initialData.id}/notify-melder`, { method: "POST" });
        if (!melderRes.ok) throw new Error("Kundenbenachrichtigung fehlgeschlagen");
      }
      setTerminSendState("sent");
      setTimeout(() => setTerminSendState("idle"), 3000);
      setLocalEvents(prev => [...prev, {
        id: crypto.randomUUID(), event_type: "termin_versendet",
        title: `Termin versendet${hasContact ? " (Mitarbeiter + Kunde)" : " (Mitarbeiter)"}`,
        created_at: new Date().toISOString(),
      }]);
    } catch {
      setTerminSendState("error");
      setTimeout(() => setTerminSendState("idle"), 4000);
    }
  }

  function saveKontakt() {
    return saveFields({
      street: street.trim() || null,
      house_number: houseNumber.trim() || null,
      plz: plz.trim(), city: city.trim(),
      reporter_name: reporterName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
    });
  }

  function saveBeschreibung() {
    return saveFields({
      category: category.trim(),
      description: description.trim(),
    });
  }

  function saveNotizen() {
    return saveFields({ internal_notes: internalNotes || null });
  }

  function cancelEdit() {
    setStatus(baseline.status);
    setUrgency(baseline.urgency);
    setAssigneeText(baseline.assignee_text);
    setScheduledAt(baseline.scheduled_at);
    setScheduledEndAt(baseline.scheduled_end_at);
    setPickerOpen(false);
    setStreet(baseline.street);
    setHouseNumber(baseline.house_number);
    setPlz(baseline.plz);
    setCity(baseline.city);
    setReporterName(baseline.reporter_name);
    setContactPhone(baseline.contact_phone);
    setContactEmail(baseline.contact_email);
    setCategory(baseline.category);
    setDescription(baseline.description);
    setInternalNotes(baseline.internal_notes);
    setAssigneeNotifyState("idle");
    setTerminSendState("idle");
    setShowCloseWarning(false);
    setEditingSection(null);
  }

  function startEdit(section: Section) {
    if (!editingSection) setEditingSection(section);
  }

  // ── Review ───────────────────────────────────────────────────────────
  const hasContactInfo = !!contactEmail.trim() || !!contactPhone.trim();
  const reviewInfo = deriveReviewStatus({
    caseStatus: status,
    hasContactInfo,
    reviewSentAt: initialData.review_sent_at,
    events: localEvents.map(e => ({ event_type: e.event_type, created_at: e.created_at })),
  });
  const canRequestReview = reviewInfo.canRequest || reviewInfo.canResend;

  async function handleRequestReview() {
    setReviewState("sending");
    setReviewMsg("");
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/request-review`, { method: "POST" });
      if (!res.ok) throw new Error("Fehler");
      setReviewState("sent");
      setTimeout(() => setReviewState("idle"), 2000);
      setLocalEvents(prev => [...prev, {
        id: crypto.randomUUID(), event_type: "review_requested",
        title: "Bewertungsanfrage gesendet", created_at: new Date().toISOString(),
      }]);
    } catch {
      setReviewState("error");
      setReviewMsg("Senden fehlgeschlagen.");
    }
  }

  async function handleSkipReview() {
    try {
      await fetch(`/api/ops/cases/${initialData.id}/skip-review`, { method: "POST" });
      setLocalEvents(prev => [...prev, {
        id: crypto.randomUUID(), event_type: "review_skipped",
        title: "Bewertung nicht angefragt", created_at: new Date().toISOString(),
      }]);
    } catch { /* silent */ }
  }

  // ── Computed values ──────────────────────────────────────────────────
  const urgencyBorder =
    urgency === "notfall" ? "border-l-red-500" :
    urgency === "dringend" ? "border-l-amber-400" : "border-l-gray-200";

  const canEditSection = (s: Section) => !editingSection || editingSection === s;

  // ════════════════════════════════════════════════════════════════════
  // PROSPECT VIEW — simplified read-only + status change
  // ════════════════════════════════════════════════════════════════════
  if (isProspect) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl border-l-[4px] ${urgencyBorder} shadow-sm divide-y divide-gray-100`}>
        <div className={sectionPad}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-3">
            <div><span className="text-gray-400 text-xs">Status</span>
              <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div><span className="text-gray-400 text-xs">Priorität</span>
              <p className="text-gray-900 font-medium">{URGENCY_LABELS[urgency] ?? urgency}</p>
            </div>
          </div>
          <p className="text-sm text-gray-900 font-medium mb-1">{category}</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{description || "—"}</p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button onClick={() => saveFields({ status })} disabled={status === baseline.status || saveState === "saving"}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >{saveState === "saving" ? "Speichern…" : "Status speichern"}</button>
            {saveState === "saved" && <span className="text-emerald-600 text-xs">Gespeichert</span>}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════
  // FULL CASE SURFACE
  // ════════════════════════════════════════════════════════════════════
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl border-l-[4px] ${urgencyBorder} shadow-sm print:shadow-none print:border-gray-300`}>
      {/* ── ÜBERSICHT (full width top band) ─────────────────────── */}
      <div className={sectionPad}>
        {editingSection === "steuerung" ? (
          <div className="bg-gradient-to-b from-stone-50/80 to-gray-50/50 -mx-5 -my-4 px-5 py-4 rounded-t-2xl">
            <SectionHead title="Übersicht" editing onClose={cancelEdit} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className={lbl}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className={inp}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Priorität</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)} className={inp}>
                  {URGENCIES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className={lbl}>Zuständig</label>
                {staffRole === "techniker" ? (
                  <p className={`${inp} bg-gray-50 text-gray-500`}>{assigneeText || "—"}</p>
                ) : staffMembers.length > 0 ? (
                  <StaffMultiSelect
                    staffMembers={staffMembers}
                    selected={selectedAssignees}
                    onAdd={addAssignee}
                    onRemove={removeAssignee}
                    roleLabels={ROLE_LABELS}
                  />
                ) : (
                  <input type="text" value={assigneeText} onChange={e => setAssigneeText(e.target.value)} placeholder="z.B. Ramon D." className={inp} />
                )}

                {/* Zuständige benachrichtigen — sofort bei Änderung */}
                {liveNewAssignees.length > 0 && assigneeNotifyState !== "sent" && (
                  <button
                    onClick={handleSaveAndNotifyAssignees}
                    disabled={assigneeNotifyState === "sending"}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-60 transition-colors print:hidden"
                  >
                    {assigneeNotifyState === "sending" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Wird benachrichtigt…</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                        <span>Benachrichtigen</span>
                      </>
                    )}
                  </button>
                )}
                {liveNewAssignees.length > 0 && assigneeNotifyState === "idle" && (
                  <p className="text-xs text-gray-500 mt-1">Neu: {liveNewAssignees.join(", ")}</p>
                )}
                {assigneeNotifyState === "sent" && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-xs text-emerald-700 font-medium">Benachrichtigt</span>
                  </div>
                )}
                {assigneeNotifyState === "error" && (
                  <p className="text-xs text-red-600 mt-1">Benachrichtigung fehlgeschlagen</p>
                )}
              </div>
              <div>
                <label className={lbl}>Termin</label>
                <button
                  type="button"
                  onClick={() => setPickerOpen(p => !p)}
                  className={`${inp} text-left`}
                >
                  {scheduledAt
                    ? formatTerminRange(scheduledAt, scheduledEndAt || null)
                    : <span className="text-gray-400">Termin wählen</span>}
                </button>

                {/* Termin versenden — sofort bei Änderung */}
                {liveTerminChanged && terminSendState !== "sent" && (contactEmail.trim() || contactPhone.trim()) && (
                  <button
                    onClick={handleSaveAndSendTermin}
                    disabled={terminSendState === "sending"}
                    className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-60 transition-colors print:hidden"
                  >
                    {terminSendState === "sending" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Wird versendet…</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                        <span>Termin versenden</span>
                      </>
                    )}
                  </button>
                )}
                {/* Channel hint: what channel will be used for customer notification */}
                {liveTerminChanged && terminSendState === "idle" && (
                  <p className="text-xs text-gray-500 mt-1">
                    {!contactEmail.trim() && !contactPhone.trim()
                      ? "Keine Kontaktdaten — Kunde wird nicht benachrichtigt"
                      : !contactEmail.trim()
                        ? "Kunde wird per SMS benachrichtigt"
                        : contactPhone.trim()
                          ? "Kunde wird per E-Mail + SMS benachrichtigt"
                          : "Kunde wird per E-Mail benachrichtigt"
                    }
                  </p>
                )}
                {/* No contact warning — shown instead of button */}
                {liveTerminChanged && !contactEmail.trim() && !contactPhone.trim() && terminSendState !== "sent" && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">Termin wird nur an Zuständige gesendet</p>
                )}
                {terminSendState === "sent" && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span className="text-xs text-emerald-700 font-medium">Termin versendet</span>
                  </div>
                )}
                {terminSendState === "error" && (
                  <p className="text-xs text-red-600 mt-1">Versand fehlgeschlagen</p>
                )}
              </div>
            </div>

            {/* Appointment Picker (inline) */}
            {pickerOpen && (
              <AppointmentPicker
                initialStart={scheduledAt || null}
                initialEnd={scheduledEndAt || null}
                brandColor={brandColor}
                onConfirm={(startIso, endIso) => {
                  setScheduledAt(startIso);
                  setScheduledEndAt(endIso);
                  setPickerOpen(false);
                }}
                onCancel={() => setPickerOpen(false)}
              />
            )}

            {/* Close warning */}
            {showCloseWarning && (
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                <p className="font-medium">Benachrichtigungen noch nicht versendet</p>
                <p className="text-xs mt-0.5">Zuständige und/oder Termindaten wurden geändert, aber noch nicht verschickt.</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={forceSaveSteuerung}
                    className="rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                  >Trotzdem speichern</button>
                  <button onClick={() => setShowCloseWarning(false)}
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
                  >Zurück</button>
                </div>
              </div>
            )}

            <EditActions
              onSave={saveSteuerungAndClose}
              onCancel={cancelEdit}
              saving={saveState === "saving"}
              dirty={steuerungDirty}
              error={saveState === "error" ? errorMsg : ""}
            />
          </div>
        ) : (
          <div className="bg-gradient-to-b from-stone-50/80 to-white -mx-5 -my-4 px-6 py-5 rounded-t-2xl">
            <SectionHead title="Übersicht" onEdit={() => startEdit("steuerung")} canEdit={canEditSection("steuerung")} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 min-w-0">
              <KV label="Status">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABELS[status] ?? status}
                </span>
              </KV>
              <KV label="Priorität">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  urgency === "notfall" ? "bg-red-100 text-red-700" :
                  urgency === "dringend" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{URGENCY_LABELS[urgency] ?? urgency}</span>
              </KV>
              <KV label="Zuständig">
                {selectedAssignees.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {selectedAssignees.map(name => (
                      <span key={name} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700">
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-sm font-medium text-gray-500">Offen</span>
                )}
              </KV>
              <KV label="Termin">
                {scheduledAt ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">{formatTerminRange(scheduledAt, scheduledEndAt || null)}</span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-sm font-medium text-gray-500">Offen</span>
                )}
              </KV>
            </div>

            {/* Save state feedback */}
            {(saveState === "saved" || saveState === "error") && (
              <div className="mt-2">
                {saveState === "saved" && <span className="text-emerald-600 text-xs">Gespeichert</span>}
                {saveState === "error" && <span className="text-red-600 text-xs">{errorMsg}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2-LANE BODY ──────────────────────────────────────────── */}
      {/* ── BODY ──────────────────────────────────────────────── */}
      <div className="p-3 space-y-3 print:block">

        {/* ── Row 1: Beschreibung + Kontakt (equal height) ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Beschreibung card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
            {editingSection === "beschreibung" ? (
              <div className="bg-gray-50 -m-4 p-4 rounded-xl flex-1">
                <SectionHead title="Beschreibung" editing onClose={cancelEdit} />
                <div className="space-y-3">
                  <div><label className={lbl}>Kategorie</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inp} /></div>
                  <div><label className={lbl}>Beschreibung</label><textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className={`${inp} max-h-60 overflow-y-auto`} /></div>
                </div>
                <EditActions onSave={saveBeschreibung} onCancel={cancelEdit} saving={saveState === "saving"} dirty={beschreibungDirty} error={saveState === "error" ? errorMsg : ""} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <SectionHead title="Beschreibung" onEdit={() => startEdit("beschreibung")} canEdit={canEditSection("beschreibung")} />
                <p className="text-sm font-semibold text-gray-800 mb-2">{category}</p>
                {description ? (
                  <div className="overflow-hidden flex-1">
                    <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words ${!descExpanded ? "line-clamp-2 sm:line-clamp-3" : ""}`}>{description}</p>
                    {(description.split("\n").length > 3 || description.length > 200) && (
                      <button onClick={() => setDescExpanded(p => !p)}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 mt-2 transition-colors min-h-[44px] sm:min-h-0">
                        {descExpanded ? "Weniger" : "Mehr anzeigen"}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 flex-1">—</p>
                )}
              </div>
            )}
          </div>

          {/* Kontakt card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col">
            {editingSection === "kontakt" ? (
              <div className="flex-1">
                <SectionHead title="Kontakt" editing onClose={cancelEdit} />
                <div className="space-y-3">
                  <div><label className={lbl}>Kunde</label><input type="text" value={reporterName} onChange={e => setReporterName(e.target.value)} placeholder="Hans Müller" className={inp} /></div>
                  <div><label className={lbl}>Telefon</label><input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+41 79..." className={inp} /></div>
                  <div><label className={lbl}>E-Mail</label><input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="name@beispiel.ch" className={inp} /></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2"><label className={lbl}>Strasse</label><input type="text" value={street} onChange={e => setStreet(e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Nr</label><input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} className={inp} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>PLZ</label><input type="text" value={plz} onChange={e => setPlz(e.target.value)} className={inp} /></div>
                    <div><label className={lbl}>Ort</label><input type="text" value={city} onChange={e => setCity(e.target.value)} className={inp} /></div>
                  </div>
                </div>
                <EditActions onSave={saveKontakt} onCancel={cancelEdit} saving={saveState === "saving"} dirty={kontaktDirty} error={saveState === "error" ? errorMsg : ""} />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <SectionHead title="Kontakt" onEdit={() => startEdit("kontakt")} canEdit={canEditSection("kontakt")} />
                <div className="space-y-1 text-sm flex-1">
                  {reporterName && <p className="font-medium text-gray-900">{reporterName}</p>}
                  {contactPhone && (
                    <a href={`tel:${contactPhone}`} className="block text-blue-600 hover:underline min-h-[44px] sm:min-h-0 flex items-center">{contactPhone}</a>
                  )}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="block text-blue-600 hover:underline break-all min-h-[44px] sm:min-h-0 flex items-center">{contactEmail}</a>
                  )}
                  {!reporterName && !contactPhone && !contactEmail && (
                    <p className="text-gray-400">Kein Kontakt hinterlegt</p>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-gray-600">
                      {[street, houseNumber].filter(Boolean).join(" ")}
                      {(street || houseNumber) && ", "}
                      {plz} {city}
                    </span>
                    <a href={googleMapsUrl(street, houseNumber, plz, city)} target="_blank" rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 min-h-[44px] sm:min-h-0 flex items-center" title="Google Maps">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Verlauf + Notizen/Anhänge ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Verlauf + Bewertung card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className={`${sectionTitle} mb-3`}>Verlauf</h3>
            <CompactTimeline
              events={localEvents}
              status={status}
              expanded={timelineExpanded}
              onToggle={() => setTimelineExpanded(p => !p)}
            />
            <BewertungEndCap
              status={status}
              reviewInfo={reviewInfo}
              canRequestReview={canRequestReview}
              reviewState={reviewState}
              reviewMsg={reviewMsg}
              onRequest={handleRequestReview}
              onSkip={handleSkipReview}
              brandColor={brandColor}
              hasEvents={localEvents.length > 0}
            />
          </div>

          {/* Notizen + Anhänge */}
          <div className="space-y-3">
            {/* Interne Notizen card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              {editingSection === "notizen" ? (
                <>
                  <SectionHead title="Interne Notizen" editing onClose={cancelEdit} />
                  <textarea rows={4} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Nur intern sichtbar…" className={`${inp} max-h-40 overflow-y-auto`} />
                  <EditActions onSave={saveNotizen} onCancel={cancelEdit} saving={saveState === "saving"} dirty={notizenDirty} error={saveState === "error" ? errorMsg : ""} />
                </>
              ) : (
                <>
                  <SectionHead title="Interne Notizen" onEdit={() => startEdit("notizen")} canEdit={canEditSection("notizen")} />
                  {internalNotes ? (
                    <div>
                      <p className={`text-sm text-gray-600 whitespace-pre-wrap break-words ${!notesExpanded ? "line-clamp-2" : ""}`} style={{ overflowWrap: "anywhere" }}>{internalNotes}</p>
                      {(internalNotes.includes("\n") || internalNotes.length > 80) && (
                        <button onClick={() => setNotesExpanded(p => !p)}
                          className="text-xs text-gray-400 hover:text-gray-600 mt-1 transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                          {notesExpanded ? "Weniger" : "Alles anzeigen"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Keine Notizen</p>
                  )}
                </>
              )}
            </div>

            {/* Anhänge card */}
            {!isProspect && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <AttachmentsSection caseId={initialData.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Section header with edit pencil or close X */
function SectionHead({
  title, editing, onEdit, onClose, canEdit,
}: {
  title: string;
  editing?: boolean;
  onEdit?: () => void;
  onClose?: () => void;
  canEdit?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <h3 className={sectionTitle}>{title}</h3>
      {editing && onClose && (
        <button onClick={onClose} className={editBtnClass} title="Abbrechen">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {!editing && onEdit && (
        <button onClick={onEdit} disabled={!canEdit} className={`${editBtnClass} print:hidden`} title="Bearbeiten">
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Key-value display pair */
function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <span className="text-gray-500 text-[11px] font-medium uppercase tracking-wide">{label}</span>
      <div className="mt-0.5 min-w-0 break-words">{children}</div>
    </div>
  );
}

/** Save/Cancel buttons for edit mode */
function EditActions({
  onSave, onCancel, saving, dirty, error,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  dirty: boolean;
  error?: string;
}) {
  return (
    <div className="flex items-center gap-3 mt-3">
      <button onClick={onSave} disabled={!dirty || saving}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >{saving ? "Speichern…" : "Speichern"}</button>
      <button onClick={onCancel}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      >Abbrechen</button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </div>
  );
}

/** Multi-select staff dropdown with chips */
function StaffMultiSelect({
  staffMembers,
  selected,
  onAdd,
  onRemove,
  roleLabels,
}: {
  staffMembers: { display_name: string; role: string }[];
  selected: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  roleLabels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const available = staffMembers.filter(
    s => !selected.includes(s.display_name) &&
      (search === "" || s.display_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Selected chips + input field */}
      <div
        className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400/30 transition-colors cursor-text flex flex-wrap gap-1.5 min-h-[38px] items-center"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selected.map(name => (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 pl-2.5 pr-1 py-0.5 text-xs font-medium text-gray-700 animate-in fade-in duration-150"
          >
            {name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(name); }}
              className="rounded-full p-0.5 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`${name} entfernen`}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? "Mitarbeiter auswählen…" : ""}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-gray-400 py-0.5"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {available.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-gray-400">
              {search ? "Kein Treffer" : "Alle zugewiesen"}
            </p>
          ) : (
            available.map(s => (
              <button
                key={s.display_name}
                type="button"
                onClick={() => {
                  onAdd(s.display_name);
                  setSearch("");
                  inputRef.current?.focus();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {/* Avatar circle */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[10px] font-bold uppercase">
                  {s.display_name.charAt(0)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900">{s.display_name}</span>
                  <span className="text-gray-400 ml-1.5 text-xs">{roleLabels[s.role] ?? s.role}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/** Compact timeline — first, +N, second-to-last, last, next step */
function CompactTimeline({
  events, status, expanded, onToggle,
}: {
  events: CaseEvent[];
  status: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const nextStep = NEXT_STEP[status];

  if (events.length === 0) {
    return nextStep
      ? <p className="text-sm text-amber-700 font-semibold">→ {nextStep}</p>
      : <p className="text-sm text-gray-400">Noch keine Einträge</p>;
  }

  const showAll = expanded || events.length <= 2;
  const first = events[0];
  const last = events.length > 1 ? events[events.length - 1] : null;
  const middleCount = events.length - 2;

  return (
    <div className="relative">
      <div className="absolute left-[5px] top-2 bottom-0 w-px bg-gray-200" />

      <div className="space-y-2">
        {showAll ? (
          events.map(ev => <TimelineItem key={ev.id} event={ev} />)
        ) : (
          <>
            <TimelineItem event={first} />
            {middleCount > 0 && (
              <button onClick={onToggle} className="relative flex items-center gap-2 pl-[18px] text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <span className="relative z-10 w-[10px] h-[10px] rounded-full border-2 border-dashed border-gray-300 bg-white" />
                +{middleCount} weitere {middleCount === 1 ? "Schritt" : "Schritte"}
              </button>
            )}
            {last && <TimelineItem event={last} />}
          </>
        )}

        {/* Next step hint */}
        {nextStep && (
          <div className="relative flex items-center gap-2">
            <div className="relative z-10 w-[10px] h-[10px] rounded-full border-2 border-dashed border-amber-400 bg-white flex-shrink-0" />
            <span className="text-sm text-amber-700 font-semibold">→ {nextStep}</span>
          </div>
        )}
      </div>

      {expanded && events.length > 2 && (
        <button onClick={onToggle} className="text-xs text-gray-400 hover:text-gray-600 mt-2 ml-[18px] transition-colors">
          Weniger anzeigen
        </button>
      )}
    </div>
  );
}

function TimelineItem({ event }: { event: CaseEvent }) {
  return (
    <div className="relative flex items-start gap-2">
      <div className="relative z-10 flex-shrink-0 mt-1">
        <div className="w-[10px] h-[10px] rounded-full border-2 border-white bg-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug truncate">{humanizeTitle(event.title)}</p>
        <p className="text-[11px] text-gray-400">{formatEventDate(event.created_at)}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stars SVG
// ---------------------------------------------------------------------------

function StarIcon({ filled, muted }: { filled: boolean; brandColor?: string; muted?: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "rgba(245,158,11,0.35)"}
      strokeWidth={1.5}
      stroke={filled ? "#b45309" : "#d97706"}
      style={muted ? { opacity: 0.5 } : undefined}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bewertung end-cap — connected to timeline, always visible
// ---------------------------------------------------------------------------

function BewertungEndCap({
  status, reviewInfo, canRequestReview, reviewState, reviewMsg,
  onRequest, onSkip, brandColor, hasEvents,
}: {
  status: string;
  reviewInfo: ReturnType<typeof deriveReviewStatus>;
  canRequestReview: boolean;
  reviewState: string;
  reviewMsg: string;
  onRequest: () => void;
  onSkip: () => void;
  brandColor: string;
  hasEvents: boolean;
}) {
  const isActive = status === "done";
  const reviewSent = reviewInfo.status === "angefragt" || reviewInfo.status === "geoeffnet" || reviewInfo.status === "geklickt";
  const starsMuted = !isActive; // muted when case not yet done

  // Determine copy
  let label: string;
  if (reviewSent) {
    label = "Bewertung angefragt";
  } else if (status === "done" && canRequestReview) {
    label = "Bewertung anfragen";
  } else if (reviewInfo.status === "kein_kontakt") {
    label = "Kein Kontakt hinterlegt";
  } else if (reviewInfo.status === "uebersprungen") {
    label = "Keine Bewertung angefragt";
  } else if (isActive) {
    label = "Bewertung möglich";
  } else {
    label = "Nach Erledigung möglich";
  }

  return (
    <div className={`relative mt-3 pt-3 ${hasEvents ? "border-t-0" : ""}`}>
      {/* Connecting line from timeline */}
      {hasEvents && <div className="absolute left-[5px] -top-2 h-5 w-px bg-gray-200" />}

      <div className="relative flex items-center gap-3">
        {/* Star circle — end-cap of timeline */}
        <div className="relative z-10 flex-shrink-0">
          <div className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: reviewSent ? "#f59e0b" : brandColor, opacity: starsMuted ? 0.35 : 1 }} />
        </div>

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Stars */}
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map(i => (
              <StarIcon key={i} filled={reviewSent} brandColor={brandColor} muted={starsMuted} />
            ))}
          </div>

          {/* Label + actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${reviewSent ? "text-amber-700" : isActive ? "text-gray-700" : "text-gray-400"}`}>
              {label}
            </span>

            {canRequestReview && !reviewSent && (
              <button onClick={onRequest} disabled={reviewState === "sending"}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors print:hidden"
              >{reviewState === "sending" ? "Sende…" : reviewInfo.canResend ? "Nochmals anfragen" : "Bewertung anfragen"}</button>
            )}

            {reviewInfo.canSkip && (
              <button onClick={onSkip}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors print:hidden"
              >Nicht anfragen</button>
            )}

            {reviewState === "sent" && <span className="text-emerald-600 text-xs">Gesendet</span>}
            {reviewState === "error" && <span className="text-red-600 text-xs">{reviewMsg}</span>}
            {reviewInfo.reviewCount > 0 && <span className="text-gray-400 text-xs">{reviewInfo.reviewCount}/2 Anfragen</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
