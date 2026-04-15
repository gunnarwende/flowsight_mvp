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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900">{tenantName}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Zurich" })}
        </p>
      </div>

      {/* ── NEW RESERVATIONS (urgent!) ──────────────────── */}
      {pendingCount > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
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
                    <button
                      onClick={() => confirmReservation(r.id)}
                      disabled={updatingId === r.id}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => declineReservation(r.id)}
                      disabled={updatingId === r.id}
                      className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-300 disabled:opacity-40"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TODAY'S OVERVIEW ───────────────────────────── */}
      <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Today</p>

        {/* Today stats — clickable */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button onClick={() => router.push("/ops/events")} className="rounded-xl bg-gray-50 p-3 text-center transition-colors hover:bg-gray-100">
            <p className="text-xl font-bold text-gray-900">{todayEvents.length}</p>
            <p className="text-[10px] text-gray-400 uppercase flex items-center justify-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
              Events
            </p>
          </button>
          <button onClick={() => router.push("/ops/reservations")} className="rounded-xl bg-gray-50 p-3 text-center transition-colors hover:bg-gray-100">
            <p className="text-xl font-bold text-gray-900">{todayReservations.length}</p>
            <p className="text-[10px] text-gray-400 uppercase flex items-center justify-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              Bookings
            </p>
          </button>
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{todayGuestCount}</p>
            <p className="text-[10px] text-gray-400 uppercase">Guests</p>
          </div>
        </div>

        {/* Today's events */}
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

        {/* Today's reservations */}
        {todayReservations.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Reservations today</p>
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

        {todayEvents.length === 0 && todayReservations.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Quiet day today.</p>
        )}
      </div>

      {/* ── COMING UP (next 7 days) ────────────────────── */}
      {(upcomingEvents.length > 0 || upcomingReservations.length > 0) && (
        <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
          <button onClick={() => router.push("/ops/events")} className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-600 transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
            Next 7 Days →
          </button>

          {upcomingEvents.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm">{e.category === "sport" ? "⚽" : "🎵"}</span>
                  <span className="text-xs text-gray-400">{fmtDate(e.event_date)}</span>
                  <span className="text-xs font-semibold text-gray-700 flex-1 truncate">{e.title}</span>
                  {e.event_time && <span className="text-xs text-gray-400">{fmtTime(e.event_time)}</span>}
                </div>
              ))}
            </div>
          )}

          {upcomingReservations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Reservations</p>
              {upcomingReservations.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs text-gray-400">{fmtDate(r.reservation_date)}</span>
                  <span className="text-xs font-semibold text-gray-700">{fmtTime(r.reservation_time)}</span>
                  <span className="text-xs text-gray-600 flex-1 truncate">{r.guest_name} · {r.party_size}</span>
                  <span className={`text-[10px] font-bold ${r.status === "confirmed" ? "text-emerald-600" : "text-amber-500"}`}>
                    {r.status === "confirmed" ? "✓" : "⏳"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── WEBSITE LINK ──────────────────────────────── */}
      <a
        href="/bigben-pub"
        target="_blank"
        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      >
        <div>
          <p className="text-sm font-bold text-gray-900">🌐 Your Website</p>
          <p className="text-xs text-gray-500">flowsight.ch/bigben-pub</p>
        </div>
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>
  );
}
