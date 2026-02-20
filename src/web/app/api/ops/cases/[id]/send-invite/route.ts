import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Resend } from "resend";
import { getServiceClient } from "@/src/lib/supabase/server";
import { getAuthClient } from "@/src/lib/supabase/server-auth";

// ---------------------------------------------------------------------------
// ICS helpers
// ---------------------------------------------------------------------------

/** Format a Date as ICS UTC timestamp: YYYYMMDDTHHMMSSZ */
function icsUtc(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  );
}

function buildIcs(opts: {
  uid: string;
  dtStart: Date;
  dtEnd: Date;
  summary: string;
  description: string;
  url: string;
  organizerEmail: string;
  attendeeEmail: string;
}): string {
  // ICS lines must be CRLF-terminated
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlowSight//Termin//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${icsUtc(new Date())}`,
    `DTSTART:${icsUtc(opts.dtStart)}`,
    `DTEND:${icsUtc(opts.dtEnd)}`,
    `SUMMARY:${opts.summary}`,
    `DESCRIPTION:${opts.description}`,
    `URL:${opts.url}`,
    `ORGANIZER:mailto:${opts.organizerEmail}`,
    `ATTENDEE;RSVP=TRUE:mailto:${opts.attendeeEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

// ---------------------------------------------------------------------------
// POST /api/ops/cases/[id]/send-invite
// ---------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shortId = id.slice(0, 8);

  // Base log fields — single log line per invocation
  const base: Record<string, unknown> = {
    _tag: "resend",
    kind: "invite",
    case_id: id,
  };

  function respond(
    status: number,
    body: Record<string, unknown>,
    logExtra: Record<string, unknown>,
  ) {
    console.log(JSON.stringify({ ...base, http_status: status, ...logExtra }));
    return NextResponse.json(body, { status });
  }

  // ── Auth ──────────────────────────────────────────────────────────────
  const supabaseAuth = await getAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return respond(401, { ok: false, error: "unauthorized" }, {
      decision: "skipped",
      error_code: "unauthorized",
      scheduled_at_present: false,
      recipient_present: false,
    });
  }

  // ── Load case ─────────────────────────────────────────────────────────
  const supabase = getServiceClient();
  const { data: row, error: dbError } = await supabase
    .from("cases")
    .select("id, scheduled_at, category, city")
    .eq("id", id)
    .single();

  if (dbError || !row) {
    return respond(404, { ok: false, error: "case_not_found" }, {
      decision: "skipped",
      error_code: "case_not_found",
      scheduled_at_present: false,
      recipient_present: false,
    });
  }

  // ── Validate scheduled_at ─────────────────────────────────────────────
  if (!row.scheduled_at) {
    return respond(400, { ok: false, error: "missing_scheduled_at" }, {
      decision: "skipped",
      error_code: "missing_scheduled_at",
      scheduled_at_present: false,
      recipient_present: false,
    });
  }

  // ── Validate recipient ────────────────────────────────────────────────
  const to = process.env.MAIL_REPLY_TO;
  if (!to) {
    return respond(400, { ok: false, error: "missing_mail_reply_to" }, {
      decision: "skipped",
      error_code: "missing_mail_reply_to",
      scheduled_at_present: true,
      recipient_present: false,
    });
  }

  // ── Validate Resend key ───────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return respond(500, { ok: false, error: "server_misconfigured" }, {
      decision: "skipped",
      error_code: "no_resend_api_key",
      scheduled_at_present: true,
      recipient_present: true,
    });
  }

  // ── Build ICS ─────────────────────────────────────────────────────────
  const dtStart = new Date(row.scheduled_at);
  const dtEnd = new Date(dtStart.getTime() + 60 * 60 * 1000); // +60 min

  const fromEnvValue = process.env.MAIL_FROM;
  const from = fromEnvValue ?? "noreply@send.flowsight.ch";
  const organizerEmail = from;

  const baseUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://flowsight-mvp.vercel.app";
  const opsLink = `${baseUrl}/ops/cases/${id}`;

  const ics = buildIcs({
    uid: `${id}@flowsight.ch`,
    dtStart,
    dtEnd,
    summary: `FlowSight Termin – Fall ${shortId}`,
    description: `Fall öffnen: ${opsLink}`,
    url: opsLink,
    organizerEmail,
    attendeeEmail: to,
  });

  // ── Send via Resend (inline, no helper — 1-log rule) ─────────────────
  try {
    Sentry.setTag("area", "email");
    Sentry.setTag("provider", "resend");
    Sentry.setTag("case_id", id);

    const resend = new Resend(resendKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Termin – FlowSight Fall ${shortId}`,
      text: [
        `FlowSight Termin`,
        `──────────────────────`,
        `Fall:    ${shortId}`,
        `Termin:  ${dtStart.toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        ``,
        `Fall öffnen: ${opsLink}`,
        `(Login erforderlich)`,
      ].join("\n"),
      attachments: [
        {
          filename: "flowsight-termin.ics",
          content: Buffer.from(ics, "utf-8").toString("base64"),
          contentType: 'text/calendar; method=REQUEST; charset="UTF-8"',
        },
      ],
    });

    if (error) {
      Sentry.captureException(error, {
        tags: { area: "email", provider: "resend", case_id: id },
      });
      const apiErr = error as Record<string, unknown>;
      return respond(502, { ok: false, error: "resend_error" }, {
        decision: "failed",
        error_code: apiErr.name ?? "resend_error",
        error_message: typeof apiErr.message === "string" ? apiErr.message : null,
        scheduled_at_present: true,
        recipient_present: true,
        provider_message_id: null,
      });
    }

    return respond(200, { ok: true }, {
      decision: "sent",
      scheduled_at_present: true,
      recipient_present: true,
      provider_message_id: data?.id ?? null,
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { area: "email", provider: "resend", case_id: id },
    });
    return respond(502, { ok: false, error: "resend_error" }, {
      decision: "failed",
      error_code: err instanceof Error ? err.name : "unknown",
      error_message: err instanceof Error ? err.message : "unknown",
      scheduled_at_present: true,
      recipient_present: true,
      provider_message_id: null,
    });
  }
}
