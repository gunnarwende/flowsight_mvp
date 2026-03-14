"use client";

import Link from "next/link";
import type { CaseRow } from "./CaseListClient";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PulsGroup {
  key: string;
  label: string;
  emptyLabel: string;
  color: string;
  headerBg: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  cases: CaseRow[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  scheduled: "Geplant",
  done: "Erledigt",
  archived: "Archiviert",
};

const URGENCY_DOT: Record<string, string> = {
  notfall: "bg-red-500",
  dringend: "bg-amber-500",
  normal: "bg-gray-400",
};

const SOURCE_ICON: Record<string, string> = {
  voice: "\uD83D\uDCDE",
  wizard: "\uD83C\uDF10",
  manual: "\u2795",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "gerade eben";
  if (hours < 24) return `vor ${hours}h`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}

function isToday(iso: string): boolean {
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date(iso));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
  return d === today;
}

function isStuck48h(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() > 48 * 60 * 60 * 1000;
}

function isRecentlyDone(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 7 * 24 * 60 * 60 * 1000;
}

// ---------------------------------------------------------------------------
// Grouping logic (leitstand.md §5.1)
// ---------------------------------------------------------------------------

function groupCases(cases: CaseRow[]): PulsGroup[] {
  const achtung: CaseRow[] = [];
  const heute: CaseRow[] = [];
  const inArbeit: CaseRow[] = [];
  const abschluss: CaseRow[] = [];

  for (const c of cases) {
    if (c.status === "archived") continue;

    // Achtung: Notfälle (any status except done) + stuck >48h
    if (c.status !== "done" && (c.urgency === "notfall" || isStuck48h(c.created_at))) {
      achtung.push(c);
      continue;
    }

    // Abschluss: done in last 7 days
    if (c.status === "done") {
      if (isRecentlyDone(c.created_at)) {
        abschluss.push(c);
      }
      continue;
    }

    // Heute: new today OR status "new"
    if (c.status === "new" || isToday(c.created_at)) {
      heute.push(c);
      continue;
    }

    // In Arbeit: contacted or scheduled
    inArbeit.push(c);
  }

  return [
    {
      key: "achtung",
      label: "Achtung",
      emptyLabel: "Keine Notfälle oder überfällige Fälle",
      color: "text-red-700",
      headerBg: "bg-red-100",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      dotColor: "bg-red-500",
      cases: achtung,
    },
    {
      key: "heute",
      label: "Heute",
      emptyLabel: "Keine neuen Fälle heute",
      color: "text-amber-700",
      headerBg: "bg-amber-100",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      dotColor: "bg-amber-500",
      cases: heute,
    },
    {
      key: "in-arbeit",
      label: "In Arbeit",
      emptyLabel: "Keine Fälle in Bearbeitung",
      color: "text-blue-700",
      headerBg: "bg-blue-100",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      dotColor: "bg-blue-500",
      cases: inArbeit,
    },
    {
      key: "abschluss",
      label: "Abschluss",
      emptyLabel: "Keine Abschlüsse diese Woche",
      color: "text-emerald-700",
      headerBg: "bg-emerald-100",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      dotColor: "bg-emerald-500",
      cases: abschluss,
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PulsView({
  cases,
  caseIdPrefix = "FS",
}: {
  cases: CaseRow[];
  caseIdPrefix?: string;
}) {
  const groups = groupCases(cases);

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key}>
          {/* Group header — always visible, shows count badge */}
          <div className={`flex items-center gap-2.5 mb-2.5 px-3 py-2 rounded-lg ${group.headerBg}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${group.dotColor}`} />
            <h2 className={`text-sm font-bold ${group.color}`}>
              {group.label}
            </h2>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${group.color} bg-white/60`}>
              {group.cases.length}
            </span>
          </div>

          {/* Empty state — confirms "all clear" */}
          {group.cases.length === 0 ? (
            <p className="text-xs text-gray-400 pl-3 pb-1">
              {group.emptyLabel}
            </p>
          ) : (
            /* Case cards */
            <div className="space-y-2">
              {group.cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/ops/cases/${c.id}`}
                  className={`block rounded-xl border ${group.borderColor} bg-white p-3.5 transition-all hover:shadow-md hover:border-gray-300`}
                >
                  {/* Row 1: Category + Reporter | Time + Case ID */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${URGENCY_DOT[c.urgency] ?? "bg-gray-300"}`} />
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {c.category}
                      </span>
                      {c.reporter_name && (
                        <span className="text-sm text-gray-500 truncate hidden sm:inline">
                          — {c.reporter_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {SOURCE_ICON[c.source]} {timeAgo(c.created_at)}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {formatCaseId(c.seq_number, caseIdPrefix)}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Description */}
                  {c.description && (
                    <p className="mt-1.5 text-sm text-gray-600 line-clamp-1">
                      {c.description}
                    </p>
                  )}

                  {/* Row 3: Location + Status + Assignee */}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-gray-500">
                      {c.plz} {c.city}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      c.status === "new" ? "bg-blue-100 text-blue-700" :
                      c.status === "contacted" ? "bg-sky-100 text-sky-700" :
                      c.status === "scheduled" ? "bg-violet-100 text-violet-700" :
                      c.status === "done" ? "bg-emerald-100 text-emerald-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                    {c.status === "done" && !c.review_sent_at && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                        R
                      </span>
                    )}
                    {c.assignee_text && (
                      <span className="font-medium text-gray-600">
                        → {c.assignee_text}
                      </span>
                    )}
                    {/* Mobile: show reporter inline */}
                    {c.reporter_name && (
                      <span className="text-gray-400 sm:hidden truncate">
                        {c.reporter_name}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
