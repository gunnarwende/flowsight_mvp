import Link from "next/link";
import { getServiceClient } from "@/src/lib/supabase/server";
import { CaseListClient } from "@/src/components/ops/CaseListClient";
import type { CaseRow, KpiData } from "@/src/components/ops/CaseListClient";

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

// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------

export default async function OpsCasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  // Filters from URL
  const filterStatus = params.status;
  const filterUrgency = params.urgency;
  const filterCategory = params.category;
  const filterSource = params.source;
  const filterAssigned = params.assigned;
  const showAll = params.show === "all";

  const supabase = getServiceClient();

  // Stats query (lightweight, all cases, for KPI tiles)
  const statsQuery = supabase
    .from("cases")
    .select("id, status, created_at, updated_at")
    .limit(1000);

  // Filtered list query (new columns: seq_number, reporter_name, description, street, house_number)
  let listQuery = supabase
    .from("cases")
    .select(
      "id, seq_number, created_at, status, urgency, category, description, city, plz, street, house_number, source, assignee_text, reporter_name"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  // Default: open cases (exclude done + archived), unless showAll or explicit status filter
  if (filterStatus) {
    listQuery = listQuery.eq("status", filterStatus);
  } else if (!showAll) {
    listQuery = listQuery.not("status", "in", "(done,archived)");
  } else {
    listQuery = listQuery.neq("status", "archived");
  }

  if (filterUrgency) listQuery = listQuery.eq("urgency", filterUrgency);
  if (filterCategory) listQuery = listQuery.ilike("category", filterCategory);
  if (filterSource) listQuery = listQuery.eq("source", filterSource);
  if (filterAssigned === "yes") listQuery = listQuery.not("assignee_text", "is", null);

  const [{ data: allCases }, { data: cases, error }] = await Promise.all([
    statsQuery,
    listQuery,
  ]);

  // KPI calculations
  const todayZurich = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(new Date());
  const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

  const kpi: KpiData = {
    total: allCases?.filter((c) => c.status !== "archived").length ?? 0,
    todayNew: allCases?.filter((c) => {
      if (c.status === "archived") return false;
      const cDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Zurich",
      }).format(new Date(c.created_at));
      return cDate === todayZurich;
    }).length ?? 0,
    inProgress: allCases?.filter((c) =>
      c.status === "contacted" || c.status === "scheduled"
    ).length ?? 0,
    doneWeek: allCases?.filter(
      (c) => c.status === "done" && new Date(c.updated_at) >= sevenDaysAgo
    ).length ?? 0,
  };

  if (error) {
    return (
      <p className="text-red-600">Fehler beim Laden: {error.message}</p>
    );
  }

  const rows = (cases ?? []) as CaseRow[];

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Fälle</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Übersicht aller eingehenden Aufträge
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FilterChip
          label="Offen"
          active={!filterStatus && !showAll}
          href="/ops/cases"
        />
        <FilterChip
          label="Alle"
          active={showAll && !filterStatus}
          href="/ops/cases?show=all"
        />
        <Divider />
        {(["new", "contacted", "scheduled", "done", "archived"] as const).map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            active={filterStatus === s}
            href={`/ops/cases?status=${s}`}
          />
        ))}
        <Divider />
        {(["notfall", "dringend", "normal"] as const).map((u) => (
          <FilterChip
            key={u}
            label={u.charAt(0).toUpperCase() + u.slice(1)}
            active={filterUrgency === u}
            href={`/ops/cases?urgency=${u}`}
          />
        ))}
        <Divider />
        {(["wizard", "voice", "manual"] as const).map((src) => (
          <FilterChip
            key={src}
            label={src === "wizard" ? "Website" : src === "voice" ? "Anruf" : "Manuell"}
            active={filterSource === src}
            href={`/ops/cases?source=${src}`}
          />
        ))}
        <FilterChip
          label="Zugewiesen"
          active={filterAssigned === "yes"}
          href="/ops/cases?assigned=yes"
        />
      </div>

      <CaseListClient rows={rows} kpi={kpi} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-amber-500 text-white"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

function Divider() {
  return <span className="border-l border-gray-200 mx-1 h-5 inline-block" />;
}
