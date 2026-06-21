import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export const dynamic = "force-dynamic";

/** Erlaubte, vom Tool geloggte Ereignistypen (Funnel-Verlauf). */
const EVENT_TYPES = new Set([
  "call_dialed", "call_reached", "call_no_answer", "ja_to_sim",
  "warm_call", "note",
]);

/**
 * POST /api/ceo/journey/event
 * Body: { lead_id?: string, event_type: string, payload?: object, lead_status?: string }
 *
 * Schreibt ein journey_event (append-only) und — wenn lead_status mitkommt —
 * setzt zugleich den Lead-Status (z.B. "ja"/"abgelehnt"/"rueckruf"). So wird
 * aus jedem Anruf ein echtes Funnel-Signal, das CC + das Tool lesen können.
 */
export async function POST(req: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { lead_id?: string; event_type?: string; payload?: Record<string, unknown>; lead_status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.event_type || !EVENT_TYPES.has(body.event_type)) {
    return NextResponse.json({ error: "valid event_type required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { error: evErr } = await supabase.from("journey_events").insert({
    lead_id: body.lead_id ?? null,
    event_type: body.event_type,
    payload: body.payload ?? {},
    source: "manual",
  });
  if (evErr) {
    return NextResponse.json({ error: evErr.message }, { status: 500 });
  }

  // Optional: Lead-Status + letzter_kontakt mitziehen
  if (body.lead_id && body.lead_status) {
    await supabase
      .from("leads")
      .update({
        status: body.lead_status,
        letzter_kontakt: new Date().toISOString().slice(0, 10),
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.lead_id);
  }

  return NextResponse.json({ ok: true });
}
