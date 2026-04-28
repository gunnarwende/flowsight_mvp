"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface PubEvent {
  id: string;
  category: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  is_active: boolean;
}

const DAY_HEAD = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const day = d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Europe/Zurich" });
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
  return `${day} ${date}`;
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time.substring(0, 5);
}

function todayIso(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
}

/** English-locale month-grid date picker. Replaces native <input type="date">
 *  whose UI is browser-locale-dependent (German on Swiss browsers).
 *  Shows current month, < / > navigation, today highlighted, past dates disabled. */
function EventDatePicker({
  value,
  onChange,
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
}) {
  const today = todayIso();
  const min = minDate ?? today;
  const [view, setView] = useState(() => {
    const base = value ? new Date(value + "T12:00:00") : new Date();
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(value + "T12:00:00") : null;
  const selectedLabel = selected
    ? `${DAYS_LONG[selected.getDay()]}, ${selected.getDate()} ${MONTHS[selected.getMonth()]} ${selected.getFullYear()}`
    : "Pick a date";

  const firstOfMonth = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  // Mon-first: shift Sun(0) → 6, others -1
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const cells: Array<{ day: number; iso: string; isPast: boolean; isToday: boolean; isSelected: boolean } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${view.year}-${String(view.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      day: d,
      iso,
      isPast: iso < min,
      isToday: iso === today,
      isSelected: iso === value,
    });
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      const m = v.month + delta;
      const year = v.year + Math.floor(m / 12);
      const month = ((m % 12) + 12) % 12;
      return { year, month };
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-left hover:border-gray-300 transition-colors"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{selectedLabel}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => shiftMonth(-1)} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
            <div className="text-sm font-bold text-gray-900">
              {MONTHS[view.month]} {view.year}
            </div>
            <button type="button" onClick={() => shiftMonth(1)} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAY_HEAD.map((d) => (
              <div key={d} className="text-[10px] font-bold uppercase text-gray-400 text-center py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((c, i) =>
              c === null ? (
                <div key={`empty-${i}`} />
              ) : (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => { onChange(c.iso); setOpen(false); }}
                  disabled={c.isPast}
                  className={`aspect-square text-sm rounded-lg transition-all ${
                    c.isSelected
                      ? "bg-gray-900 text-white font-bold shadow-sm"
                      : c.isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : c.isToday
                      ? "bg-gray-100 text-gray-900 font-semibold ring-1 ring-gray-300"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {c.day}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 15-min time slots from 14:00 to 23:45 — English-locale, controlled. */
const TIME_SLOTS_EVENT: string[] = (() => {
  const out: string[] = [];
  for (let h = 14; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
})();

export function EventManager({ events }: { events: PubEvent[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const lockedTab = tabParam === "event" || tabParam === "sport" ? tabParam : null;
  const initialTab = tabParam === "event" ? "event" : "sport";
  const [activeTab, setActiveTab] = useState<"sport" | "event">(initialTab);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [description, setDescription] = useState("");

  const sportEvents = events.filter((e) => e.category === "sport");
  const pubEvents = events.filter((e) => e.category === "event");
  const displayedEvents = activeTab === "sport" ? sportEvents : pubEvents;

  async function handleSave() {
    if (!title.trim() || !eventDate) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bigben-pub/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeTab,
          title: title.trim(),
          event_date: eventDate,
          event_time: eventTime || null,
          description: description.trim() || null,
        }),
      });
      if (res.ok) {
        setTitle("");
        setEventDate("");
        setEventTime("");
        setDescription("");
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function startEdit(e: PubEvent) {
    setEditingId(e.id);
    setEditTitle(e.title);
    setEditDate(e.event_date);
    setEditTime(e.event_time?.substring(0, 5) ?? "");
    setEditDesc(e.description ?? "");
  }

  async function handleEditSave() {
    if (!editingId || !editTitle.trim() || !editDate) return;
    setSaving(true);
    try {
      await fetch(`/api/bigben-pub/events/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          event_date: editDate,
          event_time: editTime || null,
          description: editDesc.trim() || null,
        }),
      });
      setEditingId(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await fetch(`/api/bigben-pub/events/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/ops/pub-dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          {lockedTab === "sport" ? "Sports" : lockedTab === "event" ? "Events" : "Events"}
        </h1>
      </div>

      {/* Tabs — only show if not locked to a specific category */}
      {!lockedTab && (
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => { setActiveTab("sport"); setShowForm(false); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "sport" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Sport ({sportEvents.length})
          </button>
          <button
            onClick={() => { setActiveTab("event"); setShowForm(false); }}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "event" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Events ({pubEvents.length})
          </button>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        {showForm ? "Cancel" : activeTab === "sport" ? "+ New Match" : "+ New Event"}
      </button>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
              Title
            </label>
            <input
              type="text"
              placeholder={activeTab === "sport" ? "e.g. Arsenal vs. Chelsea" : "e.g. Quiz Night"}
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 30))}
              maxLength={30}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Date</label>
            <EventDatePicker value={eventDate} onChange={setEventDate} />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
              Time <span className="font-normal normal-case tracking-normal text-gray-400">— optional</span>
            </label>
            <select
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="">No specific time</option>
              {TIME_SLOTS_EVENT.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
              Description <span className="font-normal normal-case tracking-normal text-gray-400">— optional, max 40</span>
            </label>
            <input
              type="text"
              placeholder="Short, catchy line"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 40))}
              maxLength={40}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !eventDate}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : `Save ${activeTab === "sport" ? "match" : "event"}${eventDate ? " · " + eventDate : ""}`}
          </button>
        </div>
      )}

      {/* Event list */}
      <div className="space-y-2">
        {displayedEvents.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            {activeTab === "sport" ? "No matches yet." : "No events yet."}
          </p>
        )}
        {displayedEvents.map((e) => (
          <div key={e.id} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {editingId === e.id ? (
              /* Inline edit form */
              <div className="p-4 space-y-3 bg-gray-50">
                <input type="text" value={editTitle} onChange={(ev) => setEditTitle(ev.target.value.slice(0, 30))} maxLength={30} placeholder="Title" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                <EventDatePicker value={editDate} onChange={setEditDate} />
                <select
                  value={editTime}
                  onChange={(ev) => setEditTime(ev.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                  <option value="">No specific time</option>
                  {TIME_SLOTS_EVENT.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input type="text" value={editDesc} onChange={(ev) => setEditDesc(ev.target.value.slice(0, 40))} maxLength={40} placeholder="Short description (max 40)" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                <div className="flex gap-2">
                  <button onClick={handleEditSave} disabled={saving} className="flex-1 rounded-lg bg-gray-900 py-2 text-xs font-semibold text-white disabled:opacity-40">{saving ? "Saving..." : "Save"}</button>
                  <button onClick={() => setEditingId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">{formatDate(e.event_date)}</span>
                    {e.event_time && <span className="text-xs text-gray-400">{formatTime(e.event_time)}</span>}
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-gray-900 truncate">{e.title}</p>
                  {e.description && <p className="mt-0.5 text-xs text-gray-500 truncate">{e.description}</p>}
                </div>
                <div className="ml-2 flex flex-shrink-0 gap-1">
                  <button
                    onClick={() => startEdit(e)}
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={deleting === e.id}
                    className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
