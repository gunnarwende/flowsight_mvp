"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  totalCases: number;
  openCases: number;
  newThisWeek: number;
  newThisMonth: number;
  resolvedThisWeek: number;
  resolvedThisMonth: number;
  avgResolutionHours: number | null;
  notfallCount: number;
  voiceCases: number;
  wizardCases: number;
  manualCases: number;
}

// ---------------------------------------------------------------------------
// Überblick — Betriebsbrief, nicht KPI-Wand
// ---------------------------------------------------------------------------

export function MetricsView() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ops/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-400 py-12 text-center">Laden…</p>;
  }

  if (!data) {
    return (
      <p className="text-sm text-gray-400 py-12 text-center">
        Daten konnten nicht geladen werden.
      </p>
    );
  }

  const totalSources = data.voiceCases + data.wizardCases + data.manualCases;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900">Überblick</h2>
        <p className="text-sm text-gray-500">
          Ihr Betrieb auf einen Blick
        </p>
      </div>

      {/* Leistung — Woche vs. Monat */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Letzte 7 Tage
            </h3>
            <div className="space-y-2.5">
              <Stat value={data.newThisWeek} label="neue Fälle" />
              <Stat value={data.resolvedThisWeek} label="erledigt" />
              {data.avgResolutionHours !== null && (
                <Stat
                  value={`Ø ${data.avgResolutionHours}h`}
                  label="bis Abschluss"
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Letzte 30 Tage
            </h3>
            <div className="space-y-2.5">
              <Stat value={data.newThisMonth} label="neue Fälle" />
              <Stat value={data.resolvedThisMonth} label="erledigt" />
              {data.notfallCount > 0 && (
                <Stat
                  value={data.notfallCount}
                  label="Notfälle"
                  accent="text-red-700"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aktuell + Eingangsquellen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Aktuell
          </h3>
          <div className="space-y-2.5">
            <Stat value={data.openCases} label="offene Fälle" />
            <Stat value={data.totalCases} label="insgesamt" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Eingangsquellen
          </h3>
          <div className="space-y-2">
            <SourceRow
              label="Anrufe"
              count={data.voiceCases}
              total={totalSources}
            />
            <SourceRow
              label="Formulare"
              count={data.wizardCases}
              total={totalSources}
            />
            {data.manualCases > 0 && (
              <SourceRow
                label="Manuell"
                count={data.manualCases}
                total={totalSources}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <p className="text-sm text-gray-600">
      <span className={`font-semibold ${accent ?? "text-gray-900"}`}>
        {value}
      </span>{" "}
      {label}
    </p>
  );
}

function SourceRow({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-400 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-gray-900 font-semibold tabular-nums w-6 text-right">
          {count}
        </span>
      </div>
    </div>
  );
}
