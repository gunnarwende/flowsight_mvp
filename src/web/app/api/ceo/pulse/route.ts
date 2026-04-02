import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { computeSeverity } from "@/src/lib/ceo/severityEngine";
import { APP_BASE_URL } from "@/src/lib/config/appUrl";

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const h24ago = new Date(now.getTime() - 24 * 3600_000).toISOString();
  const h48ago = new Date(now.getTime() - 48 * 3600_000).toISOString();
  const d7ago = new Date(now.getTime() - 7 * 86400_000).toISOString();
  const h48ahead = new Date(now.getTime() + 48 * 3600_000).toISOString();
  const h24ahead = new Date(now.getTime() + 24 * 3600_000).toISOString();
  const d3ago = new Date(now.getTime() - 3 * 86400_000).toISOString();
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);

  // Run all queries in parallel
  const [
    recentRes, backlogRes, stuckRes, scheduledRes, doneRes, reviewsRes, oldestRes,
    activeTrialsRes, followUpsRes, expiring48hRes, zombieRes, staleRes
  ] = await Promise.all([
    supabase.from("cases").select("id, source, urgency").neq("status", "archived").gte("created_at", h24ago),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "new").lt("created_at", h48ago),
    supabase.from("cases").select("id", { count: "exact", head: true }).neq("status", "archived").gte("scheduled_at", todayStart.toISOString()).lte("scheduled_at", todayEnd.toISOString()),
    supabase.from("cases").select("id", { count: "exact", head: true }).eq("status", "done").gte("updated_at", d7ago),
    supabase.from("cases").select("id", { count: "exact", head: true }).not("review_sent_at", "is", null).gte("review_sent_at", d7ago),
    supabase.from("cases").select("id, created_at").eq("status", "new").order("created_at", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("tenants").select("slug, name, trial_status").in("trial_status", ["trial_active", "live_dock"]),
    supabase.from("tenants").select("slug, name").eq("trial_status", "trial_active").gte("follow_up_at", d3ago).lte("follow_up_at", todayEnd.toISOString()),
    supabase.from("tenants").select("slug, name, trial_end").in("trial_status", ["trial_active", "live_dock"]).lte("trial_end", h48ahead),
    supabase.from("tenants").select("slug").eq("trial_status", "trial_active").lt("trial_start", d7ago),
    supabase.from("tenants").select("slug").eq("trial_status", "trial_active").is("day14_marked_at", null).lt("trial_start", new Date(now.getTime() - 14 * 86400_000).toISOString()),
  ]);

  // Health check
  let healthOk = false;
  let healthDb = "?";
  let healthEmail = "?";
  try {
    const res = await fetch(`${APP_BASE_URL}/api/health`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const body = await res.json();
      healthOk = body.ok === true;
      healthDb = body.db ?? "?";
      healthEmail = body.email ?? "?";
    }
  } catch { /* health check failed */ }

  const recent = recentRes.data ?? [];
  const cases24h = recent.length;
  const voiceCount = recent.filter(c => c.source === "voice").length;
  const wizardCount = recent.filter(c => c.source === "wizard").length;
  const notfallCount = recent.filter(c => c.urgency === "notfall").length;
  const backlogNew = backlogRes.count ?? 0;
  const stuck48h = stuckRes.count ?? 0;
  const scheduledToday = scheduledRes.count ?? 0;
  const done7d = doneRes.count ?? 0;
  const reviews7d = reviewsRes.count ?? 0;

  let oldestAge: string | null = null;
  if (oldestRes.data) {
    const ageMs = now.getTime() - new Date(oldestRes.data.created_at).getTime();
    const ageH = Math.floor(ageMs / 3600_000);
    const ageD = Math.floor(ageH / 24);
    oldestAge = ageD > 0 ? `${ageD}d ${ageH % 24}h` : `${ageH}h`;
  }

  const activeTrialCount = activeTrialsRes.data?.length ?? 0;
  const followUpDueCount = followUpsRes.data?.length ?? 0;
  const expiring48hCount = expiring48hRes.data?.length ?? 0;
  const expiring24h = (expiring48hRes.data ?? []).filter(t => t.trial_end && new Date(t.trial_end).getTime() <= new Date(h24ahead).getTime());
  const zombieCount = zombieRes.data?.length ?? 0;
  const staleCount = staleRes.data?.length ?? 0;

  const cases = { cases24h, voiceCount, wizardCount, notfallCount, backlogNew, stuck48h, scheduledToday, done7d, reviews7d, oldestAge };
  const trials = {
    active: activeTrialCount,
    activeList: (activeTrialsRes.data ?? []).map(t => ({ slug: t.slug, name: t.name })),
    followUpDue: followUpDueCount,
    followUpList: (followUpsRes.data ?? []).map(t => ({ slug: t.slug, name: t.name })),
    expiring48h: expiring48hCount,
    expiringList: (expiring48hRes.data ?? []).map(t => ({ slug: t.slug, name: t.name })),
    zombies: zombieCount,
    stale: staleCount,
  };
  const health = { ok: healthOk, db: healthDb, email: healthEmail };

  const severity = computeSeverity({ cases, trials, health, expiring24hCount: expiring24h.length });

  // Build alerts
  const alerts: { severity: "red" | "yellow" | "green"; text: string }[] = [];
  if (stuck48h > 0) alerts.push({ severity: "red", text: `${stuck48h} Fall/Fälle seit >48h offen` });
  if (!healthOk) alerts.push({ severity: "red", text: "System-Health-Check fehlgeschlagen" });
  if (expiring24h.length > 0) alerts.push({ severity: "red", text: `Trial läuft in <24h ab: ${expiring24h.map(t => t.name ?? t.slug).join(", ")}` });
  if (staleCount > 0) alerts.push({ severity: "red", text: `${staleCount} Trial(s) ohne Lifecycle-Tick (>Day 14)` });
  if (backlogNew > 5) alerts.push({ severity: "yellow", text: `Backlog: ${backlogNew} neue Fälle warten` });
  if (notfallCount > 0) alerts.push({ severity: "yellow", text: `${notfallCount} Notfall-Fall/-Fälle in den letzten 24h` });
  if (followUpDueCount > 0) alerts.push({ severity: "yellow", text: `Follow-up fällig: ${(followUpsRes.data ?? []).map(t => t.name ?? t.slug).join(", ")}` });
  if (zombieCount > 0) alerts.push({ severity: "yellow", text: `${zombieCount} Zombie-Trial(s) (aktiv aber inaktiv >7d)` });

  return NextResponse.json({
    severity,
    cases,
    trials,
    health,
    alerts,
    snapshot_at: now.toISOString(),
  });
}
