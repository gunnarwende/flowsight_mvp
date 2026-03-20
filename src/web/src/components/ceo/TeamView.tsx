"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";

/* ---------- Types ---------- */
interface Task {
  id: string;
  title: string;
  due_at: string | null;
  tenant_id: string | null;
  tenant_name: string | null;
  done_at: string | null;
  priority: "low" | "normal" | "high";
  created_at: string;
}

interface Note {
  id: string;
  text: string;
  tenant_id: string | null;
  tenant_name: string | null;
  pinned: boolean;
  created_at: string;
}

type TaskFilter = "alle" | "offen" | "erledigt";

/* ---------- Helpers ---------- */
const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  normal: "bg-navy-600",
  low: "bg-gray-400",
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ========================================================================= */
export function TeamView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Team</h1>
        <p className="text-xs text-gray-500 mt-0.5">Aufgaben, Notizen & Kapazitäten</p>
      </div>

      <TaskSection />
      <NoteSection />
      <CapacityPlaceholder />
    </div>
  );
}

/* ========================================================================= */
/* Section 1: Meine Aufgaben                                                  */
/* ========================================================================= */
function TaskSection() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>("offen");
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/tasks");
      if (!res.ok) return;
      const json = await res.json();
      setTasks(json.tasks ?? []);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ceo/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        setNewTitle("");
        await fetchTasks();
      }
    } catch {
      // silent
    }
    setSubmitting(false);
  };

  const toggleDone = async (task: Task) => {
    const done_at = task.done_at ? null : new Date().toISOString();
    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done_at } : t))
    );
    try {
      await fetch("/api/ceo/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, done_at }),
      });
    } catch {
      await fetchTasks();
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "offen") return !t.done_at;
    if (filter === "erledigt") return !!t.done_at;
    return true;
  });

  const FILTERS: { key: TaskFilter; label: string }[] = [
    { key: "alle", label: "Alle" },
    { key: "offen", label: "Offen" },
    { key: "erledigt", label: "Erledigt" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Meine Aufgaben</h2>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                filter === f.key
                  ? "bg-navy-100 text-navy-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick-add */}
      <form onSubmit={addTask} className="px-4 py-2.5 border-b border-gray-50 flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Neue Aufgabe + Enter"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 focus:ring-0"
          style={{ caretColor: "#c8965a" }}
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || submitting}
          className="text-xs font-medium text-gold-600 hover:text-gold-700 disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </form>

      {/* Task list */}
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center">
            <span className="text-xs text-gray-400 animate-pulse">Laden...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <span className="text-xs text-gray-400">
              {filter === "offen" ? "Keine offenen Aufgaben." : filter === "erledigt" ? "Keine erledigten Aufgaben." : "Keine Aufgaben."}
            </span>
          </div>
        ) : (
          filtered.map((task) => (
            <div key={task.id} className="px-4 py-2.5 flex items-center gap-3 group">
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(task)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  task.done_at
                    ? "bg-gold-500 border-gold-500"
                    : "border-navy-300 hover:border-navy-400"
                }`}
              >
                {task.done_at && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${task.done_at ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {task.title}
                </span>
                {task.tenant_name && (
                  <span className="ml-2 text-[10px] text-gray-400">{task.tenant_name}</span>
                )}
              </div>

              {/* Priority dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority] ?? "bg-gray-400"}`} title={task.priority} />

              {/* Due date */}
              {task.due_at && (
                <span className={`text-[11px] flex-shrink-0 ${
                  !task.done_at && new Date(task.due_at) < new Date() ? "text-red-500 font-medium" : "text-gray-400"
                }`}>
                  {formatDate(task.due_at)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Section 2: Quick Notes                                                     */
/* ========================================================================= */
function NoteSection() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/notes");
      if (!res.ok) return;
      const json = await res.json();
      setNotes(json.notes ?? []);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async () => {
    const text = newText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ceo/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setNewText("");
        await fetchNotes();
      }
    } catch {
      // silent
    }
    setSubmitting(false);
  };

  // Show max 10
  const visible = notes.slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Quick Notes</h2>
      </div>

      {/* Quick-add */}
      <div className="px-4 py-3 border-b border-gray-50 space-y-2">
        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Notiz schreiben..."
          rows={2}
          className="w-full text-sm bg-transparent outline-none placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-gold-500/30 rounded-lg border border-gray-200 px-3 py-2"
        />
        <button
          onClick={addNote}
          disabled={!newText.trim() || submitting}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-30 transition-colors"
        >
          Notiz speichern
        </button>
      </div>

      {/* Notes list */}
      <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center">
            <span className="text-xs text-gray-400 animate-pulse">Laden...</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <span className="text-xs text-gray-400">Keine Notizen.</span>
          </div>
        ) : (
          visible.map((note) => (
            <div key={note.id} className="px-4 py-3">
              <div className="bg-navy-50 rounded-xl p-3 border border-navy-100">
                <div className="flex items-start gap-2">
                  {note.pinned && (
                    <svg className="w-3.5 h-3.5 text-gold-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                    </svg>
                  )}
                  <p className="text-sm text-gray-800 whitespace-pre-wrap flex-1">{note.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-400">{formatTimestamp(note.created_at)}</span>
                  {note.tenant_name && (
                    <span className="text-[10px] text-navy-400 bg-navy-50 px-1.5 py-0.5 rounded">{note.tenant_name}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* Section 3: Team Capacity Placeholder                                       */
/* ========================================================================= */
function CapacityPlaceholder() {
  const futureFeatures = [
    "Aufgaben an Mitarbeiter delegieren",
    "Workload-Verteilung",
    "Kapazitäts-Dashboard",
    "Bottleneck-Alerts",
  ];

  return (
    <div className="bg-navy-50/50 border-dashed border-2 border-navy-200 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-navy-700">Team-Management</h3>
          <p className="text-xs text-navy-400">Wird verfügbar wenn FlowSight wächst.</p>
        </div>
      </div>
      <ul className="space-y-1.5 ml-[52px]">
        {futureFeatures.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
