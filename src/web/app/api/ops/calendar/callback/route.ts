import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getServiceClient } from "@/src/lib/supabase/server";
import { encryptToken } from "@/src/lib/crypto/tokenEncryption";

/**
 * GET /api/ops/calendar/callback?code=...&state=...
 *
 * Microsoft OAuth 2.0 callback. Exchanges authorization code for tokens,
 * encrypts them, and stores the calendar connection in tenants.modules.
 *
 * After success → redirect to /ops/settings (admin sees green status).
 * After error → redirect to /ops/settings?calendar_error=<reason>.
 */

const TOKEN_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";

const SETTINGS_PATH = "/ops/settings";

function getRequiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

/**
 * Validate signed state: `tenantId:nonce:signature`
 * Returns tenantId if valid, null if tampered/invalid.
 */
function validateState(state: string): string | null {
  const parts = state.split(":");
  if (parts.length !== 3) return null;

  const [tenantId, nonce, providedSig] = parts;
  if (!tenantId || !nonce || !providedSig) return null;

  const key = getRequiredEnv("CALENDAR_ENCRYPTION_KEY");
  const payload = `${tenantId}:${nonce}`;
  const expectedSig = createHmac("sha256", key).update(payload).digest("hex");

  // Timing-safe comparison
  try {
    const expected = Buffer.from(expectedSig, "hex");
    const provided = Buffer.from(providedSig, "hex");
    if (expected.length !== provided.length) return null;
    if (!timingSafeEqual(expected, provided)) return null;
  } catch {
    return null;
  }

  return tenantId;
}

/**
 * Exchange authorization code for access + refresh tokens.
 */
async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getRequiredEnv("MICROSOFT_CLIENT_ID"),
      client_secret: getRequiredEnv("MICROSOFT_CLIENT_SECRET"),
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      scope: "offline_access Calendars.Read",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${body}`);
  }

  return res.json();
}

/**
 * Fetch the connected Microsoft account's email (for display in settings).
 */
async function fetchConnectedEmail(accessToken: string): Promise<string> {
  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const profile = await res.json();
      return profile.mail || profile.userPrincipalName || "unknown";
    }
  } catch {
    // Non-critical — we still have valid tokens
  }
  return "unknown";
}

export async function GET(req: NextRequest) {
  const appUrl = getRequiredEnv("APP_URL");
  const settingsUrl = `${appUrl}${SETTINGS_PATH}`;

  // 1. Read query params
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  // Microsoft sends error param if user denied consent
  if (error) {
    const desc = req.nextUrl.searchParams.get("error_description") || error;
    console.error("[calendar/callback] Microsoft error:", desc);
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=consent_denied`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=missing_params`,
    );
  }

  // 2. Validate state (CSRF + tenant binding)
  const tenantId = validateState(state);
  if (!tenantId) {
    console.error("[calendar/callback] Invalid state parameter");
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=invalid_state`,
    );
  }

  // 3. Exchange code for tokens
  const redirectUri = `${appUrl}/api/ops/calendar/callback`;
  let tokens;
  try {
    tokens = await exchangeCode(code, redirectUri);
  } catch (e) {
    console.error("[calendar/callback] Token exchange failed:", e);
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=token_exchange`,
    );
  }

  if (!tokens.refresh_token) {
    console.error("[calendar/callback] No refresh token received");
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=no_refresh_token`,
    );
  }

  // 4. Fetch connected account email (best-effort)
  const connectedEmail = await fetchConnectedEmail(tokens.access_token);

  // 5. Encrypt tokens + persist in tenants.modules
  const now = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + tokens.expires_in * 1000,
  ).toISOString();

  const supabase = getServiceClient();

  // Read current modules to merge (don't overwrite other settings)
  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();

  if (!tenant) {
    console.error("[calendar/callback] Tenant not found:", tenantId);
    return NextResponse.redirect(
      `${settingsUrl}?calendar_error=tenant_not_found`,
    );
  }

  const modules = {
    ...((tenant.modules ?? {}) as Record<string, unknown>),
    calendar_provider: "microsoft",
    calendar_connected_email: connectedEmail,
    calendar_connected_at: now,
    calendar_access_token: encryptToken(tokens.access_token),
    calendar_refresh_token: encryptToken(tokens.refresh_token),
    calendar_token_expires_at: expiresAt,
    calendar_scopes: tokens.scope,
  };

  const { error: updateError } = await supabase
    .from("tenants")
    .update({ modules })
    .eq("id", tenantId);

  if (updateError) {
    console.error("[calendar/callback] DB update failed:", updateError);
    return NextResponse.redirect(`${settingsUrl}?calendar_error=db_save`);
  }

  // 6. Success → redirect to settings
  return NextResponse.redirect(`${settingsUrl}?calendar_connected=true`);
}
