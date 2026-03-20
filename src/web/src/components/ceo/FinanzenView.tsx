"use client";

import { useEffect, useState, useCallback } from "react";

/* ---------- Types ---------- */
interface CostEntry {
  vendor: string;
  current: number;
  prev: number;
  trend: "up" | "down" | "flat";
}

interface UnitEconomics {
  cac: number | null;
  ltv: number;
  ltvCacRatio: number | null;
  churnRate: number;
  newCustomers3m: number;
}

interface FinanzenData {
  mrr: number;
  convertedCount: number;
  currentMonthCosts: number;
  prevMonthCosts: number;
  netPL: number;
  unitEconomics: UnitEconomics;
  costBreakdown: CostEntry[];
  snapshot_at: string;
}

/* ---------- Vendor options ---------- */
const VENDORS = [
  "Vercel",
  "Supabase",
  "Resend",
  "Twilio",
  "Retell",
  "Peoplefone",
  "eCall",
  "Sonstiges",
];

/* ---------- Upgrade triggers (hardcoded limits) ---------- */
const UPGRADE_TRIGGERS = [
  { vendor: "Vercel", plan: "Hobby", limit: "100 GB BW", freeLimit: 100 },
  { vendor: "Supabase", plan: "Free", limit: "500 MB DB", freeLimit: 500 },
  { vendor: "Resend", plan: "Free", limit: "100 E-Mails/Tag", freeLimit: 100 },
  { vendor: "Retell", plan: "Pay-as-you-go", limit: "60 Min/Mo", freeLimit: 60 },
];

