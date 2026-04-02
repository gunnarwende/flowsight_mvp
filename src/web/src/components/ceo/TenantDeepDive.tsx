"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TenantDetail {
  tenant: {
    id: string;
    slug: string;
    name: string;
    created_at: string;
    trial_status: string | null;
    trial_start: string | null;
    trial_end: string | null;
    follow_up_at: string | null;
    modules: Record<string, unknown> | null;
    prospect_phone: string | null;
    prospect_email: string | null;
  };
  stats: {
    case_count_total: number;
    case_count_7d: number;
    case_count_30d: number;
    done_count: number;
    review_count: number;
    review_rate: number;
    voice_percent: number;
    wizard_percent: number;
    done_percent: number;
    last_case_at: string | null;
    staff_count: number;
  };
  source_breakdown: { voice: number; wizard: number; manual: number };
  status_breakdown: Record<string, number>;
  staff: { id: string; display_name: string; role: string; phone: string | null; email: string | null; is_active: boolean }[];
  trial: {
    days_remaining: number | null;
    milestones: { day7_checked: boolean; day10_alerted: boolean; day13_reminded: boolean; day14_marked: boolean };
  };
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  converted: { label: "Live", cls: "bg-emerald-600 text-white" },
  trial_active: { label: "Trial", cls: "bg-gold-500 text-navy-950" },
  live_dock: { label: "Trial", cls: "bg-gold-500 text-navy-950" },
  interested: { label: "Prospect", cls: "bg-navy-400 text-white" },
  decision_pending: { label: "Pending", cls: "bg-amber-500 text-navy-950" },
  offboarded: { label: "Archiv", cls: "bg-gray-400 text-white" },
};

