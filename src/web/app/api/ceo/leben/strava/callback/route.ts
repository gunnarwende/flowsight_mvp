import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { exchangeCode, backfill, appOrigin } from "@/src/lib/leben/strava";

// GET /api/ceo/leben/strava/callback — OAuth-Rueckkehr von Strava.
// Tauscht den Code gegen Tokens, holt die letzten Aktivitaeten, geht zurueck zur App.
export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.redirect(`${appOrigin(req)}/ceo/login`);
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const base = `${appOrigin(req)}/ceo/leben`;

  if (error || !code) {
    return NextResponse.redirect(`${base}?strava=denied`);
  }

  try {
    await exchangeCode(code);
    // Erst-Befuellung: die letzten ~30 Aktivitaeten direkt holen.
    await backfill(30).catch(() => 0);
    return NextResponse.redirect(`${base}?strava=connected`);
  } catch {
    return NextResponse.redirect(`${base}?strava=error`);
  }
}
