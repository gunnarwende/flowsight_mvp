"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FlowBar } from "./FlowBar";
import type { FlowStep } from "./FlowBar";
import type { LeitzentraleCase } from "./LeitzentraleView";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";

// ---------------------------------------------------------------------------
// TechnikerView — "Meine Arbeit"
// FlowBar (klickbar) + vollständige Tabelle mit Spaltenüberschriften.
// ---------------------------------------------------------------------------

interface TechnikerViewProps {
  staffName: string;
  cases: LeitzentraleCase[];
  caseIdPrefix: string;
  avgRating: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  scheduled: "Geplant",
  in_arbeit: "In Arbeit",
  warten: "Warten",
  done: "Erledigt",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  scheduled: "bg-violet-100 text-violet-700",
  in_arbeit: "bg-indigo-100 text-indigo-700",
  warten: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};
const URGENCY_DOT: Record<string, string> = {
  notfall: "bg-red-500",
  dringend: "bg-amber-500",
  normal: "bg-gray-400",
};
const URGENCY_LABEL: Record<string, string> = {
  notfall: "Hoch",
  dringend: "Mittel",
  normal: "Normal",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 17) return "Guten Tag";
  return "Guten Abend";
}

function getTodayZurich(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(new Date());
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const todayStr = getTodayZurich();
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(d);
  if (dateStr === todayStr)
    return (
      "Heute " +
      d.toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      })
    );
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(yesterday);
  if (dateStr === yesterdayStr) return "Gestern";
  return d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

type TechFilter = "bei_mir" | "heute" | "erledigt" | "bewertung" | null;

function matchesTechFilter(c: LeitzentraleCase, f: TechFilter, todayStr: string): boolean {
  switch (f) {
    case "bei_mir":
      return c.status !== "done";
    case "heute":
      return (
        !!c.scheduled_at &&
        c.status !== "done" &&
        new Date(c.scheduled_at).toLocaleDateString("en-CA", {
          timeZone: "Europe/Zurich",
        }) === todayStr
      );
    case "erledigt":
      return c.status === "done";
    case "bewertung":
      return c.status === "done" && !c.review_sent_at;
    default:
      return true;
  }
}

