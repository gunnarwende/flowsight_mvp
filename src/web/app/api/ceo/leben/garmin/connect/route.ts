import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { dispatch, GARMIN_AUTH_WORKFLOW } from "@/src/lib/leben/garmin";

// POST /api/ceo/leben/garmin/connect — einmaliger Login.
// Body: { email, password, mfa? }. Loest den Auth-Workflow aus: garth meldet sich
// EINMAL an, tauscht gegen ein widerrufbares Token (in life_settings.garmin_token)
// und macht einen ersten Backfill. Das Passwort wird von uns NICHT gespeichert —
// es wird nur transient an den Workflow gereicht, um das Token zu erzeugen.
export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { email?: string; password?: string; mfa?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  const mfa = (body.mfa ?? "").trim();
  if (!email || !password) {
    return NextResponse.json({ error: "email_password_required" }, { status: 400 });
  }

  const result = await dispatch(GARMIN_AUTH_WORKFLOW, { email, password, mfa });
  if (!result.ok) {
    return NextResponse.json({ error: "dispatch_failed", detail: result.body }, { status: 502 });
  }
  return NextResponse.json({ ok: true, dispatched: true, at: new Date().toISOString() });
}

// DELETE /api/ceo/leben/garmin/connect — Verbindung trennen (Token loeschen).
export async function DELETE() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  await supabase.from("life_settings").delete().in("key", ["garmin_token", "garmin_last_sync"]);
  return NextResponse.json({ ok: true });
}
