import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { dispatch, setSetting, GARMIN_AUTH_WORKFLOW, GARMIN_SYNC_WORKFLOW } from "@/src/lib/leben/garmin";

// POST /api/ceo/leben/garmin/connect — Garmin verbinden.
//
// Zwei Wege:
//  (A) { token }            -> EMPFOHLEN. Lokal erzeugtes garth-Token direkt
//                              hinterlegen (umgeht die 429-Drossel auf Server-IPs)
//                              und sofort einen Abruf anstossen.
//  (B) { email, password, mfa? } -> Login via Server-Workflow (garmin-auth.yml);
//                              funktioniert nur, wenn Garmin die Server-IP nicht
//                              drosselt. Bleibt als Fallback erhalten.
export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { token?: string; email?: string; password?: string; mfa?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // (A) Lokal erzeugtes Token direkt hinterlegen.
  const token = (body.token ?? "").trim();
  if (token) {
    if (token.length < 20) {
      return NextResponse.json({ error: "token_too_short" }, { status: 400 });
    }
    await setSetting("garmin_token", { token, source: "local" });
    // Sofort einen Abruf anstossen (best effort).
    await dispatch(GARMIN_SYNC_WORKFLOW, { limit: "30" });
    return NextResponse.json({ ok: true, mode: "token", at: new Date().toISOString() });
  }

  // (B) Login via Server-Workflow (Fallback).
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";
  const mfa = (body.mfa ?? "").trim();
  if (!email || !password) {
    return NextResponse.json({ error: "token_or_credentials_required" }, { status: 400 });
  }

  const result = await dispatch(GARMIN_AUTH_WORKFLOW, { email, password, mfa });
  if (!result.ok) {
    return NextResponse.json({ error: "dispatch_failed", detail: result.body }, { status: 502 });
  }
  return NextResponse.json({ ok: true, mode: "login", dispatched: true, at: new Date().toISOString() });
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
