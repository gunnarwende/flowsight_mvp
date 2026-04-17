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
      (existing ?? []).map((r: { note: string | null }) => r.note?.match(/call_id:([a-z0-9_]+)/)?.[1]).filter(Boolean)
    );

    let synced = 0;
    for (const call of recentCalls) {
      if (!call.call_id || syncedIds.has(call.call_id)) continue;
      if (call.call_status !== "ended") continue;

      const transcript = call.transcript ?? "";
      const lower = transcript.toLowerCase();

      // Check if this is a reservation call — use structured analysis first, transcript fallback
      const analysis = call.call_analysis?.custom_analysis_data ?? {};
      const isReservation = analysis.is_reservation === true ||
        analysis.call_type === "reservation" || analysis.call_type === "mixed" ||
        // Transcript fallback for older calls without structured analysis
        lower.includes("noted your reservation") || lower.includes("reservation for") ||
        (lower.includes("reservierung") && lower.includes("notiert")) ||
        ((lower.includes("reserv") || lower.includes("tisch")) && lower.includes("paul"));
      if (!isReservation) continue;

      // Extract data — PRIORITY: structured analysis > transcript parsing
      const guestName = (typeof analysis.guest_name === "string" && analysis.guest_name) || extractName(transcript, analysis);
      const partySize = (typeof analysis.party_size === "number" && analysis.party_size > 0) ? analysis.party_size : extractPartySize(transcript);
      const time = (typeof analysis.reservation_time === "string" && /^\d{2}:\d{2}$/.test(analysis.reservation_time)) ? analysis.reservation_time : extractTime(transcript);
      const date = (typeof analysis.reservation_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(analysis.reservation_date)) ? analysis.reservation_date : extractDate(transcript);

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

  // Try transcript: EN + DE patterns
  const nameMatch = transcript.match(/(?:under (?:the )?name|my name is|name is|auf den Namen|unter dem Namen|Namen?\s)\s*(\w[\w\s]{1,30}?)[\.,!?\n]/i);
  if (nameMatch) return nameMatch[1].trim();

  // Agent confirmation: "under your name" or "deinem Namen"
  const agentName = transcript.match(/(?:under your name|unter deinem Namen|für\s+)(\w+)[.,!?\s]/i);
  if (agentName) return agentName[1].trim();

  return "Phone Guest";
}

function extractPartySize(transcript: string): number {
  const numWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20 };
  const lower = transcript.toLowerCase();

  // Pattern 1: "X people/guests/person"
  const m1 = lower.match(/(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty)\s*(?:people|person|guests?|personen?|leute|pax)/);
  if (m1) return numWords[m1[1]] ?? (parseInt(m1[1], 10) || 2);

  // Pattern 2: "we are X" / "wir sind X"
  const m2 = lower.match(/(?:we are|wir sind|there(?:'s| is| are)|party of)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)/);
  if (m2) return numWords[m2[1]] ?? (parseInt(m2[1], 10) || 2);

  // Pattern 3: "for X" (but not "for today/tomorrow")
  const m3 = lower.match(/(?:for|f(?:ü|ue)r)\s+(\d+|two|three|four|five|six|seven|eight|nine|ten|twelve)\s+(?!pm|am|today|tomorrow|monday|tuesday)/);
  if (m3) return numWords[m3[1]] ?? (parseInt(m3[1], 10) || 2);

  // Pattern 4: Agent confirmation — "for X people/guests" (Lisa confirms)
  const m4 = lower.match(/for\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty)\s+(?:people|guests?|person)/);
  if (m4) return numWords[m4[1]] ?? (parseInt(m4[1], 10) || 2);

  // Pattern 5: German — "für X Personen", "X Personen"
  const m5de = lower.match(/(?:für|fuer)\s+(\d+|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn)\s+personen/);
  const deWords: Record<string, number> = { zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10 };
  if (m5de) return deWords[m5de[1]] ?? (parseInt(m5de[1], 10) || 2);

  // Pattern 6: Just a number near "guests" or "personen" anywhere
  const m6 = lower.match(/(\d+)\s*(?:guests?|personen)/);
  if (m6) return parseInt(m6[1], 10) || 2;

  return 2;
}

function extractTime(transcript: string): string {
  const lower = transcript.toLowerCase();

  // PRIORITY 1: Agent confirmation line — Lisa confirmed time + guests back to caller
  // EN: "at 16:00, 5 guests" / DE: "um 17:00 Uhr, für zwei Personen"
  const agentConfirm = lower.match(/(?:at|um)\s+(\d{1,2}):(\d{2})[,\s]+(?:\d+\s+(?:people|guests?|person|personen)|für\s+\w+\s+personen)/);
  if (agentConfirm) {
    return fmt(parseInt(agentConfirm[1], 10), parseInt(agentConfirm[2], 10));
  }

  // DE Agent: "um 17:00 Uhr" or "um 17 Uhr" (without guest count in same sentence)
  const deTime = lower.match(/um\s+(\d{1,2}):?(\d{2})?\s*uhr/);
  if (deTime) {
    const h = parseInt(deTime[1], 10);
    const m = deTime[2] ? parseInt(deTime[2], 10) : 0;
    return fmt(h, m);
  }

  // Agent confirmation with PM/AM: "at 7 PM, 5 guests"
  const agentConfirm2 = lower.match(/at\s+(\d{1,2}):?(\d{2})?\s*(pm|am)[,\s]+\d+\s+(?:people|guests?)/);
  if (agentConfirm2) {
    let h = parseInt(agentConfirm2[1], 10);
    if (agentConfirm2[3] === "pm" && h < 12) h += 12;
    return fmt(h, agentConfirm2[2] ? parseInt(agentConfirm2[2], 10) : 0);
  }

  // PRIORITY 2: Caller says time with AM/PM/o'clock explicitly
  const callerTime = lower.match(/(?:at|um|for)\s+(\d{1,2})(?::(\d{2}))?\s*(pm|am|p\.m\.|a\.m\.|uhr|o'clock)/);
  if (callerTime) {
    let h = parseInt(callerTime[1], 10);
    const m = callerTime[2] ? parseInt(callerTime[2], 10) : 0;
    const suffix = callerTime[3];
    if (suffix.startsWith("p") && h < 12) h += 12;
    if (suffix.startsWith("a") && h === 12) h = 0;
    if ((suffix === "uhr" || suffix === "o'clock") && h < 12) h += 12; // pub = afternoon/evening
    return fmt(h, m);
  }

  // PRIORITY 3: Word numbers — "one o'clock", "at seven"
  const timeWords: Record<string, number> = { one: 13, two: 14, three: 15, four: 16, five: 17, six: 18, seven: 19, eight: 20, nine: 21, ten: 22, eleven: 23, twelve: 12 };
  for (const [word, hour] of Object.entries(timeWords)) {
    const pattern = new RegExp(`(?:at\\s+${word}|${word}\\s+(?:pm|p\\.m|o'clock))\\b`);
    if (pattern.test(lower)) return fmt(hour, 0);
  }

  return "19:00";
}

function fmt(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
