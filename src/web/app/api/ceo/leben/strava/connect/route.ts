import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { STRAVA_AUTHORIZE, STRAVA_SCOPE, stravaConfigured, appOrigin } from "@/src/lib/leben/strava";

// GET /api/ceo/leben/strava/connect — leitet zur Strava-Freigabe weiter.
export async function GET(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!stravaConfigured()) {
    return NextResponse.json({ error: "strava_not_configured" }, { status: 503 });
  }

  const redirectUri = `${appOrigin(req)}/api/ceo/leben/strava/callback`;
  const url = new URL(STRAVA_AUTHORIZE);
  url.searchParams.set("client_id", process.env.STRAVA_CLIENT_ID!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("approval_prompt", "auto");
  url.searchParams.set("scope", STRAVA_SCOPE);

  return NextResponse.redirect(url.toString());
}
