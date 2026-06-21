"use client";

import { useState, useEffect, useRef } from "react";
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

function NoShowBadge({
  count,
  phone,
  guestName,
  onForgive,
}: {
  count: number;
  phone: string;
  guestName: string;
  onForgive: (phone: string, guestName: string, count: number) => void;
}) {
  if (count === 0) return null;
  const isYellow = count === 1;
  const label = isYellow ? "Yellow Card" : "Red Card";
  const cls = isYellow
    ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    : "bg-red-100 text-red-700 hover:bg-red-200";
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onForgive(phone, guestName, count); }}
      title={`${count} previous no-show${count === 1 ? "" : "s"} — tap to review or forgive`}
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${cls}`}
    >
      {label}
    </button>
  );
}

interface ForgiveTarget {
  phone: string;
  guestName: string;
  count: number;
}

const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_LONG_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface ManualDayOption {
  value: string;
  short: string;
  long: string;
  isClosed: boolean;
  prefix: string;
}

/** Today + next 14 days as English-locale options for Paul's walk-in form. */
function buildManualDayOptions(): ManualDayOption[] {
  const out: ManualDayOption[] = [];
  const todayIso = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
  const [ty, tm, td] = todayIso.split("-").map(Number);
  for (let i = 0; i <= 14; i++) {
    const d = new Date(Date.UTC(ty, tm - 1, td + i, 12, 0));
    const iso = d.toISOString().split("T")[0];
    const dow = d.getUTCDay();
    const dayShort = DAY_NAMES_EN[dow];
    const dayLong = DAY_NAMES_LONG_EN[dow];
    const dayNum = d.getUTCDate();
    const monthShort = MONTH_NAMES_EN[d.getUTCMonth()];
    let prefix = "";
    if (i === 0) prefix = "Today";
    else if (i === 1) prefix = "Tomorrow";
    out.push({
      value: iso,
      short: `${dayShort} ${dayNum} ${monthShort}`,
      long: `${dayLong}, ${dayNum} ${monthShort}`,
      isClosed: dow === 1,
      prefix,
    });
  }
  return out;
}

/** Return today's date as YYYY-MM-DD in Zurich timezone */
function todayISO(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
}

/** Return current time rounded to nearest 15 min as HH:MM */
function nowRounded15(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
  const mins = now.getMinutes();
  const rounded = Math.ceil(mins / 15) * 15;
  const d = new Date(now);
  d.setMinutes(rounded, 0, 0);
  const h = d.getHours();
  const m = d.getMinutes();
  // Clamp to pub opening hours (14:00 minimum)
  if (h < 14) return "16:00";
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function ReservationManager({ reservations, noShowMap }: { reservations: Reservation[]; noShowMap: Record<string, number> }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [forgiveTarget, setForgiveTarget] = useState<ForgiveTarget | null>(null);
  const [forgiving, setForgiving] = useState(false);
  const lastSyncResult = useRef<{ synced: number; checked: number } | null>(null);

  function openForgiveModal(phone: string, guestName: string, count: number) {
    setForgiveTarget({ phone, guestName, count });
  }

  async function confirmForgive() {
    if (!forgiveTarget) return;
    setForgiving(true);
    try {
      await fetch("/api/bigben-pub/no-shows/forgive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgiveTarget.phone }),
      });
      setForgiveTarget(null);
      router.refresh();
    } finally {
      setForgiving(false);
    }
  }

  // BigBen Live-Fix 28.04.: Auto-Sync Voice-Calls + Polling alle 30s.
  // Vorher: nur PubDashboard mounted triggerte sync-calls einmal.
  // Jetzt: ReservationManager triggert sync-calls bei Mount + alle 30s.
  // Plus: wartet auf Promise BEFORE router.refresh() — Race-Condition fix.
  useEffect(() => {
    let cancelled = false;
    async function syncOnce() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/bigben-pub/sync-calls");
        const data = await res.json().catch(() => null);
        if (!cancelled && data && typeof data.synced === "number") {
          lastSyncResult.current = data;
          if (data.synced > 0) {
            // New reservations created → refresh page to show them
            router.refresh();
          }
        }
      } catch { /* best effort */ }
    }
    // Initial sync on mount
    syncOnce();
    // Periodic poll every 30s
    const interval = setInterval(syncOnce, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [router]);

  async function handleManualSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/bigben-pub/sync-calls");
      const data = await res.json().catch(() => null);
      if (data && typeof data.synced === "number") {
        lastSyncResult.current = data;
        router.refresh();
      }
    } catch { /* ignore */ }
    setSyncing(false);
  }

  // Manual reservation form — pre-filled for fast walk-in entry
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState(nowRounded15);
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
          phone: phone.trim() || "\u2014",
          date,
          time,
          guests,
          note: note.trim() || "",
          source: "manual",
        }),
      });
      if (res.ok) {
        // Reset but keep date/time pre-filled for next walk-in
        setName(""); setPhone(""); setDate(todayISO()); setTime(nowRounded15()); setGuests("2"); setNote("");
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: "confirmed" | "declined" | "cancelled" | "no_show") {
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
        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="text-xs font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
          title="Pull latest voice-call reservations from Retell"
        >
          {syncing ? "Syncing..." : "↻ Refresh calls"}
        </button>
      </div>

      {/* Add reservation — for walk-ins and phone bookings */}
      <button
        onClick={() => {
          if (!showForm) {
            setDate(todayISO());
            setTime(nowRounded15());
          }
          setShowForm(!showForm);
        }}
        className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.99]"
      >
        {showForm ? "Cancel" : "+ Add reservation"}
      </button>

      {/* Manual form — modern, English-only locale */}
      {showForm && (() => {
        const days = buildManualDayOptions();
        const selected = days.find((d) => d.value === date) ?? days[0];
        return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-5">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Walk-in / phone</p>
            <p className="text-[11px] text-gray-400">No SMS sent at save</p>
          </div>

          {/* Date — horizontal pill scroller, English locale */}
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Date</label>
              <span className="text-[11px] text-gray-400">{selected.long}</span>
            </div>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1 px-1" style={{ scrollbarWidth: "thin" }}>
              {days.map((d) => {
                const active = d.value === date;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => !d.isClosed && setDate(d.value)}
                    disabled={d.isClosed}
                    title={d.isClosed ? "Closed on Mondays" : d.long}
                    className={`flex-shrink-0 rounded-lg border px-3 py-2 text-center transition-all min-w-[58px] ${
                      active
                        ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                        : d.isClosed
                        ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`text-[9px] font-semibold uppercase tracking-wider ${active ? "text-white/80" : "text-gray-400"}`}>
                      {d.prefix || DAY_NAMES_EN[new Date(d.value + "T12:00:00Z").getUTCDay()]}
                    </div>
                    <div className="text-sm font-bold leading-tight mt-0.5">
                      {new Date(d.value + "T12:00:00Z").getUTCDate()}
                    </div>
                    <div className={`text-[9px] mt-0.5 ${active ? "text-white/80" : "text-gray-400"}`}>
                      {MONTH_NAMES_EN[new Date(d.value + "T12:00:00Z").getUTCMonth()]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time + Guests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {Array.from({ length: 40 }, (_, i) => {
                  const h = Math.floor(i / 4) + 14;
                  const m = (i % 4) * 15;
                  if (h >= 24) return null;
                  const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  return <option key={val} value={val}>{val}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                {[1,2,3,4,5,6,7,8,10,12,15,20].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Name</label>
            <input
              type="text"
              placeholder="Guest name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
              Phone <span className="font-normal normal-case tracking-normal text-gray-400">— optional</span>
            </label>
            <input
              type="tel"
              placeholder="+41 79 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
            />
          </div>

          {/* Note (optional) */}
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
              Note <span className="font-normal normal-case tracking-normal text-gray-400">— optional</span>
            </label>
            <input
              type="text"
              placeholder="Birthday, outdoor seating, ..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
            />
          </div>

          <button
            onClick={handleManualSave}
            disabled={saving || !name.trim() || !date || selected.isClosed}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : selected.isClosed ? "Closed on Mondays" : `Save reservation · ${selected.short} ${time}`}
          </button>
        </div>
        );
      })()}

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
              // Show "Cancel" button for confirmed/pending reservations (guest called to cancel — no penalty)
              const canCancel = (isConfirmed || isPending) && r.reservation_date >= todayStr;

              return (
                <div key={r.id} className={`rounded-xl border p-4 ${st.bg} border-gray-100`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{formatTime(r.reservation_time)}</span>
                        <span className="text-sm text-gray-600">{r.guest_name}</span>
                        <NoShowBadge
                          count={guestNoShows}
                          phone={r.guest_phone}
                          guestName={r.guest_name}
                          onForgive={openForgiveModal}
                        />
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
                        {r.guest_phone && r.guest_phone !== "\u2014" && (
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
                      {canCancel && (
                        <button
                          onClick={() => updateStatus(r.id, "cancelled")}
                          disabled={isUpdating}
                          className="rounded-lg bg-gray-400 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-500 disabled:opacity-40 transition-colors"
                        >
                          Cancel
                        </button>
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

      {/* No-show forgive modal — tap on Yellow/Red Card opens this. Lets Paul
          flip past no_show rows for this guest's phone to "cancelled", which
          resets the badge. Used when Paul decides a previous no-show wasn't
          really one (good reason, miscommunication, etc.). */}
      {forgiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setForgiveTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-gray-900">
              Forgive {forgiveTarget.guestName}?
            </h3>
            <p className="mt-2 text-center text-sm text-gray-600 leading-relaxed">
              {forgiveTarget.guestName} has{" "}
              <strong className="text-gray-900">
                {forgiveTarget.count} previous no-show{forgiveTarget.count === 1 ? "" : "s"}
              </strong>{" "}
              on file ({forgiveTarget.phone}).
              <br />
              Forgiving them flips those past entries to <em>cancelled</em> and resets the badge.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setForgiveTarget(null)}
                disabled={forgiving}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Keep badge
              </button>
              <button
                onClick={confirmForgive}
                disabled={forgiving}
                className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
              >
                {forgiving ? "Forgiving…" : "Forgive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
