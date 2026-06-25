import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

export const dynamic = "force-dynamic";

/**
 * GET /api/ceo/journey
 *
 * Liefert das Daten-Fundament der Customer Journey (Bauplan:
 * docs/gtm/customer_journey_buildplan.md):
 *   - leads:  die gepflegte Lead-Liste (DB-SSOT, ersetzt das localStorage-HTML)
 *   - funnel: die 8-Sterne-Stufen, abgeleitet aus leads.status + journey_events
 *             + proof_pages (Gesehen) + cockpit_sessions (Onboarding/Live)
 *   - stats:  Tages-/Wochen-Kennzahlen
 *
 * Founder-privat: nur über getServiceClient() (RLS-no-policy auf leads/events).
 */
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // ── Leads (die Wurzel) ──────────────────────────────────────────────
  // WICHTIG: Supabase/PostgREST liefert pro Abfrage max. 1000 Zeilen. Bei der
  // Vollerfassung stehen aber >1000 Betriebe in der DB → ohne Pagination würde
  // die Kontaktliste stillschweigend bei 1000 abschneiden (Founder sah „genau
  // 1000"). Darum in 1000er-Fenstern durchblättern, bis alles geladen ist.
  // Stabiler Tiebreaker (id), damit sich die Fenster nicht überlappen/auslassen.
  const PAGE = 1000;
  const all: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from("leads")
      .select(
        "id, place_id, firma, ort, plz, ring, ma_proxy, tariff, inhaber_am_telefon, entscheider, rolle, mail, telefon, website, rating, reviews, icp_score, tier, signale, status, letzter_kontakt, naechster_schritt, naechster_am, notiz, updated_at"
      )
      .order("ring", { ascending: true })
      .order("icp_score", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    all.push(...(page ?? []));
    if (!page || page.length < PAGE) break;
  }

  // ── Events (Funnel-Verlauf) ─────────────────────────────────────────
  const { data: events } = await supabase
    .from("journey_events")
    .select("event_type, occurred_at");
  const ev = events ?? [];
  const countEv = (type: string) => ev.filter((e) => e.event_type === type).length;

  // ── Proof-Pages (Stern 3 Simulation + Stern 4 Gesehen) ──────────────
  const { data: proofs } = await supabase
    .from("proof_pages")
    .select("token, company_name, variant, view_count, first_viewed_at, last_viewed_at, status, lead_id, created_at")
    .order("created_at", { ascending: false });
  const pp = proofs ?? [];
  const simSent = pp.length;
  const seen = pp.filter((p) => (p.view_count ?? 0) > 0).length;

  // ── Cockpit-Sessions (Stern 6 Aufbau + Stern 7 Go-live) ─────────────
  const { data: cockpits } = await supabase
    .from("cockpit_sessions")
    .select("token, company_name, slug, status, lead_id, created_at, submitted_at, approved_at, live_at")
    .order("created_at", { ascending: false });
  const cs = cockpits ?? [];
  const onboarding = cs.filter((c) => ["building", "submitted", "approved"].includes(c.status)).length;
  const kunden = cs.filter((c) => c.status === "live").length;

  // ── Funnel (8 Sterne) ───────────────────────────────────────────────
  const kontaktiert = all.filter((l) => l.status && l.status !== "neu").length;
  const jaLeads = all.filter((l) => l.status === "ja").length;

  const funnel = [
    { star: 1, key: "kontakt", label: "Kontaktliste", value: all.length },
    { star: 2, key: "coldcall", label: "Cold Call", value: Math.max(kontaktiert, countEv("call_dialed")) },
    { star: 2, key: "erreicht", label: "Erreicht", value: countEv("call_reached") },
    { star: 2, key: "ja", label: "Ja zur Simulation", value: Math.max(jaLeads, countEv("ja_to_sim")) },
    { star: 3, key: "simulation", label: "Simulation versandt", value: simSent },
    { star: 4, key: "gesehen", label: "Gesehen", value: seen },
    { star: 5, key: "warm", label: "Warmes Gespräch", value: countEv("warm_call") },
    { star: 6, key: "onboarding", label: "Aufbau", value: onboarding },
    { star: 7, key: "kunde", label: "Kunde", value: kunden },
  ];

  // ── Tages-/Wochen-Stats ─────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 86400_000).toISOString().slice(0, 10);
  const evDay = (type: string) =>
    ev.filter((e) => e.event_type === type && (e.occurred_at ?? "").slice(0, 10) === today).length;
  const evWeek = (type: string) =>
    ev.filter((e) => e.event_type === type && (e.occurred_at ?? "").slice(0, 10) >= weekAgo).length;

  const stats = {
    gespraecheHeute: evDay("call_reached"),
    jaWoche: evWeek("ja_to_sim"),
    waehlversucheHeute: evDay("call_dialed"),
  };

  return NextResponse.json({
    leads: all,
    funnel,
    stats,
    proofs: pp,
    cockpits: cs,
    snapshot_at: new Date().toISOString(),
  });
}
