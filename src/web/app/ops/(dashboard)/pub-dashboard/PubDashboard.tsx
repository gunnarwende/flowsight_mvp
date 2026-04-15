"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface TodayEvent {
  id: string;
  category: string;
  title: string;
  event_time: string | null;
}

interface UpcomingEvent {
  id: string;
  category: string;
  title: string;
  event_date: string;
  event_time: string | null;
}

interface PendingReservation {
  id: string;
  guest_name: string;
  guest_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  note: string | null;
  source: string;
}

interface TodayReservation {
  id: string;
  guest_name: string;
  reservation_time: string;
  party_size: number;
  note: string | null;
  status: string;
}

interface UpcomingReservation {
  id: string;
  guest_name: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
}

function fmtTime(t: string | null) { return t ? t.substring(0, 5) : ""; }
function fmtDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
}

export function PubDashboard({
  tenantName,
  todayEvents,
  upcomingEvents,
  pendingReservations,
  todayReservations,
  upcomingReservations,
}: {
  tenantName: string;
  todayEvents: TodayEvent[];
  upcomingEvents: UpcomingEvent[];
  pendingReservations: PendingReservation[];
  todayReservations: TodayReservation[];
  upcomingReservations: UpcomingReservation[];
}) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = pendingReservations.length;
  const todayGuestCount = todayReservations.reduce((s, r) => s + r.party_size, 0);

  async function confirmReservation(id: string) {
    setUpdatingId(id);
    try {
      await fetch(`/api/bigben-pub/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  async function declineReservation(id: string) {
    setUpdatingId(id);
    try {
      await fetch(`/api/bigben-pub/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      });
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  // Compute week stats
  const weekGuestCount = [...todayReservations, ...upcomingReservations].reduce((s, r) => s + r.party_size, 0);
  const sportEvents = [...todayEvents, ...upcomingEvents].filter(e => e.category === "sport");
  const pubEvents = [...todayEvents, ...upcomingEvents].filter(e => e.category === "event");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">{tenantName}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Zurich" })}
          {weekGuestCount > 0 && <span className="ml-2 text-gray-500">· {weekGuestCount} guests this week</span>}
        </p>
      </div>

      {/* ── PENDING RESERVATIONS (urgent alert) ──────── */}
      {pendingCount > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white animate-pulse">
              {pendingCount}
            </span>
            <p className="text-sm font-bold text-amber-800">New Reservations</p>
          </div>
          <div className="space-y-2">
            {pendingReservations.map((r) => (
              <div key={r.id} className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {fmtDate(r.reservation_date)} · {fmtTime(r.reservation_time)} · {r.party_size} guests
                    </p>
                    <p className="text-xs text-gray-600">{r.guest_name}</p>
                    {r.note && <p className="text-xs text-gray-400 italic mt-0.5">&ldquo;{r.note}&rdquo;</p>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 ml-2">
                    <button onClick={() => confirmReservation(r.id)} disabled={updatingId === r.id}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40">Confirm</button>
                    <button onClick={() => declineReservation(r.id)} disabled={updatingId === r.id}
                      className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-300 disabled:opacity-40">Decline</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4 SEGMENT CARDS ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Reservations */}
        <button onClick={() => router.push("/ops/reservations")}
          className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-gray-300 active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-base">🪑</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Reservations</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayReservations.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{todayGuestCount} guests today</p>
          {pendingCount > 0 && (
            <p className="text-[11px] font-bold text-amber-600 mt-1">{pendingCount} pending</p>
          )}
        </button>

        {/* Sports */}
        <button onClick={() => router.push("/ops/events")}
          className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-gray-300 active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-base">⚽</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Sports</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{sportEvents.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">matches this week</p>
          {todayEvents.filter(e => e.category === "sport").length > 0 && (
            <p className="text-[11px] font-bold text-emerald-600 mt-1">
              {todayEvents.filter(e => e.category === "sport").map(e => e.title.split(":")[0]).join(", ")} tonight
            </p>
          )}
        </button>

        {/* Events */}
        <button onClick={() => router.push("/ops/events")}
          className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-gray-300 active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-base">🎵</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Events</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pubEvents.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">events this week</p>
          {todayEvents.filter(e => e.category === "event").length > 0 && (
            <p className="text-[11px] font-bold text-purple-600 mt-1">
              {todayEvents.filter(e => e.category === "event").map(e => e.title).join(", ")} tonight
            </p>
          )}
        </button>

        {/* Website */}
        <a href="/bigben-pub" target="_blank"
          className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-gray-300 active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-base">🌐</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Website</span>
          </div>
          <p className="text-sm font-bold text-gray-900">View Website</p>
          <p className="text-[11px] text-gray-500 mt-0.5">flowsight.ch/bigben-pub</p>
        </a>
      </div>

      {/* ── TODAY'S DETAIL ────────────────────────────── */}
      {(todayEvents.length > 0 || todayReservations.length > 0) && (
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today</p>

          {todayEvents.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {todayEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm">{e.category === "sport" ? "⚽" : "🎵"}</span>
                  <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{e.title}</span>
                  {e.event_time && <span className="text-xs text-gray-400">{fmtTime(e.event_time)}</span>}
                </div>
              ))}
            </div>
          )}

          {todayReservations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Reservations</p>
              {todayReservations.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs font-semibold text-gray-700">{fmtTime(r.reservation_time)}</span>
                  <span className="text-xs text-gray-600 flex-1 truncate">{r.guest_name} · {r.party_size} guests</span>
                  <span className={`text-[10px] font-bold ${r.status === "confirmed" ? "text-emerald-600" : "text-amber-500"}`}>
                    {r.status === "confirmed" ? "✓" : "⏳"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {todayEvents.length === 0 && todayReservations.length === 0 && (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-400">Quiet day today. Perfect time to plan the week ahead.</p>
        </div>
      )}
    </div>
  );
}
