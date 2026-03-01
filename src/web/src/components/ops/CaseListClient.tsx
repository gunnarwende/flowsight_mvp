"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateCaseModal } from "./CreateCaseModal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CaseRow {
  id: string;
  seq_number: number | null;
  created_at: string;
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
}

export interface KpiData {
  total: number;
  todayNew: number;
  inProgress: number;
  doneWeek: number;
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

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-sky-100 text-sky-700",
  scheduled: "bg-violet-100 text-violet-700",
  done: "bg-emerald-100 text-emerald-700",
  archived: "bg-gray-100 text-gray-500",
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

const SOURCE_ICON: Record<string, string> = {
  voice: "\uD83D\uDCDE",   // phone
  wizard: "\uD83C\uDF10",  // globe
  manual: "\u2795",         // plus
};

const SOURCE_LABEL: Record<string, string> = {
  voice: "Anruf",
  wizard: "Website",
  manual: "Manuell",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCaseId(seq: number | null): string {
  if (seq === null) return "—";
  return `FS-${String(seq).padStart(4, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

function formatAddress(row: CaseRow): string {
  const parts = [row.street, row.house_number].filter(Boolean).join(" ");
  const location = [row.plz, row.city].filter(Boolean).join(" ");
  return parts ? `${parts}, ${location}` : location;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "..." : s;
}

function exportCsv(rows: CaseRow[]) {
  const headers = ["Fall-ID", "Kunde", "Adresse", "Kategorie", "Beschreibung", "Quelle", "Dringlichkeit", "Status", "Erstellt"];
  const lines = rows.map((r) => [
    formatCaseId(r.seq_number),
    r.reporter_name ?? "",
    formatAddress(r),
    r.category,
    `"${r.description.replace(/"/g, '""')}"`,
    SOURCE_LABEL[r.source] ?? r.source,
    URGENCY_LABEL[r.urgency] ?? r.urgency,
    STATUS_LABELS[r.status] ?? r.status,
    formatDate(r.created_at),
  ].join(";"));

  const csv = [headers.join(";"), ...lines].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flowsight-faelle-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseListClient({
  rows,
  kpi,
  currentPage,
  totalPages,
  totalCount,
  searchQuery,
}: {
  rows: CaseRow[];
  kpi: KpiData;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState(searchQuery);
  const router = useRouter();
  const params = useSearchParams();

  // Sync search input with URL when navigating back/forward
  useEffect(() => { setSearch(searchQuery); }, [searchQuery]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams(params.toString());
    if (search.trim()) p.set("q", search.trim());
    else p.delete("q");
    p.delete("page");
    router.push(`/ops/cases?${p.toString()}`);
  }

  function goToPage(page: number) {
    const p = new URLSearchParams(params.toString());
    if (page > 1) p.set("page", String(page));
    else p.delete("page");
    router.push(`/ops/cases?${p.toString()}`);
  }

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Fälle" value={kpi.total} color="text-slate-900" accent="border-l-slate-400" />
        <KpiCard label="Neu heute" value={kpi.todayNew} color="text-blue-700" accent="border-l-blue-500" />
        <KpiCard label="In Bearbeitung" value={kpi.inProgress} color="text-violet-700" accent="border-l-violet-500" />
        <KpiCard label="Erledigt (7d)" value={kpi.doneWeek} color="text-emerald-700" accent="border-l-emerald-500" />
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, Adresse, Kategorie…"
                className="rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 w-52 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            {search !== searchQuery && (
              <button type="submit" className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white hover:bg-slate-600 transition-colors">
                Suchen
              </button>
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  const p = new URLSearchParams(params.toString());
                  p.delete("q");
                  p.delete("page");
                  router.push(`/ops/cases?${p.toString()}`);
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                &times;
              </button>
            )}
          </form>
          <p className="text-slate-500 text-sm font-medium hidden sm:block">
            {totalCount} {totalCount === 1 ? "Fall" : "Fälle"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv(rows)}
            className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Exportieren
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-700 shadow-sm transition-colors"
          >
            + Neuer Fall
          </button>
        </div>
      </div>

      {/* Desktop table */}
      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          Keine Fälle gefunden.
        </p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden lg:block overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide border-b border-gray-200 bg-slate-50/80">
                  <th className="px-4 py-3 font-medium">Fall-ID</th>
                  <th className="px-4 py-3 font-medium">Kunde</th>
                  <th className="px-4 py-3 font-medium">Adresse</th>
                  <th className="px-4 py-3 font-medium">Problem</th>
                  <th className="px-4 py-3 font-medium">Quelle</th>
                  <th className="px-4 py-3 font-medium">Dringlichkeit</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Erstellt</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("a, button")) return;
                      router.push(`/ops/cases/${c.id}`);
                    }}
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50 cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/ops/cases/${c.id}`}
                        className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                      >
                        {formatCaseId(c.seq_number)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {c.reporter_name ?? <span className="text-gray-300">&mdash;</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {formatAddress(c)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                      <span className="font-medium">{c.category}</span>
                      {c.description && (
                        <span className="text-gray-400"> — {truncate(c.description, 40)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="mr-1">{SOURCE_ICON[c.source] ?? ""}</span>
                      {SOURCE_LABEL[c.source] ?? c.source}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${URGENCY_DOT[c.urgency] ?? "bg-gray-300"}`} />
                        <span className="text-gray-700">{URGENCY_LABEL[c.urgency] ?? c.urgency}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {STATUS_LABELS[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {rows.map((c) => (
              <Link
                key={c.id}
                href={`/ops/cases/${c.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-amber-600 font-medium text-sm">
                      {formatCaseId(c.seq_number)}
                    </span>
                    {c.reporter_name && (
                      <span className="text-gray-500 text-sm ml-2">{c.reporter_name}</span>
                    )}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </div>
                <p className="text-gray-900 text-sm font-medium mb-1">
                  {c.category} — {truncate(c.description, 60)}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${URGENCY_DOT[c.urgency] ?? "bg-gray-300"}`} />
                    {URGENCY_LABEL[c.urgency] ?? c.urgency}
                  </span>
                  <span>{SOURCE_ICON[c.source]} {SOURCE_LABEL[c.source] ?? c.source}</span>
                  <span>{formatDate(c.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4 py-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &larr; Zurück
          </button>
          <span className="text-xs text-gray-500">
            Seite {currentPage} von {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Weiter &rarr;
          </button>
        </div>
      )}

      <CreateCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  color,
  accent,
}: {
  label: string;
  value: number;
  color: string;
  accent: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 border-l-4 ${accent} rounded-xl px-4 py-3`}>
      <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
