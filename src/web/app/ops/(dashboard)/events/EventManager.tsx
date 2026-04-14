"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const day = d.toLocaleDateString("de-CH", { weekday: "short", timeZone: "Europe/Zurich" }).replace(/\.$/, "");
  const date = d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
  return `${day} ${date}`;
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time.substring(0, 5);
}

export function EventManager({ events }: { events: PubEvent[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"sport" | "event">("sport");
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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Events</h1>
      </div>

      {/* Tabs */}
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

      {/* Add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        {showForm ? "Cancel" : activeTab === "sport" ? "+ New Match" : "+ New Event"}
      </button>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <input
            type="text"
            placeholder={activeTab === "sport" ? "z.B. Premier League: Arsenal vs. Chelsea" : "z.B. Quiz Night"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-28 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !eventDate}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors hover:bg-gray-800"
          >
            {saving ? "Saving..." : "Save"}
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
              <div className="p-3 space-y-2 bg-gray-50">
                <input type="text" value={editTitle} onChange={(ev) => setEditTitle(ev.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                <div className="flex gap-2">
                  <input type="date" value={editDate} onChange={(ev) => setEditDate(ev.target.value)} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                  <input type="time" value={editTime} onChange={(ev) => setEditTime(ev.target.value)} className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
                </div>
                <input type="text" value={editDesc} onChange={(ev) => setEditDesc(ev.target.value)} placeholder="Description" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none" />
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
