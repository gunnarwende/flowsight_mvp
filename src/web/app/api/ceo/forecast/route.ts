// ---------------------------------------------------------------------------
// GET /api/ceo/forecast — Revenue forecast with 3 scenarios + churn risk
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

const PRICE_PER_TENANT = 299; // CHF/month

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const d14ago = new Date(now.getTime() - 14 * 86400_000).toISOString();

  // Parallel queries
  const [convertedRes, trialRes, offboardedRes, churnCandidatesRes] =
    await Promise.all([
      // Paying tenants
      supabase
        .from("tenants")
        .select("id, slug, display_name, trial_status")
        .eq("trial_status", "converted"),
      // Active trials
      supabase
        .from("tenants")
        .select("id, slug, display_name", { count: "exact" })
        .in("trial_status", ["trial_active", "live_dock"]),
      // Offboarded (for conversion rate)
      supabase
        .from("tenants")
        .select("id", { count: "exact", head: true })
        .eq("trial_status", "offboarded"),
      // Converted tenants — we'll check their last case separately
      supabase
        .from("tenants")
        .select("id, slug, display_name")
        .eq("trial_status", "converted"),
    ]);

  const converted = convertedRes.data ?? [];
  const convertedCount = converted.length;
  const trialCount = trialRes.data?.length ?? 0;
  const offboardedCount = offboardedRes.count ?? 0;

  // MRR
  const currentMrr = convertedCount * PRICE_PER_TENANT;

  // Conversion rate (historical)
  const totalDecided = convertedCount + offboardedCount;
  const conversionRate =
    totalDecided > 0
      ? Math.round((convertedCount / totalDecided) * 100) / 100
      : 0.5; // default 50% if no data

  // 3 scenarios
  const scenarios = {
    best: currentMrr + Math.round(trialCount * PRICE_PER_TENANT * 0.8),
    expected:
      currentMrr + Math.round(trialCount * PRICE_PER_TENANT * conversionRate),
    worst: Math.round(currentMrr * 0.9),
  };

  // Churn risk: converted tenants with last case > 14 days ago
  const churnRisk: {
    slug: string;
    name: string;
    days_since_last_case: number;
  }[] = [];

  const candidates = churnCandidatesRes.data ?? [];
  if (candidates.length > 0) {
    // Get last case per tenant
    const tenantIds = candidates.map((t) => t.id);
    const { data: lastCases } = await supabase
      .from("cases")
      .select("tenant_id, created_at")
      .in("tenant_id", tenantIds)
      .order("created_at", { ascending: false });

    // Build map of tenant_id → latest case date
    const lastCaseMap = new Map<string, string>();
    for (const c of lastCases ?? []) {
      if (!lastCaseMap.has(c.tenant_id)) {
        lastCaseMap.set(c.tenant_id, c.created_at);
      }
    }

    for (const t of candidates) {
      const lastCase = lastCaseMap.get(t.id);
      if (!lastCase) {
        // No cases at all — high risk
        const daysSinceCreation = Math.floor(
          (now.getTime() - new Date(d14ago).getTime()) / 86400_000,
        );
        churnRisk.push({
          slug: t.slug,
          name: t.display_name ?? t.slug,
          days_since_last_case: daysSinceCreation + 14,
        });
      } else {
        const daysSince = Math.floor(
          (now.getTime() - new Date(lastCase).getTime()) / 86400_000,
        );
        if (daysSince > 14) {
          churnRisk.push({
            slug: t.slug,
            name: t.display_name ?? t.slug,
            days_since_last_case: daysSince,
          });
        }
      }
    }

    // Sort by days descending (highest risk first)
    churnRisk.sort((a, b) => b.days_since_last_case - a.days_since_last_case);
  }

  return NextResponse.json({
    current_mrr: currentMrr,
    trial_count: trialCount,
    conversion_rate: conversionRate,
    scenarios,
    churn_risk: churnRisk,
  });
}
