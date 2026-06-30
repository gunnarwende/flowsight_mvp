import { NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";

// GET /api/ceo/leben/running — Laeufe + Wochenstatistik + Jungfrau-Countdown.

// Sport-Typen, die als "Lauf" ins Wochen-Volumen zaehlen.
// Strava (CamelCase) + Garmin (typeKey, lowercase) — life_activities ist quell-agnostisch.
const RUN_TYPES = new Set([
  // Strava sport_type
  "Run",
  "TrailRun",
  "VirtualRun",
  // Garmin activityType.typeKey
  "running",
  "trail_running",
  "treadmill_running",
  "track_running",
  "virtual_run",
  "indoor_running",
  "obstacle_run",
]);
const DEFAULT_RACE = { date: "2026-09-05", name: "Jungfrau-Marathon" };

interface ActivityRow {
  id: string;
  external_id: string;
  source: string | null;
  sport_type: string | null;
  name: string | null;
  start_time: string | null;
  start_time_local: string | null;
  distance_m: number | null;
  moving_time_s: number | null;
  elapsed_time_s: number | null;
  elevation_gain_m: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_speed_ms: number | null;
}

/** Montag 00:00 (lokal, CH) der laufenden Woche als ISO-String. */
function startOfIsoWeek(now: Date): Date {
  const d = new Date(now);
  const day = (d.getDay() + 6) % 7; // Mo=0 ... So=6
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Wettkampf-Datum (in life_settings ueberschreibbar)
  const { data: raceRow } = await supabase
    .from("life_settings")
    .select("value")
    .eq("key", "race")
    .maybeSingle();
  const race = (raceRow?.value as { date?: string; name?: string } | null) ?? null;
  const raceDate = race?.date || process.env.LIFE_JUNGFRAU_DATE || DEFAULT_RACE.date;
  const raceName = race?.name || DEFAULT_RACE.name;

  const now = new Date();
  const msPerDay = 86_400_000;
  const daysToRace = Math.ceil((new Date(raceDate).getTime() - now.getTime()) / msPerDay);

  // Letzte Aktivitaeten
  const { data, error } = await supabase
    .from("life_activities")
    .select(
      "id, external_id, source, sport_type, name, start_time, start_time_local, distance_m, moving_time_s, elapsed_time_s, elevation_gain_m, avg_hr, max_hr, avg_speed_ms",
    )
    .order("start_time", { ascending: false })
    .limit(60);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as ActivityRow[];
  const weekStart = startOfIsoWeek(now).getTime();

  let weekRuns = 0;
  let weekDistance = 0;
  let weekElevation = 0;
  let weekTime = 0;

  const activities = rows.map((r) => {
    const dist = Number(r.distance_m ?? 0);
    const time = Number(r.moving_time_s ?? 0);
    const sport = r.sport_type ?? "other";
    const isRun = RUN_TYPES.has(sport);
    const ts = r.start_time_local ? new Date(r.start_time_local).getTime() : new Date(r.start_time ?? 0).getTime();

    if (isRun && ts >= weekStart) {
      weekRuns += 1;
      weekDistance += dist;
      weekElevation += Number(r.elevation_gain_m ?? 0);
      weekTime += time;
    }

    // Pace in Sekunden pro km
    const paceSecPerKm = dist > 0 && time > 0 ? Math.round(time / (dist / 1000)) : null;

    return {
      id: r.id,
      external_id: r.external_id,
      sport,
      isRun,
      name: r.name,
      start_time_local: r.start_time_local ?? r.start_time,
      distance_km: dist > 0 ? +(dist / 1000).toFixed(2) : 0,
      moving_time_s: time,
      elevation_gain_m: r.elevation_gain_m != null ? Math.round(Number(r.elevation_gain_m)) : null,
      avg_hr: r.avg_hr != null ? Math.round(Number(r.avg_hr)) : null,
      pace_s_per_km: paceSecPerKm,
    };
  });

  return NextResponse.json({
    race: { date: raceDate, name: raceName, daysToRace },
    week: {
      runs: weekRuns,
      distance_km: +(weekDistance / 1000).toFixed(1),
      elevation_m: Math.round(weekElevation),
      moving_time_s: weekTime,
    },
    activities,
  });
}
