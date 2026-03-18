"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateCaseModal } from "./CreateCaseModal";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";
import { SystemflussBar } from "./SystemflussBar";
import { HandlungsbedarfZone } from "./HandlungsbedarfZone";
import { WirkungZone } from "./WirkungZone";
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
  /** Extended stats for v2 zones */
  reviewSent7d?: number;
  reviewSentTotal?: number;
  erledigt30d?: number;
  avgRating?: number | null;
  featuredReview?: string | null;
  /** Staff context for role-based rendering */
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
// Filter definitions for Systemfluss cards
// ---------------------------------------------------------------------------

type FilterKey = "eingang" | "bei_uns" | "wartet" | "heute" | "erledigt" | "bewertungen";

interface FlussCard {
  key: FilterKey;
  label: string;
  accentColor: string;
  ringColor: string;
}

const FLUSS_CARDS: FlussCard[] = [
  { key: "eingang", label: "Eingang", accentColor: "border-blue-500", ringColor: "ring-blue-500" },
  { key: "bei_uns", label: "Bei uns", accentColor: "border-indigo-500", ringColor: "ring-indigo-500" },
  { key: "wartet", label: "Wartet", accentColor: "border-amber-500", ringColor: "ring-amber-500" },
  { key: "heute", label: "Heute", accentColor: "border-violet-500", ringColor: "ring-violet-500" },
  { key: "erledigt", label: "Erledigt", accentColor: "border-emerald-500", ringColor: "ring-emerald-500" },
  { key: "bewertungen", label: "Bewertungen", accentColor: "border-amber-400", ringColor: "ring-amber-400" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTodayZurich(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
}

function isScheduledToday(scheduledAt: string | null | undefined): boolean {
  if (!scheduledAt) return false;
  const dateInZurich = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date(scheduledAt));
  return dateInZurich === getTodayZurich();
}

function matchesFilter(c: LeitzentraleCase, filter: FilterKey): boolean {
  switch (filter) {
    case "eingang":
      return c.status === "new";
    case "bei_uns":
      return c.status === "scheduled" || c.status === "in_arbeit";
    case "wartet":
      return c.status === "warten";
    case "heute":
      return isScheduledToday(c.scheduled_at);
    case "erledigt":
      return c.status === "done";
    case "bewertungen":
      return c.status === "done" && !c.review_sent_at;
  }
}

function matchesSearch(c: LeitzentraleCase, query: string): boolean {
  const q = query.toLowerCase();
  // Search across ALL visible fields — scalable, comprehensive
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
    // Labels (so users can search "dringend", "notfall", "erledigt", etc.)
    STATUS_LABELS[c.status],
    c.status,
    URGENCY_LABEL[c.urgency],
    c.urgency,
    // Case ID
    c.seq_number != null ? String(c.seq_number) : null,
    // Date (multiple formats: "14.03", "14.03.2026", "März")
    new Date(c.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Zurich" }),
    new Date(c.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" }),
    new Date(c.created_at).toLocaleDateString("de-CH", { day: "numeric", month: "long", timeZone: "Europe/Zurich" }),
  ];
  return fields.some(f => f && f.toLowerCase().includes(q));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const todayStr = getTodayZurich();
  const dateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(d);

  if (dateStr === todayStr) {
    return "Heute " + d.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
  }

  // Yesterday
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(yesterday);
  if (dateStr === yesterdayStr) {
    return "Gestern";
  }

  return d.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeitzentraleView({ cases, caseIdPrefix, weekStats, reviewStats, reviewSent7d, reviewSentTotal, erledigt30d, avgRating, featuredReview, staffName, staffRole }: LeitzentraleProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Card counts ──────────────────────────────────────────────────────
  const cardCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      eingang: 0,
      bei_uns: 0,
      wartet: 0,
      heute: 0,
      erledigt: 0,
      bewertungen: 0,
    };
    for (const c of cases) {
      if (c.status === "new") counts.eingang++;
      if (c.status === "scheduled" || c.status === "in_arbeit") counts.bei_uns++;
      if (c.status === "warten") counts.wartet++;
      if (isScheduledToday(c.scheduled_at)) counts.heute++;
      if (c.status === "done") counts.erledigt++;
      if (c.status === "done" && !c.review_sent_at) counts.bewertungen++;
    }
    return counts;
  }, [cases]);

  // ── Filtered + searched cases ────────────────────────────────────────
  const filteredCases = useMemo(() => {
    let result = cases;

    // Apply card filter
    if (activeFilter) {
      result = result.filter((c) => matchesFilter(c, activeFilter));
    }

    // Apply search
    if (searchQuery.trim()) {
      result = result.filter((c) => matchesSearch(c, searchQuery.trim()));
    }

    // Sort: Notfälle to top, then by created_at desc
    const urgencyRank: Record<string, number> = { notfall: 0, dringend: 1, normal: 2 };
    result = [...result].sort((a, b) => {
      const ra = urgencyRank[a.urgency] ?? 9;
      const rb = urgencyRank[b.urgency] ?? 9;
      if (ra !== rb) return ra - rb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [cases, activeFilter, searchQuery]);

  // ── Pagination ───────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCases = filteredCases.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when filter/search changes
  const handleFilterClick = (key: FilterKey) => {
    setActiveFilter((prev) => (prev === key ? null : key));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // ── Source counts ─────────────────────────────────────────────────────
  const sourceCounts = useMemo(() => {
    const counts = { voice: 0, wizard: 0, manual: 0 };
    for (const c of cases) {
      if (c.source === "voice") counts.voice++;
      else if (c.source === "wizard" || c.source === "website") counts.wizard++;
      else counts.manual++;
    }
    return counts;
  }, [cases]);

  // ── Techniker view ──────────────────────────────────────────────────
  if (staffRole === "techniker" && staffName) {
    return (
      <TechnikerView
        staffName={staffName}
        cases={cases}
        caseIdPrefix={caseIdPrefix}
        allCasesCount={{
          eingang: cardCounts.eingang,
          beiUns: cardCounts.bei_uns + cardCounts.wartet,
          erledigt: cardCounts.erledigt,
        }}
        sources={sourceCounts}
        reviewAvg={avgRating ?? null}
        reviewStats={{
          sent7d: reviewSent7d ?? 0,
          sent30d: reviewStats.sent,
          sentTotal: reviewSentTotal ?? reviewStats.sent,
          erledigt30d: erledigt30d ?? weekStats.erledigt,
        }}
      />
    );
  }

  // ── Admin/Inhaber view ──────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* ═══════════════════════════════════════════════════════════════
          SYSTEMFLUSS — Verbundener Flow: Eingang → Bei uns → Erledigt → ★
         ═══════════════════════════════════════════════════════════════ */}
      <SystemflussBar
        eingang={cardCounts.eingang}
        beiUns={cardCounts.bei_uns + cardCounts.wartet}
        erledigt={cardCounts.erledigt}
        reviewAvg={avgRating ?? null}
        sources={sourceCounts}
      />

      {/* ═══════════════════════════════════════════════════════════════
          HANDLUNGSBEDARF — Was braucht Aufmerksamkeit?
         ═══════════════════════════════════════════════════════════════ */}
      <HandlungsbedarfZone cases={cases} caseIdPrefix={caseIdPrefix} />

      {/* ═══════════════════════════════════════════════════════════════
          WIRKUNG — Gold-Zone: Bewertungen, Fortschritt, Stolz
         ═══════════════════════════════════════════════════════════════ */}
      <WirkungZone
        reviewStats={{
          sent7d: reviewSent7d ?? 0,
          sent30d: reviewStats.sent,
          sentTotal: reviewSentTotal ?? reviewStats.sent,
          erledigt30d: erledigt30d ?? weekStats.erledigt,
        }}
        avgRating={avgRating ?? null}
        featuredReview={featuredReview}
      />

      {/* ═══════════════════════════════════════════════════════════════
          SEARCH + NEW CASE
         ═══════════════════════════════════════════════════════════════ */}
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
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex-shrink-0 whitespace-nowrap"
        >
          + Neuer Fall
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CASE TABLE
         ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Nr
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Kunde
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Kat.
                </th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                  Ort
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
              {paginatedCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-12 text-sm">
                    Keine Fälle gefunden.
                  </td>
                </tr>
              )}
              {paginatedCases.map((c) => {
                const isNotfall = c.urgency === "notfall";
                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/ops/cases/${c.id}`)}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isNotfall ? "border-l-4 border-l-red-500 bg-red-50/30" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {formatCaseId(c.seq_number, caseIdPrefix)}
                    </td>
                    <td className="px-3 py-2 text-gray-900 truncate max-w-[180px]">
                      {c.reporter_name || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-gray-700 truncate max-w-[140px]">{c.category}</td>
                    <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">{c.city || "—"}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${URGENCY_DOT[c.urgency] ?? "bg-gray-400"}`} />
                        <span className="text-xs text-gray-600">
                          {URGENCY_LABEL[c.urgency] ?? c.urgency}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"
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
            const isNotfall = c.urgency === "notfall";
            return (
              <div
                key={c.id}
                onClick={() => router.push(`/ops/cases/${c.id}`)}
                className={`px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isNotfall ? "border-l-4 border-l-red-500 bg-red-50/30" : ""
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
                <p className="text-sm text-gray-900 font-medium truncate">{c.category}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {c.reporter_name && <span className="truncate max-w-[120px]">{c.reporter_name}</span>}
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

      {/* ═══════════════════════════════════════════════════════════════
          PAGINATION
         ═══════════════════════════════════════════════════════════════ */}
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
