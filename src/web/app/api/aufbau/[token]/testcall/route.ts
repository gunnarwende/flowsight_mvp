import { NextResponse } from "next/server";
import { getCockpitSessionByToken } from "@/src/lib/cockpit/cockpitSessions";
import type { CockpitSession, VoiceWissen } from "@/src/lib/cockpit/types";

export const dynamic = "force-dynamic";

const RETELL_BASE = "https://api.retellai.com";

/**
 * POST /api/aufbau/[token]/testcall — startet einen Lisa-Testanruf (OC6).
 *
 * Erzeugt einen Retell-WEB-Call gegen den geteilten Cockpit-Test-Agenten und
 * injiziert die Draft-Config als `retell_llm_dynamic_variables` (die 24
 * Schablonen-Platzhalter). KEIN Publish, KEIN Per-Session-Agent. Der Call trägt
 * `metadata.is_demo=true` → der Webhook markiert den entstehenden Fall als Demo
 * (fällt aus den KPIs, G6). Gibt { accessToken } zurück (Browser-SDK verbindet).
 *
 * Voraussetzung: env RETELL_API_KEY + RETELL_COCKPIT_TEST_AGENT_ID (der einmal
 * angelegte/publishte Test-Agent, dessen Prompt die {{Platzhalter}} nutzt).
 * Fehlt der Agent → 503 (ready-to-test; nichts wird hier publisht).
 */

/** Effektiver Wissens-Wert: Draft-Korrektur über Vorbefüllung. */
function eff(session: CockpitSession, key: keyof VoiceWissen): string {
  const d = session.draft?.voice?.wissen?.[key];
  if (typeof d === "string" && d.trim()) return d;
  return session.prefill.voice.wissen[key] ?? "";
}

function buildDynamicVariables(session: CockpitSession): Record<string, string> {
  const pf = session.prefill;
  const categories = pf.wizard.categories.map((c) => c.label).join(" | ");
  return {
    company_name: pf.voice.companyName,
    domain: pf.voice.domain,
    owner_names: eff(session, "ownerNames"),
    address: eff(session, "address"),
    address_spoken: eff(session, "addressSpoken"),
    phone: eff(session, "phone"),
    email: eff(session, "email"),
    website: eff(session, "website"),
    founded: eff(session, "founded"),
    team_section: eff(session, "teamSection"),
    memberships: eff(session, "memberships"),
    google_rating: eff(session, "googleRating"),
    opening_hours: eff(session, "openingHours"),
    opening_hours_spoken: eff(session, "openingHoursSpoken"),
    emergency_policy: eff(session, "emergencyPolicy"),
    services_list: eff(session, "servicesList"),
    service_area: eff(session, "serviceArea"),
    service_area_spoken: eff(session, "serviceAreaSpoken"),
    price_section: "",
    price_deflect: eff(session, "priceDeflect"),
    jobs_section: "",
    jobs_spoken: eff(session, "jobsSpoken"),
    categories,
  };
}

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
    return NextResponse.json({ error: "locked" }, { status: 409 });
  }

  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_COCKPIT_TEST_AGENT_ID;
  if (!apiKey || !agentId) {
    // Ready-to-test: der Test-Agent ist noch nicht angelegt/konfiguriert.
    return NextResponse.json(
      { error: "test_agent_not_configured" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${RETELL_BASE}/v2/create-web-call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        agent_id: agentId,
        retell_llm_dynamic_variables: buildDynamicVariables(session),
        metadata: {
          is_demo: true,
          source: "cockpit_test",
          cockpit_session: token,
          tenant_id: session.tenant_id,
          company_name: session.company_name,
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "retell_error", status: res.status, detail: detail.slice(0, 300) },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { access_token?: string; call_id?: string };
    if (!data.access_token) {
      return NextResponse.json({ error: "no_access_token" }, { status: 502 });
    }
    return NextResponse.json({ accessToken: data.access_token, callId: data.call_id ?? null });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