const MODULE_LIST: { key: string; label: string }[] = [
  { key: "voice", label: "Voice (Lisa)" },
  { key: "wizard", label: "Meldungsformular" },
  { key: "ops", label: "Leitsystem" },
  { key: "reviews", label: "Bewertungs-Vorbereiter" },
  { key: "sms", label: "SMS-Benachrichtigung" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function TenantDeepDive({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReason, setAiReason] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/ceo/tenants/${tenantId}`);
      if (!res.ok) throw new Error("Fetch failed");
      setData(await res.json());
      setError("");
    } catch {
      setError("Betrieb konnte nicht geladen werden.");
    }
    setLoading(false);
  }, [tenantId]);

  const fetchInsight = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await fetch(`/api/ceo/ai/tenant-insight?tenant_id=${tenantId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.insight) {
          setAiInsight(json.insight);
        } else if (json.reason) {
          setAiReason(json.reason);
        }
      }
    } catch {
      // Non-critical
    } finally {
      setAiLoading(false);
    }
  }, [tenantId]);

  // Update detection via version polling
  const [initialVersion, setInitialVersion] = useState<string | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    fetchData();
    fetchInsight();
    // Capture initial version
    fetch(`/api/ceo/tenants/${tenantId}/version`)
      .then((r) => r.ok ? r.json() : null)
      .then((body) => { if (body?.version) setInitialVersion(body.version); })
      .catch(() => {});
  }, [fetchData, fetchInsight, tenantId]);

  // Poll version every 60s
  useEffect(() => {
    if (!initialVersion) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ceo/tenants/${tenantId}/version`);
        if (!res.ok) return;
        const body = await res.json();
        if (body.version && body.version !== initialVersion) {
          setHasUpdate(true);
        }
      } catch { /* silent */ }
    }, 60_000);
    return () => clearInterval(interval);
  }, [initialVersion, tenantId]);

  function handleRefresh() {
    setHasUpdate(false);
    fetchData();
    // Re-capture version
    fetch(`/api/ceo/tenants/${tenantId}/version`)
      .then((r) => r.ok ? r.json() : null)
      .then((body) => { if (body?.version) setInitialVersion(body.version); })
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-navy-100 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-navy-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-red-700 font-medium">{error || "Keine Daten."}</p>
          <button onClick={fetchData} className="mt-3 text-xs text-red-600 hover:text-red-800 underline">
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const { tenant, stats, source_breakdown, status_breakdown, staff, trial } = data;
  const badge = STATUS_BADGE[tenant.trial_status ?? ""] ?? { label: tenant.trial_status ?? "?", cls: "bg-gray-300 text-gray-700" };

  const isModuleEnabled = (key: string): boolean => {
    if (!tenant.modules) return false;
    const val = tenant.modules[key];
    if (typeof val === "boolean") return val;
    if (typeof val === "object" && val !== null && "enabled" in val) return (val as { enabled: boolean }).enabled;
    return !!val;
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <BackLink />

      {/* Update notification banner */}
      {hasUpdate && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3">
          <span className="text-sm text-amber-800 font-medium">Neue Daten verfügbar</span>
          <button
            onClick={handleRefresh}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
          >
            Aktualisieren
          </button>
        </div>
      )}

      <div className="bg-white border border-navy-100 rounded-2xl shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-extrabold text-navy-900 truncate">{tenant.name}</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-gray-400">{tenant.slug} &middot; Erstellt {formatDate(tenant.created_at)}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {tenant.prospect_phone && (
              <a
                href={`tel:${tenant.prospect_phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-950 text-xs font-semibold hover:bg-gold-400 transition-colors min-h-[44px]"
              >
                <PhoneIcon />
                Anrufen
              </a>
            )}
            {tenant.prospect_email && (
              <a
                href={`mailto:${tenant.prospect_email}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-navy-200 text-navy-700 text-xs font-semibold hover:bg-navy-50 transition-colors min-h-[44px]"
              >
                <MailIcon />
                E-Mail
              </a>
            )}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      {(aiLoading || aiInsight) && (
        <div className="bg-navy-900 rounded-2xl border border-navy-700 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            {/* Sparkle icon */}
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-gold-500 uppercase tracking-wider mb-2">AI Insight</p>
              {aiLoading ? (
                <p className="text-sm text-navy-300 animate-pulse">AI analysiert Betrieb...</p>
              ) : (
                <p className="text-sm text-navy-100 leading-relaxed">{aiInsight}</p>
              )}
            </div>
          </div>
        </div>
      )}
      {!aiLoading && !aiInsight && aiReason === "ai_not_configured" && (
        <div className="bg-navy-50 rounded-2xl border border-navy-100 px-5 py-3">
          <p className="text-xs text-navy-400">AI Insight verf&uuml;gbar wenn API-Key konfiguriert ist.</p>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiBox label="Fälle Total" value={stats.case_count_total} />
        <KpiBox label="Fälle 7d" value={stats.case_count_7d} accent={stats.case_count_7d > 0 ? "emerald" : undefined} />
        <KpiBox label="Fälle 30d" value={stats.case_count_30d} />
        <KpiBox label="Voice %" value={`${stats.voice_percent}%`} />
        <KpiBox label="Formular %" value={`${stats.wizard_percent}%`} />
        <KpiBox label="Erledigt %" value={`${stats.done_percent}%`} />
        <KpiBox label="Review Rate" value={`${stats.review_rate}%`} accent={stats.review_rate > 50 ? "emerald" : undefined} />
        <KpiBox label="Team" value={stats.staff_count} />
      </div>

      {/* Source breakdown */}
      <Section title="Quellen">
        <div className="grid grid-cols-3 gap-3">
          <MiniStat label="Voice" value={source_breakdown.voice} />
          <MiniStat label="Formular" value={source_breakdown.wizard} />
          <MiniStat label="Manuell" value={source_breakdown.manual} />
        </div>
      </Section>

      {/* Status breakdown */}
      {Object.keys(status_breakdown).length > 0 && (
        <Section title="Status-Verteilung">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(status_breakdown).map(([status, count]) => (
              <MiniStat key={status} label={status} value={count} />
            ))}
          </div>
        </Section>
      )}

      {/* Modules */}
      <Section title="Module">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MODULE_LIST.map((m) => {
            const enabled = isModuleEnabled(m.key);
            return (
              <div
                key={m.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  enabled ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${enabled ? "bg-emerald-500" : "bg-gray-300"}`} />
                <span className={`text-sm font-medium ${enabled ? "text-emerald-800" : "text-gray-400"}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Staff */}
      {staff.length > 0 && (
        <Section title={`Team (${staff.length})`}>
          <div className="divide-y divide-navy-50">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-navy-900">{s.display_name}</span>
                  <span className="ml-2 text-[10px] text-gray-400 uppercase font-medium">{s.role}</span>
                  {!s.is_active && (
                    <span className="ml-2 text-[10px] text-red-400 font-medium">inaktiv</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-shrink-0">
                  {s.phone && <span>{s.phone}</span>}
                  {s.email && <span className="hidden sm:inline">{s.email}</span>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Trial info */}
      {(tenant.trial_status === "trial_active" || tenant.trial_status === "live_dock") && (
        <Section title="Trial">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MiniStat label="Start" value={formatDate(tenant.trial_start)} />
            <MiniStat label="Ende" value={formatDate(tenant.trial_end)} />
            <MiniStat
              label="Tage übrig"
              value={trial.days_remaining ?? "–"}
              warn={trial.days_remaining !== null && trial.days_remaining <= 3}
            />
            <MiniStat label="Follow-up" value={formatDate(tenant.follow_up_at)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["day7_checked", "day10_alerted", "day13_reminded", "day14_marked"] as const).map((m) => {
              const labels: Record<string, string> = {
                day7_checked: "Tag 7",
                day10_alerted: "Tag 10",
                day13_reminded: "Tag 13",
                day14_marked: "Tag 14",
              };
              const done = trial.milestones[m];
              return (
                <span
                  key={m}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {labels[m]} {done ? "\u2713" : "\u2013"}
                </span>
              );
            })}
          </div>
        </Section>
      )}

      {/* Open Leitsystem in new tab */}
      <LeitsystemLink tenantId={data.tenant.id} tenantName={data.tenant.name} slug={data.tenant.slug} />
    </div>
  );
}

// ── Leitsystem Link (opens in new tab) ──────────────────────────────────────

function LeitsystemLink({ tenantId, tenantName, slug }: { tenantId: string; tenantName: string; slug: string }) {
  const [loading, setLoading] = useState(false);

  async function openLeitsystem() {
    setLoading(true);
    // Switch tenant cookie BEFORE opening the new tab
    await fetch("/api/ops/switch-tenant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId, viewAsRole: null }),
    });
    // Open in new tab — always fresh data, no cache issues
    window.open("/ops/cases", "_blank");
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <button
        onClick={openLeitsystem}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-navy-950 font-semibold text-sm hover:bg-gold-400 transition-colors shadow-sm min-h-[44px] disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
        {loading ? "Lade..." : "Leitsystem anzeigen"}
      </button>
      <p className="text-[10px] text-gray-400">
        {tenantName} &mdash; {slug}
      </p>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link
      href="/ceo/betriebe"
      className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-700 font-medium transition-colors min-h-[44px]"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Alle Betriebe
    </Link>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-navy-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-navy-50">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function KpiBox({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  const accentBorder: Record<string, string> = {
    emerald: "border-t-emerald-500",
    red: "border-t-red-500",
    amber: "border-t-amber-500",
  };

  return (
    <div className={`bg-white rounded-2xl border border-navy-100 ${accent ? `border-t-[3px] ${accentBorder[accent] ?? ""}` : ""} shadow-sm p-4 flex flex-col items-center justify-center min-h-[96px]`}>
      <span className="text-2xl font-extrabold text-navy-900 leading-none">{value}</span>
      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mt-2">{label}</span>
    </div>
  );
}

function MiniStat({ label, value, warn }: { label: string; value: number | string; warn?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 flex items-center justify-between ${warn ? "bg-red-50 border-red-200" : "bg-navy-50 border-navy-100"}`}>
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${warn ? "text-red-700" : "text-navy-900"}`}>{value}</span>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
