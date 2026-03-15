import Link from "next/link";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { CaseListClient } from "@/src/components/ops/CaseListClient";
import type { CaseRow } from "@/src/components/ops/CaseListClient";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: "", label: "Alle Status" },
  { value: "new", label: "Neu eingegangen" },
  { value: "contacted", label: "In Bearbeitung" },
  { value: "scheduled", label: "Termin steht" },
  { value: "done", label: "Erledigt" },
  { value: "archived", label: "Abgeschlossen" },
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
// Page (Server Component) — "Fälle" (Suche, Filter, Export, Tabelle)
// ---------------------------------------------------------------------------

export default async function FaellePage({
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
  const filterQuery = params.q ?? "";
  const showDemo = params.tab === "demo";
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const PAGE_SIZE = 15;

  const supabase = getServiceClient();

  // ── Tenant scope ──────────────────────────────────────────────────
  const scope = await resolveTenantScope();
  let filterTenantId: string | undefined;

  if (scope && !scope.isAdmin && scope.tenantId) {
    filterTenantId = scope.tenantId;
  } else if (filterTenantSlug) {
    const { data: t } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", filterTenantSlug)
      .single();
    if (t) filterTenantId = t.id;
  }

  // Filtered list query
  let listQuery = supabase
    .from("cases")
    .select(
      "id, seq_number, created_at, status, urgency, category, description, city, plz, street, house_number, source, assignee_text, reporter_name, review_sent_at",
      { count: "exact" }
    )
    .eq("is_demo", showDemo)
    .order("created_at", { ascending: false });
  if (filterTenantId) listQuery = listQuery.eq("tenant_id", filterTenantId);

  // Status filter logic
  if (filterStatus === "in_progress") {
    listQuery = listQuery.in("status", ["contacted", "scheduled"]);
  } else if (filterStatus) {
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
  if (filterAssigned === "no") listQuery = listQuery.is("assignee_text", null);

  // Text search
  if (filterQuery) {
    const q = `%${filterQuery}%`;
    listQuery = listQuery.or(
      `reporter_name.ilike.${q},city.ilike.${q},category.ilike.${q},street.ilike.${q},description.ilike.${q},plz.ilike.${q}`
    );
  }

  // Pagination
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  listQuery = listQuery.range(from, to);

  const { data: cases, error, count } = await listQuery;

  if (error) {
    return (
      <p className="text-red-600">Fehler beim Laden: {error.message}</p>
    );
  }

  const rows = (cases ?? []) as CaseRow[];
  const totalCount = count ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Resolve tenant identity for case ID prefix
  let caseIdPrefix = "FS";
  let tenantShortName: string | undefined;
  try {
    const authClient = await getAuthClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (user) {
      const identity = await resolveTenantIdentity(user);
      if (identity) {
        caseIdPrefix = identity.caseIdPrefix;
        tenantShortName = identity.shortName;
      }
    }
  } catch { /* fallback to defaults */ }

  // Build filter URL helper
  function filterHref(key: string, value: string): string {
    const p = new URLSearchParams();
    if (filterTenantSlug) p.set("tenant", filterTenantSlug);
    if (showDemo) p.set("tab", "demo");
    if (key === "status") { if (value) p.set("status", value); }
    else if (filterStatus) p.set("status", filterStatus);
    if (key === "urgency") { if (value) p.set("urgency", value); }
    else if (filterUrgency) p.set("urgency", filterUrgency);
    if (key === "source") { if (value) p.set("source", value); }
    else if (filterSource) p.set("source", filterSource);
    if (key === "show") { if (value) p.set("show", value); }
    else if (showAll) p.set("show", "all");
    if (filterQuery) p.set("q", filterQuery);
    const qs = p.toString();
    return `/ops/faelle${qs ? `?${qs}` : ""}`;
  }

  const hasActiveFilters = !!(filterStatus || filterUrgency || filterSource || filterAssigned);

  // Quickfilter chip helper
  function quickHref(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (filterTenantSlug) p.set("tenant", filterTenantSlug);
    if (showDemo) p.set("tab", "demo");
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
    }
    if (filterQuery) p.set("q", filterQuery);
    const qs = p.toString();
    return `/ops/faelle${qs ? `?${qs}` : ""}`;
  }

  const QUICK_FILTERS = [
    { label: "Neu", href: quickHref({ status: "new" }), active: filterStatus === "new" },
    { label: "Bei uns", href: quickHref({ status: "in_progress" }), active: filterStatus === "in_progress" },
    { label: "Abschluss", href: quickHref({ status: "done", show: "all" }), active: filterStatus === "done" },
    { label: "Kritisch", href: quickHref({ urgency: "notfall" }), active: filterUrgency === "notfall" && !filterStatus },
    { label: "Unzugewiesen", href: quickHref({ assigned: "no" }), active: filterAssigned === "no" && !filterStatus },
  ];

  return (
    <>
      {/* Quickfilter chips — semantic betriebsnahe Schnellzugriffe */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Link
          href={filterTenantSlug ? `/ops/faelle?tenant=${filterTenantSlug}${showDemo ? "&tab=demo" : ""}` : `/ops/faelle${showDemo ? "?tab=demo" : ""}`}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !hasActiveFilters && !showAll
              ? "bg-slate-800 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          Offen
        </Link>
        {QUICK_FILTERS.map((qf) => (
          <Link
            key={qf.label}
            href={qf.href}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              qf.active
                ? "bg-slate-800 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {qf.label}
          </Link>
        ))}
        <Link
          href={filterTenantSlug ? `/ops/faelle?tenant=${filterTenantSlug}&show=all${showDemo ? "&tab=demo" : ""}` : `/ops/faelle?show=all${showDemo ? "&tab=demo" : ""}`}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            showAll && !filterStatus && !filterUrgency && !filterAssigned
              ? "bg-slate-800 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
          }`}
        >
          Alle
        </Link>
      </div>

      {/* Secondary filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Demo/Real tab toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <Link
              href={filterTenantSlug ? `/ops/faelle?tenant=${filterTenantSlug}` : "/ops/faelle"}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                !showDemo
                  ? "bg-slate-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Ihre Fälle
            </Link>
            <Link
              href={filterTenantSlug ? `/ops/faelle?tenant=${filterTenantSlug}&tab=demo` : "/ops/faelle?tab=demo"}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                showDemo
                  ? "bg-slate-700 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Demo
            </Link>
          </div>

          <span className="border-l border-gray-200 h-6 inline-block" />

          {/* Detail filters */}
          <FilterSelect options={STATUS_OPTIONS} value={filterStatus} paramKey="status" filterHref={filterHref} />
          <FilterSelect options={URGENCY_OPTIONS} value={filterUrgency} paramKey="urgency" filterHref={filterHref} />
          <FilterSelect options={SOURCE_OPTIONS} value={filterSource} paramKey="source" filterHref={filterHref} />

          {/* Reset */}
          {hasActiveFilters && (
            <Link
              href={filterTenantSlug ? `/ops/faelle?tenant=${filterTenantSlug}` : "/ops/faelle"}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
            >
              Zurücksetzen
            </Link>
          )}
        </div>
      </div>

      <CaseListClient
        rows={rows}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={filterQuery}
        caseIdPrefix={caseIdPrefix}
        tenantShortName={tenantShortName}
        basePath="/ops/faelle"
      />
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
