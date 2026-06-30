"use client";

import { useEffect, useState, useCallback } from "react";

/* ---------- Types ---------- */
interface StravaStatus {
  configured: boolean;
  connected: boolean;
  athlete_name: string | null;
  webhookActive: boolean;
}

interface Activity {
  id: string;
  strava_id: number;
  sport: string;
  isRun: boolean;
  name: string | null;
  start_time_local: string | null;
  distance_km: number;
  moving_time_s: number;
  elevation_gain_m: number | null;
  avg_hr: number | null;
  pace_s_per_km: number | null;
}

interface RunningData {
  race: { date: string; name: string; daysToRace: number };
  week: { runs: number; distance_km: number; elevation_m: number; moving_time_s: number };
  activities: Activity[];
}

/* ---------- Helpers ---------- */
function pace(s: number | null): string {
  if (!s || s <= 0) return "–";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}/km`;
}

function duration(s: number): string {
  if (!s) return "–";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")} min`;
}

function activityDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit" });
}

const SPORT_LABEL: Record<string, string> = {
  Run: "Lauf",
  TrailRun: "Trail",
  VirtualRun: "Indoor-Lauf",
  Treadmill: "Laufband",
  Soccer: "Fussball",
  Workout: "Training",
};

function RunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 5.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-2 2.5L8 10.5l2 2 .5 5m3-9.25 2 1.75 3-1m-5 -0.75-3.5 1.75M10 12.5l-2.5 1.5L5 21" />
    </svg>
  );
}

