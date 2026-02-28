import Link from "next/link";
import { getServiceClient } from "@/src/lib/supabase/server";
import { CaseListClient } from "@/src/components/ops/CaseListClient";
import type { CaseRow, KpiData } from "@/src/components/ops/CaseListClient";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "", label: "Alle Status" },
  { value: "new", label: "Neu" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "scheduled", label: "Geplant" },
  { value: "done", label: "Erledigt" },
  { value: "archived", label: "Archiviert" },
];

const URGENCY_OPTIONS = [
  { value: "", label: "Alle Dringlichkeiten" },
  { value: "notfall", label: "Notfall" },
  { value: "dringend", label: "Dringend" },
  { value: "normal", label: "Normal" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "Alle Quellen" },
  { value: "voice", label: "Anruf" },
  { value: "wizard", label: "Website" },
  { value: "manual", label: "Manuell" },
];

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
  const filterStatus = params.status ?? "";
  const filterUrgency = params.urgency ?? "";
  const filterSource = params.source ?? "";
  const filterCategory = params.category;
  const filterAssigned = params.assigned;
  const filterTenantSlug = params.tenant;
  const showAll = params.show === "all";

  const supabase = getServiceClient();

  // Resolve tenant slug → tenant_id + name for filtered view
  let filterTenantId: string | undefined;
  let filterTenantName: string | undefined;
  if (filterTenantSlug) {
    const { data: t } = await supabase
      .from("tenants")
      .select("id, name")
      .eq("slug", filterTenantSlug)
      .single();
    if (t) {
      filterTenantId = t.id;
      filterTenantName = t.name;
    }
  }

  // Stats query (lightweight, all cases, for KPI tiles)
  let statsQuery = supabase
    .from("cases")
    .select("id, status, created_at, updated_at")
    .limit(1000);
  if (filterTenantId) statsQuery = statsQuery.eq("tenant_id", filterTenantId);

  // Filtered list query
  let listQuery = supabase
    .from("cases")
    .select(
      "id, seq_number, created_at, status, urgency, category, description, city, plz, street, house_number, source, assignee_text, reporter_name"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (filterTenantId) listQuery = listQuery.eq("tenant_id", filterTenantId);

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

  // Build filter URL helper
  function filterHref(key: string, value: string): string {
    const p = new URLSearchParams();
    if (filterTenantSlug) p.set("tenant", filterTenantSlug);
    if (key === "status" && value) p.set("status", value);
    else if (filterStatus) p.set("status", filterStatus);
    if (key === "urgency" && value) p.set("urgency", value);
    else if (filterUrgency) p.set("urgency", filterUrgency);
    if (key === "source" && value) p.set("source", value);
    else if (filterSource) p.set("source", filterSource);
    if (key === "show" && value) p.set("show", value);
    else if (showAll && key !== "show") p.set("show", "all");
    const qs = p.toString();
    return `/ops/cases${qs ? `?${qs}` : ""}`;
  }

  const hasActiveFilters = !!(filterStatus || filterUrgency || filterSource);

  return (
    <>
      {/* Page header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fälle</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filterTenantName
              ? `Tenant: ${filterTenantName}`
              : "Übersicht aller eingehenden Aufträge"}
          </p>
        </div>
      </div>

      {/* Filters row — dropdowns */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <Link
              href={filterTenantSlug ? `/ops/cases?tenant=${filterTenantSlug}` : "/ops/cases"}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                !showAll && !filterStatus
                  ? "bg-slate-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Offen
            </Link>
            <Link
              href={filterTenantSlug ? `/ops/cases?tenant=${filterTenantSlug}&show=all` : "/ops/cases?show=all"}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                showAll && !filterStatus
                  ? "bg-slate-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Alle
            </Link>
          </div>

          <span className="border-l border-gray-200 h-6 inline-block" />

          {/* Status dropdown */}
          <FilterSelect
            options={STATUS_OPTIONS}
            value={filterStatus}
            paramKey="status"
            filterHref={filterHref}
          />

          {/* Urgency dropdown */}
          <FilterSelect
            options={URGENCY_OPTIONS}
            value={filterUrgency}
            paramKey="urgency"
            filterHref={filterHref}
          />

          {/* Source dropdown */}
          <FilterSelect
            options={SOURCE_OPTIONS}
            value={filterSource}
            paramKey="source"
            filterHref={filterHref}
          />

          {/* Reset */}
          {hasActiveFilters && (
            <Link
              href={filterTenantSlug ? `/ops/cases?tenant=${filterTenantSlug}` : "/ops/cases"}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
            >
              Filter zurücksetzen
            </Link>
          )}
        </div>
      </div>

      <CaseListClient rows={rows} kpi={kpi} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Filter dropdown (renders as styled links to preserve SSR)
// ---------------------------------------------------------------------------

function FilterSelect({
  options,
  value,
  paramKey,
  filterHref,
}: {
  options: { value: string; label: string }[];
  value: string;
  paramKey: string;
  filterHref: (key: string, value: string) => string;
}) {
  const current = options.find((o) => o.value === value);
  const isActive = !!value;

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          isActive
            ? "border-slate-600 bg-slate-700 text-white"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        {current?.label ?? options[0].label}
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div className="absolute top-full left-0 mt-1 z-20 hidden group-hover:block group-focus-within:block">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
          {options.map((opt) => (
            <Link
              key={opt.value}
              href={filterHref(paramKey, opt.value)}
              className={`block px-3 py-1.5 text-xs transition-colors ${
                opt.value === value
                  ? "bg-slate-50 text-slate-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
