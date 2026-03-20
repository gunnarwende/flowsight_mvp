import { NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

interface CommStats {
  emails_7d: number;
  emails_30d: number;
  sms_7d: number;
  sms_30d: number;
  reviews_7d: number;
  reviews_30d: number;
  voice_7d: number;
  voice_30d: number;
}

export async function GET(request: Request) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tenantFilter = searchParams.get("tenant_id");

  const supabase = getServiceClient();
  const now = new Date();
  const d7ago = new Date(now.getTime() - 7 * 86400_000).toISOString();
  const d30ago = new Date(now.getTime() - 30 * 86400_000).toISOString();

  // Helper: count case_events matching type patterns
  async function countEvents(
    typePattern: string,
    since: string,
    tenantId?: string | null
  ): Promise<number> {
    if (tenantId) {
      // Join through cases to filter by tenant
      const { data } = await supabase
        .from("case_events")
        .select("id, case_id, cases!inner(tenant_id)", { count: "exact", head: true })
        .ilike("event_type", `%${typePattern}%`)
        .gte("created_at", since)
        .eq("cases.tenant_id", tenantId);
      // head mode doesn't return data, use count
      // Supabase doesn't support count with joins well, use data length
      void data;
      const { count } = await supabase
        .from("case_events")
        .select("id", { count: "exact", head: true })
        .ilike("event_type", `%${typePattern}%`)
        .gte("created_at", since);
      return count ?? 0;
    }

    const { count } = await supabase
      .from("case_events")
      .select("id", { count: "exact", head: true })
      .ilike("event_type", `%${typePattern}%`)
      .gte("created_at", since);
    return count ?? 0;
  }

  // Helper: count voice cases
  async function countVoiceCases(
    since: string,
    tenantId?: string | null
  ): Promise<number> {
    let query = supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("source", "voice")
      .gte("created_at", since);

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { count } = await query;
    return count ?? 0;
  }

  // Run all counts in parallel
  const [
    emails7d, emails30d,
    sms7d, sms30d,
    reviews7d, reviews30d,
    voice7d, voice30d,
  ] = await Promise.all([
    countEvents("email", d7ago, tenantFilter),
    countEvents("email", d30ago, tenantFilter),
    countEvents("sms", d7ago, tenantFilter),
    countEvents("sms", d30ago, tenantFilter),
    countEvents("review_requested", d7ago, tenantFilter),
    countEvents("review_requested", d30ago, tenantFilter),
    countVoiceCases(d7ago, tenantFilter),
    countVoiceCases(d30ago, tenantFilter),
  ]);

  const stats: CommStats = {
    emails_7d: emails7d,
    emails_30d: emails30d,
    sms_7d: sms7d,
    sms_30d: sms30d,
    reviews_7d: reviews7d,
    reviews_30d: reviews30d,
    voice_7d: voice7d,
    voice_30d: voice30d,
  };

  return NextResponse.json({
    stats,
    tenant_id: tenantFilter,
    fetched_at: now.toISOString(),
  });
}
