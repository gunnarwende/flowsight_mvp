import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Garmin-Anbindung fuer die Sektion "Leben" / Running.
// Garmin Connect -> garth (GitHub-Actions-Cron, scripts/_ops/garmin_sync.py)
//   -> life_activities.
// Die App selbst spricht NIE mit Garmin (Login waere auf Serverless fragil) —
// sie liest nur life_settings/life_activities und stoesst die Workflows an
// (selbe "Handy fasst keinen Key an"-Mechanik wie /api/ceo/ops/dispatch).
// ---------------------------------------------------------------------------

const REPO = "gunnarwende/flowsight_mvp";
const SYNC_WORKFLOW = "garmin-sync.yml";
const AUTH_WORKFLOW = "garmin-auth.yml";

/**
 * Ref, auf dem die Workflows liegen.
 * - explizit via LIFE_WORKFLOW_REF, sonst
 * - der Branch der laufenden Vercel-Deployment (VERCEL_GIT_COMMIT_REF) →
 *   Branch-Vorschau dispatcht automatisch gegen ihren eigenen Branch (kein Setup),
 * - Fallback main (Production).
 */
function workflowRef(): string {
  return process.env.LIFE_WORKFLOW_REF || process.env.VERCEL_GIT_COMMIT_REF || "main";
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const supabase = getServiceClient();
  const { data } = await supabase.from("life_settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const supabase = getServiceClient();
  await supabase
    .from("life_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

/** Ist ein Garmin-Token hinterlegt? (= verbunden) */
export async function isConnected(): Promise<boolean> {
  const token = await getSetting<{ present?: boolean }>("garmin_token");
  // garmin_token wird vom Auth-Workflow gesetzt; Marker { present:true } reicht der UI.
  return Boolean(token);
}

/** GitHub-Workflow ausloesen (workflow_dispatch). */
export async function dispatch(
  workflow: string,
  inputs: Record<string, string> = {},
): Promise<{ ok: boolean; status: number; body?: string }> {
  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) return { ok: false, status: 500, body: "GH_DISPATCH_TOKEN not configured" };

  const res = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref: workflowRef(), inputs }),
    },
  );
  if (!res.ok) {
    return { ok: false, status: res.status, body: (await res.text().catch(() => "")).slice(0, 500) };
  }
  return { ok: true, status: 204 };
}

export const GARMIN_SYNC_WORKFLOW = SYNC_WORKFLOW;
export const GARMIN_AUTH_WORKFLOW = AUTH_WORKFLOW;
