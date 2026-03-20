import { NextResponse } from "next/server";
import { randomBytes, createHmac } from "crypto";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/calendar/connect
 *
 * Starts the Microsoft OAuth 2.0 Authorization Code flow.
 * Redirects the admin to Microsoft's consent screen.
 *
 * Required env vars:
 *   MICROSOFT_CLIENT_ID      — Azure App Registration (multi-tenant)
 *   MICROSOFT_CLIENT_SECRET   — Azure App Registration secret
 *   APP_URL                   — Canonical app URL for callback
 *   CALENDAR_ENCRYPTION_KEY   — Used to HMAC-sign the state parameter
 *
 * Callback: /api/ops/calendar/callback (exchanges code → encrypted tokens)
 */

// Microsoft OAuth endpoints (multi-tenant = "common")
const AUTHORIZE_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";

// Phase 1: read-only calendar availability
const SCOPES = [
  "offline_access",  // needed for refresh tokens
  "User.Read",       // read profile (connected email in callback)
  "Calendars.Read",  // read calendar events via calendarView
].join(" ");

function getRequiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

/**
 * Build a signed state parameter: `tenantId:nonce:signature`
 *
 * The state ties the OAuth callback to a specific tenant and prevents CSRF.
 * Signature uses CALENDAR_ENCRYPTION_KEY as HMAC key — same secret,
 * different purpose (HMAC vs AES). Avoids needing yet another env var.
 */
function buildState(tenantId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${tenantId}:${nonce}`;
  const key = getRequiredEnv("CALENDAR_ENCRYPTION_KEY");
  const sig = createHmac("sha256", key).update(payload).digest("hex");
  return `${payload}:${sig}`;
}

export async function GET() {
  // 1. Auth check — admin only
  const scope = await resolveTenantScope();
  if (!scope?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!scope.isAdmin) {
    return NextResponse.json(
      { error: "Nur Admins können den Kalender verbinden" },
      { status: 403 },
    );
  }

  // 2. Validate env vars — fail fast with clear message
  let clientId: string;
  let appUrl: string;
  try {
    clientId = getRequiredEnv("MICROSOFT_CLIENT_ID");
    getRequiredEnv("MICROSOFT_CLIENT_SECRET"); // needed later in callback
    appUrl = getRequiredEnv("APP_URL");
    getRequiredEnv("CALENDAR_ENCRYPTION_KEY");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Config error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 3. Build redirect URL
  const redirectUri = `${appUrl}/api/ops/calendar/callback`;
  const state = buildState(scope.tenantId);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: SCOPES,
    state,
    prompt: "select_account", // let user pick account — consent is auto for Calendars.Read
  });

  const authorizeUrl = `${AUTHORIZE_URL}?${params.toString()}`;

  // 4. Redirect to Microsoft
  return NextResponse.redirect(authorizeUrl);
}
