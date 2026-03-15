"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CreateCaseModal } from "./CreateCaseModal";
import { formatCaseId } from "@/src/lib/cases/formatCaseId";

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
  review_sent_at: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  new: "Neu eingegangen",
  contacted: "In Bearbeitung",
  scheduled: "Termin steht",
  done: "Erledigt",
  archived: "Abgeschlossen",
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

function exportCsv(rows: CaseRow[], prefix: string, tenantName?: string) {
  const headers = ["Fall-ID", "Kunde", "Adresse", "Kategorie", "Beschreibung", "Quelle", "Dringlichkeit", "Status", "Erstellt"];
  const lines = rows.map((r) => [
    formatCaseId(r.seq_number, prefix),
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
  // Identity Contract R4: use tenant name in filename, not "flowsight"
  const slug = (tenantName ?? "faelle").toLowerCase().replace(/[^a-z0-9]/g, "-");
  a.download = `${slug}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CaseListClient({
  rows,
  currentPage,
  totalPages,
  totalCount,
  searchQuery,
  caseIdPrefix = "FS",
  tenantShortName,
  basePath = "/ops/faelle",
}: {
  rows: CaseRow[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  caseIdPrefix?: string;
  tenantShortName?: string;
  /** Base path for navigation (search, pagination). Defaults to /ops/faelle */
  basePath?: string;
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
    router.push(`${basePath}?${p.toString()}`);
  }

  function goToPage(page: number) {
    const p = new URLSearchParams(params.toString());
    if (page > 1) p.set("page", String(page));
    else p.delete("page");
    router.push(`${basePath}?${p.toString()}`);
  }

  return (
    <>
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
                className="rounded-lg border border-gray-300 bg-white pl-8 pr-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 w-52 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400"
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
                  router.push(`${basePath}?${p.toString()}`);
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
            onClick={() => exportCsv(rows, caseIdPrefix, tenantShortName)}
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

      {/* Table view */}
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
                        className="text-slate-700 hover:text-slate-900 font-medium hover:underline"
                      >
                        {formatCaseId(c.seq_number, caseIdPrefix)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {c.reporter_name ?? <span className="text-gray-300">&mdash;</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {formatAddress(c)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[220px]">
                      <div className="truncate">
                        <span className="font-medium">{c.category}</span>
                        {c.description && (
                          <span className="text-gray-400"> — {truncate(c.description, 50)}</span>
                        )}
                      </div>
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
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                        {c.status === "done" && !c.review_sent_at && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200" title="Review m\u00f6glich">
                            R
                          </span>
                        )}
                        {c.status === "done" && c.review_sent_at && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-300" title="Review gesendet">
                            R&#10003;
                          </span>
                        )}
                      </div>
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
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-slate-700 font-medium text-sm">
                      {formatCaseId(c.seq_number, caseIdPrefix)}
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

