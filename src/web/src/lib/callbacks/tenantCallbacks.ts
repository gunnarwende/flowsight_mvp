import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * tenant_callbacks — die generalisierte "Rückrufe / Nachrichten"-Datenschicht
 * (Onboarding-Cockpit Phase 2, OC1).
 *
 * Lisa sortiert jeden Anruf in 3 Körbe: FALL (cases) / NACHRICHT (hier) /
 * NICHTS. Diese Lib ist die gemeinsame Datenschicht für den Voice-Webhook
 * (Insert, OC2/OC3), eine künftige generische API-Route und das Leitsystem
 * (Read/Update, OC4). Service-Client → umgeht RLS (gleiches Muster wie der
 * BigBen-Callback-Pfad), Aufrufer sind tenant-scoped.
 *
 * Spec: docs/gtm/onboarding/phase2_voice_dispositions.md
 *     + docs/gtm/onboarding/phase2_datamodel_backend.md
 *
 * BEWUSST ADDITIV: ersetzt NICHT pub_callback_requests (BigBen, live) — eine
 * spätere Konsolidierung ist ein eigener, founder-getesteter Schritt.
 */

export type TenantCallbackReason = "callback" | "order_followup";
export type TenantCallbackStatus = "pending" | "resolved" | "dismissed";

export interface TenantCallback {
  id: string;
  tenant_id: string;
  reason: TenantCallbackReason;
  caller_name: string | null;
  caller_phone: string;
  topic: string | null;
  call_id: string | null;
  transcript_excerpt: string | null;
  status: TenantCallbackStatus;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface InsertTenantCallbackInput {
  tenantId: string;
  reason?: TenantCallbackReason;
  callerName?: string | null;
  callerPhone: string;
  topic?: string | null;
  callId?: string | null;
  transcriptExcerpt?: string | null;
}

const SELECT_COLS =
  "id, tenant_id, reason, caller_name, caller_phone, topic, call_id, transcript_excerpt, status, resolved_at, resolved_by, created_at";

/** Postgres unique_violation — derselbe Retell-Call kam doppelt rein. */
const PG_UNIQUE_VIOLATION = "23505";
/** PostgREST "no rows" bei .single() — Zeile existiert nicht (mehr). */
const PGRST_NO_ROWS = "PGRST116";

function errorCode(error: unknown): string | undefined {
  return (error as { code?: string } | null)?.code;
}

/**
 * Schreibt eine Nachricht/einen Rückruf. Idempotent über call_id: derselbe
 * Retell-Call erzeugt keine Duplikate (matcht den partiellen Unique-Index).
 * Gibt { created, callback } zurück — created=false, wenn bereits vorhanden.
 */
export async function insertTenantCallback(
  input: InsertTenantCallbackInput,
): Promise<{ created: boolean; callback: TenantCallback | null }> {
  const supabase = getServiceClient();

  // Idempotenz-Vorab-Check: vermeidet unnötige Conflict-Errors im Log, wenn
  // der Call schon erfasst ist. Der Unique-Index bleibt die harte Absicherung.
  if (input.callId) {
    const { data: existing } = await supabase
      .from("tenant_callbacks")
      .select(SELECT_COLS)
      .eq("call_id", input.callId)
      .maybeSingle();
    if (existing) {
      return { created: false, callback: existing as TenantCallback };
    }
  }

  const { data, error } = await supabase
    .from("tenant_callbacks")
    .insert({
      tenant_id: input.tenantId,
      reason: input.reason ?? "callback",
      caller_name: input.callerName ?? null,
      caller_phone: input.callerPhone,
      topic: input.topic ?? null,
      call_id: input.callId ?? null,
      transcript_excerpt: input.transcriptExcerpt ?? null,
    })
    .select(SELECT_COLS)
    .single();

  if (error) {
    // Race: zwei parallele Inserts desselben Calls. Nicht fatal.
    if (errorCode(error) === PG_UNIQUE_VIOLATION) {
      return { created: false, callback: null };
    }
    throw new Error(`tenant_callbacks insert failed: ${error.message}`);
  }

  return { created: true, callback: data as TenantCallback };
}

/**
 * Listet Nachrichten/Rückrufe eines Tenants (neueste zuerst, max 100).
 * status="pending" (default) | "resolved" | "dismissed" | "all".
 */
export async function listTenantCallbacks(
  tenantId: string,
  status: TenantCallbackStatus | "all" = "pending",
): Promise<TenantCallback[]> {
  const supabase = getServiceClient();
  let query = supabase
    .from("tenant_callbacks")
    .select(SELECT_COLS)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(`tenant_callbacks list failed: ${error.message}`);
  return (data ?? []) as TenantCallback[];
}

/**
 * Setzt den Status (resolve / dismiss / wieder öffnen). Tenant-scoped
 * (Defence in Depth neben RLS). resolved_at/by werden bei "pending"
 * zurückgesetzt. Gibt die aktualisierte Zeile zurück, null wenn nicht gefunden.
 */
export async function updateTenantCallbackStatus(args: {
  id: string;
  tenantId: string;
  status: TenantCallbackStatus;
  userId?: string | null;
}): Promise<TenantCallback | null> {
  const supabase = getServiceClient();
  const isOpen = args.status === "pending";

  const { data, error } = await supabase
    .from("tenant_callbacks")
    .update({
      status: args.status,
      resolved_at: isOpen ? null : new Date().toISOString(),
      resolved_by: isOpen ? null : (args.userId ?? null),
    })
    .eq("id", args.id)
    .eq("tenant_id", args.tenantId)
    .select(SELECT_COLS)
    .single();

  if (error) {
    if (errorCode(error) === PGRST_NO_ROWS) return null;
    throw new Error(`tenant_callbacks update failed: ${error.message}`);
  }
  return (data as TenantCallback) ?? null;
}
