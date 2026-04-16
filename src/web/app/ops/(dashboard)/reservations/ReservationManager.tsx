"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Reservation {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  note: string | null;
  status: string;
  source: string;
  confirmed_at: string | null;
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmed" },
  declined: { bg: "bg-red-50", text: "text-red-700", label: "Declined" },
  cancelled: { bg: "bg-gray-50", text: "text-gray-500", label: "Cancelled" },
  no_show: { bg: "bg-gray-50", text: "text-gray-500", label: "No-Show" },
};

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  voice: "Call",
  manual: "Walk-in",
  phone: "Phone",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (iso === today) return "Today";
  if (iso === tomorrow) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
}

function formatTime(time: string): string {
  return time.substring(0, 5);
}

function NoShowBadge({ count }: { count: number }) {
  if (count === 0) return null;
  if (count === 1) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-bold text-yellow-800" title="1 previous no-show">
        Yellow Card
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700" title={`${count} previous no-shows`}>
      Red Card
    </span>
  );
}

export function ReservationManager({ reservations, noShowMap }: { reservations: Reservation[]; noShowMap: Record<string, number> }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Manual reservation form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState("2");
  const [note, setNote] = useState("");

  // Group by date
  const grouped = new Map<string, Reservation[]>();
  for (const r of reservations) {
    const key = r.reservation_date;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  }

  async function handleManualSave() {
    if (!name.trim() || !date) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bigben-pub/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || "—",
          date,
          time,
          guests,
          note: note.trim() || "",
          source: "manual",
        }),
      });
      if (res.ok) {
        setName(""); setPhone(""); setDate(""); setTime("19:00"); setGuests("2"); setNote("");
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: "confirmed" | "declined" | "no_show") {
    setUpdatingId(id);
    try {
      await fetch(`/api/bigben-pub/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = reservations.filter((r) => r.status === "pending").length;

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
          Reservations
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </h1>
      </div>

      {/* Manual reservation button — for walk-in / bar reservations */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        {showForm ? "Cancel" : "+ Add Reservation"}
      </button>

      {/* Manual form — quick entry for bar reservations */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs text-gray-400 font-medium">Walk-in / Phone</p>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            autoFocus
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-16 rounded-lg border border-gray-200 px-2 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,10,12,15,20].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <button
            onClick={handleManualSave}
            disabled={saving || !name.trim() || !date}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors hover:bg-gray-800"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      )}

      {/* Reservations grouped by day */}
      {reservations.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-400">No reservations in the next 14 days.</p>
      )}

      {Array.from(grouped.entries()).map(([dateKey, dayReservations]) => (
        <div key={dateKey}>
          <p className="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {formatDate(dateKey)}
            <span className="ml-1 font-normal">({dayReservations.length})</span>
          </p>
          <div className="space-y-2">
            {dayReservations.map((r) => {
              const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
              const isPending = r.status === "pending";
              const isConfirmed = r.status === "confirmed";
              const isUpdating = updatingId === r.id;
              const guestNoShows = (r.guest_phone && r.guest_phone !== "—") ? (noShowMap[r.guest_phone] ?? 0) : 0;

              // Show "No Show" button for confirmed reservations whose date is today or in the past
              const todayStr = new Date().toISOString().split("T")[0];
              const canMarkNoShow = isConfirmed && r.reservation_date <= todayStr;

              return (
                <div key={r.id} className={`rounded-xl border p-4 ${st.bg} border-gray-100`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{formatTime(r.reservation_time)}</span>
                        <span className="text-sm text-gray-600">{r.guest_name}</span>
                        <NoShowBadge count={guestNoShows} />
                        <span className="text-xs text-gray-400">· {r.party_size} guests</span>
                      </div>
                      {r.note && (
                        <p className="text-xs text-gray-500 mb-1">
                          &ldquo;{r.note.startsWith("Voice reservation (call_id:") ? "Phone booking" : r.note}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                        <span className="text-[10px] text-gray-400">{SOURCE_LABELS[r.source] ?? r.source}</span>
                        {r.guest_phone && r.guest_phone !== "—" && (
                          <a href={`tel:${r.guest_phone}`} className="text-[10px] text-blue-500 hover:underline">{r.guest_phone}</a>
                        )}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-1.5 ml-2 flex-shrink-0">
                      {isPending && (
                        <>
                          <button
                            onClick={() => updateStatus(r.id, "confirmed")}
                            disabled={isUpdating}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "declined")}
                            disabled={isUpdating}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-40 transition-colors"
                          >
                            ✗
                          </button>
                        </>
                      )}
                      {canMarkNoShow && (
                        <button
                          onClick={() => updateStatus(r.id, "no_show")}
                          disabled={isUpdating}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
                        >
                          No Show
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
