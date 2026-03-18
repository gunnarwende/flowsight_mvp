"use client";

import Link from "next/link";
import { SystemflussBar } from "./SystemflussBar";
import { WirkungZone } from "./WirkungZone";
import type { LeitzentraleCase } from "./LeitzentraleView";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";

// ---------------------------------------------------------------------------
// Techniker View — "Meine Arbeit"
// Personal greeting, today's appointments, my cases, my week.
// ---------------------------------------------------------------------------

interface TechnikerViewProps {
  staffName: string;
  cases: LeitzentraleCase[];
  caseIdPrefix: string;
  /** All cases (for system flow counts) */
  allCasesCount: { eingang: number; beiUns: number; erledigt: number };
  sources: { voice: number; wizard: number; manual: number };
  reviewAvg: number | null;
  reviewStats: { sent7d: number; sent30d: number; sentTotal: number; erledigt30d: number };
}

const STATUS_LABELS: Record<string, string> = {
  new: "Neu", scheduled: "Geplant", in_arbeit: "In Arbeit", warten: "Warten", done: "Erledigt",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", scheduled: "bg-violet-100 text-violet-700",
  in_arbeit: "bg-indigo-100 text-indigo-700", warten: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 17) return "Guten Tag";
  return "Guten Abend";
}

function formatTerminShort(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("de-CH", { weekday: "short", timeZone: "Europe/Zurich" }).replace(/\.$/, "");
  const date = d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
  const time = d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
  return `${day} ${date}, ${time}`;
}

export function TechnikerView({
  staffName, cases, caseIdPrefix, allCasesCount, sources, reviewAvg, reviewStats,
}: TechnikerViewProps) {
  const firstName = staffName.split(" ")[0];

  // Today's appointments
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Zurich" });
  const todayAppointments = cases
    .filter((c) => c.scheduled_at && c.status !== "done" && new Date(c.scheduled_at).toLocaleDateString("en-CA", { timeZone: "Europe/Zurich" }) === todayStr)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime());

  // My open cases (not done)
  const openCases = cases.filter((c) => c.status !== "done");

  // My week stats
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const doneThisWeek = cases.filter((c) => c.status === "done" && new Date(c.updated_at).getTime() >= sevenDaysAgo);

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{getGreeting()}, {firstName}</h1>
        <SystemflussBar
          eingang={allCasesCount.eingang}
          beiUns={allCasesCount.beiUns}
          erledigt={allCasesCount.erledigt}
          reviewAvg={reviewAvg}
          sources={sources}
          compact
        />
      </div>

      {/* Today's appointments */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Heute {todayAppointments.length > 0 ? `(${todayAppointments.length})` : ""}
          </h2>
        </div>
        {todayAppointments.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-gray-400">
            Keine Termine heute.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppointments.map((c) => (
              <div key={c.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">{formatTerminShort(c.scheduled_at!)}</p>
                    <p className="text-sm font-semibold text-gray-900">{c.category}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {c.reporter_name ? `${c.reporter_name} · ` : ""}{c.street ? `${c.street} ${c.house_number ?? ""}, ` : ""}{c.plz} {c.city}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{formatCaseId(c.seq_number, caseIdPrefix)}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {c.street && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.street, c.house_number, c.plz, c.city, "Schweiz"].filter(Boolean).join(" "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors min-h-[36px] flex items-center gap-1"
                    >
                      📍 Navigieren
                    </a>
                  )}
                  <Link
                    href={`/ops/cases/${c.id}`}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors min-h-[36px] flex items-center"
                  >
                    Fall öffnen
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My open cases */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Meine Fälle ({openCases.length} offen)
          </h2>
        </div>
        {openCases.length === 0 ? (
          <div className="px-5 py-6 text-center text-sm text-gray-400">
            Keine offenen Fälle.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {openCases.slice(0, 10).map((c) => (
              <Link
                key={c.id}
                href={`/ops/cases/${c.id}`}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors min-h-[44px]"
              >
                <span className="text-xs font-mono text-gray-400 w-16 flex-shrink-0">{formatCaseId(c.seq_number, caseIdPrefix)}</span>
                <span className="text-sm text-gray-900 truncate flex-1">{c.category}</span>
                <span className="text-xs text-gray-500 truncate max-w-[80px]">{c.city}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* My week */}
      <WirkungZone
        reviewStats={reviewStats}
        avgRating={reviewAvg}
        compact
      />

      {doneThisWeek.length > 0 && (
        <p className="text-xs text-gray-400 text-center">✅ {doneThisWeek.length} Fälle diese Woche erledigt</p>
      )}
    </div>
  );
}
