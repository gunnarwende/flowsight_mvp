"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Reason = "callback" | "order_followup";
type Status = "pending" | "resolved" | "dismissed";

interface Nachricht {
  id: string;
  reason: Reason;
  caller_name: string | null;
  caller_phone: string;
  topic: string | null;
  transcript_excerpt: string | null;
  call_id: string | null;
  status: Status;
  resolved_at: string | null;
  created_at: string;
}

const REASON_LABEL: Record<Reason, string> = {
  callback: "Rückruf",
  order_followup: "Rückfrage Auftrag",
};

export function NachrichtenManager({ initialCallbacks }: { initialCallbacks: Nachricht[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Nachricht[]>(initialCallbacks);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = items.filter((c) => c.status === "pending");
  const past = items.filter((c) => c.status !== "pending");

  async function setStatus(id: string, status: Status) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/ops/callbacks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => prev.map((c) => (c.id === id ? { ...c, ...data.callback } : c)));
        router.refresh();
      }
    } catch {
      /* ignore — Nutzer kann erneut versuchen */
    } finally {
      setBusyId(null);
    }
  }

  function fmtTime(iso: string): string {
    const d = new Date(iso);
    const sameDay = d.toDateString() === new Date().toDateString();
    const time = d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit" });
    if (sameDay) return `Heute, ${time}`;
    return d.toLocaleDateString("de-CH", { day: "numeric", month: "short" }) + `, ${time}`;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="border-l-4 border-[#1e3a5f] pl-3">
        <h1 className="text-lg font-bold text-[#1e3a5f]">Nachrichten</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Rückruf-Wünsche und Nachfragen, die Lisa aufgenommen hat — kein Auftrag,
          sondern „bitte zurückrufen&quot;.
        </p>
      </div>

      {/* Offen */}
      {pending.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-600">Keine offenen Nachrichten.</p>
          <p className="text-xs text-gray-400 mt-1">Alles erledigt.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((c) => (
            <div key={c.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {c.caller_name || "Unbekannter Anrufer"}
                  </p>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#1e3a5f]/10 text-[#1e3a5f]">
                    {REASON_LABEL[c.reason]}
                  </span>
                </div>
                {c.caller_phone && (
                  <a href={`tel:${c.caller_phone}`} className="text-xs text-blue-600 underline">
                    {c.caller_phone}
                  </a>
                )}
                {c.topic && <p className="text-xs text-gray-700 mt-1 italic">„{c.topic}&quot;</p>}
                <p className="text-[11px] text-gray-500 mt-2">{fmtTime(c.created_at)}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${c.caller_phone}`}
                  className="flex-1 rounded-lg bg-[#1e3a5f] px-3 py-2 text-center text-xs font-semibold text-white"
                >
                  Zurückrufen
                </a>
                <button
                  onClick={() => setStatus(c.id, "resolved")}
                  disabled={busyId === c.id}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Erledigt
                </button>
                <button
                  onClick={() => setStatus(c.id, "dismissed")}
                  disabled={busyId === c.id}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 disabled:opacity-50"
                >
                  Verwerfen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Erledigt / Verworfen */}
      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-6">Erledigt</p>
          {past.map((c) => (
            <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {c.caller_name || "Unbekannt"}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        c.status === "resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.status === "resolved" ? "erledigt" : "verworfen"}
                    </span>
                  </div>
                  {c.topic && <p className="text-xs text-gray-500 mt-0.5 truncate">{c.topic}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{fmtTime(c.created_at)}</p>
                </div>
                <button
                  onClick={() => setStatus(c.id, "pending")}
                  disabled={busyId === c.id}
                  className="text-[11px] text-gray-500 underline disabled:opacity-50"
                >
                  Wieder öffnen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
