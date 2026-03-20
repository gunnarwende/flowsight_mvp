// ---------------------------------------------------------------------------
// GET /api/ceo/ai/tenant-insight?tenant_id=X — AI analysis of a tenant
// Graceful: returns { insight: null, reason } if AI not configured
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAiProvider } from "@/src/lib/ai/registry";
import { trackAiCall } from "@/src/lib/ai/middleware/costTracker";
import { AI_CONFIG } from "@/src/lib/ai/types";

// Per-tenant cache (10 min TTL)
const insightCache = new Map<string, { text: string; ts: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) {
    return NextResponse.json(
      { error: "tenant_id required" },
      { status: 400 },
    );
  }

  // Check cache
  const cached = insightCache.get(tenantId);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ insight: cached.text, cached: true });
  }

  // Check AI availability
  const provider = getAiProvider("pulse_comment"); // reuse same config
  if (!provider) {
    return NextResponse.json({
      insight: null,
      reason: "ai_not_configured",
    });
  }

  const supabase = getServiceClient();
  const d30ago = new Date(
    Date.now() - 30 * 86400_000,
  ).toISOString();

  // Fetch tenant + cases + events
  const [tenantRes, casesRes] = await Promise.all([
    supabase
      .from("tenants")
      .select(
        "slug, display_name, trial_status, trial_start, trial_end, modules, created_at",
      )
      .eq("id", tenantId)
      .single(),
    supabase
      .from("cases")
      .select(
        "id, status, urgency, source, category, created_at, updated_at",
      )
      .eq("tenant_id", tenantId)
      .gte("created_at", d30ago)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (tenantRes.error || !tenantRes.data) {
    return NextResponse.json(
      { insight: null, reason: "tenant_not_found" },
    );
  }

  const tenant = tenantRes.data;
  const cases = casesRes.data ?? [];

  // Build context for AI
  const context = {
    name: tenant.display_name ?? tenant.slug,
    status: tenant.trial_status,
    trial_start: tenant.trial_start,
    trial_end: tenant.trial_end,
    modules: tenant.modules,
    created_at: tenant.created_at,
    cases_30d: cases.length,
    status_distribution: cases.reduce(
      (acc, c) => {
        acc[c.status] = (acc[c.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    source_distribution: cases.reduce(
      (acc, c) => {
        acc[c.source ?? "unknown"] = (acc[c.source ?? "unknown"] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    urgency_distribution: cases.reduce(
      (acc, c) => {
        acc[c.urgency ?? "normal"] = (acc[c.urgency ?? "normal"] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    last_case_at: cases[0]?.created_at ?? null,
  };

  const config = AI_CONFIG.pulse_comment;
  const insight = await trackAiCall(
    config.provider,
    config.model,
    "tenant_insight",
    () =>
      provider.chat([
        {
          role: "system",
          content:
            "Du bist der FlowSight CEO-Assistent. Analysiere diesen Betrieb und gib 2-3 Saetze Insight auf Deutsch: Was laeuft gut, was braucht Aufmerksamkeit, Empfehlung. Sei direkt, konkret, und hilfreich fuer den CEO.",
        },
        {
          role: "user",
          content: `Betrieb-Daten (letzte 30 Tage):\n${JSON.stringify(context, null, 2)}`,
        },
      ]),
  );

  // Cache on success
  if (!insight.startsWith("[AI-Fehler]")) {
    insightCache.set(tenantId, { text: insight, ts: Date.now() });
  }

  return NextResponse.json({ insight, cached: false });
}
