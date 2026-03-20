import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAccessToken, getFreeBusy } from "@/src/lib/calendar/outlookClient";

/**
 * GET /api/ops/calendar/debug?date=2026-04-01&staff=Gunnar Wende
 *
 * TEMPORARY diagnostic endpoint — admin only.
 * Returns raw Graph API response for debugging.
 */
export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId || !scope.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const date = req.nextUrl.searchParams.get("date") ?? "2026-04-01";
  const staffParam = req.nextUrl.searchParams.get("staff") ?? "";
  const steps: Record<string, unknown> = {};

  // Step 1: Get access token
  steps.tenant_id = scope.tenantId;
  const auth = await getAccessToken(scope.tenantId);
  steps.has_token = !!auth;
  if (!auth) {
    steps.reason = "getAccessToken returned null — no calendar connected or token refresh failed";
    return NextResponse.json(steps);
  }
  steps.token_preview = auth.token.substring(0, 20) + "...";

  // Step 2: Resolve staff
  const names = staffParam.split(",").map(n => n.trim()).filter(Boolean);
  steps.staff_names = names;

  const supabase = getServiceClient();
  const { data: staffRows } = await supabase
    .from("staff")
    .select("display_name, email")
    .eq("tenant_id", scope.tenantId)
    .eq("is_active", true);

  steps.all_staff = staffRows;

  const matched = (staffRows ?? []).filter(
    s => names.includes(s.display_name) && !!s.email,
  );
  steps.matched_staff = matched;

  if (matched.length === 0) {
    steps.reason = "No staff matched with email";
    return NextResponse.json(steps);
  }

  // Step 3: Call Graph getSchedule
  const emails = matched.map(s => s.email!);
  const startTime = `${date}T06:00:00`;
  const endTime = `${date}T20:00:00`;
  steps.graph_query = { emails, startTime, endTime };

  const results = await getFreeBusy(auth.token, emails, startTime, endTime);
  steps.graph_results = results;

  // Step 4: Also try raw calendarView for comparison
  try {
    const params = new URLSearchParams({
      startDateTime: `${startTime}Z`,
      endDateTime: `${endTime}Z`,
      $select: "subject,start,end,showAs,isAllDay",
      $top: "50",
    });
    const rawRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?${params}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          "Content-Type": "application/json",
          Prefer: 'outlook.timezone="Europe/Zurich"',
        },
      },
    );
    steps.raw_calendarView_status = rawRes.status;
    steps.raw_calendarView_body = await rawRes.json();
  } catch (e) {
    steps.raw_calendarView_error = String(e);
  }

  return NextResponse.json(steps, { status: 200 });
}
