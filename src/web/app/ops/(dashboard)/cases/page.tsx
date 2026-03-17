import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";
import { resolveStaffRole } from "@/src/lib/staff/resolveStaffRole";
import { ZentraleView } from "@/src/components/ops/ZentraleView";
import type { ZentraleCase, TodayAppointment } from "@/src/components/ops/ZentraleView";

// ---------------------------------------------------------------------------
// Page (Server Component) — Leitsystem
// ---------------------------------------------------------------------------

export default async function OpsCasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const showDemo = params.tab === "demo";

  const supabase = getServiceClient();
  const scope = await resolveTenantScope();

  // ── Tenant scope ──────────────────────────────────────────────────
  let filterTenantId: string | undefined;
  const filterTenantSlug = params.tenant;

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

  // ── Query 1: Active cases (up to 200) for Leitsystem grouping ────
  let casesQuery = supabase
    .from("cases")
    .select(
      "id, seq_number, created_at, updated_at, status, urgency, category, description, city, plz, street, house_number, source, assignee_text, reporter_name, review_sent_at, scheduled_at"
    )
    .eq("is_demo", showDemo)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filterTenantId) casesQuery = casesQuery.eq("tenant_id", filterTenantId);

  // ── RBAC: Techniker sees only assigned cases ──────────────────────
  if (scope && !scope.isAdmin && scope.tenantId) {
    try {
      const authClient2 = await getAuthClient();
      const { data: { user: authUser2 } } = await authClient2.auth.getUser();
      if (authUser2?.email) {
        const ctx = await resolveStaffRole(authUser2.email, scope.tenantId);
        if (ctx?.role === "techniker") {
          casesQuery = casesQuery.eq("assignee_text", ctx.displayName);
        }
      }
    } catch { /* fallback: no filter */ }
  }

  // ── Query 2: Today's appointments with staff + case join ───────────
  const todayZurich = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
  }).format(new Date());
  const todayStart = `${todayZurich}T00:00:00+00:00`;
  const todayEnd = `${todayZurich}T23:59:59+00:00`;

  let appointmentsQuery = supabase
    .from("appointments")
    .select(
      "id, scheduled_at, duration_min, status, notes, staff:staff_id(display_name), case_info:case_id(id, seq_number, category, reporter_name, street, house_number, plz, city)"
    )
    .gte("scheduled_at", todayStart)
    .lte("scheduled_at", todayEnd)
    .in("status", ["scheduled", "confirmed"])
    .order("scheduled_at", { ascending: true });
  if (filterTenantId) appointmentsQuery = appointmentsQuery.eq("tenant_id", filterTenantId);

  // ── Query 3: 7-day stats ──────────────────────────────────────────
  const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  let statsNeueQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .gte("created_at", sevenDaysAgo);
  if (filterTenantId) statsNeueQuery = statsNeueQuery.eq("tenant_id", filterTenantId);

  let statsErledigtQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .eq("status", "done")
    .gte("updated_at", sevenDaysAgo);
  if (filterTenantId) statsErledigtQuery = statsErledigtQuery.eq("tenant_id", filterTenantId);

  // ── Query 5+6: Review stats (server-side, last 30 days) ──────────
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let reviewSentQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .eq("status", "done")
    .not("review_sent_at", "is", null)
    .gte("updated_at", thirtyDaysAgo);
  if (filterTenantId) reviewSentQuery = reviewSentQuery.eq("tenant_id", filterTenantId);

  let reviewPendingQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .eq("status", "done")
    .is("review_sent_at", null)
    .gte("updated_at", thirtyDaysAgo);
  if (filterTenantId) reviewPendingQuery = reviewPendingQuery.eq("tenant_id", filterTenantId);

  // ── Execute all queries in parallel ────────────────────────────────
  const [
    { data: casesRaw },
    { data: appointmentsRaw },
    { count: neueCount },
    { count: erledigtCount },
    { count: reviewSentCount },
    { count: reviewPendingCount },
  ] = await Promise.all([
    casesQuery,
    appointmentsQuery,
    statsNeueQuery,
    statsErledigtQuery,
    reviewSentQuery,
    reviewPendingQuery,
  ]);

  const cases = (casesRaw ?? []) as ZentraleCase[];

  // Supabase returns joined relations as arrays — normalize to single objects
  const todayAppointments: TodayAppointment[] = (appointmentsRaw ?? []).map((a: Record<string, unknown>) => ({
    ...a,
    staff: Array.isArray(a.staff) ? (a.staff[0] ?? null) : a.staff,
    case_info: Array.isArray(a.case_info) ? (a.case_info[0] ?? null) : a.case_info,
  })) as TodayAppointment[];

  // ── Resolve tenant identity for case ID prefix ─────────────────────
  let caseIdPrefix = "FS";
  try {
    const authClient = await getAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (user) {
      const identity = await resolveTenantIdentity(user);
      if (identity) caseIdPrefix = identity.caseIdPrefix;
    }
  } catch {
    /* fallback to defaults */
  }

  return (
    <ZentraleView
      cases={cases}
      todayAppointments={todayAppointments}
      caseIdPrefix={caseIdPrefix}
      weekStats={{
        neue: neueCount ?? 0,
        erledigt: erledigtCount ?? 0,
      }}
      reviewStats={{
        sent: reviewSentCount ?? 0,
        pending: reviewPendingCount ?? 0,
      }}
    />
  );
}
