import "server-only";

import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Strava-Anbindung fuer die Sektion "Leben" / Running.
// Garmin -> (Auto-Sync) -> Strava -> diese Helfer -> life_activities.
// Offizielle Strava-API, OAuth (kein Garmin-Passwort gespeichert).
// Token in life_settings.strava_token; Aktivitaeten quell-agnostisch
// (source='strava', external_id=<strava id>).
// Docs: https://developers.strava.com/docs/reference/
// ---------------------------------------------------------------------------

const STRAVA_OAUTH = "https://www.strava.com/oauth/token";
export const STRAVA_AUTHORIZE = "https://www.strava.com/oauth/authorize";
const STRAVA_API = "https://www.strava.com/api/v3";

/** Scope: Profil lesen + alle Aktivitaeten (auch privat). */
export const STRAVA_SCOPE = "read,activity:read_all";

export function stravaConfigured(): boolean {
  return Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET);
}

export function webhookVerifyToken(): string {
  return process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || "flowsight-leben";
}

/** Basis-URL der App (fuer Redirect-/Callback-URLs). */
export function appOrigin(req: Request): string {
  const env = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

interface StravaToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch seconds
  athlete_id?: number;
  athlete_name?: string | null;
  scope?: string;
}

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number; firstname?: string; lastname?: string };
}

async function readToken(): Promise<StravaToken | null> {
  const supabase = getServiceClient();
  const { data } = await supabase.from("life_settings").select("value").eq("key", "strava_token").maybeSingle();
  return (data?.value as StravaToken | null) ?? null;
}

async function writeToken(tok: StravaToken): Promise<StravaToken> {
  const supabase = getServiceClient();
  await supabase
    .from("life_settings")
    .upsert({ key: "strava_token", value: tok, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return tok;
}

/** Code (aus OAuth-Callback) gegen Tokens tauschen und speichern. */
export async function exchangeCode(code: string): Promise<StravaToken> {
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
  return writeToken({
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
    athlete_id: json.athlete?.id,
    athlete_name,
    scope: STRAVA_SCOPE,
  });
}

/** Aktuell verbundener Athlet (oder null). */
export async function getTokenRow(): Promise<StravaToken | null> {
  return readToken();
}

/** Gueltiges Access-Token; bei Ablauf automatisch refreshen. */
export async function getValidAccessToken(): Promise<StravaToken | null> {
  const tok = await readToken();
  if (!tok) return null;
  const now = Math.floor(Date.now() / 1000);
  if (tok.expires_at > now + 120) return tok;

  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: tok.refresh_token,
    }),
  });
  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status} ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as StravaTokenResponse;
  return writeToken({
    ...tok,
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_at,
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type StravaActivity = Record<string, any>;

/** Eine Aktivitaet per ID holen (Detail). */
export async function fetchActivity(id: number | string): Promise<StravaActivity | null> {
  const token = await getValidAccessToken();
  if (!token) return null;
  const res = await fetch(`${STRAVA_API}/activities/${id}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as StravaActivity;
}

/** Liste der letzten Aktivitaeten (fuer Backfill). */
export async function fetchRecentActivities(perPage = 30, page = 1): Promise<StravaActivity[]> {
  const token = await getValidAccessToken();
  if (!token) return [];
  const res = await fetch(`${STRAVA_API}/athlete/activities?per_page=${perPage}&page=${page}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!res.ok) return [];
  return (await res.json()) as StravaActivity[];
}

/** Strava-Aktivitaet -> life_activities (quell-agnostisch). */
export async function upsertActivity(a: StravaActivity): Promise<void> {
  if (!a?.id) return;
  const supabase = getServiceClient();
  await supabase.from("life_activities").upsert(
    {
      source: "strava",
      external_id: String(a.id),
      sport_type: a.sport_type ?? a.type ?? null,
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
      updated_at: new Date().toISOString(),
    },
    { onConflict: "source,external_id" },
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Letzte N Aktivitaeten holen und speichern (Backfill). */
export async function backfill(perPage = 30): Promise<number> {
  const acts = await fetchRecentActivities(perPage, 1);
  for (const a of acts) await upsertActivity(a);
  return acts.length;
}

/** Strava trennen: Token loeschen (Aktivitaeten bleiben). */
export async function disconnect(): Promise<void> {
  const supabase = getServiceClient();
  await supabase.from("life_settings").delete().in("key", ["strava_token", "strava_subscription"]);
}
