import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST /api/lifecycle/tick
//
// Deterministic, idempotent lifecycle processor for active trials.
// Triggered by GitHub Actions Cron (daily) or Morning Report (fallback).
// Auth: Bearer token must match LIFECYCLE_TICK_SECRET env var.
//
// Milestones:
//   Day 7  — Engagement check → log (no email yet, just marks checked)
//   Day 10 — Founder alert (follow-up due) → updates follow_up_at awareness
//   Day 13 — Trial expiry reminder to prospect → sends email
//   Day 14 — Status → decision_pending (no auto-offboard)
// ---------------------------------------------------------------------------

const MILESTONES = [
  { day: 7, column: "day7_checked_at", action: "check" },
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
      "id, slug, name, trial_start, trial_end, trial_status, prospect_email, prospect_phone, day7_checked_at, day10_alerted_at, day13_reminder_sent_at, day14_marked_at"
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

  return NextResponse.json({
    processed: trials.length,
    actions: results.length,
    results,
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
      case "check":
        // Day 7: Just mark as checked. Future: engagement metrics.
        break;

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
// Day 13 email — Trial expiry reminder
// ---------------------------------------------------------------------------

async function sendDay13Email(
  to: string,
  companyName: string,
  trialEndDate: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.MAIL_FROM || "noreply@send.flowsight.ch";

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0b1120;border-radius:8px;overflow:hidden">
<tr><td style="height:4px;background:#d4a853;font-size:0;line-height:0">&nbsp;</td></tr>
<tr><td style="padding:20px 24px 12px;color:#d4a853;font-size:20px;font-weight:700;letter-spacing:0.5px">FlowSight</td></tr>
<tr><td style="padding:0 24px;color:#e2e8f0;font-size:22px;font-weight:700">Ihr Trial endet bald</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Guten Tag,<br><br>
Ihr FlowSight Trial f&uuml;r <strong style="color:#e2e8f0">${companyName}</strong> endet am <strong style="color:#e2e8f0">${trialEndDate}</strong>.
</td></tr>
<tr><td style="padding:16px 24px 0;color:#94a3b8;font-size:15px;line-height:1.6">
Falls Sie FlowSight weiterhin nutzen m&ouml;chten, melden Sie sich bei uns &mdash; wir k&uuml;mmern uns um alles Weitere.
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
    `Ihr FlowSight Trial für ${companyName} endet am ${trialEndDate}.`,
    "",
    "Falls Sie FlowSight weiterhin nutzen möchten, melden Sie sich bei uns — wir kümmern uns um alles Weitere.",
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
      body: JSON.stringify({ from, to, subject: "Ihr FlowSight Trial endet bald", html, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
