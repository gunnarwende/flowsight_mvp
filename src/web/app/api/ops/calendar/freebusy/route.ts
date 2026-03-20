import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAccessToken, getFreeBusy } from "@/src/lib/calendar/outlookClient";

/**
 * GET /api/ops/calendar/freebusy?date=2026-03-21&staff=Ramon D.,Stefan M.
 *
 * Returns Outlook busy slots for the given date and staff members.
 * Maps staff display_name → staff.email → Graph getSchedule.
 *
 * Response: { connected: boolean, slots: { name, email, busy: [{start,end}] }[] }
 */

// Simple in-memory cache (per serverless invocation — short-lived, but avoids
// duplicate calls within the same request cycle or rapid re-renders)
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD
  const staffParam = req.nextUrl.searchParams.get("staff"); // comma-separated names

  if (!date || !staffParam) {
    return NextResponse.json({ connected: false, slots: [] });
  }

  // Build day window (full day in Europe/Zurich)
  const startTime = `${date}T06:00:00`;
  const endTime = `${date}T20:00:00`;

  // Check cache
  const cacheKey = `${scope.tenantId}:${date}:${staffParam}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // Get access token (auto-refreshes if needed)
  const auth = await getAccessToken(scope.tenantId);
  if (!auth) {
    return NextResponse.json({ connected: false, slots: [] });
  }

  // Resolve staff names → emails
  const names = staffParam.split(",").map((n) => n.trim()).filter(Boolean);
  const supabase = getServiceClient();
  const { data: staffRows } = await supabase
    .from("staff")
    .select("display_name, email")
    .eq("tenant_id", scope.tenantId)
    .eq("is_active", true)
    .in("display_name", names);

  const staffWithEmail = (staffRows ?? []).filter(
    (s): s is { display_name: string; email: string } => !!s.email,
  );

  if (staffWithEmail.length === 0) {
    return NextResponse.json({ connected: true, slots: [] });
  }

  // Query Microsoft Graph
  const emails = staffWithEmail.map((s) => s.email);
  const results = await getFreeBusy(auth.token, emails, startTime, endTime);

  // Map back to display names
  const emailToName = new Map(staffWithEmail.map((s) => [s.email.toLowerCase(), s.display_name]));
  const slots = results.map((r) => ({
    name: emailToName.get(r.email.toLowerCase()) ?? r.email,
    email: r.email,
    busy: r.busy,
    error: r.error,
  }));

  const response = { connected: true, slots };

  // Cache the result
  cache.set(cacheKey, { data: response, ts: Date.now() });

  return NextResponse.json(response);
}
