/**
 * ICS v2 generation with proper UID, SEQUENCE, and METHOD support.
 * Ref: leitstand.md §6, RFC 5545
 */

interface IcsParams {
  uid: string;
  sequence: number;
  summary: string;
  description?: string;
  location?: string;
  startAt: Date;
  durationMin: number;
  organizerName?: string;
  organizerEmail?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  /** "REQUEST" for new/update, "CANCEL" for cancellation */
  method?: "REQUEST" | "CANCEL";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatUtc(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateIcs(params: IcsParams): string {
  const {
    uid,
    sequence,
    summary,
    description,
    location,
    startAt,
    durationMin,
    organizerName,
    organizerEmail,
    attendeeName,
    attendeeEmail,
    method = "REQUEST",
  } = params;

  const endAt = new Date(startAt.getTime() + durationMin * 60 * 1000);
  const now = new Date();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FlowSight//Leitstand//DE",
    `METHOD:${method}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(startAt)}`,
    `DTEND:${formatUtc(endAt)}`,
    `SEQUENCE:${sequence}`,
    `SUMMARY:${escapeIcs(summary)}`,
  ];

  if (description) lines.push(`DESCRIPTION:${escapeIcs(description)}`);
  if (location) lines.push(`LOCATION:${escapeIcs(location)}`);

  if (organizerEmail) {
    const cn = organizerName ? `;CN=${escapeIcs(organizerName)}` : "";
    lines.push(`ORGANIZER${cn}:mailto:${organizerEmail}`);
  }

  if (attendeeEmail) {
    const cn = attendeeName ? `;CN=${escapeIcs(attendeeName)}` : "";
    lines.push(`ATTENDEE;PARTSTAT=NEEDS-ACTION${cn}:mailto:${attendeeEmail}`);
  }

  if (method === "CANCEL") {
    lines.push("STATUS:CANCELLED");
  } else {
    lines.push("STATUS:CONFIRMED");
  }

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}