export function TechnikerView({
  staffName,
  cases,
  caseIdPrefix,
  avgRating,
}: TechnikerViewProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<TechFilter>(null);
  const firstName = staffName.split(" ")[0];
  const todayStr = getTodayZurich();

  // Counts
  const beiMir = cases.filter((c) => c.status !== "done").length;
  const heute = cases.filter(
    (c) =>
      c.scheduled_at &&
      c.status !== "done" &&
      new Date(c.scheduled_at).toLocaleDateString("en-CA", {
        timeZone: "Europe/Zurich",
      }) === todayStr,
  ).length;
  const erledigt = cases.filter((c) => c.status === "done").length;
  const reviewCount = cases.filter(
    (c) => c.status === "done" && c.review_sent_at,
  ).length;

  // Next appointment
  const todayAppointments = cases
    .filter(
      (c) =>
        c.scheduled_at &&
        c.status !== "done" &&
        new Date(c.scheduled_at).toLocaleDateString("en-CA", {
          timeZone: "Europe/Zurich",
        }) === todayStr,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduled_at!).getTime() -
        new Date(b.scheduled_at!).getTime(),
    );
  const next = todayAppointments[0] ?? null;
  const nextAppt = next
    ? {
        time: new Date(next.scheduled_at!).toLocaleTimeString("de-CH", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Zurich",
        }),
        location: [next.street, next.house_number, next.plz, next.city]
          .filter(Boolean)
          .join(" "),
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([next.street, next.house_number, next.plz, next.city, "Schweiz"].filter(Boolean).join(" "))}`,
      }
    : null;

  // Steps
  const steps: FlowStep[] = [
    { key: "bei_mir", icon: "📋", count: beiMir, label: "Bei mir", accent: "blue" },
    { key: "heute", icon: "📅", count: heute, label: "Heute", accent: "indigo" },
    { key: "erledigt", icon: "✅", count: erledigt, label: "Erledigt", accent: "emerald" },
  ];

  // Filtered cases
  const displayCases = useMemo(() => {
    let result = cases.filter((c) =>
      matchesTechFilter(c, activeStep, todayStr),
    );
    // Sort: active notfall > dringend > normal > done
    return [...result].sort((a, b) => {
      const rank = (c: LeitzentraleCase) => {
        if (c.status === "done") return 4;
        if (c.urgency === "notfall") return 0;
        if (c.urgency === "dringend") return 1;
        return 2;
      };
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [cases, activeStep, todayStr]);

  return (
    <div className="space-y-3">
      {/* Flow Bar */}
      <FlowBar
        greeting={`${getGreeting()}, ${firstName}`}
        steps={steps}
        starRating={avgRating}
        starSub={`${reviewCount} Bew.`}
        activeStep={activeStep}
        onStepClick={(k) => setActiveStep(k as TechFilter)}
        nextAppointment={nextAppt}
      />

      {/* Case Table — with proper headers */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Meine Fälle ({displayCases.length})
          </h2>
          {activeStep && (
            <button
              onClick={() => setActiveStep(null)}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Nr
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Kategorie
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Kunde
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Adresse
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Priorität
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Status
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Datum
                </th>
              </tr>
            </thead>
            <tbody>
              {displayCases.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-gray-400 py-10 text-sm"
                  >
                    Keine Fälle gefunden.
                  </td>
                </tr>
              )}
              {displayCases.map((c) => {
                const isNotfall =
                  c.urgency === "notfall" && c.status !== "done";
                const isDone = c.status === "done";
                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/ops/cases/${c.id}`)}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isNotfall
                        ? "border-l-4 border-l-red-500 bg-red-50/30"
                        : isDone
                          ? "opacity-50"
                          : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {formatCaseId(c.seq_number, caseIdPrefix)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-900 font-medium truncate max-w-[140px]">
                      {c.category}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 truncate max-w-[140px]">
                      {c.reporter_name || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 truncate max-w-[180px]">
                      {c.street
                        ? `${c.street} ${c.house_number ?? ""}, ${c.plz} ${c.city}`
                        : c.city || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${URGENCY_DOT[c.urgency] ?? "bg-gray-400"}`}
                        />
                        <span className="text-xs text-gray-600">
                          {URGENCY_LABEL[c.urgency] ?? c.urgency}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[c.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-gray-50">
          {displayCases.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">
              Keine Fälle gefunden.
            </div>
          )}
          {displayCases.map((c) => {
            const isNotfall = c.urgency === "notfall" && c.status !== "done";
            const isDone = c.status === "done";
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/ops/cases/${c.id}`)}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isNotfall
                    ? "border-l-4 border-l-red-500 bg-red-50/30"
                    : isDone
                      ? "opacity-50"
                      : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-gray-400">
                    {formatCaseId(c.seq_number, caseIdPrefix)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${URGENCY_DOT[c.urgency] ?? "bg-gray-400"}`}
                      />
                      <span className="text-[10px] text-gray-500">
                        {URGENCY_LABEL[c.urgency]}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-900 font-medium truncate">
                  {c.category}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  {c.reporter_name && (
                    <span className="truncate max-w-[100px]">
                      {c.reporter_name}
                    </span>
                  )}
                  {c.reporter_name && (c.street || c.city) && (
                    <span className="text-gray-300">·</span>
                  )}
                  {c.street ? (
                    <span className="truncate">
                      {c.street} {c.house_number}, {c.city}
                    </span>
                  ) : c.city ? (
                    <span>{c.city}</span>
                  ) : null}
                  <span className="text-gray-300">·</span>
                  <span>{formatDate(c.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
