import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST /api/ceo/leben/running/import
// Einmaliger Import der Garmin-Connect-CSV-Aktivitaetenliste in life_activities
// (source='garmin_csv'). Body = roher CSV-Text. Idempotent ueber
// UNIQUE(source, external_id); external_id = lokaler Startzeitstempel.
// Garmin synct nur NEUE Laeufe zu Strava → so kommt die Historie rein.
// ---------------------------------------------------------------------------

/** Minimaler CSV-Parser: respektiert Anführungszeichen (Kommas in Feldern). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else if (c === "\r") {
      // ignore
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((f) => f.trim() !== "")) rows.push(row);
  }
  return rows;
}

/** Header (DE + EN) → Spaltenindex. */
function headerIndex(header: string[]): Record<string, number> {
  const idx: Record<string, number> = {};
  const find = (...names: string[]) => {
    for (const n of names) {
      const k = header.findIndex((h) => h.trim().toLowerCase() === n.toLowerCase());
      if (k >= 0) return k;
    }
    return -1;
  };
  idx.type = find("Aktivitätstyp", "Activity Type");
  idx.date = find("Datum", "Date");
  idx.title = find("Titel", "Title");
  idx.distance = find("Distanz", "Distance");
  idx.calories = find("Kalorien", "Calories");
  idx.time = find("Zeit", "Time");
  idx.avgHr = find("Ø Herzfrequenz", "Avg HR", "Durchschnittliche Herzfrequenz");
  idx.maxHr = find("Maximale Herzfrequenz", "Max HR");
  idx.ascent = find("Anstieg gesamt", "Total Ascent");
  idx.movingTime = find("Zeit in Bewegung", "Moving Time");
  idx.elapsedTime = find("Verstrichene Zeit", "Elapsed Time");
  return idx;
}

function cell(row: string[], i: number): string {
  return i >= 0 && i < row.length ? row[i].trim() : "";
}

/** "--" / leer → null; sonst Zahl ohne Tausender-Kommas. */
function num(s: string): number | null {
  if (!s || s === "--") return null;
  const cleaned = s.replace(/,/g, ""); // Tausender-Trennzeichen weg
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Distanz in km (Punkt = Dezimal in der Garmin-CSV) → Meter. */
function distanceMeters(s: string): number | null {
  if (!s || s === "--") return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n * 1000) : null;
}

/** "h:mm:ss" / "mm:ss" / "00:05:36.5" → Sekunden. */
function durationSeconds(s: string): number | null {
  if (!s || s === "--") return null;
  const parts = s.split(":").map((p) => parseFloat(p));
  if (parts.some((p) => Number.isNaN(p))) return null;
  let sec = 0;
  for (const p of parts) sec = sec * 60 + p;
  return Math.round(sec);
}

/** "2026-06-29 20:43:35" → ISO mit Z (Wand-Uhr, konsistent zur Anzeige). */
function isoLocal(s: string): string | null {
  if (!s) return null;
  const t = s.trim().replace(" ", "T");
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t) ? t + "Z" : null;
}

const SPORT_MAP: Record<string, string> = {
  laufen: "running",
  "trail running": "trail_running",
  traillauf: "trail_running",
  laufband: "treadmill_running",
  radfahren: "cycling",
  fußball: "soccer",
  fussball: "soccer",
  football: "soccer",
  soccer: "soccer",
  running: "running",
};

function sportType(s: string): string {
  const k = s.trim().toLowerCase();
  return SPORT_MAP[k] ?? (k.replace(/\s+/g, "_") || "other");
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const text = await req.text().catch(() => "");
  if (!text.trim()) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const rows = parseCsv(text);
  if (rows.length < 2) {
    return NextResponse.json({ error: "no_rows" }, { status: 400 });
  }

  const idx = headerIndex(rows[0]);
  if (idx.date < 0 || idx.distance < 0) {
    return NextResponse.json({ error: "unrecognized_format" }, { status: 400 });
  }

  const records: Record<string, unknown>[] = [];
  for (const row of rows.slice(1)) {
    const startLocal = isoLocal(cell(row, idx.date));
    if (!startLocal) continue;
    const moving = durationSeconds(cell(row, idx.movingTime)) ?? durationSeconds(cell(row, idx.time));
    records.push({
      source: "garmin_csv",
      external_id: startLocal,
      sport_type: sportType(cell(row, idx.type)),
      name: cell(row, idx.title) || null,
      start_time: startLocal,
      start_time_local: startLocal,
      distance_m: distanceMeters(cell(row, idx.distance)),
      moving_time_s: moving,
      elapsed_time_s: durationSeconds(cell(row, idx.elapsedTime)),
      elevation_gain_m: num(cell(row, idx.ascent)),
      avg_hr: num(cell(row, idx.avgHr)),
      max_hr: num(cell(row, idx.maxHr)),
      calories: num(cell(row, idx.calories)),
      updated_at: new Date().toISOString(),
    });
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "no_valid_rows" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("life_activities")
    .upsert(records, { onConflict: "source,external_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, imported: records.length });
}
