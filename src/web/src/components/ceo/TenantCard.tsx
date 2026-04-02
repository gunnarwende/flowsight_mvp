"use client";

import { useState } from "react";
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
  test_phone?: string | null;
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
  { key: "website_wizard", label: "Formular", icon: "F" },
  { key: "ops", label: "Leitsystem", icon: "L" },
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

export function TenantCard({ tenant, hasUpdate }: { tenant: TenantCardData; hasUpdate?: boolean }) {
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
          {hasUpdate && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" title="Update verfügbar" />
          )}
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

      {/* Quick-Actions row */}
      <QuickActions tenant={tenant} />
    </Link>
  );
}

function QuickActions({ tenant }: { tenant: TenantCardData }) {
  const [copied, setCopied] = useState(false);
  const phone = tenant.test_phone;
  const websiteUrl = `https://flowsight.ch/kunden/${tenant.slug}`;
  const wizardUrl = `https://flowsight.ch/kunden/${tenant.slug}/meldung`;

  function copyAll(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const lines = [
      `${tenant.name}`,
      `Website: ${websiteUrl}`,
      `Formular: ${wizardUrl}`,
      ...(phone ? [`Testnummer: ${phone}`] : []),
      `Leitzentrale: https://flowsight.ch/ops`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-1.5 pt-3 border-t border-navy-50">
      {/* Testnummer */}
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={(e) => e.stopPropagation()}
          title="Testnummer anrufen"
          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
        </a>
      )}
      {/* Website */}
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title="Website"
        className="w-8 h-8 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center hover:bg-navy-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      </a>
      {/* Wizard */}
      <a
        href={wizardUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        title="Meldungsformular"
        className="w-8 h-8 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center hover:bg-navy-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </a>
      {/* Copy all */}
      <button
        onClick={copyAll}
        title={copied ? "Kopiert!" : "Alle Links kopieren"}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          copied ? "bg-emerald-50 text-emerald-600" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
        }`}
      >
        {copied ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
          </svg>
        )}
      </button>
      {/* Details link */}
      <span className="ml-auto text-[10px] text-gray-400 group-hover:text-gold-500 transition-colors font-medium">
        Details &rarr;
      </span>
    </div>
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
