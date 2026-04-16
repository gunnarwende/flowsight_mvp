import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

/**
 * GET /api/bigben-pub/sync-calls — Poll Retell for recent BigBen calls
 * and create pub_reservations from calls with reservation intent.
 *
 * Called by PubDashboard auto-refresh (every 30s) or manually.
 * Idempotent: skips calls already processed (by retell_call_id in note).
 */
export async function GET() {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "no_api_key" }, { status: 500 });

  try {
    const supabase = getServiceClient();

    // Get BigBen tenant
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", "bigben-pub")
      .single();
    if (!tenant) return NextResponse.json({ error: "no_tenant" }, { status: 404 });

    // Get BigBen agent IDs from agent_ids or known IDs
    const { data: numbers } = await supabase
      .from("tenant_numbers")
      .select("phone_number")
      .eq("tenant_id", tenant.id)
      .eq("active", true);
    const bigbenNumbers = (numbers ?? []).map(n => n.phone_number);

    // Fetch recent calls from Retell (last 2 hours)
    const res = await fetch("https://api.retellai.com/v2/list-calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter_criteria: {
          to_number: bigbenNumbers.length > 0 ? bigbenNumbers : ["+41445054818"],
        },
        limit: 20,
        sort_order: "descending",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "retell_api_error", status: res.status }, { status: 502 });
    }

    const calls = await res.json();
    if (!Array.isArray(calls) || calls.length === 0) {
      return NextResponse.json({ synced: 0, message: "no_recent_calls" });
    }

    // Get existing reservation notes to avoid duplicates
    const { data: existing } = await supabase
      .from("pub_reservations")
      .select("note")
      .eq("tenant_id", tenant.id)
      .eq("source", "voice");
    const processedCallIds = new Set(
      (existing ?? [])
        .map(r => r.note?.match(/call_id:(\S+)/)?.[1])
        .filter(Boolean)
    );

    let synced = 0;
    for (const call of calls) {
      if (!call.call_id) continue;
      if (processedCallIds.has(call.call_id)) continue;

      // Only process ended calls with transcripts
      if (call.call_status !== "ended") continue;
      const transcript = (call.transcript ?? "").toLowerCase();
      if (!transcript) continue;

      // Check for reservation intent
      const hasReservation = transcript.includes("reserv") ||
        transcript.includes("book") ||
        transcript.includes("table for") ||
        transcript.includes("tisch");
      if (!hasReservation) continue;

      // Extract name from transcript or analysis
      const analysis = call.call_analysis?.custom_analysis_data ?? {};
      const guestName = analysis.reporter_name ?? analysis.name ?? call.from_number ?? "Phone Guest";
      const callerPhone = call.from_number ?? "";

      // Create reservation
      const { error: insertErr } = await supabase.from("pub_reservations").insert({
        tenant_id: tenant.id,
        guest_name: typeof guestName === "string" ? guestName : "Phone Guest",
        guest_phone: callerPhone,
        reservation_date: new Date().toISOString().split("T")[0],
        reservation_time: "19:00",
        party_size: 2,
        note: `Voice reservation (call_id:${call.call_id})`,
        source: "voice",
        status: "pending",
      });

      if (!insertErr) {
        synced++;
        // Push to Paul
        try {
          const { sendOpsPush } = await import("@/src/lib/push/sendOpsPush");
          await sendOpsPush({
            tenantId: tenant.id,
            eventType: "case",
            title: "New Reservation (Call)",
            body: `${guestName} via phone`,
            url: "/ops/reservations",
            tag: `reservation-voice-${call.call_id}`,
          });
        } catch { /* best effort */ }
      }
    }

    return NextResponse.json({ synced, total_calls: calls.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
