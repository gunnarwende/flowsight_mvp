import { NextRequest, NextResponse } from "next/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

const COOKIE_NAME = "fs_active_tenant";
const RECENT_COOKIE = "fs_recent_tenants";
const MAX_RECENT = 3;

/**
 * POST /api/ops/switch-tenant — Sets/clears the active tenant cookie.
 * Admin-only. HttpOnly, SameSite=Lax, path=/ops.
 *
 * Body: { tenantId: "uuid" } to switch, or { tenantId: null } to reset to home tenant.
 */
export async function POST(request: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const tenantId = body.tenantId as string | null;

  const res = NextResponse.json({ ok: true, tenantId });

  if (tenantId && /^[0-9a-f-]{36}$/i.test(tenantId)) {
    // Set active tenant cookie
    res.cookies.set(COOKIE_NAME, tenantId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/ops",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Update recent tenants list
    const existingRecent = request.cookies.get(RECENT_COOKIE)?.value;
    let recent: string[] = [];
    try { recent = JSON.parse(existingRecent ?? "[]"); } catch { /* ignore */ }
    recent = [tenantId, ...recent.filter((id) => id !== tenantId)].slice(0, MAX_RECENT);
    res.cookies.set(RECENT_COOKIE, JSON.stringify(recent), {
      httpOnly: true,
      sameSite: "lax",
      path: "/ops",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    // Clear → reset to home tenant (JWT)
    res.cookies.delete({ name: COOKIE_NAME, path: "/ops" });
  }

  return res;
}
