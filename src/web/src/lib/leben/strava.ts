import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Strava-Bruecke fuer die Sektion "Leben" / Running.
// Garmin -> (Auto-Sync) -> Strava -> diese Helfer -> life_activities.
// Offizielle Strava-API, OAuth (kein Garmin-Passwort gespeichert).
// Docs: https://developers.strava.com/docs/reference/
// ---------------------------------------------------------------------------

const STRAVA_OAUTH = "https://www.strava.com/oauth/token";
export const STRAVA_AUTHORIZE = "https://www.strava.com/oauth/authorize";
const STRAVA_API = "https://www.strava.com/api/v3";

/** Scope, den wir anfragen: Profil lesen + alle Aktivitaeten (auch privat). */
export const STRAVA_SCOPE = "read,activity:read_all";

export function stravaConfigured(): boolean {
  return Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
}

export function webhookVerifyToken(): string {
  return process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || "flowsight-leben";
}

/** Basis-URL der App (fuer Redirect-/Callback-URLs). Aus der Anfrage abgeleitet. */
export function appOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

interface TokenRow {
  athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string | null;
  athlete_name: string | null;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; firstname?: string; lastname?: string };
}

/** Code (aus OAuth-Callback) gegen Tokens tauschen und speichern. */
export async function exchangeCode(code: string): Promise<TokenRow> {
  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as StravaTokenResponse;
  const athlete_name = json.athlete
    ? [json.athlete.firstname, json.athlete.lastname].filter(Boolean).join(" ").trim() || null
    : null;
  return persistToken({
    athlete_id: json.athlete?.id ?? 0,
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
    scope: STRAVA_SCOPE,
    athlete_name,
  });
}

async function persistToken(row: TokenRow): Promise<TokenRow> {
  const supabase = getServiceClient();
  await supabase
    .from("life_strava_tokens")
    .upsert(
      {
        athlete_id: row.athlete_id,
        access_token: row.access_token,
        refresh_token: row.refresh_token,
        expires_at: row.expires_at,
        scope: row.scope,
        athlete_name: row.athlete_name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "athlete_id" },
    );
  return row;
}

/** Aktuell verbundenen Athleten laden (oder null). */
export async function getTokenRow(): Promise<TokenRow | null> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("life_strava_tokens")
    .select("athlete_id, access_token, refresh_token, expires_at, scope, athlete_name")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as TokenRow | null) ?? null;
}

/** Gueltiges Access-Token zurueckgeben; bei Ablauf automatisch refreshen. */
export async function getValidAccessToken(): Promise<TokenRow | null> {
  const row = await getTokenRow();
  if (!row) return null;
  const now = Math.floor(Date.now() / 1000);
  if (row.expires_at > now + 120) return row; // noch >2 Min gueltig

  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as StravaTokenResponse;
  return persistToken({
    athlete_id: row.athlete_id,
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
    scope: row.scope,
    athlete_name: row.athlete_name,
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type StravaActivity = Record<string, any>;

/** Eine Aktivitaet per ID von Strava holen (Detail). */
export async function fetchActivity(id: number | string): Promise<StravaActivity | null> {
  const token = await getValidAccessToken();
  if (!token) return null;
  const res = await fetch(`${STRAVA_API}/activities/${id}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as StravaActivity;
}

/** Liste der letzten Aktivitaeten (fuer Backfill nach dem Verbinden). */
export async function fetchRecentActivities(perPage = 30, page = 1): Promise<StravaActivity[]> {
  const token = await getValidAccessToken();
  if (!token) return [];
  const res = await fetch(`${STRAVA_API}/athlete/activities?per_page=${perPage}&page=${page}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) return [];
  return (await res.json()) as StravaActivity[];
}

/** Strava-Aktivitaet in unser Schema mappen und in life_activities upserten. */
export async function upsertActivity(a: StravaActivity): Promise<void> {
  if (!a?.id) return;
  const supabase = getServiceClient();
  await supabase.from("life_activities").upsert(
    {
      strava_id: a.id,
      athlete_id: a.athlete?.id ?? null,
      sport_type: a.sport_type ?? a.type ?? null,
      type: a.type ?? null,
      name: a.name ?? null,
      start_time: a.start_date ?? null,
      start_time_local: a.start_date_local ?? null,
      distance_m: a.distance ?? null,
      moving_time_s: a.moving_time ?? null,
      elapsed_time_s: a.elapsed_time ?? null,
      elevation_gain_m: a.total_elevation_gain ?? null,
      avg_hr: a.average_heartrate ?? null,
      max_hr: a.max_heartrate ?? null,
      avg_speed_ms: a.average_speed ?? null,
      calories: a.calories ?? null,
      raw: a,
      source: "strava",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "strava_id" },
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Letzte N Aktivitaeten holen und speichern (Backfill). Gibt Anzahl zurueck. */
export async function backfill(perPage = 30): Promise<number> {
  const acts = await fetchRecentActivities(perPage, 1);
  for (const a of acts) {
    // Aktivitaeten-Liste enthaelt bereits die Kernfelder; Detail nicht noetig.
    await upsertActivity(a);
  }
  return acts.length;
}

/** Strava-Konto trennen: Tokens loeschen (Aktivitaeten bleiben erhalten). */
export async function disconnect(): Promise<void> {
  const supabase = getServiceClient();
  await supabase.from("life_strava_tokens").delete().neq("athlete_id", -1);
}
