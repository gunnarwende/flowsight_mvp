import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";

const PRICE_PER_TENANT = 299; // CHF/month

export async function GET() {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();

  // Current month start (for MRR)
  const d90ago = new Date(now.getTime() - 90 * 86400_000).toISOString();

  // Parallel queries
  const [convertedRes, offboardedRes, costsRes, recentConvertedRes] =
    await Promise.all([
      // Active paying customers
      supabase
        .from("tenants")
        .select("slug, name, trial_status")
        .eq("trial_status", "converted"),
      // Offboarded in last 90 days (for churn)
      supabase
        .from("tenants")
        .select("slug", { count: "exact", head: true })
        .eq("trial_status", "offboarded"),
      // Costs last 12 months
      supabase
        .from("ceo_costs")
        .select("*")
        .gte(
          "month",
          new Date(now.getFullYear(), now.getMonth() - 11, 1)
            .toISOString()
            .slice(0, 10),
        )
        .order("month", { ascending: false }),
      // New conversions in last 90 days (for CAC)
      supabase
        .from("tenants")
        .select("slug", { count: "exact", head: true })
        .eq("trial_status", "converted")
        .gte("updated_at", d90ago),
    ]);

  const convertedCount = convertedRes.data?.length ?? 0;
  const offboardedCount = offboardedRes.count ?? 0;
  const costs = costsRes.data ?? [];
  const newCustomers3m = recentConvertedRes.count ?? 0;

  // MRR
  const mrr = convertedCount * PRICE_PER_TENANT;

  // Current month costs
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthCosts = costs
    .filter((c) => (c.month as string).startsWith(currentMonthStr))
    .reduce((sum, c) => sum + Number(c.amount_chf), 0);

  // Previous month costs (for trend)
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthCosts = costs
    .filter((c) => (c.month as string).startsWith(prevMonthStr))
    .reduce((sum, c) => sum + Number(c.amount_chf), 0);

  // Net P&L
  const netPL = mrr - currentMonthCosts;

  // Unit economics
  const totalCosts3m = costs
    .filter((c) => new Date(c.month as string) >= new Date(d90ago))
    .reduce((sum, c) => sum + Number(c.amount_chf), 0);
  const cac = newCustomers3m > 0 ? Math.round(totalCosts3m / newCustomers3m) : null;
  const ltvPerCustomer = PRICE_PER_TENANT * 12; // 12-month estimate
  const ltvCacRatio =
    cac && cac > 0 ? Math.round((ltvPerCustomer / cac) * 10) / 10 : null;
  const totalForChurn = convertedCount + offboardedCount;
  const churnRate =
    totalForChurn > 0
      ? Math.round((offboardedCount / totalForChurn) * 1000) / 10
      : 0;

  // Cost breakdown by vendor (current month + previous for trend)
  const vendors = [
    "Vercel",
    "Supabase",
    "Resend",
    "Twilio",
    "Retell",
    "Peoplefone",
    "eCall",
    "Sonstiges",
  ];
  const costBreakdown = vendors.map((vendor) => {
    const current = costs
      .filter(
        (c) =>
          c.vendor === vendor &&
          (c.month as string).startsWith(currentMonthStr),
      )
      .reduce((s, c) => s + Number(c.amount_chf), 0);
    const prev = costs
      .filter(
        (c) =>
          c.vendor === vendor &&
          (c.month as string).startsWith(prevMonthStr),
      )
      .reduce((s, c) => s + Number(c.amount_chf), 0);
    const trend = current > prev ? "up" : current < prev ? "down" : "flat";
    return { vendor, current, prev, trend };
  });

  return NextResponse.json({
    mrr,
    convertedCount,
    currentMonthCosts,
    prevMonthCosts,
    netPL,
    unitEconomics: {
      cac,
      ltv: ltvPerCustomer,
      ltvCacRatio,
      churnRate,
      newCustomers3m,
    },
    costBreakdown,
    costs, // raw for table
    snapshot_at: now.toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const scope = await resolveTenantScope();
  if (!scope?.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { month, vendor, amount_chf, notes } = body as {
    month: string;
    vendor: string;
    amount_chf: number;
    notes?: string;
  };

  if (!month || !vendor || amount_chf == null) {
    return NextResponse.json(
      { error: "month, vendor, amount_chf required" },
      { status: 400 },
    );
  }

  const supabase = getServiceClient();

  // Upsert (unique on vendor + month)
  const { data, error } = await supabase
    .from("ceo_costs")
    .upsert(
      { month, vendor, amount_chf, notes: notes ?? null },
      { onConflict: "vendor,month" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, entry: data });
}
