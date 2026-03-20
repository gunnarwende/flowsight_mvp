// ---------------------------------------------------------------------------
// GET /api/ceo/ai/pulse-comment — AI-generated comment on current Pulse data
// Graceful: returns { comment: null, reason } if AI not configured
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getAiProvider } from "@/src/lib/ai/registry";
import { trackAiCall } from "@/src/lib/ai/middleware/costTracker";
import { AI_CONFIG } from "@/src/lib/ai/types";

// Simple in-memory cache (5 min TTL)
let cachedComment: string | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Return cached if fresh
  if (cachedComment && Date.now() - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ comment: cachedComment, cached: true });
  }

  // Check AI availability
  const provider = getAiProvider("pulse_comment");
  if (!provider) {
    return NextResponse.json({
      comment: null,
      reason: "ai_not_configured",
    });
  }

  // Fetch pulse data internally via absolute URL construction
  let pulseData: Record<string, unknown>;
  try {
    // Use internal import instead of HTTP fetch to avoid auth/cookie issues
    const { getServiceClient } = await import(
      "@/src/lib/supabase/server"
    );
    const { computeSeverity } = await import(
      "@/src/lib/ceo/severityEngine"
    );

    const supabase = getServiceClient();
    const now = new Date();
    const h24ago = new Date(now.getTime() - 24 * 3600_000).toISOString();
    const d7ago = new Date(now.getTime() - 7 * 86400_000).toISOString();

    const [recentRes, backlogRes, doneRes, activeTrialsRes] =
      await Promise.all([
        supabase
          .from("cases")
          .select("id, source, urgency")
          .neq("status", "archived")
          .gte("created_at", h24ago),
        supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .eq("status", "done")
          .gte("updated_at", d7ago),
        supabase
          .from("tenants")
          .select("slug, display_name")
          .eq("trial_status", "active"),
      ]);

    const cases24h = recentRes.data?.length ?? 0;
    const notfallCount =
      recentRes.data?.filter((c) => c.urgency === "notfall").length ?? 0;
    const backlog = backlogRes.count ?? 0;
    const done7d = doneRes.count ?? 0;
    const activeTrials = activeTrialsRes.data?.length ?? 0;

    pulseData = {
      cases24h,
      notfallCount,
      backlog,
      done7d,
      activeTrials,
      severity: computeSeverity({
        cases: { stuck48h: 0, backlogNew: backlog, notfallCount },
        trials: { followUpDue: 0, zombies: 0, stale: 0 },
        health: { ok: true },
        expiring24hCount: 0,
      }),
    };
  } catch {
    return NextResponse.json({
      comment: null,
      reason: "pulse_fetch_failed",
    });
  }

  // Generate AI comment
  const config = AI_CONFIG.pulse_comment;
  const comment = await trackAiCall(
    config.provider,
    config.model,
    "pulse_comment",
    () =>
      provider.chat([
        {
          role: "system",
          content:
            "Du bist der FlowSight CEO-Assistent. Analysiere diesen Business-Snapshot und gib eine 2-3 Satz Zusammenfassung auf Deutsch. Fokus: was ist wichtig, was braucht Aufmerksamkeit, was läuft gut. Sei direkt und konkret.",
        },
        {
          role: "user",
          content: `Aktueller Pulse-Snapshot:\n${JSON.stringify(pulseData, null, 2)}`,
        },
      ]),
  );

  // Cache successful responses (not error strings)
  if (!comment.startsWith("[AI-Fehler]")) {
    cachedComment = comment;
    cachedAt = Date.now();
  }

  return NextResponse.json({ comment, cached: false });
}
