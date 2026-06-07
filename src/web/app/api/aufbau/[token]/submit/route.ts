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
  const staff = Array.isArray(draft.staff) ? draft.staff : [];
  const validStaff = staff.filter(
    (s) => s && s.name?.trim() && EMAIL_RE.test(s.email ?? ""),
  );
  if (validStaff.length === 0) missing.push("staff");
  else if (!validStaff.some((s) => s.role === "admin")) missing.push("staff_admin");

  if (!EMAIL_RE.test(draft.review?.notificationEmail ?? "")) missing.push("notification_email");
  if (!(draft.review?.googleReviewUrl ?? "").trim()) missing.push("google_review_url");
  if (!EMAIL_RE.test(draft.golive?.adminEmail ?? "")) missing.push("admin_email");
  if (draft.golive?.avvAccepted !== true) missing.push("avv");
  if (!(draft.voice?.greetingText ?? "").trim()) missing.push("greeting");
  if (!draft.wizard?.distribution) missing.push("wizard_distribution");

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
