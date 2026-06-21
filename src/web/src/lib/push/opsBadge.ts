import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * SSOT für den App-Icon-Badge + die In-App-Nav-Zähler.
 *
 * Badge-Zahl = offene Fälle (status != "done") + pending Nachrichten
 * (tenant_callbacks status = "pending"). Genau das, was der Inhaber noch
 * abarbeiten muss — KEIN „neu seit letztem Öffnen".
 *
 * Wird bei jedem Push mitgeschickt (sendOpsPush badgeCount) UND beim Öffnen
 * der App neu geholt (LeitzentraleView), damit der Badge immer den echten
 * Stand zeigt — nicht eine per-Event-Hochzählung.
 */
export interface OpsBadgeBreakdown {
  cases: number;
  messages: number;
  total: number;
}

export async function computeOpsBadgeBreakdown(
  supabase: ReturnType<typeof getServiceClient>,
  tenantId: string,
): Promise<OpsBadgeBreakdown> {
  const [caseRes, msgRes] = await Promise.all([
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .neq("status", "done"),
    supabase
      .from("tenant_callbacks")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pending"),
  ]);
  const cases = caseRes.count ?? 0;
  const messages = msgRes.count ?? 0;
  return { cases, messages, total: cases + messages };
}

/** Nur die Gesamtzahl — Bequemlichkeit für sendOpsPush({ badgeCount }). */
export async function computeOpsBadgeCount(
  supabase: ReturnType<typeof getServiceClient>,
  tenantId: string,
): Promise<number> {
  return (await computeOpsBadgeBreakdown(supabase, tenantId)).total;
}
