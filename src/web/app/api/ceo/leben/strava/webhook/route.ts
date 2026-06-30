import { NextRequest, NextResponse } from "next/server";
import { webhookVerifyToken, fetchActivity, upsertActivity, getTokenRow } from "@/src/lib/leben/strava";
import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// Strava Webhook-Endpunkt. Wird von Strava-Servern aufgerufen (KEIN Login).
//   GET  = Subscription-Validierung (hub.challenge zurueckspiegeln)
//   POST = Aktivitaets-Events (create/update/delete)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === webhookVerifyToken() && challenge) {
    return NextResponse.json({ "hub.challenge": challenge });
  }
  return NextResponse.json({ error: "verification_failed" }, { status: 403 });
}

interface StravaEvent {
  aspect_type?: "create" | "update" | "delete";
  object_type?: "activity" | "athlete";
  object_id?: number;
  owner_id?: number;
}

export async function POST(req: NextRequest) {
  // Strava erwartet schnell ein 200 — Verarbeitung defensiv, nie crashen.
  let event: StravaEvent;
  try {
    event = (await req.json()) as StravaEvent;
  } catch {
    return NextResponse.json({ ok: true });
  }

  try {
    if (event.object_type === "activity" && event.object_id) {
      // Nur Events des verbundenen Athleten verarbeiten.
      const tokenRow = await getTokenRow();
      if (tokenRow && event.owner_id && tokenRow.athlete_id && event.owner_id !== tokenRow.athlete_id) {
        return NextResponse.json({ ok: true });
      }

      if (event.aspect_type === "delete") {
        const supabase = getServiceClient();
        await supabase
          .from("life_activities")
          .delete()
          .eq("source", "strava")
          .eq("external_id", String(event.object_id));
      } else {
        // create + update: Detail holen und upserten.
        const activity = await fetchActivity(event.object_id);
        if (activity) await upsertActivity(activity);
      }
    }
  } catch {
    // Schlucken — Strava soll trotzdem 200 sehen (sonst wiederholt es endlos).
  }

  return NextResponse.json({ ok: true });
}
