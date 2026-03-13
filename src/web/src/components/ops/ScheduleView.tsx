"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StaffMember {
  id: string;
  display_name: string;
  role: string;
}

interface Appointment {
  id: string;
  case_id: string;
  staff_id: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
  notes: string | null;
  staff: StaffMember;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  scheduled: { bg: "bg-blue-100 text-blue-700", label: "Geplant" },
  confirmed: { bg: "bg-violet-100 text-violet-700", label: "Bestätigt" },
  completed: { bg: "bg-emerald-100 text-emerald-700", label: "Erledigt" },
  cancelled: { bg: "bg-gray-100 text-gray-500", label: "Abgesagt" },
};

export function ScheduleView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"today" | "week">("today");

  useEffect(() => {
    fetchAppointments();
  }, [view]);

  async function fetchAppointments() {
    setLoading(true);
    const now = new Date();
    const zurichDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(now);

    let from: string;
    let to: string;

    if (view === "today") {
      from = `${zurichDate}T00:00:00+01:00`;
      to = `${zurichDate}T23:59:59+01:00`;
    } else {
      // Week view: today + 6 days
      from = `${zurichDate}T00:00:00+01:00`;
      const endDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
      const endStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(endDate);
      to = `${endStr}T23:59:59+01:00`;
    }

    const res = await fetch(`/api/ops/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    if (res.ok) {
      setAppointments(await res.json());
    }
    setLoading(false);
  }

  // Group by staff
  const byStaff = new Map<string, { staff: StaffMember; items: Appointment[] }>();
  for (const apt of appointments) {
    const key = apt.staff_id;
    if (!byStaff.has(key)) {
      byStaff.set(key, { staff: apt.staff, items: [] });
    }
    byStaff.get(key)!.items.push(apt);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Einsatzplan</h2>
          <p className="text-sm text-gray-500">Termine nach Mitarbeiter gruppiert</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setView("today")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "today" ? "bg-slate-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Heute
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "week" ? "bg-slate-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Woche
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Laden…</p>
      ) : byStaff.size === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {view === "today" ? "Heute keine Termine geplant." : "Diese Woche keine Termine geplant."}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byStaff.values()).map(({ staff, items }) => (
            <section key={staff.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50/80 border-b border-gray-200 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {staff.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">{staff.display_name}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">{staff.role}</span>
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  {items.length} {items.length === 1 ? "Termin" : "Termine"}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((apt) => {
                  const badge = STATUS_BADGE[apt.status] ?? STATUS_BADGE.scheduled;
                  return (
                    <div key={apt.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{formatTime(apt.scheduled_at)}</span>
                        {view === "week" && (
                          <span className="text-gray-400 ml-1">({formatDate(apt.scheduled_at)})</span>
                        )}
                        <span className="text-gray-400 ml-1">· {apt.duration_min} Min.</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {apt.notes && (
                        <span className="text-xs text-gray-400 truncate max-w-[200px]">{apt.notes}</span>
                      )}
                      <Link
                        href={`/ops/cases/${apt.case_id}`}
                        className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Fall →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
