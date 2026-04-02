import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status");
  const searchFilter = url.searchParams.get("search")?.trim().toLowerCase();

  const now = new Date();
  const d7ago = new Date(now.getTime() - 7 * 86400_000).toISOString();

  // ── 1. Load all tenants (exclude default) ──────────────────────────────
  const { data: tenants, error: tErr } = await supabase
    .from("tenants")
    .select("id, slug, name, created_at, trial_status, trial_start, trial_end, modules, prospect_phone, prospect_email")
    .neq("slug", "default")
    .order("created_at", { ascending: false });

  if (tErr || !tenants) {
    return NextResponse.json({ error: tErr?.message ?? "query failed" }, { status: 500 });
  }

  // ── 2. Parallel queries for case & staff stats ─────────────────────────
  const tenantIds = tenants.map((t) => t.id);

  const [casesRes, doneRes, reviewRes, staffRes, cases7dRes, phonesRes] = await Promise.all([
    // Total cases per tenant
    supabase.from("cases").select("tenant_id, created_at").in("tenant_id", tenantIds),
    // Done cases
    supabase.from("cases").select("tenant_id").eq("status", "done").in("tenant_id", tenantIds),
    // Review sent
    supabase.from("cases").select("tenant_id").not("review_sent_at", "is", null).in("tenant_id", tenantIds),
    // Active staff
    supabase.from("staff").select("tenant_id").eq("is_active", true).in("tenant_id", tenantIds),
    // Cases last 7d
    supabase.from("cases").select("tenant_id").gte("created_at", d7ago).in("tenant_id", tenantIds),
    // Phone numbers per tenant (for quick-actions)
    supabase.from("tenant_numbers").select("tenant_id, phone_number").eq("active", true).in("tenant_id", tenantIds),
  ]);

  // Build lookup maps
  const allCases = casesRes.data ?? [];
  const countBy = (arr: { tenant_id: string }[], tid: string) =>
    arr.filter((r) => r.tenant_id === tid).length;

  // Phone number lookup
  const phoneMap = new Map<string, string>();
  for (const p of phonesRes.data ?? []) {
    if (!phoneMap.has(p.tenant_id)) phoneMap.set(p.tenant_id, p.phone_number);
  }

  const lastCaseMap = new Map<string, string>();
  for (const c of allCases) {
    const prev = lastCaseMap.get(c.tenant_id);
    if (!prev || c.created_at > prev) lastCaseMap.set(c.tenant_id, c.created_at);
  }

  // ── 3. Enrich tenants ──────────────────────────────────────────────────
  type EnrichedTenant = {
    id: string;
    slug: string;
    name: string;
    created_at: string;
    trial_status: string | null;
    trial_start: string | null;
    trial_end: string | null;
    modules: Record<string, unknown> | null;
    prospect_phone: string | null;
    prospect_email: string | null;
    test_phone: string | null;
    case_count_7d: number;
    case_count_total: number;
    last_case_at: string | null;
    done_count: number;
    review_rate: number;
    staff_count: number;
  };

  let enriched: EnrichedTenant[] = tenants.map((t) => {
    const doneCount = countBy(doneRes.data ?? [], t.id);
    const reviewCount = countBy(reviewRes.data ?? [], t.id);
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      created_at: t.created_at,
      trial_status: t.trial_status,
      trial_start: t.trial_start,
      trial_end: t.trial_end,
      modules: t.modules as Record<string, unknown> | null,
      prospect_phone: t.prospect_phone,
      prospect_email: t.prospect_email,
      test_phone: phoneMap.get(t.id) ?? null,
      case_count_7d: countBy(cases7dRes.data ?? [], t.id),
      case_count_total: countBy(allCases, t.id),
      last_case_at: lastCaseMap.get(t.id) ?? null,
      done_count: doneCount,
      review_rate: doneCount > 0 ? Math.round((reviewCount / doneCount) * 100) : 0,
      staff_count: countBy(staffRes.data ?? [], t.id),
    };
  });

  // ── 4. Filter ──────────────────────────────────────────────────────────
  if (statusFilter) {
    const statuses = statusFilter.split(",").map((s) => s.trim());
    enriched = enriched.filter((t) => statuses.includes(t.trial_status ?? "unknown"));
  }

  if (searchFilter) {
    enriched = enriched.filter(
      (t) =>
        t.name.toLowerCase().includes(searchFilter) ||
        t.slug.toLowerCase().includes(searchFilter),
    );
  }

  // ── 5. Sort: active trials first, then converted, then rest ────────────
  const ORDER: Record<string, number> = {
    trial_active: 0,
    live_dock: 1,
    converted: 2,
    interested: 3,
    decision_pending: 4,
    offboarded: 5,
  };
  enriched.sort((a, b) => {
    const oa = ORDER[a.trial_status ?? ""] ?? 9;
    const ob = ORDER[b.trial_status ?? ""] ?? 9;
    if (oa !== ob) return oa - ob;
    return (b.case_count_7d ?? 0) - (a.case_count_7d ?? 0);
  });

  return NextResponse.json({ tenants: enriched, count: enriched.length });
}
