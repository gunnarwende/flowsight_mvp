"use client";

import { useEffect, useState } from "react";

/* ---------- Types ---------- */
interface FunnelBucket {
  key: string;
  label: string;
  count: number;
}

interface SmartCall {
  slug: string;
  name: string;
  reason: string;
  phone: string | null;
  detail: string;
}

interface Conversion {
  converted: number;
  offboarded: number;
  total: number;
  rate: number | null;
}

interface CalendarItem {
  date: string;
  slug: string;
  name: string;
  action: string;
  phone: string | null;
}

interface PipelineData {
  funnel: FunnelBucket[];
  smartCalls: SmartCall[];
  conversion: Conversion;
  calendar: CalendarItem[];
  snapshot_at: string;
}

/* ---------- Reason badges ---------- */
const REASON_STYLE: Record<string, { bg: string; text: string }> = {
  Ablaufend: { bg: "bg-red-500/15", text: "text-red-400" },
  "Follow-up": { bg: "bg-amber-500/15", text: "text-amber-400" },
  "Erstgespräch": { bg: "bg-emerald-500/15", text: "text-emerald-400" },
};

/* ---------- Calendar action colors ---------- */
const ACTION_DOT: Record<string, string> = {
  "Erstgespräch": "bg-emerald-500",
  "Day-5-Nudge": "bg-blue-400",
  "7-Tage-Check": "bg-blue-500",
  "Follow-up": "bg-amber-500",
  "Ablauf-Mail": "bg-orange-500",
  Entscheidung: "bg-red-500",
  "Trial-Ablauf": "bg-red-600",
};

/* ---------- Component ---------- */
export function PipelineView() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"pipeline" | "kalender">("pipeline");

  useEffect(() => {
    fetch("/api/ceo/pipeline")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  /* --- Loading skeleton --- */
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-navy-200 rounded-lg" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 h-24 bg-navy-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-navy-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
        Fehler beim Laden: {error ?? "Keine Daten"}
      </div>
    );
  }

  const { funnel, smartCalls, conversion, calendar } = data;

  /* --- Group calendar by date --- */
  const calendarByDate = new Map<string, CalendarItem[]>();
  for (const item of calendar) {
    const list = calendarByDate.get(item.date) ?? [];
    list.push(item);
    calendarByDate.set(item.date, list);
  }

  const today = new Date().toISOString().slice(0, 10);

  function formatDateLabel(dateStr: string): string {
    if (dateStr === today) return "Heute";
    const d = new Date(dateStr + "T00:00:00");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateStr === tomorrow.toISOString().slice(0, 10)) return "Morgen";
    return d.toLocaleDateString("de-CH", { weekday: "short", day: "numeric", month: "short" });
  }

  return (
    <div className="space-y-6">
      {/* Header + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-navy-900">Pipeline</h1>
        <div className="flex gap-1 bg-navy-100 rounded-xl p-1">
          <button
            onClick={() => setTab("pipeline")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === "pipeline"
                ? "bg-white text-navy-900 shadow-sm"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setTab("kalender")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === "kalender"
                ? "bg-white text-navy-900 shadow-sm"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            Kalender
          </button>
        </div>
      </div>

      {tab === "pipeline" ? (
        <>
          {/* Funnel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {funnel.map((bucket, i) => (
              <div
                key={bucket.key}
                className="bg-navy-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                {/* Arrow connector (desktop) */}
                {i < funnel.length - 1 && (
                  <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-navy-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                  </div>
                )}
                <span className="text-3xl font-bold text-gold-500">{bucket.count}</span>
                <span className="text-xs text-white/70 font-medium mt-1">{bucket.label}</span>
              </div>
            ))}
          </div>

          {/* Conversion KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-navy-100 p-4 text-center">
              <span className="text-2xl font-bold text-navy-900">{conversion.converted}</span>
              <span className="block text-xs text-navy-500 mt-0.5">Konvertiert</span>
            </div>
            <div className="bg-white rounded-2xl border border-navy-100 p-4 text-center">
              <span className="text-2xl font-bold text-navy-900">{conversion.offboarded}</span>
              <span className="block text-xs text-navy-500 mt-0.5">Offboarded</span>
            </div>
            <div className="bg-white rounded-2xl border border-navy-100 p-4 text-center">
              <span className="text-2xl font-bold text-gold-600">
                {conversion.rate !== null ? `${conversion.rate}%` : "—"}
              </span>
              <span className="block text-xs text-navy-500 mt-0.5">Conversion Rate</span>
            </div>
          </div>

          {/* Smart Call List */}
          <div>
            <h2 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              Heute anrufen
            </h2>
            {smartCalls.length === 0 ? (
              <div className="bg-white rounded-2xl border border-navy-100 p-6 text-center text-sm text-navy-400">
                Keine Anrufe nötig heute
              </div>
            ) : (
              <div className="space-y-2">
                {smartCalls.map((call) => {
                  const style = REASON_STYLE[call.reason] ?? { bg: "bg-navy-100", text: "text-navy-600" };
                  return (
                    <div
                      key={`${call.slug}-${call.reason}`}
                      className="bg-white rounded-xl border border-navy-100 p-4 flex items-center gap-4 border-l-4 border-l-gold-500"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-navy-900 text-sm">{call.name}</span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                            {call.reason}
                          </span>
                        </div>
                        <span className="text-xs text-navy-400 mt-0.5 block">{call.detail}</span>
                      </div>
                      {call.phone ? (
                        <a
                          href={`tel:${call.phone}`}
                          className="flex items-center gap-1.5 bg-gold-500 text-navy-950 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gold-400 transition-colors flex-shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                          </svg>
                          Anrufen
                        </a>
                      ) : (
                        <span className="text-xs text-navy-300 flex-shrink-0">Keine Nr.</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Calendar tab */
        <div>
          <h2 className="text-sm font-semibold text-navy-700 mb-3">
            Nächste 14 Tage — Trial-Meilensteine
          </h2>
          {calendarByDate.size === 0 ? (
            <div className="bg-white rounded-2xl border border-navy-100 p-6 text-center text-sm text-navy-400">
              Keine Meilensteine in den nächsten 14 Tagen
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from(calendarByDate.entries()).map(([date, items]) => (
                <div key={date}>
                  <h3
                    className={`text-xs font-semibold mb-2 ${
                      date === today ? "text-gold-600" : "text-navy-500"
                    }`}
                  >
                    {formatDateLabel(date)}
                    <span className="text-navy-300 font-normal ml-2">{date}</span>
                  </h3>
                  <div className="space-y-1.5">
                    {items.map((item, idx) => (
                      <div
                        key={`${item.slug}-${item.action}-${idx}`}
                        className={`bg-white rounded-xl border p-3 flex items-center gap-3 ${
                          date === today ? "border-gold-200" : "border-navy-100"
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                            ACTION_DOT[item.action] ?? "bg-navy-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-navy-900">{item.name}</span>
                          <span className="text-xs text-navy-400 ml-2">{item.action}</span>
                        </div>
                        {item.phone ? (
                          <a
                            href={`tel:${item.phone}`}
                            className="text-gold-600 hover:text-gold-500 flex-shrink-0"
                            title="Anrufen"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                            </svg>
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-[10px] text-navy-300 text-right">
        Stand: {new Date(data.snapshot_at).toLocaleString("de-CH")}
      </p>
    </div>
  );
}
