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
// Free/Busy query via Microsoft Graph getSchedule
// ---------------------------------------------------------------------------

const GRAPH_SCHEDULE_URL =
  "https://graph.microsoft.com/v1.0/me/calendar/getSchedule";

/**
 * Query Outlook free/busy for one or more email addresses.
 *
 * @param accessToken - Valid Microsoft Graph access token
 * @param emails - Outlook email addresses to query
 * @param startTime - Start of time window (ISO)
 * @param endTime - End of time window (ISO)
 * @returns FreeBusyResult per email
 */
export async function getFreeBusy(
  accessToken: string,
  emails: string[],
  startTime: string,
  endTime: string,
): Promise<FreeBusyResult[]> {
  if (emails.length === 0) return [];

  const res = await fetch(GRAPH_SCHEDULE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      schedules: emails,
      startTime: { dateTime: startTime, timeZone: "Europe/Zurich" },
      endTime: { dateTime: endTime, timeZone: "Europe/Zurich" },
      availabilityViewInterval: 15, // 15-min granularity
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[outlookClient] getSchedule failed:", res.status, body);
    return emails.map((email) => ({
      email,
      busy: [],
      error: `Graph API ${res.status}`,
    }));
  }

  const data = await res.json();
  const results: FreeBusyResult[] = [];

  for (const schedule of data.value ?? []) {
    const email = schedule.scheduleId as string;
    const busy: BusySlot[] = [];

    for (const item of schedule.scheduleItems ?? []) {
      // Include busy, tentative, oof — not free
      if (item.status !== "free") {
        busy.push({
          start: item.start?.dateTime ?? "",
          end: item.end?.dateTime ?? "",
        });
      }
    }

    results.push({ email, busy, error: null });
  }

  return results;
}
