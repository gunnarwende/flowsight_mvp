import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAccessToken, getFreeBusy } from "@/src/lib/calendar/outlookClient";

/**
 * GET /api/ops/calendar/debug?date=2026-04-01&staff=Gunnar Wende
 *
 * TEMPORARY diagnostic endpoint — admin only.
 * Tests application-permission based Graph access.
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

  // Step 1: Get app token (client_credentials)
  const auth = await getAccessToken(scope.tenantId);
  steps.has_token = !!auth;
  if (!auth) {
    steps.reason = "getAccessToken returned null — check calendar_ms_tenant_id in modules + MICROSOFT_CLIENT_ID/SECRET";
    return NextResponse.json(steps);
  }

  const token = auth.token;

  // Decode JWT to verify it's an app token
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      steps.jwt_claims = {
        app_id: payload.appid,
        aud: payload.aud,
        tid: payload.tid,
        roles: payload.roles,       // should include "Calendars.Read"
        iss: payload.iss,
      };
    }
  } catch {
    steps.jwt_decode_error = "Could not decode JWT";
  }

  // Step 2: Resolve staff
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
  steps.matched_staff = matched;

  if (matched.length === 0) {
    steps.reason = "No staff matched";
    return NextResponse.json(steps);
  }

  // Step 3: Query calendarView per user
  const emails = matched.map(s => s.email!);
  const startTime = `${date}T06:00:00`;
  const endTime = `${date}T20:00:00`;
  steps.graph_query = { emails, startTime, endTime };

  const results = await getFreeBusy(token, emails, startTime, endTime);
  steps.freebusy_results = results;

  // Step 4: Raw test for first email
  const testEmail = emails[0];
  try {
    const params = new URLSearchParams({
      startDateTime: `${startTime}Z`,
      endDateTime: `${endTime}Z`,
      $select: "subject,start,end,showAs",
      $top: "10",
    });
    const r = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(testEmail)}/calendarView?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: 'outlook.timezone="Europe/Zurich"',
        },
      },
    );
    steps.raw_status = r.status;
    steps.raw_body = await r.json();
  } catch (e) {
    steps.raw_error = String(e);
  }

  return NextResponse.json(steps, { status: 200 });
}
