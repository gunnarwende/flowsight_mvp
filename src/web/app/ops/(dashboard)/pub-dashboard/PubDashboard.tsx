"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

export function PubDashboard({
  tenantName,
  todayEvents,
  upcomingEvents,
  pendingReservations,
  todayReservations,
  upcomingReservations,
  noShowMap,
}: {
  tenantName: string;
  todayEvents: TodayEvent[];
  upcomingEvents: UpcomingEvent[];
  pendingReservations: PendingReservation[];
  todayReservations: TodayReservation[];
  upcomingReservations: UpcomingReservation[];
  noShowMap: Record<string, number>;
}) {
  const router = useRouter();

  // P2: Sync voice reservations on mount so they appear without double-refresh
  useEffect(() => {
    fetch("/api/bigben-pub/sync-calls")
      .then(() => router.refresh())
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = pendingReservations.length;
  const todayGuestCount = todayReservations.reduce((s, r) => s + r.party_size, 0);

  // Compute week stats
  const weekGuestCount = [...todayReservations, ...upcomingReservations].reduce((s, r) => s + r.party_size, 0);
  const sportEvents = [...todayEvents, ...upcomingEvents].filter(e => e.category === "sport");
  const pubEvents = [...todayEvents, ...upcomingEvents].filter(e => e.category === "event");

  // Guest Watch: count guests with yellow (1 no-show) and red (2+ no-shows) cards
  const yellowCardCount = Object.values(noShowMap).filter(c => c === 1).length;
  const redCardCount = Object.values(noShowMap).filter(c => c >= 2).length;
  const totalFlagged = yellowCardCount + redCardCount;

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

      {/* ── PENDING RESERVATIONS (compact alert) ──────── */}
      {pendingCount > 0 && (
        <button
          onClick={() => router.push("/ops/reservations")}
          className="w-full rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-3 text-left transition-all hover:bg-amber-100 active:scale-[0.98]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white animate-pulse flex-shrink-0">
            {pendingCount}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-amber-800">
              {pendingCount === 1 ? "1 new reservation" : `${pendingCount} new reservations`}
            </p>
            <p className="text-xs text-amber-600 truncate">
              {pendingReservations.map((r) => `${r.guest_name} (${r.party_size})`).join(", ")}
            </p>
          </div>
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
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
        <button onClick={() => router.push("/ops/events?tab=sport")}
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
        <button onClick={() => router.push("/ops/events?tab=event")}
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

        {/* Guest Watch */}
        <button onClick={() => router.push("/ops/reservations")}
          className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-gray-300 active:scale-[0.98]">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-base">{totalFlagged > 0 ? "\u26A0\uFE0F" : "\u2705"}</span>
            <span className="text-xs font-bold text-gray-400 uppercase">Guest Watch</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalFlagged}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">flagged guests</p>
          {(yellowCardCount > 0 || redCardCount > 0) && (
            <p className="text-[11px] mt-1">
              {yellowCardCount > 0 && <span className="font-bold text-yellow-600">{yellowCardCount} yellow</span>}
              {yellowCardCount > 0 && redCardCount > 0 && <span className="text-gray-400"> · </span>}
              {redCardCount > 0 && <span className="font-bold text-red-600">{redCardCount} red</span>}
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

    </div>
  );
}
