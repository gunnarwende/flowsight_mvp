"use client";

import { useCallback, useEffect, useState } from "react";
import type { CaseDetail } from "./page";
import { deriveReviewStatus } from "@/src/lib/reviews/deriveReviewStatus";
import type { CaseEvent } from "@/src/components/ops/CaseTimeline";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUSES = [
  { value: "new", label: "Neu" },
  { value: "scheduled", label: "Geplant" },
  { value: "in_arbeit", label: "In Arbeit" },
  { value: "warten", label: "Warten" },
  { value: "done", label: "Erledigt" },
  { value: "archived", label: "Abgeschlossen" },
] as const;

const STATUS_LABELS: Record<string, string> = Object.fromEntries(STATUSES.map(s => [s.value, s.label]));

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  scheduled: "bg-violet-100 text-violet-700",
  in_arbeit: "bg-indigo-100 text-indigo-700",
  warten: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
  archived: "bg-gray-100 text-gray-500",
};

const URGENCIES = [
  { value: "notfall", label: "Notfall" },
  { value: "dringend", label: "Dringend" },
  { value: "normal", label: "Normal" },
] as const;

const URGENCY_LABELS: Record<string, string> = Object.fromEntries(URGENCIES.map(u => [u.value, u.label]));

const QUICK_TIMES = ["08:00", "11:00", "15:00"] as const;

const NEXT_STEP: Record<string, string> = {
  new: "Sichten und einordnen",
  scheduled: "Einsatz durchführen",
  in_arbeit: "Einsatz abschliessen",
  warten: "Rückmeldung prüfen",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function quickDateTime(dayOffset: number, time: string): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return toDatetimeLocal(d.toISOString());
}

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

