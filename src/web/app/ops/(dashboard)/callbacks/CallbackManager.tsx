"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Callback {
  id: string;
  caller_name: string | null;
  caller_phone: string;
  topic: string | null;
  transcript_excerpt: string | null;
  call_id: string | null;
  status: "pending" | "resolved" | "dismissed";
  resolved_at: string | null;
  created_at: string;
}

export function CallbackManager({ initialCallbacks }: { initialCallbacks: Callback[] }) {
  const router = useRouter();
  const [callbacks, setCallbacks] = useState<Callback[]>(initialCallbacks);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = callbacks.filter((c) => c.status === "pending");
  const past = callbacks.filter((c) => c.status !== "pending");

  async function setStatus(id: string, status: "resolved" | "dismissed" | "pending") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/bigben-pub/callbacks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setCallbacks((prev) => prev.map((c) => (c.id === id ? { ...c, ...data.callback } : c)));
        router.refresh();
      }
    } catch {
      /* ignore — user can retry */
    } finally {
      setBusyId(null);
    }
  }

  function fmtTime(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
      ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Callbacks</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          People asking you to call them back — suppliers, partners, anything that
          isn&apos;t a table booking.
        </p>
      </div>

      {/* Pending list */}
      {pending.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-600">No pending callbacks.</p>
          <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((cb) => (
            <div key={cb.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {cb.caller_name || "Unknown caller"}
                  </p>
                  {cb.caller_phone && (
                    <a href={`tel:${cb.caller_phone}`} className="text-xs text-blue-600 underline">
                      {cb.caller_phone}
                    </a>
                  )}
                  {cb.topic && (
                    <p className="text-xs text-gray-700 mt-1 italic">&ldquo;{cb.topic}&rdquo;</p>
                  )}
                  <p className="text-[11px] text-gray-500 mt-2">{fmtTime(cb.created_at)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${cb.caller_phone}`}
                  className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-center text-xs font-semibold text-white"
                >
                  Call back
                </a>
                <button
                  onClick={() => setStatus(cb.id, "resolved")}
                  disabled={busyId === cb.id}
                  className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Done
                </button>
                <button
                  onClick={() => setStatus(cb.id, "dismissed")}
                  disabled={busyId === cb.id}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past list (resolved + dismissed) */}
      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mt-6">Past</p>
          {past.map((cb) => (
            <div key={cb.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {cb.caller_name || "Unknown"}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        cb.status === "resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cb.status}
                    </span>
                  </div>
                  {cb.topic && <p className="text-xs text-gray-500 mt-0.5 truncate">{cb.topic}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">{fmtTime(cb.created_at)}</p>
                </div>
                <button
                  onClick={() => setStatus(cb.id, "pending")}
                  disabled={busyId === cb.id}
                  className="text-[11px] text-gray-500 underline disabled:opacity-50"
                >
                  Reopen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