/* ========================================================================= */
export function RunningView() {
  const [status, setStatus] = useState<StravaStatus | null>(null);
  const [data, setData] = useState<RunningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/leben/strava/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/leben/running");
      if (res.ok) setData(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadStatus(), loadData()]);
      setLoading(false);
    })();
    // Query-Param-Feedback nach OAuth-Rueckkehr
    const params = new URLSearchParams(window.location.search);
    const s = params.get("strava");
    const msg =
      s === "connected"
        ? "Strava verbunden – deine Läufe werden geladen."
        : s === "denied"
          ? "Strava-Freigabe abgebrochen."
          : s === "error"
            ? "Verbindung fehlgeschlagen – bitte erneut versuchen."
            : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time toast from OAuth redirect param
    if (msg) setToast(msg);
    if (s) window.history.replaceState({}, "", "/ceo/leben");
  }, [loadStatus, loadData]);

  const sync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/ceo/leben/strava/sync", { method: "POST" });
      await loadData();
      setToast("Aktualisiert.");
    } catch {
      setToast("Aktualisieren fehlgeschlagen.");
    }
    setSyncing(false);
  };

  const enableWebhook = async () => {
    try {
      const res = await fetch("/api/ceo/leben/strava/subscribe", { method: "POST" });
      if (res.ok) {
        setToast("Auto-Import aktiviert – neue Läufe erscheinen jetzt von selbst.");
        await loadStatus();
      } else {
        setToast("Auto-Import konnte nicht aktiviert werden (App muss live/öffentlich sein).");
      }
    } catch {
      setToast("Auto-Import konnte nicht aktiviert werden.");
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-xs text-gray-400 animate-pulse">Laden…</div>;
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-xl bg-navy-50 border border-navy-100 px-4 py-2.5 text-xs text-navy-700 flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-navy-400 hover:text-navy-600">✕</button>
        </div>
      )}

      {/* Strava nicht eingerichtet */}
      {status && !status.configured && <SetupCard />}

      {/* Eingerichtet, aber noch nicht verbunden */}
      {status && status.configured && !status.connected && <ConnectCard />}

      {/* Verbunden → Dashboard */}
      {status && status.connected && data && (
        <>
          <RaceCountdown race={data.race} />
          <WeekStats week={data.week} />

          {/* Aktions-Zeile */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-[11px]">
              {status.webhookActive ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-Import aktiv
                </span>
              ) : (
                <button
                  onClick={enableWebhook}
                  className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg font-medium hover:bg-amber-100"
                >
                  Auto-Import aktivieren
                </button>
              )}
              {status.athlete_name && <span className="text-gray-400">Strava: {status.athlete_name}</span>}
            </div>
            <button
              onClick={sync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-40 transition-colors"
            >
              <svg className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.745 0a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {syncing ? "Lädt…" : "Aktualisieren"}
            </button>
          </div>

          <ActivityList activities={data.activities} />
        </>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function RaceCountdown({ race }: { race: RunningData["race"] }) {
  const d = race.daysToRace;
  return (
    <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 text-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/50 font-medium">Nächstes Ziel</p>
          <p className="text-lg font-bold mt-0.5">{race.name}</p>
          <p className="text-[11px] text-white/50 mt-0.5">
            {new Date(race.date).toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-extrabold text-gold-500 leading-none">{d > 0 ? d : "–"}</p>
          <p className="text-[11px] text-white/50 mt-1">{d > 0 ? "Tage" : "vorbei"}</p>
        </div>
      </div>
      {d > 0 && (
        <p className="text-[11px] text-white/40 mt-3">
          {d <= 14 ? "Tapering-Fenster – Umfang runter, Spritzigkeit halten." : "2000 Höhenmeter auf den letzten 10 km – Bergkraft & Vertikal-Volumen im Blick behalten."}
        </p>
      )}
    </div>
  );
}

function WeekStats({ week }: { week: RunningData["week"] }) {
  const cards = [
    { label: "Distanz", value: `${week.distance_km}`, unit: "km" },
    { label: "Höhenmeter", value: `${week.elevation_m}`, unit: "hm" },
    { label: "Läufe", value: `${week.runs}`, unit: "" },
    { label: "Zeit", value: duration(week.moving_time_s), unit: "" },
  ];
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-2">Diese Woche</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
            <p className="text-[11px] text-gray-400 font-medium">{c.label}</p>
            <p className="text-xl font-extrabold text-gray-900 mt-1">
              {c.value}
              {c.unit && <span className="text-xs font-semibold text-gray-400 ml-1">{c.unit}</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityList({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Letzte Aktivitäten</h2>
      </div>
      <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            Noch keine Aktivitäten. Sobald du läufst, erscheint dein Lauf hier automatisch.
          </div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.isRun ? "bg-gold-500/15 text-gold-600" : "bg-navy-100 text-navy-500"}`}>
                <RunIcon className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{a.name || SPORT_LABEL[a.sport] || a.sport}</p>
                <p className="text-[11px] text-gray-400">
                  {activityDate(a.start_time_local)} · {SPORT_LABEL[a.sport] ?? a.sport}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {a.distance_km > 0 && <p className="text-sm font-bold text-gray-900">{a.distance_km} km</p>}
                <p className="text-[11px] text-gray-400">
                  {a.isRun && a.pace_s_per_km ? pace(a.pace_s_per_km) : duration(a.moving_time_s)}
                  {a.elevation_gain_m ? ` · ${a.elevation_gain_m} hm` : ""}
                  {a.avg_hr ? ` · ${a.avg_hr} bpm` : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gold-500/15 text-gold-600 flex items-center justify-center mx-auto mb-3">
        <RunIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Mit Strava verbinden</h3>
      <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto">
        Einmal verbinden – danach landet jeder Lauf von deiner Garmin automatisch hier. Kein Tippen, keine Screenshots.
      </p>
      <a
        href="/api/ceo/leben/strava/connect"
        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-[#fc4c02] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Mit Strava verbinden
      </a>
    </div>
  );
}

function SetupCard() {
  const steps = [
    "Strava-Konto anlegen (kostenlos), falls noch nicht vorhanden.",
    "In Garmin Connect → Verbundene Apps → Strava den Auto-Sync aktivieren.",
    "Auf strava.com/settings/api eine API-Anwendung erstellen → Client ID + Secret.",
    "Diese Schlüssel als Vercel-Env STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET hinterlegen.",
  ];
  return (
    <div className="rounded-2xl bg-navy-50/60 border-2 border-dashed border-navy-200 p-6">
      <h3 className="text-sm font-bold text-navy-700">Running – einmalige Einrichtung</h3>
      <p className="text-xs text-navy-400 mt-1">
        Damit deine Garmin-Läufe automatisch ankommen, fehlen noch die Strava-Schlüssel.
      </p>
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2.5 text-xs text-gray-600">
            <span className="w-5 h-5 rounded-full bg-navy-200 text-navy-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
              {i + 1}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-navy-400 mt-3">
        Sobald die Schlüssel gesetzt sind, erscheint hier der „Mit Strava verbinden“-Knopf.
      </p>
    </div>
  );
}
