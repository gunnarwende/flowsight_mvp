import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/calendar/admin-consent
 *
 * One-time admin consent for the FlowSight Calendar app.
 * This grants Calendars.Read + User.Read for ALL users in the organization.
 * After this, individual users can connect without admin-consent redirect.
 *
 * Must be called ONCE by a Global Admin before /connect works for regular users.
 */
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId || !scope.isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  if (!clientId || !appUrl) {
    return NextResponse.json({ error: "Missing MICROSOFT_CLIENT_ID or APP_URL" }, { status: 500 });
  }

  // Microsoft admin consent endpoint — grants permissions org-wide
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/ops/calendar/callback`,
    scope: "offline_access User.Read Calendars.Read",
    state: "admin-consent",     // callback will recognize this and redirect to settings
    response_type: "code",
    prompt: "admin_consent",    // explicit admin consent for the organization
  });

  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;

  return NextResponse.redirect(url);
}
