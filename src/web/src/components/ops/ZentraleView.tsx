"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
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
  if (c.status === "contacted" && !c.scheduled_at) return "Termin vereinbaren";
  if (c.status === "contacted" && c.scheduled_at) return "Termin bestätigen";
  if (c.status === "scheduled") return "Einsatz durchführen";
  if (c.status === "done" && !c.review_sent_at) return "Review anfragen";
  if (c.status === "done") return "Abgeschlossen";
  return "";
}

// ---------------------------------------------------------------------------
// Grouping — Cases → Leitzentrale zones
// ---------------------------------------------------------------------------

interface Lage {
  kritisch: number;
  aktive: number;
  beiUns: number;
  abschlussOffen: number;
}

interface ZentraleGroups {
  lage: Lage;
  notfallCases: ZentraleCase[];
  eingaenge: ZentraleCase[];
  wartet: ZentraleCase[];
  beiUnsActive: ZentraleCase[];
  todayAppointments: TodayAppointment[];
  abschluss: ZentraleCase[];
}

function groupForZentrale(
  cases: ZentraleCase[],
  rawAppointments: TodayAppointment[],
): ZentraleGroups {
  let kritisch = 0;
  let aktive = 0;

  const notfallCases: ZentraleCase[] = [];
  const eingaenge: ZentraleCase[] = [];
  const wartet: ZentraleCase[] = [];
  const beiUnsActive: ZentraleCase[] = [];
  const abschluss: ZentraleCase[] = [];

  for (const c of cases) {
    if (c.status === "archived") continue;
    const isActive = c.status !== "done" && c.status !== "archived";

    if (isActive) {
      aktive++;
      if (c.urgency === "notfall") kritisch++;
    }

    // Notfall-Banner (active emergencies)
    if (c.urgency === "notfall" && isActive) {
      notfallCases.push(c);
    }

    // Eingänge: new cases
    if (c.status === "new") {
      eingaenge.push(c);
      continue;
    }

    // Wartet auf uns: contacted, no appointment yet — ball stuck with us
    if (c.status === "contacted" && !c.scheduled_at) {
      wartet.push(c);
      continue;
    }

    // Bei uns active: contacted WITH appointment + scheduled
    if (c.status === "contacted" && c.scheduled_at) {
      beiUnsActive.push(c);
      continue;
    }
    if (c.status === "scheduled") {
      beiUnsActive.push(c);
      continue;
    }

    // Abschluss: done, no review, last 7 days
    if (c.status === "done" && !c.review_sent_at && daysAgo(c.updated_at) <= 7) {
      abschluss.push(c);
    }
  }

  // Sort: eingänge = notfall first, then dringend, then newest
  const urgencyRank: Record<string, number> = { notfall: 0, dringend: 1, normal: 2 };
  eingaenge.sort((a, b) => {
    const ra = urgencyRank[a.urgency] ?? 9;
    const rb = urgencyRank[b.urgency] ?? 9;
    if (ra !== rb) return ra - rb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Sort: wartet = oldest first (most stuck)
  wartet.sort(
    (a, b) =>
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
  );

  // Sort: beiUnsActive = scheduled with date first, then by update
  beiUnsActive.sort((a, b) => {
    const aS = a.status === "scheduled" && a.scheduled_at;
    const bS = b.status === "scheduled" && b.scheduled_at;
    if (aS && !bS) return -1;
    if (!aS && bS) return 1;
    if (aS && bS)
      return (
        new Date(a.scheduled_at!).getTime() -
        new Date(b.scheduled_at!).getTime()
      );
    return (
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // Sort: notfall = newest first
  notfallCases.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // Sort: abschluss = oldest first (most overdue for review)
  abschluss.sort(
    (a, b) =>
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
  );

  // Appointments: only scheduled/confirmed
  const todayAppointments = rawAppointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed",
  );

  return {
    lage: {
      kritisch,
      aktive,
      beiUns: wartet.length + beiUnsActive.length,
      abschlussOffen: abschluss.length,
    },
    notfallCases,
    eingaenge,
    wartet,
    beiUnsActive,
    todayAppointments,
    abschluss,
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const URGENCY_BORDER: Record<string, string> = {
  notfall: "border-l-red-500",
  dringend: "border-l-amber-400",
  normal: "border-l-gray-200",
};

const MAX_EINGAENGE = 5;
const MAX_WARTET = 4;
const MAX_BEI_UNS = 6;
const MAX_ABSCHLUSS = 5;

// ---------------------------------------------------------------------------
// Component — Leitzentrale
// ---------------------------------------------------------------------------

export function ZentraleView({
  cases,
  todayAppointments,
  caseIdPrefix = "FS",
  weekStats,
}: {
  cases: ZentraleCase[];
  todayAppointments: TodayAppointment[];
  caseIdPrefix?: string;
  weekStats: WeekStats;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const g = groupForZentrale(cases, todayAppointments);

  return (
    <div className="space-y-6">
      {/* ────────────────────────────────────────────────────────────────
          EBENE A — Priorität / Lage
         ──────────────────────────────────────────────────────────────── */}

      {/* Notfall-Banner — only when critical cases exist */}
      {g.notfallCases.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-semibold text-red-800">
              {g.notfallCases.length === 1
                ? "Notfall"
                : `${g.notfallCases.length} Notfälle`}
            </span>
          </div>
          <div className="space-y-1">
            {g.notfallCases.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/ops/cases/${c.id}`}
                className="flex items-center justify-between text-sm hover:bg-red-100/50 rounded-lg px-2.5 py-1.5 -mx-2.5 transition-colors"
              >
                <span className="text-red-800 font-medium">
                  {c.category}
                  <span className="text-red-600/60 font-normal ml-2">
                    {c.plz} {c.city}
                  </span>
                </span>
                <span className="text-xs text-red-500/80 font-medium flex-shrink-0 ml-3">
                  {formatCaseId(c.seq_number, caseIdPrefix)}
                </span>
              </Link>
            ))}
            {g.notfallCases.length > 3 && (
              <Link
                href="/ops/faelle?urgency=notfall"
                className="block text-xs text-red-500 hover:text-red-700 px-2.5 pt-1 transition-colors"
              >
                +{g.notfallCases.length - 3} weitere
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Lagezeile — Instrument strip */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {/* Status signal */}
          {g.lage.kritisch > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {g.lage.kritisch} kritisch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Alles ruhig
            </span>
          )}

          {/* Counters — mirror the modules below */}
          <span className="text-gray-300 select-none">|</span>
          <span className="text-gray-500">
            {g.lage.aktive} aktiv
          </span>
          {g.lage.beiUns > 0 && (
            <span className="text-gray-400">
              {g.lage.beiUns} bei uns
            </span>
          )}
          {g.lage.abschlussOffen > 0 && (
            <span className="text-gray-400">
              {g.lage.abschlussOffen} abschluss
            </span>
          )}
          {g.todayAppointments.length > 0 && (
            <span className="text-gray-400">
              {g.todayAppointments.length} heute
            </span>
          )}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors flex-shrink-0"
        >
          + Neuer Fall
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          EBENE B — Hauptarbeitsfläche
         ──────────────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Links: Neu eingegangen ──────────────────────────────── */}
        <section>
          <SectionHeader
            label="Neu eingegangen"
            count={g.eingaenge.length}
          />

          {g.eingaenge.length === 0 ? (
            <EmptyState text="Keine neuen Eingänge" />
          ) : (
            <div className="space-y-2.5">
              {g.eingaenge.slice(0, MAX_EINGAENGE).map((c) => (
                <Link
                  key={c.id}
                  href={`/ops/cases/${c.id}`}
                  className={`block bg-white border border-gray-200 border-l-[3px] ${URGENCY_BORDER[c.urgency] ?? "border-l-gray-200"} rounded-xl p-4 transition-all hover:shadow-md hover:-translate-y-px`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">
                      {c.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                      {formatCaseId(c.seq_number, caseIdPrefix)}
                    </span>
                  </div>
                  {c.description && (
                    <p className="text-sm text-gray-500 line-clamp-1 mb-1.5">
                      {c.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>
                      {c.plz} {c.city}
                    </span>
                    {c.reporter_name && (
                      <>
                        <span className="text-gray-300">&middot;</span>
                        <span>{c.reporter_name}</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
              {g.eingaenge.length > MAX_EINGAENGE && (
                <Link
                  href="/ops/faelle?status=new"
                  className="block text-xs text-gray-400 hover:text-gray-600 transition-colors px-1 pt-1"
                >
                  → Alle {g.eingaenge.length} Eingänge
                </Link>
              )}
            </div>
          )}
        </section>

        {/* ── Rechts: Bei uns ─────────────────────────────────────── */}
        <section>
          <SectionHeader
            label="Bei uns"
            count={g.wartet.length + g.beiUnsActive.length}
          />

          {g.wartet.length === 0 &&
          g.beiUnsActive.length === 0 &&
          g.todayAppointments.length === 0 ? (
            <EmptyState text="Alles versorgt" />
          ) : (
            <div className="space-y-3">
              {/* Wartet auf uns — amber sub-zone, only when stuck cases */}
              {g.wartet.length > 0 && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl overflow-hidden">
                  <div className="px-3.5 pt-2.5 pb-1.5">
                    <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Wartet auf uns
                      <span className="ml-1.5 text-amber-500/70 normal-case tracking-normal font-medium">
                        ({g.wartet.length})
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-amber-100">
                    {g.wartet.slice(0, MAX_WARTET).map((c) => {
                      const d = daysAgo(c.updated_at);
                      const signal = !c.assignee_text
                        ? "unzugewiesen"
                        : d > 0
                          ? `kein Termin, ${d}d`
                          : "kein Termin";
                      return (
                        <Link
                          key={c.id}
                          href={`/ops/cases/${c.id}`}
                          className="flex items-center justify-between px-3.5 py-2 text-sm hover:bg-amber-100/40 transition-colors"
                        >
                          <span className="text-gray-800 truncate">
                            {c.reporter_name ?? c.category}
                            <span className="text-gray-400 ml-1.5 text-xs font-normal">
                              {c.category !== (c.reporter_name ?? c.category) ? c.category : ""}
                            </span>
                          </span>
                          <span className="text-xs text-amber-600/80 flex-shrink-0 ml-2 font-medium">
                            {signal}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  {g.wartet.length > MAX_WARTET && (
                    <Link
                      href="/ops/faelle?status=contacted"
                      className="block px-3.5 py-2 text-xs text-amber-600/70 hover:text-amber-700 transition-colors border-t border-amber-100"
                    >
                      → Alle in Fälle
                    </Link>
                  )}
                </div>
              )}

              {/* Heute — only when appointments exist */}
              {g.todayAppointments.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-3.5 pt-2.5 pb-1.5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Heute
                      <span className="ml-1.5 text-gray-400 normal-case tracking-normal font-medium">
                        ({g.todayAppointments.length})
                      </span>
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {g.todayAppointments.map((a) => (
                      <Link
                        key={a.id}
                        href={
                          a.case_info ? `/ops/cases/${a.case_info.id}` : "#"
                        }
                        className="flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-gray-100/60 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 flex-shrink-0 tabular-nums">
                          {formatTime(a.scheduled_at)}
                        </span>
                        {a.staff?.display_name && (
                          <span className="text-gray-600 truncate">
                            {a.staff.display_name}
                          </span>
                        )}
                        {a.case_info && (
                          <span className="text-gray-400 truncate text-xs">
                            {a.case_info.category} · {a.case_info.plz}{" "}
                            {a.case_info.city}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Active cases — contacted with appointment + scheduled */}
              {g.beiUnsActive.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                  {g.beiUnsActive.slice(0, MAX_BEI_UNS).map((c) => {
                    const step = computeNextStep(c);
                    const d = daysAgo(c.updated_at);
                    const stuck = isStuck48h(c.updated_at);
                    return (
                      <Link
                        key={c.id}
                        href={`/ops/cases/${c.id}`}
                        className="flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      >
                        <div className="truncate mr-2">
                          <span className="text-gray-800 font-medium">
                            {c.reporter_name ?? c.category}
                          </span>
                          {c.reporter_name && c.category && (
                            <span className="text-gray-400 ml-1.5 text-xs">
                              {c.category}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs flex-shrink-0 ${stuck ? "text-amber-600 font-medium" : "text-gray-400"}`}
                        >
                          {step}
                          {d > 2 && ` · ${d}d`}
                        </span>
                      </Link>
                    );
                  })}
                  {g.beiUnsActive.length > MAX_BEI_UNS && (
                    <Link
                      href="/ops/faelle?status=in_progress"
                      className="block px-3.5 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      +{g.beiUnsActive.length - MAX_BEI_UNS} weitere
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          EBENE C — Schluss / Wirkung
         ──────────────────────────────────────────────────────────────── */}

      {/* Abschluss — compact, full width, collapse when empty */}
      {g.abschluss.length > 0 && (
        <section>
          <SectionHeader label="Abschluss" count={g.abschluss.length} />
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
            {g.abschluss.slice(0, MAX_ABSCHLUSS).map((c) => {
              const d = daysAgo(c.updated_at);
              return (
                <Link
                  key={c.id}
                  href={`/ops/cases/${c.id}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700 font-medium truncate">
                    {c.reporter_name ?? c.category}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-3">
                    Review offen{d > 0 ? ` · ${d}d` : ""}
                  </span>
                </Link>
              );
            })}
            {g.abschluss.length > MAX_ABSCHLUSS && (
              <Link
                href="/ops/faelle?status=done"
                className="block px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                +{g.abschluss.length - MAX_ABSCHLUSS} weitere
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Betriebsleiste — ambient footer with Wirkung */}
      <div className="text-center pt-3 pb-1">
        <p className="text-xs text-gray-400">
          {weekStats.neue} neue · {weekStats.erledigt} erledigt
          <span className="text-gray-300 ml-0.5">(7d)</span>
          {g.abschluss.length > 0 && (
            <>
              <span className="text-gray-300 mx-1.5">·</span>
              {g.abschluss.length} Review offen
            </>
          )}
        </p>
      </div>

      <CreateCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
      {label}
      {count > 0 && (
        <span className="ml-1.5 text-gray-400 normal-case tracking-normal font-medium">
          ({count})
        </span>
      )}
    </h2>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-8 text-center">
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}

// Export for case detail page
export { computeNextStep };
