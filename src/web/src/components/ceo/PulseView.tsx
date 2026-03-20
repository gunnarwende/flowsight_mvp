"use client";

import { useEffect, useState, useCallback } from "react";

interface PulseData {
  severity: "green" | "yellow" | "red";
  cases: {
    cases24h: number; voiceCount: number; wizardCount: number; notfallCount: number;
    backlogNew: number; stuck48h: number; scheduledToday: number; done7d: number; reviews7d: number; oldestAge: string | null;
  };
  trials: {
    active: number; followUpDue: number; expiring48h: number; zombies: number; stale: number;
    activeList: { slug: string; name: string }[];
    followUpList: { slug: string; name: string }[];
    expiringList: { slug: string; name: string }[];
  };
  health: { ok: boolean; db: string; email: string };
  alerts: { severity: "red" | "yellow" | "green"; text: string }[];
  snapshot_at: string;
}

const SEVERITY_CONFIG = {
  green: { bg: "bg-emerald-500", glow: "shadow-emerald-500/30", label: "Alles gut", emoji: "" },
  yellow: { bg: "bg-amber-500", glow: "shadow-amber-500/30", label: "Aufmerksamkeit", emoji: "" },
  red: { bg: "bg-red-500", glow: "shadow-red-500/30", label: "Aktion nötig", emoji: "" },
};

export function PulseView() {
  const [data, setData] = useState<PulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPulse = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/pulse");
      if (!res.ok) throw new Error("Pulse fetch failed");
      setData(await res.json());
      setError("");
    } catch {
      setError("Daten konnten nicht geladen werden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPulse();
    const interval = setInterval(fetchPulse, 30_000); // 30s polling
    return () => clearInterval(interval);
  }, [fetchPulse]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-gray-200 animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-white rounded-2xl border border-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-red-700 font-medium">{error || "Keine Daten verfügbar."}</p>
        <button onClick={fetchPulse} className="mt-3 text-xs text-red-600 hover:text-red-800 underline">Erneut versuchen</button>
      </div>
    );
  }

  const sev = SEVERITY_CONFIG[data.severity];
  const time = new Date(data.snapshot_at).toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });

  return (
    <div className="space-y-4">
      {/* Header + Traffic Light */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-full ${sev.bg} shadow-lg ${sev.glow} animate-pulse`} />
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Pulse</h1>
            <p className="text-xs text-gray-500">{sev.label} — Stand {time}</p>
          </div>
        </div>
        <button
          onClick={fetchPulse}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Aktualisieren"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </div>

      {/* KPI Cards — 2x2 mobile, 4 col desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Neue Fälle (24h)" value={data.cases.cases24h} sub={`${data.cases.voiceCount} Tel / ${data.cases.wizardCount} Web`} accent="blue" />
        <KpiCard label="Aktive Trials" value={data.trials.active} sub={data.trials.active > 0 ? data.trials.activeList.map(t => t.name).join(", ") : "Keine"} accent="violet" />
        <KpiCard label="Erledigt (7d)" value={data.cases.done7d} sub={`${data.cases.reviews7d} Reviews`} accent="emerald" />
        <KpiCard label="Health" value={data.health.ok ? "OK" : "FAIL"} sub={`DB: ${data.health.db} / Mail: ${data.health.email}`} accent={data.health.ok ? "emerald" : "red"} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKpi label="Backlog (neu)" value={data.cases.backlogNew} warn={data.cases.backlogNew > 5} />
        <MiniKpi label="Stuck >48h" value={data.cases.stuck48h} warn={data.cases.stuck48h > 0} />
        <MiniKpi label="Heute geplant" value={data.cases.scheduledToday} />
        <MiniKpi label="Follow-ups fällig" value={data.trials.followUpDue} warn={data.trials.followUpDue > 0} />
      </div>

      {/* Alert Feed */}
      {data.alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alerts ({data.alerts.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.alerts.map((alert, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.severity === "red" ? "bg-red-500" : alert.severity === "yellow" ? "bg-amber-500" : "bg-emerald-500"}`} />
                <p className="text-sm text-gray-700">{alert.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No alerts → green message */}
      {data.alerts.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-emerald-800">Keine offenen Alerts. Alles läuft.</p>
        </div>
      )}

      {/* AI Copilot Comment */}
      <AiCommentCard />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({ label, value, sub, accent }: { label: string; value: number | string; sub: string; accent: string }) {
  const borderColors: Record<string, string> = {
    blue: "border-t-blue-500",
    violet: "border-t-violet-500",
    emerald: "border-t-emerald-500",
    red: "border-t-red-500",
    amber: "border-t-amber-500",
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 border-t-[3px] ${borderColors[accent] ?? "border-t-gray-400"} shadow-sm p-4 flex flex-col items-center justify-center min-h-[120px]`}>
      <span className="text-3xl font-extrabold text-gray-900 leading-none">{value}</span>
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-2">{label}</span>
      <span className="text-[9px] text-gray-400 mt-1 text-center line-clamp-2">{sub}</span>
    </div>
  );
}

function MiniKpi({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 flex items-center justify-between ${warn ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${warn ? "text-amber-700" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function AiCommentCard() {
  const [comment, setComment] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ceo/ai/pulse-comment");
        if (!res.ok) { setLoading(false); return; }
        const json = await res.json();
        if (cancelled) return;
        if (json.reason === "ai_not_configured") {
          setNotConfigured(true);
        } else if (json.comment) {
          setComment(json.comment);
        }
      } catch {
        // silent — AI comment is non-critical
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-navy-900 rounded-2xl border border-navy-700 p-4 flex items-center gap-3"
           style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}>
        <SparkleIcon />
        <span className="text-sm text-amber-300 animate-pulse">AI analysiert...</span>
      </div>
    );
  }

  // Not configured — subtle hint
  if (notConfigured) {
    return (
      <div className="rounded-xl px-4 py-2.5 text-center">
        <p className="text-[11px] text-gray-400">AI-Assistent verfügbar mit API Key</p>
      </div>
    );
  }

  // No comment available (error or empty)
  if (!comment) return null;

  // AI comment card
  return (
    <div className="rounded-2xl border p-4 flex items-start gap-3"
         style={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}>
      <div className="flex-shrink-0 mt-0.5">
        <SparkleIcon />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
           style={{ color: "#d4a853" }}>
          AI-Assistent
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#e2e8f0" }}>
          {comment}
        </p>
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" style={{ color: "#d4a853" }}>
      <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z"
            fill="currentColor" />
    </svg>
  );
}
