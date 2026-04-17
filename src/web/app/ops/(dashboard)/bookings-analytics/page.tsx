import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BookingsAnalyticsPage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  const tenantId = scope.tenantId;
  if (!tenantId) redirect("/ops/cases");

  const supabase = getServiceClient();

  // All-time source counts
  const { data: allRows } = await supabase
    .from("pub_reservations")
    .select("source, reservation_date")
    .eq("tenant_id", tenantId);

  const rows = allRows ?? [];

  // All-time totals by source
  const totals: Record<string, number> = { manual: 0, website: 0, voice: 0 };
  for (const r of rows) {
    const src = r.source ?? "unknown";
    if (src in totals) {
      totals[src] += 1;
    }
  }
  const grandTotal = totals.manual + totals.website + totals.voice;

  // Monthly breakdown: last 3 months
  const now = new Date();
  const months: { label: string; key: string }[] = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    months.push({ label, key });
  }

  type MonthRow = { manual: number; website: number; voice: number };
  const monthly: Record<string, MonthRow> = {};
  for (const m of months) {
    monthly[m.key] = { manual: 0, website: 0, voice: 0 };
  }
  for (const r of rows) {
    if (!r.reservation_date) continue;
    const key = r.reservation_date.substring(0, 7); // "YYYY-MM"
    const src = r.source ?? "unknown";
    if (key in monthly && src in monthly[key]) {
      monthly[key][src as keyof MonthRow] += 1;
    }
  }

  const sparse = grandTotal < 5;

  return (
    <div className="space-y-6">
      {/* Back button + title */}
      <div>
        <Link
          href="/ops/pub-dashboard"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
        <h1 className="text-lg font-bold text-gray-900">Bookings Analytics</h1>
        <p className="text-xs text-gray-400">Where your reservations come from</p>
      </div>

      {sparse ? (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8 text-center">
          <p className="text-2xl mb-2">{"\uD83D\uDCCA"}</p>
          <p className="text-sm text-gray-600 font-medium">Not enough data yet</p>
          <p className="text-xs text-gray-400 mt-1">Check back in a few weeks!</p>
        </div>
      ) : (
        <>
          {/* Big number cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-center">
              <p className="text-2xl mb-1">{"\uD83D\uDEB6"}</p>
              <p className="text-3xl font-bold text-gray-900">{totals.manual}</p>
              <p className="text-xs text-gray-500 mt-1">Walk-in</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-center">
              <p className="text-2xl mb-1">{"\uD83C\uDF10"}</p>
              <p className="text-3xl font-bold text-gray-900">{totals.website}</p>
              <p className="text-xs text-gray-500 mt-1">Online</p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm text-center">
              <p className="text-2xl mb-1">{"\uD83D\uDCDE"}</p>
              <p className="text-3xl font-bold text-gray-900">{totals.voice}</p>
              <p className="text-xs text-gray-500 mt-1">Phone</p>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">Monthly Breakdown</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase">
                  <th className="text-left px-4 py-2 font-medium">Month</th>
                  <th className="text-center px-2 py-2 font-medium">{"\uD83D\uDEB6"} Walk-in</th>
                  <th className="text-center px-2 py-2 font-medium">{"\uD83C\uDF10"} Online</th>
                  <th className="text-center px-2 py-2 font-medium">{"\uD83D\uDCDE"} Phone</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => {
                  const d = monthly[m.key];
                  return (
                    <tr key={m.key} className="border-t border-gray-50">
                      <td className="px-4 py-2.5 text-gray-700 font-medium">{m.label}</td>
                      <td className="text-center px-2 py-2.5 text-gray-600">{d.manual}</td>
                      <td className="text-center px-2 py-2.5 text-gray-600">{d.website}</td>
                      <td className="text-center px-2 py-2.5 text-gray-600">{d.voice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
