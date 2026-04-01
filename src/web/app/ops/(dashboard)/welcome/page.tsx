import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveTenantScope } from "@/src/lib/supabase/resolveTenantScope";
import { getServiceClient } from "@/src/lib/supabase/server";

// ---------------------------------------------------------------------------
// /ops/welcome — Prospect Welcome Page
//
// First premium moment for trial prospects. Shows:
// - Greeting with company name
// - Primary CTA: "Rufen Sie jetzt an" (product-led)
// - Secondary CTA: "Dashboard öffnen"
// - Trial info (dates, what's included)
//
// Admin users bypass → redirect to /ops/cases
// ---------------------------------------------------------------------------

interface TenantInfo {
  name: string;
  trial_start: string | null;
  trial_end: string | null;
  trial_status: string | null;
}

interface TenantNumberInfo {
  phone_number: string;
}

async function getTenantInfo(tenantId: string): Promise<{
  tenant: TenantInfo | null;
  phoneNumber: string | null;
}> {
  const supabase = getServiceClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, trial_start, trial_end, trial_status")
    .eq("id", tenantId)
    .single();

  const { data: number } = await supabase
    .from("tenant_numbers")
    .select("phone_number")
    .eq("tenant_id", tenantId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  return {
    tenant: tenant as TenantInfo | null,
    phoneNumber: (number as TenantNumberInfo | null)?.phone_number ?? null,
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatPhone(phone: string): string {
  // +41441234567 → 044 123 45 67
  if (phone.startsWith("+41") && phone.length === 12) {
    const local = "0" + phone.slice(3);
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8)}`;
  }
  return phone;
}

export default async function WelcomePage() {
  const scope = await resolveTenantScope();
  if (!scope) redirect("/ops/login");

  // Admin bypasses welcome → straight to cases
  if (scope.isAdmin) redirect("/ops/cases");

  // Must have a tenant assigned
  if (!scope.tenantId) redirect("/ops/cases");

  const { tenant, phoneNumber } = await getTenantInfo(scope.tenantId);
  if (!tenant) redirect("/ops/cases");

  const trialEndFmt = formatDate(tenant.trial_end);
  const trialStartFmt = formatDate(tenant.trial_start);

  // Calculate days remaining for countdown
  const daysRemaining = tenant.trial_end
    ? Math.max(
        0,
        Math.ceil(
          (new Date(tenant.trial_end).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            Trial aktiv
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
            Willkommen, {tenant.name}
          </h1>
          <p className="text-slate-400 text-base">
            Ihr 14-Tage Trial ist bereit. Testen Sie jetzt Ihre persönliche Telefonassistentin.
          </p>
        </div>

        {/* Primary CTA — Call test number */}
        {phoneNumber && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-4">
            <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Ihre Testnummer
            </div>
            <div className="text-2xl font-bold text-slate-100 tracking-wide mb-3">
              {formatPhone(phoneNumber)}
            </div>
            <a
              href={`tel:${phoneNumber}`}
              className="inline-flex items-center justify-center w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-base py-3 px-6 rounded-lg transition-colors"
            >
              Jetzt anrufen
            </a>
            <p className="text-slate-500 text-sm mt-3 text-center">
              Ihre Assistentin nimmt ab, erkennt das Anliegen und leitet alles strukturiert weiter.
            </p>
          </div>
        )}

        {/* Secondary CTA — Leitzentrale */}
        <Link
          href="/ops/cases"
          className="block w-full text-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-300 font-medium text-base py-3 px-6 rounded-lg transition-colors mb-6"
        >
          Leitzentrale öffnen
        </Link>

        {/* Trial Info */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            Trial-Zeitraum
          </div>
          <div className="text-slate-300 text-sm font-medium mb-1">
            {trialStartFmt} — {trialEndFmt}
          </div>
          {daysRemaining !== null && (
            <div className="text-amber-400 text-sm font-semibold mb-4">
              {daysRemaining > 0
                ? `${daysRemaining} ${daysRemaining === 1 ? "Tag" : "Tage"} verbleibend`
                : "Trial abgelaufen"}
            </div>
          )}

          <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            Das ist enthalten
          </div>
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Persönliche Telefonassistentin (24/7)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>SMS-Bestätigung nach jedem Anruf</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Leitzentrale mit Fallübersicht</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Bewertungssystem für Kunden</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Fragen? Gunnar Wende — 044 552 09 19 — flowsight.ch
        </p>
      </div>
    </div>
  );
}
