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

const URGENCIES = [
  { value: "notfall", label: "Notfall" },
  { value: "dringend", label: "Dringend" },
  { value: "normal", label: "Normal" },
] as const;

const QUICK_TIMES = ["08:00", "11:00", "15:00"] as const;

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseDetailForm({ initialData, isProspect = false, caseEvents = [] }: { initialData: CaseDetail; isProspect?: boolean; caseEvents?: CaseEvent[] }) {
  const [status, setStatus] = useState(initialData.status);
  const [urgency, setUrgency] = useState(initialData.urgency);
  const [category, setCategory] = useState(initialData.category);
  const [plz, setPlz] = useState(initialData.plz);
  const [city, setCity] = useState(initialData.city);
  const [description, setDescription] = useState(initialData.description);
  const [assigneeText, setAssigneeText] = useState(initialData.assignee_text ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    initialData.scheduled_at ? toDatetimeLocal(initialData.scheduled_at) : ""
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

  // Staff members for assignee dropdown
  const [staffMembers, setStaffMembers] = useState<{ display_name: string }[]>([]);
  useEffect(() => {
    fetch("/api/ops/staff")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { display_name: string }[]) => setStaffMembers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteState, setInviteState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [inviteMsg, setInviteMsg] = useState("");
  const [reviewState, setReviewState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reviewMsg, setReviewMsg] = useState("");
  const [localEvents, setLocalEvents] = useState(caseEvents);

  const isDirty =
    status !== baseline.status ||
    urgency !== baseline.urgency ||
    category !== baseline.category ||
    plz !== baseline.plz ||
    city !== baseline.city ||
    description !== baseline.description ||
    assigneeText !== baseline.assignee_text ||
    scheduledAt !== baseline.scheduled_at ||
    internalNotes !== baseline.internal_notes ||
    reporterName !== baseline.reporter_name ||
    contactPhone !== baseline.contact_phone ||
    contactEmail !== baseline.contact_email ||
    street !== baseline.street ||
    houseNumber !== baseline.house_number;

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

  async function performSave(): Promise<boolean> {
    setSaveState("saving");
    setErrorMsg("");

    try {
      const payload = isProspect
        ? { status }
        : {
            status,
            urgency,
            category: category.trim(),
            plz: plz.trim(),
            city: city.trim(),
            description: description.trim(),
            assignee_text: assigneeText || null,
            scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
            internal_notes: internalNotes || null,
            reporter_name: reporterName.trim() || null,
            contact_phone: contactPhone.trim() || null,
            contact_email: contactEmail.trim() || null,
            street: street.trim() || null,
            house_number: houseNumber.trim() || null,
          };
      const res = await fetch(`/api/ops/cases/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setBaseline({
        status,
        urgency,
        category: category.trim(),
        plz: plz.trim(),
        city: city.trim(),
        description: description.trim(),
        assignee_text: assigneeText,
        scheduled_at: scheduledAt,
        internal_notes: internalNotes,
        reporter_name: reporterName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        street,
        house_number: houseNumber,
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
      return true;
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
      return false;
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

  const canSendInvite = !!scheduledAt && inviteState !== "sending";
  const hasContactInfo = !!contactEmail.trim() || !!contactPhone.trim();

  const reviewInfo = deriveReviewStatus({
    caseStatus: status,
    hasContactInfo,
    reviewSentAt: initialData.review_sent_at,
    events: localEvents.map(e => ({ event_type: e.event_type, created_at: e.created_at })),
  });
  const canRequestReview = reviewInfo.canRequest || reviewInfo.canResend;

  async function handleSendInvite() {
    if (isDirty) {
      const saved = await performSave();
      if (!saved) return;
    }
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
    if (isDirty) {
      const saved = await performSave();
      if (!saved) return;
    }
    setReviewState("sending");
    setReviewMsg("");
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/request-review`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setReviewState("sent");
      setTimeout(() => setReviewState("idle"), 2000);
      setLocalEvents(prev => [...prev, {
        id: crypto.randomUUID(),
        event_type: "review_requested",
        title: "Review-Anfrage gesendet",
        created_at: new Date().toISOString(),
      }]);
    } catch (err) {
      setReviewState("error");
      setReviewMsg(err instanceof Error ? err.message : "Senden fehlgeschlagen.");
    }
  }

  async function handleSkipReview() {
    try {
      const res = await fetch(`/api/ops/cases/${initialData.id}/skip-review`, { method: "POST" });
      if (!res.ok) throw new Error("Fehler");
      setLocalEvents(prev => [...prev, {
        id: crypto.randomUUID(),
        event_type: "review_skipped",
        title: "Review übersprungen",
        created_at: new Date().toISOString(),
      }]);
    } catch {
      // silent
    }
  }

  // Style tokens
  const inp =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400/30 transition-colors";
  const inpReadonly =
    "w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-sm text-gray-600";
  const lbl = "block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1";
  const sectionTitle = "text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3";

  // ── Prospect view: clean, focused, only status + review ────────────
  if (isProspect) {
    return (
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <label htmlFor="status" className={lbl}>Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inp}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <span className={lbl}>Kategorie</span>
            <p className={inpReadonly}>{category || "—"}</p>
          </div>
          <div>
            <span className={lbl}>Priorität</span>
            <p className={inpReadonly}>{URGENCIES.find(u => u.value === urgency)?.label ?? urgency}</p>
          </div>
        </div>

        <div className="mb-4">
          <span className={lbl}>Beschreibung</span>
          <p className={`${inpReadonly} whitespace-pre-wrap min-h-[60px]`}>{description || "—"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <span className={lbl}>Ort</span>
            <p className={inpReadonly}>{[plz, city].filter(Boolean).join(" ") || "—"}</p>
          </div>
          <div>
            <span className={lbl}>Melder</span>
            <p className={inpReadonly}>{reporterName || "—"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-3">
          <button
            onClick={performSave}
            disabled={!isDirty || saveState === "saving"}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saveState === "saving" ? "Speichern…" : "Status speichern"}
          </button>

          {status !== "done" && status !== "archived" && (
            <button onClick={handleQuickDone} disabled={saveState === "saving"}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >Erledigt</button>
          )}

          {saveState === "saved" && <span className="text-emerald-600 text-xs ml-2">Gespeichert</span>}
          {saveState === "error" && <span className="text-red-600 text-xs ml-2">{errorMsg}</span>}
        </div>

        {status === "done" && reviewInfo.status !== "nicht_bereit" && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${reviewInfo.color}`}>
                {reviewInfo.label}
              </span>
              {canRequestReview && (
                <button onClick={handleRequestReview} disabled={reviewState === "sending"}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
                >
                  {reviewState === "sending" ? "Sende…" :
                    reviewInfo.canResend ? "Nochmals anfragen" : "Review anfragen"}
                </button>
              )}
              {reviewInfo.canSkip && (
                <button onClick={handleSkipReview}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                >Kein Review</button>
              )}
              {reviewState === "sent" && <span className="text-emerald-600 text-xs">Gesendet</span>}
              {reviewState === "error" && <span className="text-red-600 text-xs">{reviewMsg}</span>}
            </div>
          </div>
        )}
      </section>
    );
  }

  // ── Full admin/tenant view — structured in sections ──────────────────
  return (
    <div className="space-y-4">
      {/* ════════════════════════════════════════════════════════════════
          SECTION 1: STEUERUNG — Status, Priorität, Zuständig, Termin
         ════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className={sectionTitle}>Steuerung</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="status" className={lbl}>Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inp}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="urgency" className={lbl}>Priorität</label>
            <select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className={inp}>
              {URGENCIES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="assignee" className={lbl}>Zuständig</label>
            {staffMembers.length > 0 ? (
              <select
                id="assignee"
                value={assigneeText}
                onChange={(e) => setAssigneeText(e.target.value)}
                className={inp}
              >
                <option value="">— Nicht zugewiesen —</option>
                {staffMembers.map((s) => (
                  <option key={s.display_name} value={s.display_name}>{s.display_name}</option>
                ))}
                {assigneeText && !staffMembers.some((s) => s.display_name === assigneeText) && (
                  <option value={assigneeText}>{assigneeText} (manuell)</option>
                )}
              </select>
            ) : (
              <input id="assignee" type="text" value={assigneeText} onChange={(e) => setAssigneeText(e.target.value)} placeholder="z.B. Ramon D." className={inp} />
            )}
          </div>
        </div>

        {/* Termin — promoted to Steuerung, prominent */}
        <div className="bg-gray-50/80 border border-gray-200/60 rounded-lg p-3.5">
          <label htmlFor="scheduled" className={lbl}>Termin</label>
          <div className="flex items-center gap-3 flex-wrap">
            <input id="scheduled" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={`${inp} max-w-[220px]`} />
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {([0, 1] as const).map((d) => (
                <button key={d} type="button" onClick={() => setQuickDay(d)}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${quickDay === d ? "bg-gray-800 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >{d === 0 ? "Heute" : "Morgen"}</button>
              ))}
            </div>
            <div className="flex gap-1">
              {QUICK_TIMES.map((time) => (
                <button key={time} type="button" onClick={() => setScheduledAt(quickDateTime(quickDay, time))}
                  className="rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >{time}</button>
              ))}
            </div>
          </div>
          {scheduledAt && (
            <button onClick={handleSendInvite} disabled={!canSendInvite}
              className="mt-2.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >{inviteState === "sending" ? "Sende…" : inviteState === "sent" ? "Einladung gesendet ✓" : "Termin senden"}</button>
          )}
          {inviteState === "error" && <span className="text-red-600 text-xs ml-2">{inviteMsg}</span>}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 flex-wrap mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={performSave}
            disabled={!isDirty || saveState === "saving"}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saveState === "saving" ? "Speichern…" : "Speichern"}
          </button>

          {status !== "done" && status !== "archived" && (
            <button onClick={handleQuickDone} disabled={saveState === "saving"}
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >Erledigt</button>
          )}

          {saveState === "saved" && <span className="text-emerald-600 text-xs ml-2">Gespeichert</span>}
          {saveState === "error" && <span className="text-red-600 text-xs ml-2">{errorMsg}</span>}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2: FALLDATEN — Kategorie, Adresse, Beschreibung
         ════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className={sectionTitle}>Falldaten</h3>

        <div className="space-y-3">
          <div>
            <label htmlFor="category" className={lbl}>Kategorie</label>
            <input id="category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inp} />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label htmlFor="plz" className={lbl}>PLZ</label>
              <input id="plz" type="text" value={plz} onChange={(e) => setPlz(e.target.value)} className={inp} />
            </div>
            <div>
              <label htmlFor="city" className={lbl}>Ort</label>
              <input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inp} />
            </div>
            <div>
              <label htmlFor="street" className={lbl}>Strasse</label>
              <input id="street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} className={inp} />
            </div>
            <div>
              <label htmlFor="house_number" className={lbl}>Nr</label>
              <input id="house_number" type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} className={inp} />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={lbl}>Beschreibung</label>
            <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inp} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3: KONTAKT & NOTIZEN
         ════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className={sectionTitle}>Kontakt & Notizen</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label htmlFor="reporter_name" className={lbl}>Melder</label>
            <input id="reporter_name" type="text" value={reporterName} onChange={(e) => setReporterName(e.target.value)} placeholder="Hans Müller" className={inp} />
          </div>
          <div>
            <label htmlFor="contact_phone" className={lbl}>Telefon</label>
            <input id="contact_phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+41 79..." className={inp} />
          </div>
          <div>
            <label htmlFor="contact_email" className={lbl}>E-Mail</label>
            <input id="contact_email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="name@beispiel.ch" className={inp} />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className={lbl}>Interne Notizen</label>
          <textarea id="notes" rows={4} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Nur intern sichtbar…" className={inp} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4: WIRKUNG / REVIEW — only when done
         ════════════════════════════════════════════════════════════════ */}
      {status === "done" && reviewInfo.status !== "nicht_bereit" && (
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className={sectionTitle}>Wirkung</h3>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${reviewInfo.color}`}>
              {reviewInfo.label}
            </span>

            {canRequestReview && (
              <button onClick={handleRequestReview} disabled={reviewState === "sending"}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors"
              >
                {reviewState === "sending" ? "Sende…" :
                  reviewInfo.canResend ? "Nochmals anfragen" : "Bewertung anfragen"}
              </button>
            )}

            {reviewInfo.canSkip && (
              <button onClick={handleSkipReview}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Keine Anfrage senden
              </button>
            )}

            {reviewState === "sent" && <span className="text-emerald-600 text-xs">Gesendet</span>}
            {reviewState === "error" && <span className="text-red-600 text-xs">{reviewMsg}</span>}
            {reviewInfo.reviewCount > 0 && (
              <span className="text-gray-400 text-xs">{reviewInfo.reviewCount}/2 Anfragen</span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
