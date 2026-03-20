import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAccessToken, getFreeBusy } from "@/src/lib/calendar/outlookClient";

/**
 * GET /api/ops/calendar/debug?date=2026-04-01&staff=Gunnar Wende
 *
 * TEMPORARY diagnostic endpoint — admin only.
 * Tests multiple Graph endpoints to isolate the issue.
 */
export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId || !scope.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const date = req.nextUrl.searchParams.get("date") ?? "2026-04-01";
  const staffParam = req.nextUrl.searchParams.get("staff") ?? "";
  const steps: Record<string, unknown> = {};

  steps.tenant_id = scope.tenantId;
  const auth = await getAccessToken(scope.tenantId);
  steps.has_token = !!auth;
  if (!auth) {
    steps.reason = "No token";
    return NextResponse.json(steps);
  }

  const token = auth.token;

  // ── Test 0: Decode JWT to see who the token belongs to ───────────────
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      steps.jwt_claims = {
        upn: payload.upn,           // user principal name
        unique_name: payload.unique_name,
        email: payload.email,
        preferred_username: payload.preferred_username,
        oid: payload.oid,           // object ID
        tid: payload.tid,           // tenant ID
        aud: payload.aud,           // audience (should be graph.microsoft.com)
        scp: payload.scp,           // scopes granted
        app_displayname: payload.app_displayname,
        iss: payload.iss,           // issuer
      };
    }
  } catch {
    steps.jwt_decode_error = "Could not decode JWT";
  }

  // ── Test A: /me profile — WHO is this token for? ─────────────────────
  try {
    const r = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    steps.me_status = r.status;
    steps.me_body = await r.json();
  } catch (e) {
    steps.me_error = String(e);
  }

  // ── Test B: /me/mailboxSettings — is mailbox accessible? ─────────────
  try {
    const r = await fetch("https://graph.microsoft.com/v1.0/me/mailboxSettings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    steps.mailbox_status = r.status;
    steps.mailbox_body = await r.json();
  } catch (e) {
    steps.mailbox_error = String(e);
  }

  // ── Test C: /me/calendars — list calendars ───────────────────────────
  try {
    const r = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
      headers: { Authorization: `Bearer ${token}` },
    });
    steps.calendars_status = r.status;
    steps.calendars_body = await r.json();
  } catch (e) {
    steps.calendars_error = String(e);
  }

  // ── Test D: /me/calendarView — the actual endpoint we need ───────────
  try {
    const startTime = `${date}T06:00:00`;
    const endTime = `${date}T20:00:00`;
    const params = new URLSearchParams({
      startDateTime: `${startTime}Z`,
      endDateTime: `${endTime}Z`,
      $select: "subject,start,end,showAs,isAllDay",
      $top: "50",
    });
    const r = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: 'outlook.timezone="Europe/Zurich"',
        },
      },
    );
    steps.calendarView_status = r.status;
    steps.calendarView_body = await r.json();
  } catch (e) {
    steps.calendarView_error = String(e);
  }

  // ── Test E: /me/events — simpler events list ─────────────────────────
  try {
    const r = await fetch(
      "https://graph.microsoft.com/v1.0/me/events?$top=5&$select=subject,start,end,showAs",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'outlook.timezone="Europe/Zurich"',
        },
      },
    );
    steps.events_status = r.status;
    steps.events_body = await r.json();
  } catch (e) {
    steps.events_error = String(e);
  }

  // ── Test F: getFreeBusy via our lib ──────────────────────────────────
  const names = staffParam.split(",").map(n => n.trim()).filter(Boolean);
  const supabase = getServiceClient();
  const { data: staffRows } = await supabase
    .from("staff")
    .select("display_name, email")
    .eq("tenant_id", scope.tenantId)
    .eq("is_active", true);

  steps.staff = staffRows;
  const matched = (staffRows ?? []).filter(
    s => names.includes(s.display_name) && !!s.email,
  );
  if (matched.length > 0) {
    const emails = matched.map(s => s.email!);
    const results = await getFreeBusy(token, emails, `${date}T06:00:00`, `${date}T20:00:00`);
    steps.freebusy_results = results;
  }

  return NextResponse.json(steps, { status: 200 });
}
