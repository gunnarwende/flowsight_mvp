"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCaseModal } from "./CreateCaseModal";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { FlowBar } from "./FlowBar";
import type { FlowStep, PeriodValue } from "./FlowBar";
import { TechnikerView } from "./TechnikerView";
import { getGreeting } from "@/src/lib/ui/getGreeting";
import {
  STATUS_LABELS,
  URGENCY_DOT,
  URGENCY_LABEL,
  getStatusColorClass,
} from "@/src/lib/cases/statusColors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeitzentraleCase {
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
  street?: string | null;
  house_number?: string | null;
  source: string;
  assignee_text?: string | null;
  reporter_name?: string | null;
  reporter_phone?: string | null;
  review_sent_at?: string | null;
  review_rating?: number | null;
  scheduled_at?: string | null;
}

export interface LeitzentraleProps {
  cases: LeitzentraleCase[];
  caseIdPrefix: string;
  weekStats: { neue: number; erledigt: number };
  reviewStats: { sent: number; pending: number };
  reviewSent7d?: number;
  reviewSentTotal?: number;
  erledigt30d?: number;
  avgRating?: number | null;
  featuredReview?: string | null;
  staffName?: string | null;
  staffRole?: "admin" | "techniker";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE_DESKTOP = 15;
const PAGE_SIZE_MOBILE = 8;

// ---------------------------------------------------------------------------
// SVG Icons (inline, no extra deps)
// ---------------------------------------------------------------------------

const WrenchIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
);

const CheckIcon = (
  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const PhoneIcon = (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
);

const GlobeIcon = (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const PencilIcon = (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
  </svg>
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayZurich(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(new Date());
}

function matchesNode(c: LeitzentraleCase, node: string): boolean {
  switch (node) {
    case "eingang":
      return c.status === "new";
    case "bei_uns":
      return (
        c.status === "scheduled" ||
        c.status === "in_arbeit" ||
        c.status === "warten"
      );
    case "erledigt":
      return c.status === "done";
    case "bewertung":
      return c.status === "done" && !c.review_sent_at;
    default:
      return true;
  }
}

function matchesSearch(c: LeitzentraleCase, query: string): boolean {
  const q = query.toLowerCase();
  const fields = [
    c.reporter_name,
    c.city,
    c.plz,
    c.street,
    c.house_number,
    c.category,
    c.description,
    c.assignee_text,
    c.source,
    STATUS_LABELS[c.status],
    c.status,
    URGENCY_LABEL[c.urgency],
    c.urgency,
    c.seq_number != null ? String(c.seq_number) : null,
    new Date(c.created_at).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Zurich",
    }),
  ];
  return fields.some((f) => f && f.toLowerCase().includes(q));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const todayStr = getTodayZurich();
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(d);

  if (dateStr === todayStr) {
    return (
      "Heute " +
      d.toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Zurich",
      })
    );
  }

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

