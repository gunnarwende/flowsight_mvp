"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  totalCases: number;
  openCases: number;
  resolvedThisWeek: number;
  resolvedThisMonth: number;
  avgResolutionHours: number | null;
  notfallCount: number;
  voiceCases: number;
  wizardCases: number;
}

function MetricCard({
  label,
  value,
  sublabel,
  color = "text-gray-900",
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export function MetricsView() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/metrics");
      if (res.ok) {
        setData(await res.json());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Laden…</p>;
  }

  if (!data) {
    return <p className="text-sm text-red-500 py-8 text-center">Fehler beim Laden der Kennzahlen.</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Kennzahlen</h2>
        <p className="text-sm text-gray-500">Trends und Übersicht — nur für Inhaber sichtbar</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total Fälle" value={data.totalCases} color="text-slate-900" />
        <MetricCard label="Offen" value={data.openCases} color="text-blue-700" />
        <MetricCard label="Erledigt (Woche)" value={data.resolvedThisWeek} color="text-emerald-700" sublabel="letzte 7 Tage" />
        <MetricCard label="Erledigt (Monat)" value={data.resolvedThisMonth} color="text-emerald-700" sublabel="letzte 30 Tage" />
        <MetricCard
          label="Ø Bearbeitungszeit"
          value={data.avgResolutionHours !== null ? `${data.avgResolutionHours}h` : "—"}
          sublabel="Erstellung → Erledigt"
        />
        <MetricCard label="Notfälle" value={data.notfallCount} color="text-red-700" sublabel="gesamt" />
        <MetricCard label="Anrufe" value={data.voiceCases} sublabel="via Voice Agent" />
        <MetricCard label="Website" value={data.wizardCases} sublabel="via Meldungsformular" />
      </div>
    </div>
  );
}
