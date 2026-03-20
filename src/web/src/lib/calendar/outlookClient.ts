import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";
import { encryptToken, decryptToken } from "@/src/lib/crypto/tokenEncryption";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BusySlot {
  start: string; // ISO UTC
  end: string;   // ISO UTC
}

export interface FreeBusyResult {
  /** Email that was queried */
  email: string;
  /** Busy time ranges */
  busy: BusySlot[];
  /** null = success, string = error reason */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Application token (client_credentials — no user login needed)
// ---------------------------------------------------------------------------

/**
 * Get an application-level access token using client_credentials grant.
 * This uses the app's own identity, not a user token.
 * Requires Calendars.Read APPLICATION permission + admin consent in Azure Portal.
 *
 * The MS tenant ID is stored in tenants.modules.calendar_ms_tenant_id.
 */
export async function getAccessToken(
  tenantId: string,
): Promise<{ token: string } | null> {
  const supabase = getServiceClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();

  if (!tenant) return null;

  const modules = (tenant.modules ?? {}) as Record<string, unknown>;
  const msTenantId = modules.calendar_ms_tenant_id as string | undefined;
  if (!msTenantId) return null;

  // Check cached app token
  const cachedToken = modules.calendar_app_token as string | undefined;
  const cachedExpires = modules.calendar_app_token_expires_at as string | undefined;
  if (cachedToken && cachedExpires) {
    const expiresAt = new Date(cachedExpires).getTime();
    if (expiresAt > Date.now() + 5 * 60 * 1000) {
      return { token: decryptToken(cachedToken) };
    }
  }

  // Fetch new app token
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const tokenUrl = `https://login.microsoftonline.com/${msTenantId}/oauth2/v2.0/token`;

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    console.error("[outlookClient] client_credentials failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const newExpires = new Date(Date.now() + data.expires_in * 1000).toISOString();

  // Cache the token (encrypted)
  await supabase
    .from("tenants")
    .update({
      modules: {
        ...modules,
        calendar_app_token: encryptToken(data.access_token),
        calendar_app_token_expires_at: newExpires,
      },
    })
    .eq("id", tenantId);

  return { token: data.access_token };
}

// ---------------------------------------------------------------------------
// Timezone helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Graph API local datetime string (Europe/Zurich, no offset)
 * to a UTC ISO string.
 */
function zurichToUtcIso(localDateTime: string): string {
  if (!localDateTime) return "";
  const trimmed = localDateTime.replace(/\.0+$/, "");
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return localDateTime;
  const [, yr, mo, dy, hh, mi, ss] = match;
  const asUtc = new Date(Date.UTC(+yr, +mo - 1, +dy, +hh, +mi, +ss));
  const zurichLocal = new Date(asUtc.toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
  const diffMs = zurichLocal.getTime() - asUtc.getTime();
  return new Date(asUtc.getTime() - diffMs).toISOString();
}

// ---------------------------------------------------------------------------
// Free/Busy query — per user via /users/{email}/calendarView
// ---------------------------------------------------------------------------

/**
 * Query Outlook calendar events for specific users via application permissions.
 * Uses GET /users/{email}/calendarView — reads ANY user's calendar in the tenant.
 * No user login needed, only app-level Calendars.Read permission.
 */
export async function getFreeBusy(
  accessToken: string,
  emails: string[],
  startTime: string,
  endTime: string,
): Promise<FreeBusyResult[]> {
  if (emails.length === 0) return [];

  const startUtc = zurichToUtcIso(startTime);
  const endUtc = zurichToUtcIso(endTime);

  // Query each user's calendar in parallel
  const results = await Promise.all(
    emails.map(async (email): Promise<FreeBusyResult> => {
      try {
        const params = new URLSearchParams({
          startDateTime: startUtc,
          endDateTime: endUtc,
          $select: "subject,start,end,showAs,isAllDay",
          $top: "50",
        });

        // Application permission: /users/{email} instead of /me
        const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(email)}/calendarView?${params}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: 'outlook.timezone="Europe/Zurich"',
          },
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`[outlookClient] calendarView for ${email} failed:`, res.status, body);
          return { email, busy: [], error: `Graph API ${res.status}` };
        }

        const data = await res.json();
        const busy: BusySlot[] = [];

        for (const event of data.value ?? []) {
          const showAs = (event.showAs ?? "busy") as string;
          if (showAs === "free") continue;

          const startLocal = event.start?.dateTime ?? "";
          const endLocal = event.end?.dateTime ?? "";
          if (startLocal && endLocal) {
            busy.push({
              start: zurichToUtcIso(startLocal),
              end: zurichToUtcIso(endLocal),
            });
          }
        }

        return { email, busy, error: null };
      } catch (e) {
        console.error(`[outlookClient] calendarView for ${email} error:`, e);
        return { email, busy: [], error: String(e) };
      }
    }),
  );

  return results;
}
