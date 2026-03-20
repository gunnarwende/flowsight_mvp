import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getAuthClient } from "@/src/lib/supabase/server-auth";
import { resolveTenantIdentity } from "@/src/lib/tenants/resolveTenantIdentity";
import { resolveStaffRole } from "@/src/lib/staff/resolveStaffRole";
import { LeitzentraleView } from "@/src/components/ops/LeitzentraleView";
import type { LeitzentraleCase } from "@/src/components/ops/LeitzentraleView";

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

  // ── Tenant scope (ALWAYS filter when tenantId present — even for admins)
  // Prevents tenant identity leak: Weinberger Leitstand must never show Brunner cases.
  let filterTenantId: string | undefined;
  const filterTenantSlug = params.tenant;

  if (scope?.tenantId) {
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
      "id, seq_number, created_at, updated_at, status, urgency, category, description, city, plz, street, house_number, source, assignee_text, reporter_name, contact_phone, review_sent_at, review_rating, scheduled_at"
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

  // ── Query 2: 7-day stats ──────────────────────────────────────────
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

  // ── Query 3b: Erledigt 30 days ───────────────────────────────────
  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let erledigt30dQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .eq("status", "done")
    .gte("updated_at", thirtyDaysAgo);
  if (filterTenantId) erledigt30dQuery = erledigt30dQuery.eq("tenant_id", filterTenantId);

  // ── Query 4: Review sent 7 days ────────────────────────────────────
  let reviewSent7dQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .eq("status", "done")
    .not("review_sent_at", "is", null)
    .gte("updated_at", sevenDaysAgo);
  if (filterTenantId) reviewSent7dQuery = reviewSent7dQuery.eq("tenant_id", filterTenantId);

  // ── Query 4b: Review sent total ─────────────────────────────────────
  let reviewSentTotalQuery = supabase
    .from("cases")
    .select("id", { count: "exact", head: true })
    .eq("is_demo", showDemo)
    .eq("status", "done")
    .not("review_sent_at", "is", null);
  if (filterTenantId) reviewSentTotalQuery = reviewSentTotalQuery.eq("tenant_id", filterTenantId);

  // ── Query 5+6: Review stats (server-side, last 30 days) ──────────

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
    { count: neueCount },
    { count: erledigtCount },
    { count: erledigt30dCount },
    { count: reviewSent7dCount },
    { count: reviewSentTotalCount },
    { count: reviewSentCount },
    { count: reviewPendingCount },
  ] = await Promise.all([
    casesQuery,
    statsNeueQuery,
    statsErledigtQuery,
    erledigt30dQuery,
    reviewSent7dQuery,
    reviewSentTotalQuery,
    reviewSentQuery,
    reviewPendingQuery,
  ]);

  const cases = (casesRaw ?? []) as LeitzentraleCase[];

  // ── Resolve tenant identity + staff context ────────────────────────
  let caseIdPrefix = "FS";
  let currentStaffName: string | null = null;
  let currentStaffRole: "admin" | "techniker" | undefined;
  let featuredReview: string | null = null;
  let avgRatingFromTenant: number | null = null;
  try {
    const authClient = await getAuthClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (user) {
      const identity = await resolveTenantIdentity(user);
      if (identity) caseIdPrefix = identity.caseIdPrefix;

      // Staff context for Techniker view
      if (scope?.tenantId && user.email) {
        const ctx = await resolveStaffRole(user.email, scope.tenantId);
        if (ctx) {
          currentStaffName = ctx.displayName;
          currentStaffRole = ctx.role;
        }
        // Admin role override for testing (viewAsRole cookie)
        if (scope.isAdmin && scope.viewAsRole === "techniker") {
          currentStaffRole = "techniker";
          // Use first staff member's name for demo if admin has no staff record here
          if (!currentStaffName) {
            const supabase2 = getServiceClient();
            const { data: firstStaff } = await supabase2
              .from("staff")
              .select("display_name")
              .eq("tenant_id", scope.tenantId)
              .eq("is_active", true)
              .limit(1)
              .maybeSingle();
            currentStaffName = firstStaff?.display_name ?? user.email?.split("@")[0] ?? "Techniker";
          }
        }
      }

      // Featured review from tenant modules
      if (scope?.tenantId) {
        const { data: tenant } = await supabase
          .from("tenants")
          .select("modules")
          .eq("id", scope.tenantId)
          .single();
        const modules = (tenant?.modules ?? {}) as Record<string, unknown>;
        if (typeof modules.featured_review === "string") {
          featuredReview = modules.featured_review;
        }
        // Google review stats from tenant modules
        if (typeof modules.google_review_avg === "number") {
          avgRatingFromTenant = modules.google_review_avg as number;
        }
      }
    }
  } catch {
    /* fallback to defaults */
  }

  return (
    <LeitzentraleView
      cases={cases}
      caseIdPrefix={caseIdPrefix}
      weekStats={{
        neue: neueCount ?? 0,
        erledigt: erledigtCount ?? 0,
      }}
      reviewStats={{
        sent: reviewSentCount ?? 0,
        pending: reviewPendingCount ?? 0,
      }}
      reviewSent7d={reviewSent7dCount ?? 0}
      reviewSentTotal={reviewSentTotalCount ?? 0}
      erledigt30d={erledigt30dCount ?? 0}
      avgRating={avgRatingFromTenant}
      featuredReview={featuredReview}
      staffName={currentStaffName}
      staffRole={currentStaffRole}
    />
  );
}
