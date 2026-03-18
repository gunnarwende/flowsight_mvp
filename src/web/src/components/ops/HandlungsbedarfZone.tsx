"use client";

import Link from "next/link";
import type { LeitzentraleCase } from "./LeitzentraleView";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";

// ---------------------------------------------------------------------------
// Handlungsbedarf — Shows what needs attention NOW.
// Intelligent priority: Notfall → Überfällig → Wartet >48h → Neu heute
// Collapses to "Alles im Griff" when empty.
// ---------------------------------------------------------------------------

interface HandlungsbedarfProps {
  cases: LeitzentraleCase[];
  caseIdPrefix: string;
  maxItems?: number;
}

interface ActionItem {
  case_: LeitzentraleCase;
  severity: "notfall" | "ueberfaellig" | "wartet" | "neu";
  label: string;
  color: string;
  bgColor: string;
}

function getActionItems(cases: LeitzentraleCase[]): ActionItem[] {
  const now = Date.now();
  const h48 = 48 * 60 * 60 * 1000;
  const items: ActionItem[] = [];

  for (const c of cases) {
    // Notfall — active emergencies
    if (c.urgency === "notfall" && c.status !== "done") {
      items.push({
        case_: c,
        severity: "notfall",
        label: "Notfall",
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200",
      });
      continue;
    }

    // Überfällig — scheduled appointment in the past, not done
    if (c.scheduled_at && new Date(c.scheduled_at).getTime() < now && c.status !== "done") {
      items.push({
        case_: c,
        severity: "ueberfaellig",
        label: "Überfällig",
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-200",
      });
      continue;
    }

    // Wartet >48h — contacted but no appointment, sitting for 2+ days
    if (
      c.status !== "done" && c.status !== "new" &&
      !c.scheduled_at &&
      (now - new Date(c.updated_at).getTime()) > h48
    ) {
      items.push({
        case_: c,
        severity: "wartet",
        label: `Wartet seit ${Math.floor((now - new Date(c.updated_at).getTime()) / (24 * 60 * 60 * 1000))} Tagen`,
        color: "text-amber-600",
        bgColor: "bg-amber-50/50 border-amber-100",
      });
      continue;
    }

    // Neu heute
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (c.status === "new" && new Date(c.created_at).getTime() >= todayStart.getTime()) {
      items.push({
        case_: c,
        severity: "neu",
        label: "Neu heute",
        color: "text-blue-600",
        bgColor: "bg-blue-50/50 border-blue-100",
      });
    }
  }

  // Sort: notfall → ueberfaellig → wartet → neu
  const order = { notfall: 0, ueberfaellig: 1, wartet: 2, neu: 3 };
  items.sort((a, b) => order[a.severity] - order[b.severity]);

  return items;
}

export function HandlungsbedarfZone({ cases, caseIdPrefix, maxItems = 3 }: HandlungsbedarfProps) {
  const items = getActionItems(cases);
  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;

  // "Alles im Griff" state
  if (items.length === 0) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Alles im Griff</p>
          <p className="text-xs text-emerald-600">Keine offenen Punkte. Ihr Betrieb läuft.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Handlungsbedarf</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {visible.map((item) => (
          <Link
            key={item.case_.id}
            href={`/ops/cases/${item.case_.id}`}
            className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors min-h-[52px] border-l-4 ${item.bgColor}`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${item.color}`}>{item.label}</span>
                <span className="text-xs text-gray-400">{formatCaseId(item.case_.seq_number, caseIdPrefix)}</span>
              </div>
              <p className="text-sm text-gray-900 font-medium truncate">
                {item.case_.category} — {item.case_.reporter_name ?? item.case_.city}
              </p>
              {item.case_.street && (
                <p className="text-xs text-gray-500 truncate">
                  {item.case_.street} {item.case_.house_number}, {item.case_.plz} {item.case_.city}
                </p>
              )}
            </div>
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
      {remaining > 0 && (
        <div className="px-5 py-2 border-t border-gray-100 text-center">
          <span className="text-xs text-gray-400">+ {remaining} weitere</span>
        </div>
      )}
    </div>
  );
}
