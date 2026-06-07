import { redirect } from "next/navigation";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { listTenantCallbacks } from "@/src/lib/callbacks/tenantCallbacks";
import { NachrichtenManager } from "./NachrichtenManager";

/**
 * /ops/nachrichten — die generische "Rückrufe / Nachrichten"-Ansicht
 * (Onboarding-Cockpit Phase 2, OC4).
 *
 * Zeigt `tenant_callbacks` (Korb NACHRICHT): Rückruf-Wünsche (Lieferant,
 * "den Chef sprechen") + Nachfragen zu bestehenden Aufträgen, die Lisa
 * aufgenommen hat — KEIN Fall, sondern "bitte zurückrufen". Tenant-agnostisch
 * (alle Module). Heute leer, bis ein Voice-Agent `call_type` emittiert (OC2/OC3).
 */
export default async function NachrichtenPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");
  if (!scope.tenantId) redirect("/ops/cases");

  // Alle Status holen (Manager trennt offen/erledigt); Lib liefert neueste zuerst, max 100.
  const callbacks = await listTenantCallbacks(scope.tenantId, "all");

  return <NachrichtenManager initialCallbacks={callbacks} />;
}
