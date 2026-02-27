"use client";

import { useState } from "react";
import Link from "next/link";
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
}: {
  rows: CaseRow[];
  kpi: KpiData;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Fälle" value={kpi.total} color="text-gray-900" />
        <KpiCard label="Neu heute" value={kpi.todayNew} color="text-blue-600" />
        <KpiCard label="In Bearbeitung" value={kpi.inProgress} color="text-violet-600" />
        <KpiCard label="Erledigt (7d)" value={kpi.doneWeek} color="text-emerald-600" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm">
          {rows.length} {rows.length === 1 ? "Fall" : "Fälle"}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv(rows)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Exportieren
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition-colors"
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
          <div className="hidden lg:block overflow-x-auto bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
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
                    className="border-b border-gray-50 transition-colors hover:bg-gray-50 group"
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
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
