"use client";

import { useEffect, useState, useCallback } from "react";

interface HealthData {
  ok: boolean;
  ts?: string;
  commit?: string;
  env?: string;
  db?: string;
  email?: string;
}

interface Snapshot {
  id: string;
  severity: "green" | "yellow" | "red";
  snapshot_at: string;
  cases_24h: number;
  backlog_new: number;
  stuck_48h: number;
}

interface SystemInfo {
  commit: string | null;
  env: string;
  nodeVersion: string;
}

interface SentryIssue {
  title: string;
  culprit: string;
  count: string;
  lastSeen: string;
  level: string;
}

interface MonitoringData {
  health: HealthData;
  snapshots: Snapshot[];
  sentryIssues: SentryIssue[];
  sentryConfigured: boolean;
  systemInfo: SystemInfo;
  fetched_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

const SEVERITY_RING: Record<string, string> = {
  green: "ring-emerald-500/30",
  yellow: "ring-amber-500/30",
  red: "ring-red-500/30",
};

export function MonitoringView() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/monitoring");
      if (!res.ok) throw new Error("Monitoring fetch failed");
      setData(await res.json());
      setError("");
    } catch {
      setError("Daten konnten nicht geladen werden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000); // 60s auto-refresh
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-navy-300 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-700 font-medium">{error || "Keine Daten verfuegbar."}</p>
        <button onClick={fetchData} className="mt-3 text-sm text-red-600 underline hover:text-red-800">
          Erneut versuchen
        </button>
      </div>
    );
  }

  const { health, snapshots, sentryIssues, sentryConfigured, systemInfo, fetched_at } = data;
  const healthOk = health.ok === true;
  const healthSeverity = healthOk ? "green" : "red";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Letzte Aktualisierung: {new Date(fetched_at).toLocaleTimeString("de-CH")}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="text-xs text-gray-500 hover:text-navy-700 bg-white border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Aktualisieren
        </button>
      </div>

      {/* Health Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">System Health</h2>
        <div className="flex items-center gap-5">
          {/* Big indicator */}
          <div className="flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-full ${SEVERITY_COLORS[healthSeverity]} ring-4 ${SEVERITY_RING[healthSeverity]} flex items-center justify-center animate-pulse`}
            >
              {healthOk ? (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              )}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatusChip label="API" ok={true} />
            <StatusChip label="Datenbank" ok={health.db === "ok"} detail={health.db} />
            <StatusChip label="E-Mail" ok={health.email === "ok"} detail={health.email} />
          </div>
        </div>

        {health.ts && (
          <p className="text-[11px] text-gray-400 mt-3">
            Health-Check: {new Date(health.ts).toLocaleTimeString("de-CH")}
          </p>
        )}
      </div>

      {/* Pulse History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Pulse-Verlauf (letzte 7 Tage)</h2>
        {snapshots.length === 0 ? (
          <p className="text-sm text-gray-400">Noch keine Pulse-Snapshots vorhanden.</p>
        ) : (
          <div className="flex items-center gap-3">
            {snapshots
              .slice()
              .reverse()
              .map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full ${SEVERITY_COLORS[s.severity] ?? "bg-gray-300"}`}
                    title={`${new Date(s.snapshot_at).toLocaleDateString("de-CH")} — ${s.severity}`}
                  />
                  <span className="text-[10px] text-gray-400">
                    {new Date(s.snapshot_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>
              ))}
          </div>
        )}
        {snapshots.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <MiniStat label="Faelle (24h)" value={snapshots[0]?.cases_24h ?? 0} />
            <MiniStat label="Backlog" value={snapshots[0]?.backlog_new ?? 0} />
            <MiniStat label="Stuck >48h" value={snapshots[0]?.stuck_48h ?? 0} />
          </div>
        )}
      </div>

      {/* Sentry Digest */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Sentry Error Digest</h2>
        {!sentryConfigured ? (
          <p className="text-sm text-gray-400">Sentry API nicht konfiguriert. Setze SENTRY_API_TOKEN, SENTRY_ORG und SENTRY_PROJECT auf Vercel.</p>
        ) : sentryIssues.length === 0 ? (
          <div className="flex items-center gap-3 text-emerald-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-sm font-medium">Keine offenen Fehler</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">Fehler</th>
                  <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 hidden sm:table-cell">Ort</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2">Events</th>
                  <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-2 hidden sm:table-cell">Zuletzt</th>
                </tr>
              </thead>
              <tbody>
                {sentryIssues.map((issue, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${issue.level === "error" ? "bg-red-500" : issue.level === "warning" ? "bg-amber-500" : "bg-gray-400"}`} />
                        <span className="text-navy-900 font-medium truncate max-w-[250px]">{issue.title}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-gray-500 truncate max-w-[180px] hidden sm:table-cell">{issue.culprit || "—"}</td>
                    <td className="px-2 py-2.5 text-right font-mono text-navy-800">{issue.count}</td>
                    <td className="px-2 py-2.5 text-right text-gray-500 text-xs hidden sm:table-cell">
                      {issue.lastSeen ? new Date(issue.lastSeen).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">System Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoRow label="Commit" value={systemInfo.commit ? systemInfo.commit.slice(0, 7) : "local"} />
          <InfoRow label="Environment" value={systemInfo.env} />
          <InfoRow label="Node.js" value={systemInfo.nodeVersion} />
        </div>
      </div>

      {/* Lifecycle Tick Status */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-navy-800 mb-4">Lifecycle Tick</h2>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Taeglich um <span className="font-mono font-semibold text-navy-800">07:00 UTC</span> via GitHub Actions.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Prueft Trial-Meilensteine (Day 7/10/13/14) und sendet Follow-up-E-Mails.
            </p>
            <a
              href="https://github.com/gunnarwende/flowsight_mvp/actions/workflows/lifecycle-tick.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-gold-600 hover:text-gold-700 font-medium"
            >
              GitHub Actions ansehen &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function StatusChip({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div
      className={`rounded-xl px-3 py-2 text-sm font-medium border ${
        ok
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      <span className="block text-[11px] text-gray-500 font-normal">{label}</span>
      <span>{ok ? "OK" : detail ?? "Fehler"}</span>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-bold text-navy-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="text-sm font-mono font-semibold text-navy-800 truncate">{value}</p>
    </div>
  );
}
