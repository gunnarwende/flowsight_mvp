import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getServiceClient();
  const now = new Date();
  const d7ago = new Date(now.getTime() - 7 * 86400_000).toISOString();
  const d30ago = new Date(now.getTime() - 30 * 86400_000).toISOString();

  // ── 1. Tenant base data ────────────────────────────────────────────────
  const { data: tenant, error: tErr } = await supabase
    .from("tenants")
    .select("id, slug, name, created_at, trial_status, trial_start, trial_end, follow_up_at, modules, prospect_phone, prospect_email, day7_checked_at, day10_alerted_at, day13_reminder_sent_at, day14_marked_at")
    .eq("id", id)
    .single();

  if (tErr || !tenant) {
    return NextResponse.json({ error: "tenant not found" }, { status: 404 });
  }

  // ── 2. Parallel enrichment queries ─────────────────────────────────────
  const [allCasesRes, cases7dRes, cases30dRes, doneRes, reviewRes, staffRes] =
    await Promise.all([
      supabase.from("cases").select("id, source, status, created_at, review_sent_at").eq("tenant_id", id),
      supabase.from("cases").select("id", { count: "exact", head: true }).eq("tenant_id", id).gte("created_at", d7ago),
      supabase.from("cases").select("id", { count: "exact", head: true }).eq("tenant_id", id).gte("created_at", d30ago),
      supabase.from("cases").select("id", { count: "exact", head: true }).eq("tenant_id", id).eq("status", "done"),
      supabase.from("cases").select("id", { count: "exact", head: true }).eq("tenant_id", id).not("review_sent_at", "is", null),
      supabase.from("staff").select("id, display_name, role, phone, email, is_active").eq("tenant_id", id).order("display_name"),
    ]);

  const allCases = allCasesRes.data ?? [];
  const totalCases = allCases.length;
  const cases7d = cases7dRes.count ?? 0;
  const cases30d = cases30dRes.count ?? 0;
  const doneCount = doneRes.count ?? 0;
  const reviewCount = reviewRes.count ?? 0;

  // Source breakdown
  const voiceCases = allCases.filter((c) => c.source === "voice").length;
  const wizardCases = allCases.filter((c) => c.source === "wizard").length;
  const manualCases = allCases.filter((c) => c.source !== "voice" && c.source !== "wizard").length;

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  for (const c of allCases) {
    statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1;
  }

  // Last case
  let lastCaseAt: string | null = null;
  for (const c of allCases) {
    if (!lastCaseAt || c.created_at > lastCaseAt) lastCaseAt = c.created_at;
  }

  // Review rate
  const reviewRate = doneCount > 0 ? Math.round((reviewCount / doneCount) * 100) : 0;

  // Voice percentage
  const voicePercent = totalCases > 0 ? Math.round((voiceCases / totalCases) * 100) : 0;
  const wizardPercent = totalCases > 0 ? Math.round((wizardCases / totalCases) * 100) : 0;
  const donePercent = totalCases > 0 ? Math.round((doneCount / totalCases) * 100) : 0;

  // Staff
  const staffList = (staffRes.data ?? []).map((s) => ({
    id: s.id,
    display_name: s.display_name,
    role: s.role,
    phone: s.phone,
    email: s.email,
    is_active: s.is_active,
  }));
  const activeStaff = staffList.filter((s) => s.is_active).length;

  // Trial info
  let trialDaysRemaining: number | null = null;
  if (tenant.trial_status === "trial_active" && tenant.trial_end) {
    trialDaysRemaining = Math.max(
      0,
      Math.ceil((new Date(tenant.trial_end).getTime() - now.getTime()) / 86400_000),
    );
  }

  const milestones = {
    day7_checked: !!tenant.day7_checked_at,
    day10_alerted: !!tenant.day10_alerted_at,
    day13_reminded: !!tenant.day13_reminder_sent_at,
    day14_marked: !!tenant.day14_marked_at,
  };

  return NextResponse.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      created_at: tenant.created_at,
      trial_status: tenant.trial_status,
      trial_start: tenant.trial_start,
      trial_end: tenant.trial_end,
      follow_up_at: tenant.follow_up_at,
      modules: tenant.modules,
      prospect_phone: tenant.prospect_phone,
      prospect_email: tenant.prospect_email,
    },
    stats: {
      case_count_total: totalCases,
      case_count_7d: cases7d,
      case_count_30d: cases30d,
      done_count: doneCount,
      review_count: reviewCount,
      review_rate: reviewRate,
      voice_percent: voicePercent,
      wizard_percent: wizardPercent,
      done_percent: donePercent,
      last_case_at: lastCaseAt,
      staff_count: activeStaff,
    },
    source_breakdown: {
      voice: voiceCases,
      wizard: wizardCases,
      manual: manualCases,
    },
    status_breakdown: statusCounts,
    staff: staffList,
    trial: {
      days_remaining: trialDaysRemaining,
      milestones,
    },
  });
}
