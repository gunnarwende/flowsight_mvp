import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

/**
 * GET /api/ops/tenants — Admin-only tenant list for Tenant Switcher.
 * Returns all real tenants (excludes "default" slug) with branding info.
 */
export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, slug, modules")
    .neq("slug", "default")
    .order("name");

  if (error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const tenants = (data ?? []).map((t) => {
    const modules = (t.modules ?? {}) as Record<string, unknown>;
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: typeof modules.primary_color === "string" ? modules.primary_color : "#64748b",
    };
  });

  return NextResponse.json(tenants);
}
