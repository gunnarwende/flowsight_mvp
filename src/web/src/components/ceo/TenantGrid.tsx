"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { TenantCard, type TenantCardData } from "./TenantCard";

type Tab = "alle" | "live" | "trial" | "prospect" | "archiv";

const TABS: { key: Tab; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "live", label: "Live" },
  { key: "trial", label: "Trial" },
  { key: "prospect", label: "Prospect" },
  { key: "archiv", label: "Archiv" },
];

const TAB_STATUS_MAP: Record<Tab, string[] | null> = {
  alle: null,
  live: ["converted"],
  trial: ["trial_active", "live_dock", "decision_pending"],
  prospect: ["interested"],
  archiv: ["offboarded"],
};

export function TenantGrid() {
  const [tenants, setTenants] = useState<TenantCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("alle");

  const fetchTenants = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/tenants");
      if (!res.ok) throw new Error("Fetch failed");
      const body = await res.json();
      setTenants(body.tenants ?? []);
      setError("");
    } catch {
      setError("Betriebe konnten nicht geladen werden.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filtered = useMemo(() => {
    let result = tenants;

    // Tab filter
    const statuses = TAB_STATUS_MAP[tab];
    if (statuses) {
      result = result.filter((t) => statuses.includes(t.trial_status ?? ""));
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q),
      );
    }

    return result;
  }, [tenants, tab, search]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<Tab, number> = { alle: 0, live: 0, trial: 0, prospect: 0, archiv: 0 };
    for (const t of tenants) {
      counts.alle++;
      const s = t.trial_status ?? "";
      if (["converted"].includes(s)) counts.live++;
      else if (["trial_active", "live_dock", "decision_pending"].includes(s)) counts.trial++;
      else if (["interested"].includes(s)) counts.prospect++;
      else if (["offboarded"].includes(s)) counts.archiv++;
    }
    return counts;
  }, [tenants]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-navy-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-sm text-red-700 font-medium">{error}</p>
        <button onClick={fetchTenants} className="mt-3 text-xs text-red-600 hover:text-red-800 underline">
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Betriebe</h1>
          <p className="text-xs text-gray-500 mt-0.5">{tenants.length} Betriebe insgesamt</p>
        </div>
        <button
          onClick={fetchTenants}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Aktualisieren"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Betrieb suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-400 transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] ${
              tab === t.key
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-600 hover:bg-navy-100"
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              tab === t.key ? "bg-white/20 text-white" : "bg-navy-100 text-navy-500"
            }`}>
              {tabCounts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-10 text-center">
          <p className="text-sm text-navy-400 font-medium">
            {search ? `Kein Betrieb passt zu "${search}"` : "Keine Betriebe in dieser Kategorie."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <TenantCard key={t.id} tenant={t} />
          ))}
        </div>
      )}
    </div>
  );
}
