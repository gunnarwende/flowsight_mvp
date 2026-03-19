"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCaseModal } from "./CreateCaseModal";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { SystemCard } from "./SystemCard";
import { TechnikerView } from "./TechnikerView";

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
  review_sent_at?: string | null;
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

const PAGE_SIZE = 15;

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

// Smart sort: active Notfälle > active Dringende > active Normale > Erledigte
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

  // ── Techniker view ──────────────────────────────────────────────────
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

  // ── Categories (dynamic from cases) ────────────────────────────────
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const c of cases) if (c.category) set.add(c.category);
    return Array.from(set).sort();
  }, [cases]);

  // ── Filtered + sorted cases ────────────────────────────────────────
  const filteredCases = useMemo(() => {
    let result = cases;

    // Node filter from SystemCard
    if (activeNode) {
      result = result.filter((c) => matchesNode(c, activeNode));
    }

    // Column filters
    if (statusFilter) {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (urgencyFilter) {
      result = result.filter((c) => c.urgency === urgencyFilter);
    }
    if (categoryFilter) {
      result = result.filter((c) => c.category === categoryFilter);
    }

    // Search
    if (searchQuery.trim()) {
      result = result.filter((c) => matchesSearch(c, searchQuery.trim()));
    }

    return smartSort(result);
  }, [cases, activeNode, statusFilter, urgencyFilter, categoryFilter, searchQuery]);

  // ── Pagination ───────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCases = filteredCases.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
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

  // ── Dropdown helper ─────────────────────────────────────────────────
  const selectClass =
    "text-[10px] font-semibold uppercase tracking-wide bg-transparent border-none focus:outline-none cursor-pointer text-gray-500 appearance-none pr-3";

  // ── Admin/Inhaber view ──────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* EINE Card — SystemCard Kreislauf */}
      <SystemCard
        cases={cases}
        avgRating={avgRating ?? null}
        weeklyDone={weekStats.erledigt}
        onNodeClick={handleNodeClick}
        activeNode={activeNode}
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
              <tr className="border-b border-gray-100">
                <th className="text-left px-3 py-2">
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
                    <option value="">Kat. ▾</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="text-left px-3 py-2">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Ort
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
                    Keine Fälle gefunden.
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
                    <td className="px-3 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {formatCaseId(c.seq_number, caseIdPrefix)}
                    </td>
                    <td className="px-3 py-2 text-gray-900 truncate max-w-[180px]">
                      {c.reporter_name || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-[140px]">
                      {c.category}
                    </td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">
                      {c.city || "—"}
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
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[c.status] ??
                          "bg-gray-100 text-gray-700"
                        }`}
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
              Keine Fälle gefunden.
            </div>
          )}
          {paginatedCases.map((c) => {
            const isNotfall = c.urgency === "notfall" && c.status !== "done";
            const isDone = c.status === "done";
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/ops/cases/${c.id}`)}
                className={`px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
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
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium truncate">
                  {c.category}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {c.reporter_name && (
                    <span className="truncate max-w-[120px]">
                      {c.reporter_name}
                    </span>
                  )}
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
