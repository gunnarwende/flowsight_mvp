import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { sendSms } from "@/src/lib/sms/sendSms";

// ---------------------------------------------------------------------------
// POST /api/lifecycle/tick
//
// Deterministic, idempotent lifecycle processor for active trials.
// Triggered by GitHub Actions Cron (daily) or Morning Report (fallback).
// Auth: Bearer token must match LIFECYCLE_TICK_SECRET env var.
//
// Milestones:
//   Day 5  — Engagement nudge → email if prospect inactive (< 3 cases)
//   Day 7  — Engagement snapshot → JSONB with cases_created, calls_count
//   Day 10 — Founder alert (follow-up due) → updates follow_up_at awareness
//   Day 13 — Trial expiry reminder to prospect → sends email
//   Day 14 — Status → decision_pending (no auto-offboard)
// ---------------------------------------------------------------------------

const MILESTONES = [
  { day: 5, column: "day5_nudge_sent_at", action: "nudge_prospect" },
  { day: 7, column: "day7_checked_at", action: "engagement_snapshot" },
  { day: 10, column: "day10_alerted_at", action: "alert_founder" },
  { day: 13, column: "day13_reminder_sent_at", action: "remind_prospect" },
  { day: 14, column: "day14_marked_at", action: "mark_decision_pending" },
] as const;

type MilestoneColumn = (typeof MILESTONES)[number]["column"];

interface TickResult {
  slug: string;
  milestone: string;
  action: string;
  ok: boolean;
  error?: string;
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────
  const secret = process.env.LIFECYCLE_TICK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "LIFECYCLE_TICK_SECRET not configured" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // ── Load active trials ────────────────────────────────────────────────
  const supabase = getServiceClient();
  const now = new Date();

  const { data: trials, error: fetchErr } = await supabase
    .from("tenants")
    .select(
      "id, slug, name, trial_start, trial_end, trial_status, prospect_email, prospect_phone, day5_nudge_sent_at, day7_checked_at, day10_alerted_at, day13_reminder_sent_at, day14_marked_at"
    )
    .in("trial_status", ["trial_active", "live_dock"]);

  if (fetchErr) {
    return NextResponse.json(
      { error: "db_fetch_failed", detail: fetchErr.message },
      { status: 500 }
    );
  }

  if (!trials || trials.length === 0) {
    return NextResponse.json({ processed: 0, results: [] });
  }

  // ── Process each trial ────────────────────────────────────────────────
  const results: TickResult[] = [];