function formatTermin(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
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
  contact_email: "E-Mail", contact_phone: "Telefon", reporter_name: "Melder",
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
const editBtnClass = "p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

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
  hasAttachments = false,
}: {
  initialData: CaseDetail;
  isProspect?: boolean;
  caseEvents?: CaseEvent[];
  brandColor?: string;
  hasAttachments?: boolean;
}) {
  // ── Field state ──────────────────────────────────────────────────────
  const [status, setStatus] = useState(initialData.status);
  const [urgency, setUrgency] = useState(initialData.urgency);
  const [category, setCategory] = useState(initialData.category);
  const [plz, setPlz] = useState(initialData.plz);
  const [city, setCity] = useState(initialData.city);
  const [description, setDescription] = useState(initialData.description);
  const [assigneeText, setAssigneeText] = useState(initialData.assignee_text ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : "",
  );
  const [internalNotes, setInternalNotes] = useState(initialData.internal_notes ?? "");
  const [reporterName, setReporterName] = useState(initialData.reporter_name ?? "");
  const [contactPhone, setContactPhone] = useState(initialData.contact_phone ?? "");
  const [contactEmail, setContactEmail] = useState(initialData.contact_email ?? "");
  const [street, setStreet] = useState(initialData.street ?? "");
  const [houseNumber, setHouseNumber] = useState(initialData.house_number ?? "");
  const [quickDay, setQuickDay] = useState<0 | 1>(0);

  const [baseline, setBaseline] = useState({
    status: initialData.status,
    urgency: initialData.urgency,
    category: initialData.category,
    plz: initialData.plz,
    city: initialData.city,
    description: initialData.description,
    assignee_text: initialData.assignee_text ?? "",
    scheduled_at: initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : "",
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
  const [inviteState, setInviteState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reviewState, setReviewState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reviewMsg, setReviewMsg] = useState("");
  const [localEvents, setLocalEvents] = useState(caseEvents);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);

  // ── Staff for assignee dropdown ──────────────────────────────────────
  const [staffMembers, setStaffMembers] = useState<{ display_name: string }[]>([]);
  useEffect(() => {
    fetch("/api/ops/staff")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { display_name: string }[]) => setStaffMembers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Per-section dirty checks ─────────────────────────────────────────
  const steuerungDirty =
    status !== baseline.status || urgency !== baseline.urgency ||
    assigneeText !== baseline.assignee_text || scheduledAt !== baseline.scheduled_at;

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
  async function saveFields(fields: Record<string, unknown>): Promise<boolean> {
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
            (next as Record<string, unknown>)[key] = key === "scheduled_at" && v
              ? toDatetimeLocal(v as string) : v ?? "";
          }
        }
        return next;
      });
      setEditingSection(null);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      return true;
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
      return false;
    }
  }

  function saveSteuerung() {
    return saveFields({
      status, urgency,
      assignee_text: assigneeText || null,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });
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
    setEditingSection(null);
  }

  function startEdit(section: Section) {
    if (!editingSection) setEditingSection(section);
  }

  // ── Invite ───────────────────────────────────────────────────────────
  async function handleSendInvite() {
    if (steuerungDirty) {
      const ok = await saveSteuerung();
      if (!ok) return;
    }
    setInviteState("sending");
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/send-invite`, { method: "POST" });
      if (!res.ok) throw new Error("Fehler");
      setInviteState("sent");
      setTimeout(() => setInviteState("idle"), 3000);
    } catch {
      setInviteState("error");
    }
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
        title: "Review übersprungen", created_at: new Date().toISOString(),
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
    <div className={`bg-white border border-gray-200 ${hasAttachments ? "rounded-t-2xl rounded-b-none" : "rounded-2xl"} border-l-[4px] ${urgencyBorder} shadow-sm divide-y divide-gray-100 print:shadow-none print:border-gray-300`}>
      {/* ── STEUERUNG (full width) ──────────────────────────────── */}
      <div className={sectionPad}>
        {editingSection === "steuerung" ? (
          <div className="bg-gray-50 -mx-5 -my-4 px-5 py-4 rounded-t-2xl">
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
              <div>
                <label className={lbl}>Zuständig</label>
                {staffMembers.length > 0 ? (
                  <select value={assigneeText} onChange={e => setAssigneeText(e.target.value)} className={inp}>
                    <option value="">— Offen —</option>
                    {staffMembers.map(s => <option key={s.display_name} value={s.display_name}>{s.display_name}</option>)}
                    {assigneeText && !staffMembers.some(s => s.display_name === assigneeText) && (
                      <option value={assigneeText}>{assigneeText}</option>
                    )}
                  </select>
                ) : (
                  <input type="text" value={assigneeText} onChange={e => setAssigneeText(e.target.value)} placeholder="z.B. Ramon D." className={inp} />
                )}
              </div>
              <div>
                <label className={lbl}>Termin</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className={inp} />
              </div>
            </div>

            {/* Termin quick-pick */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {([0, 1] as const).map(d => (
                  <button key={d} type="button" onClick={() => setQuickDay(d)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${quickDay === d ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  >{d === 0 ? "Heute" : "Morgen"}</button>
                ))}
              </div>
              <div className="flex gap-1">
                {QUICK_TIMES.map(time => (
                  <button key={time} type="button" onClick={() => setScheduledAt(quickDateTime(quickDay, time))}
                    className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 hover:border-gray-400 transition-colors"
                  >{time}</button>
                ))}
              </div>
              {scheduledAt && (
                <button onClick={handleSendInvite} disabled={inviteState === "sending"}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
                >{inviteState === "sending" ? "Sende…" : inviteState === "sent" ? "Gesendet ✓" : "Termin senden"}</button>
              )}
            </div>

            <EditActions onSave={saveSteuerung} onCancel={cancelEdit} saving={saveState === "saving"} dirty={steuerungDirty} error={saveState === "error" ? errorMsg : ""} />
          </div>
        ) : (
          <>
            <SectionHead title="Übersicht" onEdit={() => startEdit("steuerung")} canEdit={canEditSection("steuerung")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
              <KV label="Status">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABELS[status] ?? status}
                </span>
              </KV>
              <KV label="Priorität">
                <span className="text-gray-900">{URGENCY_LABELS[urgency] ?? urgency}</span>
              </KV>
              <KV label="Zuständig">
                {assigneeText
                  ? <span className="text-gray-900">→ {assigneeText}</span>
                  : <span className="text-gray-500">Nicht zugewiesen</span>}
              </KV>
              <KV label="Termin">
                {scheduledAt
                  ? <span className="text-gray-900 font-medium">{formatTermin(new Date(scheduledAt).toISOString())}</span>
                  : <span className="text-gray-500">Offen</span>}
              </KV>
            </div>

            {/* Save state feedback */}
            {(saveState === "saved" || saveState === "error") && (
              <div className="mt-2">
                {saveState === "saved" && <span className="text-emerald-600 text-xs">Gespeichert</span>}
                {saveState === "error" && <span className="text-red-600 text-xs">{errorMsg}</span>}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── DESKTOP: 2-column (Beschreibung left, Kontakt+Notizen right) ── */}
      <div className={`${sectionPad} md:flex md:gap-6`}>
        {/* LEFT: Beschreibung */}
        <div className="flex-1 min-w-0 md:border-r md:border-gray-100 md:pr-6">
          {editingSection === "beschreibung" ? (
            <div className="bg-gray-50 -mx-5 md:-ml-0 md:-mr-6 -my-4 px-5 py-4 md:rounded-none">
              <SectionHead title="Beschreibung" editing onClose={cancelEdit} />
              <div className="space-y-3">
                <div><label className={lbl}>Kategorie</label><input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inp} /></div>
                <div><label className={lbl}>Beschreibung</label><textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} className={`${inp} max-h-60 overflow-y-auto`} /></div>
              </div>
              <EditActions onSave={saveBeschreibung} onCancel={cancelEdit} saving={saveState === "saving"} dirty={beschreibungDirty} error={saveState === "error" ? errorMsg : ""} />
            </div>
          ) : (
            <>
              <SectionHead title="Beschreibung" onEdit={() => startEdit("beschreibung")} canEdit={canEditSection("beschreibung")} />
              <p className="text-sm font-semibold text-gray-800 mb-2">{category}</p>
              {description ? (
                <div className="overflow-hidden">
                  <p className={`text-sm text-gray-600 leading-normal whitespace-pre-wrap break-words ${!descExpanded ? "line-clamp-3" : ""}`}>{description}</p>
                  {(description.split("\n").length > 3 || description.length > 200) && (
                    <button onClick={() => setDescExpanded(p => !p)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline mt-2 transition-colors min-h-[44px] sm:min-h-0 flex items-center">
                      {descExpanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">—</p>
              )}
            </>
          )}
        </div>

        {/* RIGHT: Kontakt + Notizen — reference rail */}
        <div className="md:w-72 lg:w-80 flex-shrink-0 mt-5 md:mt-0">
         <div className="md:bg-gray-50/50 md:rounded-xl md:p-4 space-y-4">
          {/* ── KONTAKT ─────────────────────────────────────────── */}
          {editingSection === "kontakt" ? (
            <div className="bg-gray-50 -mx-5 md:mx-0 px-5 md:px-4 py-4 md:rounded-lg">
              <SectionHead title="Kontakt" editing onClose={cancelEdit} />
              <div className="space-y-3">
                <div><label className={lbl}>Melder</label><input type="text" value={reporterName} onChange={e => setReporterName(e.target.value)} placeholder="Hans Müller" className={inp} /></div>
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
            <>
              <SectionHead title="Kontakt" onEdit={() => startEdit("kontakt")} canEdit={canEditSection("kontakt")} />
              <div className="space-y-1 text-sm">
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
                {/* Address */}
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
            </>
          )}

          {/* ── NOTIZEN (in right rail) ────────────────────────── */}
          <div className="pt-3 border-t border-gray-200/60">
            {editingSection === "notizen" ? (
              <div className="bg-gray-50 -mx-5 md:mx-0 px-5 md:px-4 py-4 md:rounded-lg">
                <SectionHead title="Interne Notizen" editing onClose={cancelEdit} />
                <textarea rows={4} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Nur intern sichtbar…" className={`${inp} max-h-40 overflow-y-auto`} />
                <EditActions onSave={saveNotizen} onCancel={cancelEdit} saving={saveState === "saving"} dirty={notizenDirty} error={saveState === "error" ? errorMsg : ""} />
              </div>
            ) : (
              <>
                <SectionHead title="Interne Notizen" onEdit={() => startEdit("notizen")} canEdit={canEditSection("notizen")} />
                {internalNotes ? (
                  <div>
                    <p className={`text-sm text-gray-600 whitespace-pre-wrap ${!notesExpanded ? "line-clamp-2" : ""}`}>{internalNotes}</p>
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
         </div>
        </div>
      </div>

      {/* ── VERLAUF + BEWERTUNG ──────────────────────────────────── */}
      <div className={sectionPad}>
        <h3 className={`${sectionTitle} mb-3`}>Verlauf</h3>
        <CompactTimeline
          events={localEvents}
          status={status}
          expanded={timelineExpanded}
          onToggle={() => setTimelineExpanded(p => !p)}
        />

        {/* Bewertung end-cap — always visible, final goal post */}
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
    <div>
      <span className="text-gray-400 text-[11px] font-medium uppercase tracking-wide">{label}</span>
      <div className="mt-0.5">{children}</div>
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
    <div className="flex items-center gap-2 mt-3">
      <button onClick={onSave} disabled={!dirty || saving}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >{saving ? "Speichern…" : "Speichern"}</button>
      <button onClick={onCancel}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >Abbrechen</button>
      {error && <span className="text-red-600 text-xs">{error}</span>}
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
      ? <p className="text-sm text-amber-600 font-medium">→ {nextStep}</p>
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
            <span className="text-sm text-amber-600 font-medium">→ {nextStep}</span>
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
        <p className="text-sm text-gray-700 leading-snug truncate">{humanizeTitle(event.title)}</p>
        <p className="text-[11px] text-gray-400">{formatEventDate(event.created_at)}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stars SVG
// ---------------------------------------------------------------------------

function StarIcon({ filled, brandColor, muted }: { filled: boolean; brandColor: string; muted?: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      strokeWidth={1.5}
      stroke={filled ? brandColor : brandColor}
      style={muted ? { opacity: 0.35 } : undefined}
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
  const isActive = status === "done" || status === "archived";
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
  } else if (status === "archived" && !reviewSent) {
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
              >Überspringen</button>
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
