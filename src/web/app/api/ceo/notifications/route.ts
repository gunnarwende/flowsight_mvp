import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

interface Notification {
  id: string;
  timestamp: string;
  severity: "red" | "amber" | "blue" | "green";
  title: string;
  detail: string | null;
  tenant_name: string | null;
}

function classifySeverity(eventType: string): Notification["severity"] {
  if (eventType.includes("review")) return "green";
  if (eventType.includes("error") || eventType.includes("fail")) return "red";
  return "blue";
}

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const h48ago = new Date(now.getTime() - 48 * 3600_000).toISOString();

  // ── Case events (last 48h) ───────────────────────────────────────
  const { data: events } = await supabase
    .from("case_events")
    .select("id, event_type, title, detail, created_at, case_id")
    .gte("created_at", h48ago)
    .order("created_at", { ascending: false })
    .limit(50);

  // Resolve tenant names via cases
  const caseIds = [...new Set((events ?? []).map((e) => e.case_id))];
  let caseTenantMap: Record<string, string> = {};

  if (caseIds.length > 0) {
    const { data: cases } = await supabase
      .from("cases")
      .select("id, tenant_id")
      .in("id", caseIds);

    const tenantIds = [...new Set((cases ?? []).map((c) => c.tenant_id))];
    if (tenantIds.length > 0) {
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id, name")
        .in("id", tenantIds);

      const tenantNameMap: Record<string, string> = {};
      for (const t of tenants ?? []) {
        tenantNameMap[t.id] = t.name;
      }

      for (const c of cases ?? []) {
        caseTenantMap[c.id] = tenantNameMap[c.tenant_id] ?? "Unbekannt";
      }
    }
  }

  const eventNotifications: Notification[] = (events ?? []).map((e) => ({
    id: e.id,
    timestamp: e.created_at,
    severity: classifySeverity(e.event_type),
    title: e.title,
    detail: e.detail,
    tenant_name: caseTenantMap[e.case_id] ?? null,
  }));

  // ── Trial status changes (recent) ────────────────────────────────
  const { data: trialTenants } = await supabase
    .from("tenants")
    .select("id, name, trial_status, trial_start, trial_end, updated_at")
    .not("trial_status", "is", null)
    .gte("updated_at", h48ago)
    .order("updated_at", { ascending: false })
    .limit(20);

  const trialNotifications: Notification[] = (trialTenants ?? []).map((t) => ({
    id: `trial-${t.id}`,
    timestamp: t.updated_at,
    severity: "amber" as const,
    title: `Trial-Status: ${t.trial_status}`,
    detail: t.trial_end
      ? `Trial endet am ${new Date(t.trial_end).toLocaleDateString("de-CH")}`
      : null,
    tenant_name: t.name,
  }));

  // ── Merge + sort ─────────────────────────────────────────────────
  const notifications = [...eventNotifications, ...trialNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return NextResponse.json({
    notifications,
    fetched_at: now.toISOString(),
  });
}
