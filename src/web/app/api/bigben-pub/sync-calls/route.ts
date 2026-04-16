import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * GET /api/bigben-pub/sync-calls — Poll Retell for recent BigBen calls
 * and create pub_reservations from calls with confirmed reservation.
 *
 * Only processes calls from the last 2 hours. Idempotent via call_id.
 */
export async function GET() {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no_api_key" }, { status: 500 });

  try {
    const supabase = getServiceClient();

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", "bigben-pub")
      .single();
    if (!tenant) return NextResponse.json({ error: "no_tenant" }, { status: 404 });

    // Only calls from last 2 hours
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;

    const res = await fetch("https://api.retellai.com/v2/list-calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        filter_criteria: { to_number: ["+41445054818"] },
        limit: 20,
        sort_order: "descending",
      }),
    });

    if (!res.ok) return NextResponse.json({ error: "retell_error" }, { status: 502 });
    const calls = await res.json();
    if (!Array.isArray(calls)) return NextResponse.json({ synced: 0 });

    // Filter to recent calls only
    const recentCalls = calls.filter((c: { start_timestamp?: number }) =>
      (c.start_timestamp ?? 0) > twoHoursAgo
    );

    // Get already-synced call IDs
    const { data: existing } = await supabase
      .from("pub_reservations")
      .select("note")
      .eq("tenant_id", tenant.id)
      .eq("source", "voice");
    const syncedIds = new Set(
      (existing ?? []).map((r: { note: string | null }) => r.note?.match(/call_id:(\S+)/)?.[1]).filter(Boolean)
    );

    let synced = 0;
    for (const call of recentCalls) {
      if (!call.call_id || syncedIds.has(call.call_id)) continue;
      if (call.call_status !== "ended") continue;

      const transcript = call.transcript ?? "";
      const lower = transcript.toLowerCase();

      // Must have CONFIRMED reservation (agent said "noted" or "reservation for")
      const hasConfirmedRes =
        (lower.includes("noted your reservation") || lower.includes("reservation for")) &&
        (lower.includes("reserv") || lower.includes("book"));
      if (!hasConfirmedRes) continue;

      // Extract data from transcript
      const analysis = call.call_analysis?.custom_analysis_data ?? {};
      const guestName = extractName(transcript, analysis);
      const partySize = extractPartySize(transcript);
      const time = extractTime(transcript);
      const date = extractDate(transcript);

      // Check guest no-show history
      let voiceNote = `Voice reservation (call_id:${call.call_id})`;
      const guestPhone = call.from_number ?? "";
      if (guestPhone) {
        const { count } = await supabase
          .from("pub_reservations")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("guest_phone", guestPhone)
          .eq("status", "no_show");
        if (count && count >= 2) {
          voiceNote = `\uD83D\uDD34 ${count} previous no-shows | ${voiceNote}`;
        } else if (count && count === 1) {
          voiceNote = `\u26A0\uFE0F 1 previous no-show | ${voiceNote}`;
        }
      }

      const { error: insertErr } = await supabase.from("pub_reservations").insert({
        tenant_id: tenant.id,
        guest_name: guestName,
        guest_phone: guestPhone,
        reservation_date: date,
        reservation_time: time,
        party_size: partySize,
        note: voiceNote,
        source: "voice",
        status: "pending",
      });

      if (!insertErr) {
        synced++;
        try {
          const { sendOpsPush } = await import("@/src/lib/push/sendOpsPush");
          await sendOpsPush({
            tenantId: tenant.id,
            eventType: "case",
            title: "New Reservation (Call)",
            body: `${guestName} · ${partySize} guests · ${time}`,
            url: "/ops/reservations",
            tag: `res-voice-${call.call_id}`,
          });
        } catch { /* best effort */ }
      }
    }

    return NextResponse.json({ synced, checked: recentCalls.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// --- Extraction helpers ---

function extractName(transcript: string, analysis: Record<string, unknown>): string {
  // Try analysis first
  const aName = analysis.reporter_name ?? analysis.name;
  if (typeof aName === "string" && aName.length > 1) return aName;

  // Try transcript: "under the name X" or "name is X"
  const nameMatch = transcript.match(/(?:under (?:the )?name|my name is|name is)\s+(\w[\w\s]{1,30}?)[\.,!?]/i);
  if (nameMatch) return nameMatch[1].trim();

  return "Phone Guest";
}

function extractPartySize(transcript: string): number {
  // "4 people", "four people", "4 guests", "we are 4"
  const numWords: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12 };
  const match = transcript.match(/(\d+|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*(?:people|person|guests?|personen?|leute)/i)
    ?? transcript.match(/(?:we are|wir sind)\s*(\d+|two|three|four|five|six|seven|eight|nine|ten|twelve)/i)
    ?? transcript.match(/(?:for|für)\s*(\d+|two|three|four|five|six|seven|eight|nine|ten|twelve)\s/i);
  if (match) {
    const val = match[1].toLowerCase();
    return numWords[val] ?? (parseInt(val, 10) || 2);
  }
  return 2;
}

function extractTime(transcript: string): string {
  // "at 7 PM", "at 19:00", "um 19 Uhr", "seven PM"
  const timeWords: Record<string, number> = { five: 17, six: 18, seven: 19, eight: 20, nine: 21 };
  const match = transcript.match(/(?:at|um)\s*(\d{1,2})(?::(\d{2}))?\s*(?:PM|pm|Uhr|o'clock)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const min = match[2] ? parseInt(match[2], 10) : 0;
    if (hour < 12 && transcript.toLowerCase().includes("pm")) hour += 12;
    if (hour < 12) hour += 12; // Pub = always evening
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }
  // Try word numbers
  for (const [word, hour] of Object.entries(timeWords)) {
    if (transcript.toLowerCase().includes(word + " pm") || transcript.toLowerCase().includes(word + " o'clock")) {
      return `${hour}:00`;
    }
  }
  return "19:00";
}

function extractDate(transcript: string): string {
  const today = new Date();
  const lower = transcript.toLowerCase();

  if (lower.includes("today") || lower.includes("heute")) {
    return today.toISOString().split("T")[0];
  }
  if (lower.includes("tomorrow") || lower.includes("morgen")) {
    return new Date(today.getTime() + 86400000).toISOString().split("T")[0];
  }
  if (lower.includes("day after tomorrow") || lower.includes("übermorgen")) {
    return new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0];
  }

  // "Saturday", "Samstag", etc.
  const days: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sonntag: 0, montag: 1, dienstag: 2, mittwoch: 3, donnerstag: 4, freitag: 5, samstag: 6 };
  for (const [name, dow] of Object.entries(days)) {
    if (lower.includes(name)) {
      const diff = (dow - today.getDay() + 7) % 7 || 7;
      return new Date(today.getTime() + diff * 86400000).toISOString().split("T")[0];
    }
  }

  return today.toISOString().split("T")[0];
}
