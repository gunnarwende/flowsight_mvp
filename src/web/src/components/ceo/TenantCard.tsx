"use client";

import Link from "next/link";

export interface TenantCardData {
  id: string;
  slug: string;
  name: string;
  trial_status: string | null;
  trial_start: string | null;
  trial_end: string | null;
  modules: Record<string, unknown> | null;
  prospect_phone: string | null;
  prospect_email: string | null;
  case_count_7d: number;
  case_count_total: number;
  last_case_at: string | null;
  done_count: number;
  review_rate: number;
  staff_count: number;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  converted: { label: "Live", cls: "bg-emerald-600 text-white" },
  trial_active: { label: "Trial", cls: "bg-gold-500 text-navy-950" },
  live_dock: { label: "Trial", cls: "bg-gold-500 text-navy-950" },
  interested: { label: "Prospect", cls: "bg-navy-400 text-white" },
  decision_pending: { label: "Pending", cls: "bg-amber-500 text-navy-950" },
  offboarded: { label: "Archiv", cls: "bg-gray-400 text-white" },
};

const MODULE_ICONS: { key: string; label: string; icon: string }[] = [
  { key: "voice", label: "Voice", icon: "V" },
  { key: "wizard", label: "Formular", icon: "F" },
  { key: "ops", label: "Leitstand", icon: "L" },
  { key: "reviews", label: "Bewertung", icon: "B" },
  { key: "sms", label: "SMS", icon: "S" },
];

function healthColor(data: TenantCardData): string {
  if (data.case_count_7d > 0) return "text-emerald-500";
  if (!data.last_case_at) return "text-gray-300";
  const daysSince = (Date.now() - new Date(data.last_case_at).getTime()) / 86400_000;
  if (daysSince > 7) return "text-red-500";
  return "text-amber-500";
}

function healthBg(data: TenantCardData): string {
  if (data.case_count_7d > 0) return "stroke-emerald-500";
  if (!data.last_case_at) return "stroke-gray-300";
  const daysSince = (Date.now() - new Date(data.last_case_at).getTime()) / 86400_000;
  if (daysSince > 7) return "stroke-red-500";
  return "stroke-amber-500";
}

function HealthRing({ data }: { data: TenantCardData }) {
  const color = healthBg(data);
  // Simple ring: full if cases_7d > 0, half if recent, empty if stale
  let pct = 0;
  if (data.case_count_7d > 0) pct = 100;
  else if (data.last_case_at) {
    const days = (Date.now() - new Date(data.last_case_at).getTime()) / 86400_000;
    pct = days > 7 ? 15 : 50;
  }
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" strokeWidth="3" className="stroke-navy-100" />
      <circle
        cx="20" cy="20" r={r} fill="none" strokeWidth="3"
        className={color}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TenantCard({ tenant }: { tenant: TenantCardData }) {
  const badge = STATUS_BADGE[tenant.trial_status ?? ""] ?? {
    label: tenant.trial_status ?? "?",
    cls: "bg-gray-300 text-gray-700",
  };

  const enabledModules = MODULE_ICONS.filter((m) => {
    if (!tenant.modules) return false;
    const val = tenant.modules[m.key];
    if (typeof val === "boolean") return val;
    if (typeof val === "object" && val !== null && "enabled" in val) return (val as { enabled: boolean }).enabled;
    return !!val;
  });

  return (
    <Link
      href={`/ceo/betriebe/${tenant.id}`}
      className="block bg-white border border-navy-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-navy-900 truncate group-hover:text-gold-500 transition-colors">
            {tenant.name}
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">{tenant.slug}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
          <HealthRing data={tenant} />
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <MiniKpi label="7d" value={tenant.case_count_7d} color={healthColor(tenant)} />
        <MiniKpi label="Total" value={tenant.case_count_total} />
        <MiniKpi label="Review" value={`${tenant.review_rate}%`} />
        <MiniKpi label="Team" value={tenant.staff_count} />
      </div>

      {/* Module dots */}
      {enabledModules.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          {enabledModules.map((m) => (
            <span
              key={m.key}
              title={m.label}
              className="w-6 h-6 rounded-full bg-navy-100 text-navy-600 text-[9px] font-bold flex items-center justify-center"
            >
              {m.icon}
            </span>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-3 border-t border-navy-50">
        {tenant.prospect_phone && (
          <a
            href={`tel:${tenant.prospect_phone}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 text-navy-950 text-[11px] font-semibold hover:bg-gold-400 transition-colors min-h-[44px]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            Anrufen
          </a>
        )}
        <span className="ml-auto text-[10px] text-gray-400 group-hover:text-gold-500 transition-colors font-medium">
          Details &rarr;
        </span>
      </div>
    </Link>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="text-center">
      <span className={`block text-base font-extrabold leading-none ${color ?? "text-navy-900"}`}>
        {value}
      </span>
      <span className="block text-[9px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
