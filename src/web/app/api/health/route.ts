import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// GET /api/health — System health check
//
// Checks:
//   1. Vercel process alive (implicit — if this runs, it's alive)
//   2. Supabase DB connectivity (lightweight count query)
//   3. Resend API key present (presence check, no API call)
//
// Returns:
//   { ok: boolean, ts, commit, env, db: "ok"|"fail", email: "ok"|"missing_key" }
//
// Used by: Morning Report (health line), external monitoring
// ---------------------------------------------------------------------------

export async function GET() {
  const checks: Record<string, string> = {};
  let allOk = true;

  // ── DB connectivity ─────────────────────────────────────────────────
  try {
    const supabase = getServiceClient();
    const { error } = await supabase
      .from("tenants")
      .select("id", { count: "exact", head: true });

    if (error) {
      checks.db = `fail: ${error.message}`;
      allOk = false;
    } else {
      checks.db = "ok";
    }
  } catch (err) {
    checks.db = `fail: ${err instanceof Error ? err.message : "unknown"}`;
    allOk = false;
  }

  // ── Resend API key presence ─────────────────────────────────────────
  const hasResendKey = !!process.env.RESEND_API_KEY;
  checks.email = hasResendKey ? "ok" : "missing_key";
  if (!hasResendKey) allOk = false;

  return NextResponse.json({
    ok: allOk,
    ts: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    env: process.env.VERCEL_ENV ?? "development",
    ...checks,
  });
}