/* ---------- Helpers ---------- */
function chf(n: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function trendIcon(trend: "up" | "down" | "flat") {
  if (trend === "up") return <span className="text-red-400">&#8593;</span>;
  if (trend === "down") return <span className="text-emerald-400">&#8595;</span>;
  return <span className="text-gray-400">&#8594;</span>;
}

function trafficLight(pct: number) {
  if (pct >= 80) return { color: "text-red-500 bg-red-500/10", label: "Kritisch" };
  if (pct >= 50) return { color: "text-amber-500 bg-amber-500/10", label: "Beobachten" };
  return { color: "text-emerald-500 bg-emerald-500/10", label: "OK" };
}

/* ---------- Component ---------- */
export function FinanzenView() {
  const [data, setData] = useState<FinanzenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cost entry form
  const [showForm, setShowForm] = useState(false);
  const [formMonth, setFormMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [formVendor, setFormVendor] = useState(VENDORS[0]);
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/finanzen");
      if (!res.ok) throw new Error("Laden fehlgeschlagen");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSave() {
    if (!formAmount) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ceo/finanzen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: `${formMonth}-01`,
          vendor: formVendor,
          amount_chf: parseFloat(formAmount),
          notes: formNotes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      setShowForm(false);
      setFormAmount("");
      setFormNotes("");
      setLoading(true);
      fetchData();
    } catch {
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-400 text-sm">{error ?? "Keine Daten"}</p>
        <button onClick={() => { setLoading(true); setError(null); fetchData(); }} className="mt-3 text-sm text-gold-500 underline">
          Erneut laden
        </button>
      </div>
    );
  }

  const { mrr, convertedCount, currentMonthCosts, netPL, unitEconomics, costBreakdown } = data;
  const ue = unitEconomics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Finanzen</h1>
          <p className="text-xs text-navy-400 mt-0.5">
            Stand: {new Date(data.snapshot_at).toLocaleString("de-CH")}
          </p>
        </div>
      </div>

      {/* ── MRR + P&L Top Section ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-white rounded-2xl border border-navy-100 p-5 col-span-2 md:col-span-1">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">MRR</p>
          <p className="text-gold-500 text-5xl font-extrabold mt-1 leading-none">{chf(mrr)}</p>
          <p className="text-xs text-navy-400 mt-2">{convertedCount} zahlende Betriebe</p>
        </div>

        {/* Costs */}
        <div className="bg-white rounded-2xl border border-navy-100 p-5">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">Kosten/Monat</p>
          <p className="text-2xl font-bold text-navy-800 mt-1">{chf(currentMonthCosts)}</p>
          <p className="text-xs text-navy-400 mt-2">Laufender Monat</p>
        </div>

        {/* Net P&L */}
        <div className="bg-white rounded-2xl border border-navy-100 p-5">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">Ergebnis</p>
          <p className={`text-2xl font-bold mt-1 ${netPL >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {chf(netPL)}
          </p>
          <p className="text-xs text-navy-400 mt-2">{netPL >= 0 ? "Gewinn" : "Verlust"} / Monat</p>
        </div>

        {/* ARR projection */}
        <div className="bg-white rounded-2xl border border-navy-100 p-5">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">ARR (proj.)</p>
          <p className="text-2xl font-bold text-navy-800 mt-1">{chf(mrr * 12)}</p>
          <p className="text-xs text-navy-400 mt-2">Hochrechnung 12 Mo.</p>
        </div>
      </div>

      {/* ── Unit Economics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* CAC */}
        <div className="bg-white rounded-2xl border border-navy-100 p-4">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">CAC</p>
          <p className="text-xl font-bold text-navy-800 mt-1">
            {ue.cac != null ? chf(ue.cac) : "–"}
          </p>
          <p className="text-[10px] text-navy-400 mt-1">Kosten 90d / {ue.newCustomers3m} Neukunden</p>
        </div>

        {/* LTV */}
        <div className="bg-white rounded-2xl border border-navy-100 p-4">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">LTV (12 Mo.)</p>
          <p className="text-xl font-bold text-navy-800 mt-1">{chf(ue.ltv)}</p>
          <p className="text-[10px] text-navy-400 mt-1">CHF 299 x 12 Monate</p>
        </div>

        {/* LTV:CAC */}
        <div className="bg-white rounded-2xl border border-navy-100 p-4">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">LTV:CAC</p>
          <p className={`text-xl font-bold mt-1 ${
            ue.ltvCacRatio == null
              ? "text-navy-300"
              : ue.ltvCacRatio >= 3
                ? "text-emerald-600"
                : ue.ltvCacRatio >= 1.5
                  ? "text-amber-500"
                  : "text-red-500"
          }`}>
            {ue.ltvCacRatio != null ? `${ue.ltvCacRatio}x` : "–"}
          </p>
          <p className="text-[10px] text-navy-400 mt-1">
            {ue.ltvCacRatio == null ? "Keine Daten" : ue.ltvCacRatio >= 3 ? "Ziel: >3x ✓" : "Ziel: >3x"}
          </p>
        </div>

        {/* Churn */}
        <div className="bg-white rounded-2xl border border-navy-100 p-4">
          <p className="text-[11px] font-medium text-navy-400 uppercase tracking-wider">Churn Rate</p>
          <p className={`text-xl font-bold mt-1 ${ue.churnRate > 10 ? "text-red-500" : ue.churnRate > 5 ? "text-amber-500" : "text-emerald-600"}`}>
            {ue.churnRate}%
          </p>
          <p className="text-[10px] text-navy-400 mt-1">Offboarded / Total</p>
        </div>
      </div>

      {/* ── Cost Breakdown Table ── */}
      <div className="bg-white rounded-2xl border border-navy-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-100">
          <h2 className="text-sm font-semibold text-navy-800">Kostenaufstellung</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors"
          >
            {showForm ? "Abbrechen" : "Kosten eintragen"}
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="px-5 py-4 bg-navy-50/50 border-b border-navy-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-medium text-navy-500 mb-1">Monat</label>
                <input
                  type="month"
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-navy-500 mb-1">Anbieter</label>
                <select
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 bg-white"
                >
                  {VENDORS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-navy-500 mb-1">Betrag (CHF)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-navy-500 mb-1">Notiz</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 bg-white"
                />
              </div>
              <div>
                <button
                  onClick={handleSave}
                  disabled={saving || !formAmount}
                  className="w-full px-3 py-1.5 rounded-lg text-sm font-medium bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  {saving ? "..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-medium text-navy-400 uppercase tracking-wider">
                <th className="px-5 py-3">Anbieter</th>
                <th className="px-5 py-3 text-right">Letzter Monat (CHF)</th>
                <th className="px-5 py-3 text-right">Vormonat (CHF)</th>
                <th className="px-5 py-3 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {costBreakdown.map((row) => (
                <tr key={row.vendor} className="hover:bg-navy-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-navy-800">{row.vendor}</td>
                  <td className="px-5 py-3 text-right text-navy-700 tabular-nums">
                    {row.current > 0 ? chf(row.current) : "–"}
                  </td>
                  <td className="px-5 py-3 text-right text-navy-400 tabular-nums">
                    {row.prev > 0 ? chf(row.prev) : "–"}
                  </td>
                  <td className="px-5 py-3 text-center text-lg">
                    {row.current > 0 || row.prev > 0 ? trendIcon(row.trend) : "–"}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-navy-50/70 font-semibold">
                <td className="px-5 py-3 text-navy-800">Total</td>
                <td className="px-5 py-3 text-right text-navy-800 tabular-nums">
                  {chf(costBreakdown.reduce((s, r) => s + r.current, 0))}
                </td>
                <td className="px-5 py-3 text-right text-navy-500 tabular-nums">
                  {chf(costBreakdown.reduce((s, r) => s + r.prev, 0))}
                </td>
                <td className="px-5 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upgrade Triggers ── */}
      <div>
        <h2 className="text-sm font-semibold text-navy-800 mb-3">Upgrade-Schwellen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {UPGRADE_TRIGGERS.map((trigger) => {
            // Estimate usage percentage based on tenant count (rough heuristic)
            const estimatedPct = Math.min(
              Math.round((convertedCount / Math.max(trigger.freeLimit / 20, 1)) * 100),
              100,
            );
            const tl = trafficLight(estimatedPct);
            return (
              <div
                key={trigger.vendor}
                className="bg-white rounded-2xl border border-navy-100 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-navy-800">{trigger.vendor}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tl.color}`}>
                    {tl.label}
                  </span>
                </div>
                <p className="text-[11px] text-navy-400">Plan: {trigger.plan}</p>
                <p className="text-[11px] text-navy-400">Limit: {trigger.limit}</p>
                {/* Progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-navy-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      estimatedPct >= 80
                        ? "bg-red-500"
                        : estimatedPct >= 50
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${estimatedPct}%` }}
                  />
                </div>
                <p className="text-[10px] text-navy-300 mt-1">~{estimatedPct}% geschätzt</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
