import Link from "next/link";
import { getServiceClient } from "@/src/lib/supabase/server";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { redirect } from "next/navigation";

export default async function GuestWatchPage() {
  const scope = await resolveTenantScope();
  if (!scope?.tenantId) redirect("/ops/login");

  const supabase = getServiceClient();

  // Get all no-show reservations grouped by phone
  const { data: noShows } = await supabase
    .from("pub_reservations")
    .select("guest_name, guest_phone, reservation_date, reservation_time, party_size")
    .eq("tenant_id", scope.tenantId)
    .eq("status", "no_show")
    .order("reservation_date", { ascending: false });

  // Group by phone number
  const byPhone: Record<string, { name: string; phone: string; count: number; lastDate: string }> = {};
  for (const r of noShows ?? []) {
    const key = r.guest_phone || "unknown";
    if (!byPhone[key]) {
      byPhone[key] = { name: r.guest_name, phone: key, count: 0, lastDate: r.reservation_date };
    }
    byPhone[key].count++;
  }

  const flaggedGuests = Object.values(byPhone).sort((a, b) => b.count - a.count);
  const yellowCards = flaggedGuests.filter(g => g.count === 1);
  const redCards = flaggedGuests.filter(g => g.count >= 2);

  return (
    <div className="space-y-4">
      <Link href="/ops/pub-dashboard" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </Link>

      <h1 className="text-lg font-bold text-gray-900">Guest Watch</h1>
      <p className="text-xs text-gray-400">Guests who reserved but didn&apos;t show up. Read-only overview.</p>

      {flaggedGuests.length === 0 ? (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
          <span className="text-3xl">&#x2705;</span>
          <p className="mt-2 text-sm font-medium text-emerald-800">All clear!</p>
          <p className="text-xs text-emerald-600 mt-1">No flagged guests yet. When you mark a reservation as &quot;No Show&quot;, the guest will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Red Cards */}
          {redCards.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                &#x1F534; Red Card ({redCards.length})
              </p>
              <div className="space-y-2">
                {redCards.map(g => (
                  <div key={g.phone} className="rounded-xl bg-red-50 border border-red-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-red-900">{g.name}</p>
                        <a href={`tel:${g.phone}`} className="text-xs text-red-600 hover:underline">{g.phone}</a>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-700">{g.count}</p>
                        <p className="text-[10px] text-red-500 uppercase">no-shows</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-red-400 mt-1">Last: {g.lastDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yellow Cards */}
          {yellowCards.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
                &#x1F7E1; Yellow Card ({yellowCards.length})
              </p>
              <div className="space-y-2">
                {yellowCards.map(g => (
                  <div key={g.phone} className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-amber-900">{g.name}</p>
                        <a href={`tel:${g.phone}`} className="text-xs text-amber-600 hover:underline">{g.phone}</a>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-700">1</p>
                        <p className="text-[10px] text-amber-500 uppercase">no-show</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-400 mt-1">Last: {g.lastDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
