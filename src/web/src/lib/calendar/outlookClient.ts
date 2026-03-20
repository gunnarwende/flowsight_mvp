import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";
import { encryptToken, decryptToken } from "@/src/lib/crypto/tokenEncryption";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BusySlot {
  start: string; // ISO
  end: string;   // ISO
}

export interface FreeBusyResult {
  /** Email that was queried */
  email: string;
  /** Busy time ranges */
  busy: BusySlot[];
  /** null = success, string = error reason */
  error: string | null;
}

interface CalendarModules {
  calendar_provider?: string;
  calendar_access_token?: string;
  calendar_refresh_token?: string;
  calendar_token_expires_at?: string;
  calendar_connected_email?: string;
  calendar_scopes?: string;
  calendar_connected_at?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Token refresh
// ---------------------------------------------------------------------------

const TOKEN_URL =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";

/**
 * Get a valid access token for the tenant, refreshing if expired.
 * Returns null if no calendar is connected.
 */
export async function getAccessToken(
  tenantId: string,
): Promise<{ token: string; modules: CalendarModules } | null> {
  const supabase = getServiceClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("modules")
    .eq("id", tenantId)
    .single();

  if (!tenant) return null;

  const modules = (tenant.modules ?? {}) as CalendarModules;
  if (modules.calendar_provider !== "microsoft" || !modules.calendar_access_token) {
    return null;
  }

  // Check if token is still valid (with 5-min buffer)
  const expiresAt = modules.calendar_token_expires_at
    ? new Date(modules.calendar_token_expires_at).getTime()
    : 0;
  const now = Date.now();

  if (expiresAt > now + 5 * 60 * 1000) {
    // Token still valid
    return { token: decryptToken(modules.calendar_access_token), modules };
  }

  // Token expired — refresh
  if (!modules.calendar_refresh_token) return null;

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const refreshToken = decryptToken(modules.calendar_refresh_token);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      scope: "offline_access Calendars.Read",
    }),
  });

  if (!res.ok) {
    console.error("[outlookClient] Token refresh failed:", res.status, await res.text());
    return null;
  }

  const tokens = await res.json();
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  // Persist refreshed tokens
  const updatedModules: CalendarModules = {
    ...modules,
    calendar_access_token: encryptToken(tokens.access_token),
    calendar_token_expires_at: newExpiresAt,
  };
  // Microsoft may rotate the refresh token
  if (tokens.refresh_token) {
    updatedModules.calendar_refresh_token = encryptToken(tokens.refresh_token);
  }

  await supabase
    .from("tenants")
    .update({ modules: updatedModules })
    .eq("id", tenantId);

  return { token: tokens.access_token, modules: updatedModules };
}

// ---------------------------------------------------------------------------
// Timezone helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Graph API local datetime string (Europe/Zurich, no offset)
 * to a UTC ISO string. Graph returns e.g. "2026-04-01T08:00:00.0000000"
 * which is Zurich local time. We need UTC for consistent handling.
 */
function zurichToUtcIso(localDateTime: string): string {
  if (!localDateTime) return "";
  const trimmed = localDateTime.replace(/\.0+$/, "");
  // Parse components to avoid system timezone interference
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return localDateTime;
  const [, yr, mo, dy, hh, mi, ss] = match;
  // Treat the parsed time as UTC initially
  const asUtc = new Date(Date.UTC(+yr, +mo - 1, +dy, +hh, +mi, +ss));
  // Find the Zurich-UTC offset at this point in time
  const zurichLocal = new Date(asUtc.toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
  const diffMs = zurichLocal.getTime() - asUtc.getTime();
  // Subtract the offset to convert Zurich local → real UTC
  return new Date(asUtc.getTime() - diffMs).toISOString();
}

// ---------------------------------------------------------------------------
// Free/Busy query — calendarView (works for all account types)
// ---------------------------------------------------------------------------

/**
 * Query Outlook calendar events for the signed-in user via calendarView.
 *
 * Uses GET /me/calendarView which works for ALL Microsoft account types
 * (Personal, Family, Business, Exchange Online). The older getSchedule
 * endpoint requires Exchange Online and fails with MailboxNotEnabledForRESTAPI
 * for personal/family accounts.
 *
 * Limitation: calendarView only reads the signed-in user's calendar.
 * For multi-user (admin reads technician calendars), Exchange Online
 * with getSchedule or application permissions would be needed.
 * For MVP: the connected admin's calendar is checked for all matching staff.
 */
export async function getFreeBusy(
  accessToken: string,
  emails: string[],
  startTime: string,
  endTime: string,
): Promise<FreeBusyResult[]> {
  if (emails.length === 0) return [];

  // calendarView needs UTC ISO or datetime with timezone
  // Our startTime/endTime are like "2026-04-01T06:00:00" (Zurich local)
  const startUtc = zurichToUtcIso(startTime);
  const endUtc = zurichToUtcIso(endTime);

  const params = new URLSearchParams({
    startDateTime: startUtc,
    endDateTime: endUtc,
    $select: "subject,start,end,showAs,isAllDay",
    $top: "50",
  });

  const url = `https://graph.microsoft.com/v1.0/me/calendarView?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: 'outlook.timezone="Europe/Zurich"',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[outlookClient] calendarView failed:", res.status, body);
    return emails.map((email) => ({
      email,
      busy: [],
      error: `Graph API ${res.status}`,
    }));
  }

  const data = await res.json();
  const busy: BusySlot[] = [];

  for (const event of data.value ?? []) {
    // showAs: free, tentative, busy, oof, workingElsewhere, unknown
    // Skip events marked as "free"
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

  // Return the same busy slots for all requested emails
  // (calendarView = signed-in user's calendar, applied to matching staff)
  return emails.map((email) => ({
    email,
    busy,
    error: null,
  }));
}
