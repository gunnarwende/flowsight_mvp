import { NextResponse } from "next/server";
import {
  getCockpitSessionByToken,
  setCockpitStatus,
} from "@/src/lib/cockpit/cockpitSessions";
import { sendCockpitSubmittedAlert } from "@/src/lib/email/resend";
import type { CockpitDraft } from "@/src/lib/cockpit/types";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Anti-Ping-Pong-Vertrag (phase2_cockpit_manifest.md §2): genau die 🆕-Felder,
 * die kein Crawl kennt, müssen sitzen, BEVOR „An Gunnar gesendet" geht — sonst
 * gibt es Rückfragen. Gibt die Liste fehlender Punkte zurück (UI führt dorthin).
 */
function missingFields(draft: CockpitDraft): string[] {
  const missing: string[] = [];
  // Pflicht NUR, was der Gratis-Test wirklich braucht (Neubau-Spec, Tier-Angleich):
  //   Begrüssung · Telefonanbieter · Notfall-Kontakt (wenn Notdienst) · Geschäfts-E-Mail · Login-E-Mail · AVV.
  if (!EMAIL_RE.test(draft.review?.notificationEmail ?? "")) missing.push("notification_email");
  if (!EMAIL_RE.test(draft.golive?.adminEmail ?? "")) missing.push("admin_email");
  if (draft.golive?.avvAccepted !== true) missing.push("avv");
  if (!(draft.voice?.greetingText ?? "").trim()) missing.push("greeting");
  if (!draft.voice?.telco?.provider) missing.push("telco");
  // Notfall-Empfänger ist Pflicht, sobald ein Notdienst angeboten wird (sonst läuft die Alarmierung ins Leere).
  if (draft.voice?.emergencyService === true && !(draft.voice?.emergencyContact?.name ?? "").trim()) missing.push("emergency_contact");

  // NICHT blockierend (Default-first, nach Go-live nachgezogen): Team/staff (Default „nur Sie"),
  // Bewertungslink (Stern-5-Trumpf für später), Kalender, Website-Integration. Sonst steckt
  // der Inhaber im Test fest = genau das Pingpong, das wir vermeiden.
  return missing;
}

/**
 * POST /api/aufbau/[token]/submit — „An Gunnar zum Freischalten senden" (OC6).
 *
 * Setzt NUR status=submitted + benachrichtigt den Founder (Review-Gate, Phase 3).
 * KEIN Live-Write, KEIN Retell-Publish — das ist der separate, founder-getestete
 * Promote-Schritt. Validiert vorher den Anti-Ping-Pong-Vertrag (die 🆕-Felder).
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  if (!/^[0-9a-f]{24}$/i.test(token)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });
  }

  const session = await getCockpitSessionByToken(token);
  if (!session) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (session.status !== "building") {
    // Idempotent: schon abgesendet → ok zurückmelden, nicht doppelt benachrichtigen.
    return NextResponse.json({ ok: true, status: session.status, alreadySubmitted: true });
  }

  const missing = missingFields(session.draft ?? {});
  if (missing.length > 0) {
    return NextResponse.json({ error: "incomplete", missing }, { status: 422 });
  }

  try {
    await setCockpitStatus({ token, status: "submitted" });
    // Founder-Alert (best-effort; blockiert das Absenden nie).
    await sendCockpitSubmittedAlert({
      companyName: session.company_name,
      slug: session.slug,
      token,
    }).catch(() => {});
    return NextResponse.json({ ok: true, status: "submitted" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