function smartSort(cases: LeitzentraleCase[]): LeitzentraleCase[] {
  return [...cases].sort((a, b) => {
    const rank = (c: LeitzentraleCase): number => {
      if (c.status === "done") return 4;
      if (c.urgency === "notfall") return 0;
      if (c.urgency === "dringend") return 1;
      return 2;
    };
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  return phone.slice(0, -3) + "...";
}

function computeCutoff(period: PeriodValue): number {
  if (period === "ytd") {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1).getTime();
  }
  return Date.now() - (period === "7d" ? 7 : 30) * 86400000;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeitzentraleView({
  cases,
  caseIdPrefix,
  weekStats,
  avgRating,
  staffName,
  staffRole,
}: LeitzentraleProps) {
  const router = useRouter();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState<PeriodValue>("7d");
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DESKTOP);

  useEffect(() => {
    const update = () => setPageSize(window.innerWidth < 768 ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── ALL hooks MUST be above early returns (React rules of hooks) ────
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of cases) if (c.category) set.add(c.category);
    return Array.from(set).sort();
  }, [cases]);

  const cutoff = useMemo(() => computeCutoff(period), [period]);

  // Period-filter FIRST, then other filters (FB5: period filtert auch Tabelle)
  const filteredCases = useMemo(() => {
    let result = cases.filter((c) => new Date(c.created_at).getTime() >= cutoff);

    if (activeNode) {
      result = result.filter((c) => matchesNode(c, activeNode));
    }
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (urgencyFilter) {
      result = result.filter((c) => c.urgency === urgencyFilter);
    }
    if (categoryFilter) {
      result = result.filter((c) => c.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      result = result.filter((c) => matchesSearch(c, searchQuery.trim()));
    }

    return smartSort(result);
  }, [cases, cutoff, activeNode, statusFilter, urgencyFilter, categoryFilter, searchQuery]);

  // ── Flow step data (MUST be above early return — hooks rule) ────────
  const flowStats = useMemo(() => {
    let eingang = 0, beiUns = 0, erledigt = 0, notfaelle = 0;
    let voice = 0, web = 0, manual = 0;
    let reviewSent = 0, reviewReceived = 0;
    for (const c of cases) {
      const ct = new Date(c.created_at).getTime();
      const ut = new Date(c.updated_at).getTime();
      if (c.status === "new" && ct >= cutoff) {
        eingang++;
        if (c.source === "voice") voice++;
        else if (c.source === "wizard" || c.source === "website") web++;
        else manual++;
      }
      if (c.status === "scheduled" || c.status === "in_arbeit" || c.status === "warten") {
        beiUns++;
        if (c.urgency === "notfall") notfaelle++;
      }
      if (c.status === "done" && ut >= cutoff) erledigt++;
      if (c.status === "done") {
        if (c.review_sent_at) reviewSent++;
        if (c.review_rating != null) reviewReceived++;
      }
    }
    return { eingang, beiUns, erledigt, notfaelle, voice, web, manual, reviewSent, reviewReceived };
  }, [cases, cutoff]);

  // ── Techniker view (after ALL hooks) ──────────────────────────────
  if (staffRole === "techniker" && staffName) {
    return (
      <TechnikerView
        staffName={staffName}
        cases={cases}
        caseIdPrefix={caseIdPrefix}
        avgRating={avgRating ?? null}
      />
    );
  }

  // ── Admin-only derived state (no hooks below) ─────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCases = filteredCases.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function handleNodeClick(node: string | null) {
    setActiveNode(node);
    setCurrentPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function resetFilters() {
    setActiveNode(null);
    setStatusFilter("");
    setUrgencyFilter("");
    setCategoryFilter("");
    setSearchQuery("");
    setCurrentPage(1);
  }

  const hasFilters =
    !!activeNode ||
    !!statusFilter ||
    !!urgencyFilter ||
    !!categoryFilter ||
    !!searchQuery;

  const selectClass =
    "text-[10px] font-semibold uppercase tracking-wide bg-transparent border-none focus:outline-none cursor-pointer text-gray-500 appearance-none pr-3";

  const greetingText = `${getGreeting()}, ${staffName?.split(" ")[0] ?? "Admin"}`;

  const adminSteps: FlowStep[] = [
    {
      key: "eingang",
      icon: null,
      count: flowStats.eingang,
      label: "Neu",
      accent: "blue",
      sourceBreakdown: [
        { icon: PhoneIcon, label: "Tel", count: flowStats.voice },
        { icon: GlobeIcon, label: "Web", count: flowStats.web },
        { icon: PencilIcon, label: "Stift", count: flowStats.manual },
      ],
    },
    {
      key: "bei_uns",
      icon: WrenchIcon,
      count: flowStats.beiUns,
      label: "Bei uns",
      accent: "orange",
      badge: flowStats.notfaelle > 0 ? flowStats.notfaelle : undefined,
      onBadgeClick: () => {
        setUrgencyFilter("notfall");
        setActiveNode("bei_uns");
        setCurrentPage(1);
      },
    },
    {
      key: "erledigt",
      icon: CheckIcon,
      count: flowStats.erledigt,
      label: "Erledigt",
      accent: "emerald",
    },
  ];

  // ── Admin/Inhaber view ──────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Flow Bar */}
      <FlowBar
        steps={adminSteps}
        starRating={avgRating ?? null}
        starSub={`${flowStats.reviewReceived} erhalten / ${flowStats.reviewSent} angefragt`}
        activeStep={activeNode}
        onStepClick={handleNodeClick}
        greeting={greetingText}
        periodToggle={{ value: period, onChange: (v) => { setPeriod(v); setCurrentPage(1); } }}
      />

      {/* Search + New Case */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Suche nach Kunde, Ort, Datum, Status..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          />
        </div>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            Filter zurücksetzen
          </button>
        )}
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
        >
          + Neuer Fall
        </button>
      </div>

      {/* Case Table v2 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-3 py-2 sticky left-0 z-10 bg-gray-50/50">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Nr
                  </span>
                </th>
                <th className="text-left px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Kunde
                  </span>
                </th>
                <th className="text-left px-3 py-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={selectClass}
                    title="Kategorie filtern"
                  >
                    <option value="">Kategorie ▾</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="text-left px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Adresse
                  </span>
                </th>
                <th className="text-left px-3 py-2">
                  <select
                    value={urgencyFilter}
                    onChange={(e) => {
                      setUrgencyFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={selectClass}
                    title="Priorität filtern"
                  >
                    <option value="">Priorität ▾</option>
                    <option value="notfall">Hoch</option>
                    <option value="dringend">Mittel</option>
                    <option value="normal">Normal</option>
                  </select>
                </th>
                <th className="text-left px-3 py-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={selectClass}
                    title="Status filtern"
                  >
                    <option value="">Status ▾</option>
                    <option value="new">Neu</option>
                    <option value="scheduled">Geplant</option>
                    <option value="in_arbeit">In Arbeit</option>
                    <option value="warten">Warten</option>
                    <option value="done">Erledigt</option>
                  </select>
                </th>
                <th className="text-left px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Datum
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedCases.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center text-gray-400 py-12 text-sm"
                  >
                    Keine Fälle gefunden.{" "}
                    {hasFilters && (
                      <button onClick={resetFilters} className="text-blue-500 hover:underline">
                        Filter zurücksetzen
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {paginatedCases.map((c) => {
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
                          ? "opacity-60"
                          : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-gray-500 whitespace-nowrap sticky left-0 z-10 bg-white">
                      {formatCaseId(c.seq_number, caseIdPrefix)}
                    </td>
                    <td className="px-3 py-2 text-gray-900 truncate max-w-[180px]">
                      {c.reporter_name || (
                        c.reporter_phone ? (
                          <span className="text-gray-400">{maskPhone(c.reporter_phone)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-[140px]">
                      {c.category}
                    </td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[200px]">
                      {c.street
                        ? `${c.street} ${c.house_number ?? ""}, ${c.plz} ${c.city}`
                        : c.city || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${URGENCY_DOT[c.urgency] ?? "bg-gray-400"}`}
                        />
                        <span className="text-xs text-gray-600">
                          {URGENCY_LABEL[c.urgency] ?? c.urgency}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColorClass(c.status, c.review_sent_at, c.review_rating)}`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
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
          {paginatedCases.length === 0 && (
            <div className="text-center text-gray-400 py-12 text-sm">
              Keine Fälle gefunden.{" "}
              {hasFilters && (
                <button onClick={resetFilters} className="text-blue-500 hover:underline">
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
          {paginatedCases.map((c) => {
            const isNotfall = c.urgency === "notfall" && c.status !== "done";
            const isDone = c.status === "done";
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/ops/cases/${c.id}`)}
                className={`px-4 py-3.5 min-h-[48px] hover:bg-gray-50 cursor-pointer transition-colors ${
                  isNotfall
                    ? "border-l-4 border-l-red-500 bg-red-50/30"
                    : isDone
                      ? "opacity-60"
                      : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs text-gray-400">
                    {formatCaseId(c.seq_number, caseIdPrefix)}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColorClass(c.status, c.review_sent_at, c.review_rating)}`}
                  >
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium truncate">
                  {c.category}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {c.reporter_name ? (
                    <span className="truncate max-w-[120px]">{c.reporter_name}</span>
                  ) : c.reporter_phone ? (
                    <span className="truncate max-w-[120px] text-gray-400">{maskPhone(c.reporter_phone)}</span>
                  ) : null}
                  {c.city && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span>{c.city}</span>
                    </>
                  )}
                  <span className="text-gray-300">·</span>
                  <span>{formatDate(c.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &lt;
          </button>
          <span className="text-sm text-gray-500">
            Seite {safePage} von {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &gt;
          </button>
        </div>
      )}

      <CreateCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
