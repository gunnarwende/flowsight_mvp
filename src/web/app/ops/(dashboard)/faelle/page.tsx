import Link from "next/link";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { CaseListClient } from "@/src/components/ops/CaseListClient";
import type { CaseRow } from "@/src/components/ops/CaseListClient";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";

// ---------------------------------------------------------------------------
// Filter definitions
// ---------------------------------------------------------------------------

const STATUS_FILTERS = [
  { value: "", label: "Alle" },
  { value: "new", label: "Neu" },
  { value: "scheduled", label: "Geplant" },
  { value: "done", label: "Erledigt" },
  { value: "archived", label: "Abgeschlossen" },
] as const;

const URGENCY_FILTERS = [
  { value: "", label: "Alle" },
  { value: "notfall", label: "Notfall" },
  { value: "dringend", label: "Dringend" },
  { value: "normal", label: "Normal" },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function FaellePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const filterStatus = params.status ?? "";
  const filterUrgency = params.urgency ?? "";
  const filterWaitingFor = params.waiting_for ?? "";
  const filterTenantSlug = params.tenant;
  const filterQuery = params.q ?? "";
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

  // ── Build query ───────────────────────────────────────────────────
  let listQuery = supabase
    .from("cases")
    .select(
      "id, seq_number, created_at, status, urgency, category, description, city, plz, street, house_number, source, assignee_text, reporter_name, review_sent_at, waiting_for",
      { count: "exact" }
    )
    .eq("is_demo", false)
    .order("created_at", { ascending: false });
  if (filterTenantId) listQuery = listQuery.eq("tenant_id", filterTenantId);

  // ── Apply filters (AND combination) ─────────────────────────────
  if (filterStatus) {
    listQuery = listQuery.eq("status", filterStatus);
  }
  if (filterUrgency) {
    listQuery = listQuery.eq("urgency", filterUrgency);
  }
  // waiting_for=active: all cases where waiting_for != niemand (drilldown from Leitzentrale)
  if (filterWaitingFor === "active") {
    listQuery = listQuery.neq("waiting_for", "niemand");
  } else if (filterWaitingFor) {
    listQuery = listQuery.eq("waiting_for", filterWaitingFor);
  }

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

  function buildHref(overrides: Record<string, string>): string {
    const p = new URLSearchParams();
    if (filterTenantSlug) p.set("tenant", filterTenantSlug);

    const status = overrides.status ?? filterStatus;
    const urgency = overrides.urgency ?? filterUrgency;
    const q = overrides.q ?? filterQuery;

    if (status) p.set("status", status);
    if (urgency) p.set("urgency", urgency);
    if (q) p.set("q", q);
    // Preserve waiting_for unless a status/urgency filter change clears context
    if (!("status" in overrides) && !("urgency" in overrides) && filterWaitingFor) {
      p.set("waiting_for", filterWaitingFor);
    }
    // Reset page when changing filters
    if (!("status" in overrides) && !("urgency" in overrides) && overrides.page) {
      p.set("page", overrides.page);
    }

    const qs = p.toString();
    return `/ops/faelle${qs ? `?${qs}` : ""}`;
  }

  // Active waiting_for filter label for display
  const waitingForLabel = filterWaitingFor === "active" ? "Wartend" :
    filterWaitingFor === "kunde" ? "Wartet auf Kunde" :
    filterWaitingFor === "material" ? "Wartet auf Material" :
    filterWaitingFor === "partner" ? "Wartet auf Partner" :
    filterWaitingFor === "intern" ? "Wartet intern" : "";

  return (
    <>
      {/* Page title */}
      <h1 className="text-xl font-semibold text-gray-900 mb-5">
        Fallübersicht
        {waitingForLabel && (
          <span className="ml-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 align-middle">
            {waitingForLabel}
            <Link href={buildHref({ status: filterStatus, urgency: filterUrgency })} className="text-amber-400 hover:text-amber-600 ml-0.5">&times;</Link>
          </span>
        )}
      </h1>

      {/* Filter rows */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 mb-5 space-y-3">
        {/* Row 1: Status */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-16 shrink-0">
            Status
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const isActive = filterStatus === f.value;
              return (
                <Link
                  key={f.value || "__all"}
                  href={buildHref({ status: f.value })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Row 2: Priorität */}
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-16 shrink-0">
            Priorität
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {URGENCY_FILTERS.map((f) => {
              const isActive = filterUrgency === f.value;
              return (
                <Link
                  key={f.value || "__all"}
                  href={buildHref({ urgency: f.value })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
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
