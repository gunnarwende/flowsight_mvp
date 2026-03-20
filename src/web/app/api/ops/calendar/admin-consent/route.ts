import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/calendar/admin-consent
 *
 * One-time admin consent for the FlowSight Calendar app.
 * Uses the v2 /adminconsent endpoint (not /authorize with prompt=admin_consent).
 * After this, individual users can connect without admin-consent redirect.
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

  const redirectUri = `${appUrl}/api/ops/calendar/callback`;

  // v2 admin consent endpoint — separate from /authorize
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "offline_access User.Read Calendars.Read",
    state: "admin-consent",
  });

  const url = `https://login.microsoftonline.com/common/adminconsent?${params}`;

  return NextResponse.redirect(url);
}