  for (const tenant of trials) {
    if (!tenant.trial_start) continue;

    const trialStart = new Date(tenant.trial_start);
    const daysSinceStart = Math.floor(
      (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    for (const ms of MILESTONES) {
      // Not yet reached this milestone day
      if (daysSinceStart < ms.day) continue;

      // Already processed (idempotent guard)
      const alreadyDone = tenant[ms.column as MilestoneColumn];
      if (alreadyDone) continue;

      // Execute milestone
      const result = await executeMilestone(
        supabase,
        tenant,
        ms,
        now
      );
      results.push(result);
    }
  }

  // ── 24h Termin reminders ──────────────────────────────────────────────
  const reminderResults = await processTerminReminders(supabase, now);

  // ── 24h Pub reservation reminders ────────────────────────────────────
  const pubReminderResults = await processPubReservationReminders(supabase, now);

  return NextResponse.json({
    processed: trials.length,
    actions: results.length,
    results,
    reminders_sent: reminderResults.length,
    reminders: reminderResults,
    pub_reminders_sent: pubReminderResults.length,
    pub_reminders: pubReminderResults,
  });
}

// ---------------------------------------------------------------------------
// Milestone execution
// ---------------------------------------------------------------------------

async function executeMilestone(
  supabase: ReturnType<typeof getServiceClient>,
  tenant: {
    id: string;
    slug: string;
    name: string;
    prospect_email?: string | null;
    trial_end?: string | null;
  },
  milestone: (typeof MILESTONES)[number],
  now: Date
): Promise<TickResult> {
  const base: Omit<TickResult, "ok" | "error"> = {
    slug: tenant.slug,
    milestone: `day${milestone.day}`,
    action: milestone.action,
  };

  try {
    switch (milestone.action) {
      case "nudge_prospect": {
        // Day 5: Send engagement nudge if prospect has < 3 cases
        const { count: caseCount } = await supabase
          .from("cases")
          .select("id", { count: "exact", head: true })
          .eq("tenant_id", tenant.id)
          .eq("is_demo", false);

        if ((caseCount ?? 0) >= 3) {
          // Active prospect — suppress nudge, just mark as done
          break;
        }

        if (tenant.prospect_email) {
          const emailOk = await sendDay5Email(
            tenant.prospect_email,
            tenant.name
          );
          if (!emailOk) {
            return { ...base, ok: false, error: "day5_email_failed" };
          }
        }
        break;
      }

      case "engagement_snapshot": {
        // Day 7: Collect engagement metrics and store as JSONB
        const [
          { count: totalCases },
          { count: voiceCases },
          { count: wizardCases },
        ] = await Promise.all([
          supabase
            .from("cases")
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", tenant.id)
            .eq("is_demo", false),
          supabase
            .from("cases")
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", tenant.id)
            .eq("is_demo", false)
            .eq("source", "voice"),
          supabase
            .from("cases")
            .select("id", { count: "exact", head: true })
            .eq("tenant_id", tenant.id)
            .eq("is_demo", false)
            .eq("source", "wizard"),
        ]);

        const snapshot = {
          cases_created: totalCases ?? 0,
          cases_voice: voiceCases ?? 0,
          cases_wizard: wizardCases ?? 0,
          captured_at: now.toISOString(),
        };

        const { error: snapErr } = await supabase
          .from("tenants")
          .update({ day7_snapshot: snapshot })
          .eq("id", tenant.id);

        if (snapErr) {
          return { ...base, ok: false, error: `snapshot_failed: ${snapErr.message}` };
        }
        break;
      }

      case "alert_founder":
        // Day 10: Log awareness. Morning Report already shows follow_up_due.
        // No additional email needed — Morning Report is the channel.
        break;

      case "remind_prospect": {
        // Day 13: Send trial-expiry reminder to prospect
        if (tenant.prospect_email) {
          const trialEnd = tenant.trial_end
            ? new Date(tenant.trial_end).toISOString().slice(0, 10)
            : "bald";

          const emailOk = await sendDay13Email(
            tenant.prospect_email,
            tenant.name,
            trialEnd
          );
          if (!emailOk) {
            return { ...base, ok: false, error: "email_send_failed" };
          }
        }
        break;
      }

      case "mark_decision_pending": {
        // Day 14: Set status to decision_pending (manual offboard later)
        const { error: statusErr } = await supabase
          .from("tenants")
          .update({ trial_status: "decision_pending" })
          .eq("id", tenant.id);

        if (statusErr) {
          return { ...base, ok: false, error: statusErr.message };
        }
        break;
      }
    }

    // Mark milestone as done
    const { error: updateErr } = await supabase
      .from("tenants")
      .update({ [milestone.column]: now.toISOString() })
      .eq("id", tenant.id);

    if (updateErr) {
      return { ...base, ok: false, error: `mark_failed: ${updateErr.message}` };
    }

    return { ...base, ok: true };
  } catch (err) {
    return {
      ...base,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------
// 24h Termin reminders — SMS to Melder before scheduled appointments
// ---------------------------------------------------------------------------

interface ReminderResult {
  case_id: string;
  sent: boolean;
  reason?: string;
}

async function processTerminReminders(
  supabase: ReturnType<typeof getServiceClient>,
  now: Date,
): Promise<ReminderResult[]> {
  const results: ReminderResult[] = [];

  // Cases with scheduled_at in window: -3h to +36h from now.
  // The -3h lookback catches early-morning appointments (e.g., 08:30 MESZ = 06:30 UTC)
  // that would otherwise be "past" when the cron runs at 07:00 UTC.
  const windowStart = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000);

  // D5: Include email-only cases (not just phone) for email reminder fallback
  const { data: cases } = await supabase
    .from("cases")
    .select("id, tenant_id, seq_number, scheduled_at, scheduled_end_at, category, contact_phone, contact_email, reporter_name")
    .gte("scheduled_at", windowStart.toISOString())
    .lte("scheduled_at", windowEnd.toISOString())
    .in("status", ["scheduled", "in_arbeit"]);

  if (!cases || cases.length === 0) return results;

  // Check which cases already have a termin_reminder_sent event (idempotency)
  const caseIds = cases.map(c => c.id);
  const { data: existingEvents } = await supabase
    .from("case_events")
    .select("case_id")
    .in("case_id", caseIds)
    .eq("event_type", "termin_reminder_sent");

  const alreadySent = new Set((existingEvents ?? []).map(e => e.case_id));

  // Group cases by tenant to batch-check modules
  const tenantIds = [...new Set(cases.map(c => c.tenant_id))];
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, phone, modules")
    .in("id", tenantIds);

  const tenantMap = new Map(
    (tenants ?? []).map(t => [t.id, t])
  );

  for (const c of cases) {
    if (alreadySent.has(c.id)) continue;
    if (!c.contact_phone && !c.contact_email) continue;

    const tenant = tenantMap.get(c.tenant_id);
    if (!tenant) continue;

    const modules = (tenant.modules ?? {}) as Record<string, unknown>;

    // Format termin details (shared between SMS + Email)
    const senderName = typeof modules.sms_sender_name === "string" ? modules.sms_sender_name : tenant.name;
    const tenantPhone = typeof tenant.phone === "string" ? tenant.phone : "";
    const start = new Date(c.scheduled_at);
    const day = start.toLocaleDateString("de-CH", { weekday: "short", timeZone: "Europe/Zurich" }).replace(/\.$/, "");
    const date = start.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", timeZone: "Europe/Zurich" });
    const time = start.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
    let endTime = "";
    if (c.scheduled_end_at) {
      const end = new Date(c.scheduled_end_at);
      endTime = `\u2013${end.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" })}`;
    }

    let sent = false;
    let channel: "sms" | "email" | "none" = "none";
    let reason: string | undefined;

    // D5: SMS primary for phone contacts (time-critical, 98% open rate)
    if (c.contact_phone && modules.notify_termin_reminder_sms !== false && modules.sms === true) {
      const phoneStr = tenantPhone ? ` Bei Fragen: ${tenantPhone}.` : "";
      const smsBody = `${senderName}: Erinnerung \u2014 Ihr Termin morgen ${day} ${date}, ${time}${endTime}.${phoneStr}`;
      const smsResult = await sendSms(c.contact_phone, smsBody, senderName);
      sent = smsResult.sent;
      channel = "sms";
      reason = smsResult.reason;
    }

    // D5: Email fallback when no phone or SMS failed/disabled
    if (!sent && c.contact_email) {
      try {
        const { sendTerminReminderEmail } = await import("@/src/lib/email/resend");
        const emailSent = await sendTerminReminderEmail({
          tenantName: tenant.name,
          contactEmail: c.contact_email,
          terminDay: day,
          terminDate: date,
          terminTime: `${time}${endTime}`,
          category: c.category ?? undefined,
          tenantPhone: tenantPhone || undefined,
        });
        if (emailSent) {
          sent = true;
          channel = "email";
        }
      } catch { /* email best-effort */ }
    }

    if (!sent) {
      reason = reason ?? (c.contact_phone ? "sms_disabled_no_email" : "no_phone_email_failed");
    }

    // Insert idempotency guard event
    await supabase.from("case_events").insert({
      case_id: c.id,
      event_type: "termin_reminder_sent",
      title: `24h-Erinnerung an Kunden gesendet (${channel === "sms" ? "SMS" : channel === "email" ? "E-Mail" : "fehlgeschlagen"})`,
      metadata: { channel, sent, reason: reason ?? null },
    });

    results.push({ case_id: c.id, sent, reason });
  }

  return results;
}

// ---------------------------------------------------------------------------
// 24h Pub reservation reminders — SMS to guests before confirmed reservations
// ---------------------------------------------------------------------------

interface PubReminderResult {
  reservation_id: string;
  sent: boolean;
  reason?: string;
}

async function processPubReservationReminders(
  supabase: ReturnType<typeof getServiceClient>,
  now: Date,
): Promise<PubReminderResult[]> {
  const results: PubReminderResult[] = [];

  // Tomorrow's date in Europe/Zurich timezone
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" }); // YYYY-MM-DD

  // Query confirmed reservations for tomorrow that haven't been reminded yet
  const { data: reservations } = await supabase
    .from("pub_reservations")
    .select("id, guest_name, guest_phone, reservation_date, reservation_time, party_size")
    .eq("reservation_date", tomorrowStr)
    .eq("status", "confirmed")
    .is("reminder_sent_at", null);

  if (!reservations || reservations.length === 0) return results;

  for (const r of reservations) {
    if (!r.guest_phone || r.guest_phone === "—") {
      results.push({ reservation_id: r.id, sent: false, reason: "no_phone" });
      continue;
    }

    const timeStr = r.reservation_time?.substring(0, 5) ?? "";
    const smsBody = `Reminder: Your table at Big Ben Pub tomorrow at ${timeStr} for ${r.party_size} guests. We look forward to seeing you! — Big Ben Pub`;

    const smsResult = await sendSms(r.guest_phone, smsBody, "BigBenPub");

    // Mark as reminded (idempotency guard)
    if (smsResult.sent) {
      await supabase
        .from("pub_reservations")
        .update({ reminder_sent_at: now.toISOString() })
        .eq("id", r.id);
    }

    results.push({
      reservation_id: r.id,
      sent: smsResult.sent,
      reason: smsResult.reason,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Day 5 email — Engagement nudge for inactive prospects
// ---------------------------------------------------------------------------

async function sendDay5Email(
  to: string,
  companyName: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const fromAddr = process.env.MAIL_FROM || "noreply@send.flowsight.ch";
  const safeName = companyName.replace(/[<>"]/g, "");
  const from = `${safeName} via FlowSight <${fromAddr}>`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1120;border-radius:8px;overflow:hidden">
<tr><td style="height:4px;background:#d4a853;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:20px 24px 12px;color:#d4a853;font-size:20px;font-weight:700;letter-spacing:0.5px">${companyName}</td></tr>
<tr><td style="padding:0 24px;color:#e2e8f0;font-size:22px;font-weight:700">Ihr System wartet auf Sie</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Guten Tag,<br><br>
Ihre Einsatzzentrale f&uuml;r <strong style="color:#e2e8f0">${companyName}</strong> ist seit 5 Tagen aktiv &mdash; aber wir haben bisher wenige Testanrufe gesehen.
</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
<strong style="color:#e2e8f0">Testen Sie es jetzt:</strong> Rufen Sie einfach Ihre Testnummer an, oder nutzen Sie das Auftragsformular auf Ihrer Website. Ihre Telefonassistentin nimmt ab und leitet alles strukturiert weiter.
</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Sie haben noch 9 Tage in Ihrem Trial. Nutzen Sie die Zeit, um zu sehen, wie das System Ihren Arbeitsalltag ver&auml;ndert.
</td></tr>
<tr><td style="padding:28px 24px 20px;border-top:1px solid #1e293b;margin-top:24px">
  <div style="color:#64748b;font-size:13px;line-height:1.6;text-align:center">Gunnar Wende &mdash; 044 552 09 19 &mdash; flowsight.ch</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    "Guten Tag,",
    "",
    `Ihre Einsatzzentrale für ${companyName} ist seit 5 Tagen aktiv — aber wir haben bisher wenige Testanrufe gesehen.`,
    "",
    "Testen Sie es jetzt: Rufen Sie einfach Ihre Testnummer an, oder nutzen Sie das Auftragsformular auf Ihrer Website.",
    "",
    "Sie haben noch 9 Tage in Ihrem Trial.",
    "",
    "---",
    "Gunnar Wende — 044 552 09 19 — flowsight.ch",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Ihr System wartet auf Sie — ${companyName}`,
        html,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Day 13 email — Trial expiry reminder
// ---------------------------------------------------------------------------

async function sendDay13Email(
  to: string,
  companyName: string,
  trialEndDate: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const fromAddr = process.env.MAIL_FROM || "noreply@send.flowsight.ch";
  const safeName = companyName.replace(/[<>"]/g, "");
  const from = `${safeName} via FlowSight <${fromAddr}>`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1120;border-radius:8px;overflow:hidden">
<tr><td style="height:4px;background:#d4a853;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:20px 24px 12px;color:#d4a853;font-size:20px;font-weight:700;letter-spacing:0.5px">${companyName}</td></tr>
<tr><td style="padding:0 24px;color:#e2e8f0;font-size:22px;font-weight:700">Ihr Trial endet bald</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Guten Tag,<br><br>
Ihr 14-Tage Trial f&uuml;r <strong style="color:#e2e8f0">${companyName}</strong> endet am <strong style="color:#e2e8f0">${trialEndDate}</strong>.
</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Falls Sie das System weiterhin nutzen m&ouml;chten, melden Sie sich bei uns &mdash; wir k&uuml;mmern uns um alles Weitere.
</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Falls nicht: kein Problem. Ihre Daten werden nach Ablauf des Trials sicher gel&ouml;scht.
</td></tr>
<tr><td style="padding:28px 24px 20px;border-top:1px solid #1e293b;margin-top:24px">
  <div style="color:#64748b;font-size:13px;line-height:1.6;text-align:center">Gunnar Wende &mdash; 044 552 09 19 &mdash; flowsight.ch</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    "Guten Tag,",
    "",
    `Ihr 14-Tage Trial für ${companyName} endet am ${trialEndDate}.`,
    "",
    "Falls Sie das System weiterhin nutzen möchten, melden Sie sich bei uns — wir kümmern uns um alles Weitere.",
    "",
    "Falls nicht: kein Problem. Ihre Daten werden nach Ablauf des Trials sicher gelöscht.",
    "",
    "---",
    "Gunnar Wende — 044 552 09 19 — flowsight.ch",
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject: `Ihr Trial endet bald — ${companyName}`, html, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
