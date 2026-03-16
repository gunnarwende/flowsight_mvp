"use client";

import Link from "next/link";
import { useState } from "react";
import { CreateCaseModal } from "./CreateCaseModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ZentraleCase {
  id: string;
  seq_number: number | null;
  created_at: string;
  updated_at: string;
  status: string;
  urgency: string;
  category: string;
  description: string;
  city: string;
  plz: string;
  street: string | null;
  house_number: string | null;
  source: string;
  assignee_text: string | null;
  reporter_name: string | null;
  review_sent_at: string | null;
  scheduled_at: string | null;
}

export interface TodayAppointment {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
  notes: string | null;
  staff: { display_name: string } | null;
  case_info: {
    id: string;
    seq_number: number | null;
    category: string;
    reporter_name: string | null;
    street: string | null;
    house_number: string | null;
    plz: string;
    city: string;
  } | null;
}

export interface WeekStats {
  neue: number;
  erledigt: number;
}

export interface ReviewStats {
  sent: number;
  pending: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isStuck48h(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 48 * 60 * 60 * 1000;
}

function daysAgo(iso: string): number {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

function computeNextStep(c: ZentraleCase): string {
  if (c.status === "new") return "Sichten und einordnen";
  if (c.status === "scheduled") return "Einsatz durchführen";
  if (c.status === "in_arbeit") return "Einsatz abschliessen";
  if (c.status === "warten") return "Rückmeldung prüfen";
  if (c.status === "done" && !c.review_sent_at) return "Review anfragen";
  if (c.status === "done") return "Abgeschlossen";
  return "";
}

// ---------------------------------------------------------------------------
// Grouping — Cases → Leitsystem modules
// ---------------------------------------------------------------------------

interface LeitsystemGroups {
  aktive: number;
  kritisch: number;
  notfallCases: ZentraleCase[];
  eingaenge: ZentraleCase[];
  wartet: ZentraleCase[];
  scheduled: ZentraleCase[];
  abschluss: ZentraleCase[];
  oldestWartetDays: number;
  oldestAbschlussDays: number;
}

function groupForLeitsystem(cases: ZentraleCase[]): LeitsystemGroups {
  let aktive = 0;
  let kritisch = 0;

  const notfallCases: ZentraleCase[] = [];
  const eingaenge: ZentraleCase[] = [];
  const wartet: ZentraleCase[] = [];
  const scheduled: ZentraleCase[] = [];
  const abschluss: ZentraleCase[] = [];

  for (const c of cases) {
    if (c.status === "archived") continue;
    const isActive = c.status !== "done" && c.status !== "archived";

    if (isActive) {
      aktive++;
      if (c.urgency === "notfall") kritisch++;
    }

    // Notfall overlay
    if (c.urgency === "notfall" && isActive) {
      notfallCases.push(c);
    }

    // Wartet: status = warten
    if (c.status === "warten") {
      wartet.push(c);
      continue;
    }

    // Neu (Eingänge)
    if (c.status === "new") {
      eingaenge.push(c);
      continue;
    }

    // Scheduled + In Arbeit (for Heute)
    if (c.status === "scheduled" || c.status === "in_arbeit") {
      scheduled.push(c);
      continue;
    }

    // Abschluss: done, no review sent, last 14 days
    if (c.status === "done" && !c.review_sent_at && daysAgo(c.updated_at) <= 14) {
      abschluss.push(c);
    }
  }

  // Sort eingänge by urgency then newest
  const urgencyRank: Record<string, number> = { notfall: 0, dringend: 1, normal: 2 };
  eingaenge.sort((a, b) => {
    const ra = urgencyRank[a.urgency] ?? 9;
    const rb = urgencyRank[b.urgency] ?? 9;
    if (ra !== rb) return ra - rb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Sort wartet by oldest first
  wartet.sort(
    (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
  );

  // Sort notfall by newest
  notfallCases.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Sort abschluss by oldest first
  abschluss.sort(
    (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
  );

  return {
    aktive,
    kritisch,
    notfallCases,
    eingaenge,
    wartet,
    scheduled,
    abschluss,
    oldestWartetDays: wartet.length > 0 ? daysAgo(wartet[0].updated_at) : 0,
    oldestAbschlussDays: abschluss.length > 0 ? daysAgo(abschluss[0].updated_at) : 0,
  };
}

// ---------------------------------------------------------------------------
// Betriebspuls — system health signal
// ---------------------------------------------------------------------------

function derivePulsSignal(g: LeitsystemGroups): {
  color: string;
  dotClass: string;
  text: string;
} {
  if (g.kritisch > 0) {
    return {
      color: "text-red-700",
      dotClass: "bg-red-500 animate-pulse",
      text: `${g.kritisch} kritisch`,
    };
  }
  const stuckCount = g.wartet.filter((c) => isStuck48h(c.updated_at)).length;
  if (stuckCount > 0 || g.wartet.length > 3) {
    return {
      color: "text-amber-700",
      dotClass: "bg-amber-500",
      text: `${g.wartet.length} wartend`,
    };
  }
  return {
    color: "text-emerald-700",
    dotClass: "bg-emerald-500",
    text: "Ruhig",
  };
}

// ---------------------------------------------------------------------------
// Component — Leitsystem
// ---------------------------------------------------------------------------

export function ZentraleView({
  cases,
  todayAppointments,
  caseIdPrefix = "FS",
  weekStats,
  reviewStats,
}: {
  cases: ZentraleCase[];
  todayAppointments: TodayAppointment[];
  caseIdPrefix?: string;
  weekStats: WeekStats;
  reviewStats: ReviewStats;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const g = groupForLeitsystem(cases);
  const puls = derivePulsSignal(g);

  // Heute: appointments + scheduled cases
  const todayFiltered = todayAppointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed",
  );
  const heuteCount = todayFiltered.length + g.scheduled.length;

  // Eingänge urgency split
  const dringendCount = g.eingaenge.filter((c) => c.urgency === "dringend" || c.urgency === "notfall").length;
  const normalCount = g.eingaenge.length - dringendCount;


  return (
    <div className="space-y-5">
      {/* ═══════════════════════════════════════════════════════════════
          NOTFALL EVENT OVERLAY
         ═══════════════════════════════════════════════════════════════ */}
      {g.notfallCases.length > 0 && (
        <Link
          href="/ops/faelle?urgency=notfall"
          className="block bg-red-50/80 border border-red-200/60 rounded-2xl px-5 py-4 hover:bg-red-50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="text-sm font-semibold text-red-800">
                {g.notfallCases.length === 1
                  ? "Notfall"
                  : `${g.notfallCases.length} Notfälle`}
              </span>
              <span className="text-sm text-red-600/70">
                {g.notfallCases[0].category}
                {g.notfallCases[0].city && ` — ${g.notfallCases[0].city}`}
              </span>
            </div>
            <svg className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          {g.notfallCases.length > 1 && (
            <p className="text-xs text-red-500/60 mt-1.5 pl-[18px]">
              +{g.notfallCases.length - 1} weitere
            </p>
          )}
        </Link>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          BETRIEBSPULS
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className={`inline-flex items-center gap-1.5 font-medium ${puls.color}`}>
            <span className={`w-2 h-2 rounded-full ${puls.dotClass}`} />
            {puls.text}
          </span>

          <span className="text-gray-300 select-none">·</span>

          <span className="text-gray-500">
            {g.aktive} aktiv
          </span>
          {g.wartet.length > 0 && (
            <span className="text-gray-400">
              · {g.wartet.length} wartend
            </span>
          )}
          {heuteCount > 0 && (
            <span className="text-gray-400">
              · {heuteCount} heute
            </span>
          )}

          <span className="text-gray-300 select-none">·</span>

          <span className="text-gray-400 text-xs">
            {weekStats.neue} neu, {weekStats.erledigt} erledigt diese Woche
          </span>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors flex-shrink-0 ml-3"
        >
          + Neuer Fall
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODULE GRID — 5 cards
         ═══════════════════════════════════════════════════════════════ */}

      {/* Row 1: Neu + Wartet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModuleCard
          href="/ops/faelle?status=new"
          label="Neu"
          accentColor="border-l-blue-500"
          count={g.eingaenge.length}
          context={
            g.eingaenge.length === 0
              ? "Alles gesichtet"
              : dringendCount > 0
                ? `${dringendCount} dringend · ${normalCount} normal`
                : `${normalCount} neue Eingänge`
          }
          subSignal={
            g.eingaenge.length > 0 && daysAgo(g.eingaenge[g.eingaenge.length - 1].created_at) > 1
              ? `Ältester vor ${daysAgo(g.eingaenge[g.eingaenge.length - 1].created_at)} Tagen`
              : undefined
          }
          emptyText="Keine neuen Eingänge"
        />

        <ModuleCard
          href="/ops/faelle?status=warten"
          label="Warten"
          accentColor="border-l-amber-500"
          count={g.wartet.length}
          tinted={g.oldestWartetDays > 2 || g.wartet.length > 3}
          tintClass="bg-amber-50/40"
          context={
            g.wartet.length === 0
              ? "Nichts blockiert"
              : `${g.wartet.length} Fälle warten`
          }
          subSignal={
            g.oldestWartetDays > 0
              ? `Ältester seit ${g.oldestWartetDays} Tagen`
              : undefined
          }
          emptyText="Nichts blockiert"
        />
      </div>

      {/* Row 2: Heute (full width) */}
      <ModuleCard
        href="/ops/faelle?status=scheduled"
        label="Heute"
        accentColor="border-l-blue-600"
        count={heuteCount}
        context={
          heuteCount === 0
            ? "Keine Termine oder Einsätze geplant"
            : todayFiltered.length > 0
              ? todayFiltered
                  .slice(0, 3)
                  .map((a) => formatTime(a.scheduled_at))
                  .join(" · ") +
                (todayFiltered.length > 3 ? ` +${todayFiltered.length - 3}` : "") +
                (g.scheduled.length > 0 ? ` · ${g.scheduled.length} geplant` : "")
              : `${g.scheduled.length} Fälle mit Termin`
        }
        subSignal={
          heuteCount === 0
            ? "Ruhiger Tag"
            : undefined
        }
        emptyText="Keine Termine heute"
        fullWidth
      />

      {/* Row 3: Abschluss + Wirkung */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ModuleCard
          href="/ops/faelle?status=done"
          label="Abschluss"
          accentColor="border-l-emerald-500"
          count={g.abschluss.length}
          context={
            g.abschluss.length === 0
              ? "Alles nachgefasst"
              : `${g.abschluss.length} ohne Bewertungsanfrage`
          }
          subSignal={
            g.oldestAbschlussDays > 3
              ? `Ältester seit ${g.oldestAbschlussDays} Tagen`
              : undefined
          }
          emptyText="Alles nachgefasst"
        />

        <ModuleCard
          href="/ops/faelle?status=done"
          label="Wirkung"
          accentColor="border-l-emerald-600"
          count={reviewStats.sent}
          countSuffix={reviewStats.sent === 1 ? " Bewertungsanfrage" : " Bewertungsanfragen"}
          context={
            reviewStats.sent === 0 && reviewStats.pending === 0
              ? "Noch keine Bewertungsanfragen"
              : reviewStats.pending > 0
                ? `${reviewStats.pending} Fälle bereit für Anfrage`
                : "Alle angefragten Fälle versorgt"
          }
          subSignal="Letzte 30 Tage"
          emptyText="Noch keine Bewertungsanfragen"
        />
      </div>

      <CreateCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ModuleCard
// ---------------------------------------------------------------------------

function ModuleCard({
  href,
  label,
  accentColor,
  count,
  countSuffix,
  context,
  subSignal,
  emptyText,
  tinted,
  tintClass,
  fullWidth,
}: {
  href: string;
  label: string;
  accentColor: string;
  count: number;
  countSuffix?: string;
  context: string;
  subSignal?: string;
  emptyText: string;
  tinted?: boolean;
  tintClass?: string;
  fullWidth?: boolean;
}) {
  const isEmpty = count === 0;

  return (
    <Link
      href={href}
      className={`block border border-gray-200 rounded-2xl border-l-[4px] ${accentColor} px-6 py-5 transition-all hover:border-gray-300 hover:shadow-sm group ${
        tinted && !isEmpty ? tintClass ?? "" : "bg-white"
      } ${isEmpty ? "bg-white" : "bg-white"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      <div className="mb-1.5">
        {countSuffix ? (
          <span className="text-gray-900">
            <span className="text-2xl font-bold">{count}</span>
            <span className="text-sm font-medium text-gray-500 ml-1">{countSuffix}</span>
          </span>
        ) : (
          <span className={`text-2xl font-bold ${isEmpty ? "text-gray-300" : "text-gray-900"}`}>
            {count}
          </span>
        )}
      </div>

      <p className={`text-sm ${isEmpty ? "text-gray-400" : "text-gray-600"}`}>
        {isEmpty ? emptyText : context}
      </p>

      {subSignal && !isEmpty && (
        <p className="text-xs text-gray-400 mt-1">{subSignal}</p>
      )}
      {subSignal && isEmpty && label === "Wirkung" && (
        <p className="text-xs text-gray-400 mt-1">{subSignal}</p>
      )}
    </Link>
  );
}

// Export for case detail page
export { computeNextStep };
