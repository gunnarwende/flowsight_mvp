"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";

/* ---------- Types ---------- */
interface GarminStatus {
  connected: boolean;
  lastSync: string | null;
  lastCount: number | null;
  dispatchReady: boolean;
}

interface Activity {
  id: string;
  external_id: string;
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
  // start_time_local ist als Wand-Uhr gespeichert (mit Z markiert) → mit tz=UTC rendern.
  return new Date(iso).toLocaleDateString("de-CH", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

function relTime(iso: string | null): string {
  if (!iso) return "noch nie";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} Std`;
  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
}

const SPORT_LABEL: Record<string, string> = {
  running: "Lauf",
  trail_running: "Trail",
  treadmill_running: "Laufband",
  track_running: "Bahn",
  virtual_run: "Indoor-Lauf",
  indoor_running: "Indoor-Lauf",
  obstacle_run: "Hindernislauf",
  soccer: "Fussball",
  other: "Training",
};

function label(sport: string): string {
  return SPORT_LABEL[sport] ?? sport.replace(/_/g, " ");
}

function RunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 5.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-2 2.5L8 10.5l2 2 .5 5m3-9.25 2 1.75 3-1m-5 -0.75-3.5 1.75M10 12.5l-2.5 1.5L5 21" />
    </svg>
  );
}

/* ========================================================================= */
export function RunningView() {
  const [status, setStatus] = useState<GarminStatus | null>(null);
  const [data, setData] = useState<RunningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/leben/garmin/status");
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
  }, [loadStatus, loadData]);

  const sync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/ceo/leben/garmin/sync", { method: "POST" });
      if (res.ok) {
        setToast("Abruf gestartet – neue Läufe erscheinen in ein bis zwei Minuten.");
        // Nach kurzer Wartezeit Daten nachladen.
        setTimeout(() => loadData(), 60000);
      } else {
        setToast("Abruf konnte nicht gestartet werden.");
      }
    } catch {
      setToast("Abruf konnte nicht gestartet werden.");
    }
    setSyncing(false);
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

      {/* Nicht verbunden → Login */}
      {status && !status.connected && (
        <ConnectCard
          dispatchReady={status.dispatchReady}
          onConnected={() => {
            setToast("Login läuft im Hintergrund … deine Läufe erscheinen gleich.");
            // Status periodisch nachladen, bis verbunden.
            let tries = 0;
            const t = setInterval(async () => {
              tries += 1;
              await loadStatus();
              await loadData();
              if (tries >= 12) clearInterval(t);
            }, 10000);
          }}
        />
      )}

      {/* Verbunden → Dashboard */}
      {status && status.connected && data && (
        <>
          <RaceCountdown race={data.race} />
          <WeekStats week={data.week} />

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] text-gray-400">
              Garmin verbunden · letzter Abruf {relTime(status.lastSync)}
            </span>
            <button
              onClick={sync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-navy-800 text-white hover:bg-navy-700 disabled:opacity-40 transition-colors"
            >
              <svg className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.745 0a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {syncing ? "Startet…" : "Aktualisieren"}
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
          {d <= 14
            ? "Tapering-Fenster – Umfang runter, Spritzigkeit halten."
            : "2000 Höhenmeter auf den letzten 10 km – Bergkraft & Vertikal-Volumen im Blick behalten."}
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
            Noch keine Aktivitäten. Sobald dein nächster Lauf von der Garmin synct, erscheint er hier.
          </div>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.isRun ? "bg-gold-500/15 text-gold-600" : "bg-navy-100 text-navy-500"}`}>
                <RunIcon className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{a.name || label(a.sport)}</p>
                <p className="text-[11px] text-gray-400">
                  {activityDate(a.start_time_local)} · {label(a.sport)}
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

const TOKEN_CMD =
  `pip3 install garth\n` +
  `python3 -c "import garth,getpass;e=input('Garmin E-Mail: ');p=getpass.getpass('Passwort: ');m=input('2FA-Code (Enter=keiner): ').strip();garth.login(e,p,prompt_mfa=lambda:m) if m else garth.login(e,p);print('\\n=== TOKEN ===');print(garth.client.dumps())"`;

function ConnectCard({ dispatchReady, onConnected }: { dispatchReady: boolean; onConnected: () => void }) {
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submitToken = async (e: FormEvent) => {
    e.preventDefault();
    if (token.trim().length < 20 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ceo/leben/garmin/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      if (res.ok) {
        setToken("");
        onConnected();
      } else {
        setError("Token konnte nicht hinterlegt werden.");
      }
    } catch {
      setError("Token konnte nicht hinterlegt werden.");
    }
    setSubmitting(false);
  };

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/15 text-gold-600 flex items-center justify-center mx-auto mb-3">
          <RunIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Mit Garmin verbinden</h3>
        <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto">
          Einmal ein Token von deiner eigenen Verbindung erzeugen – danach landet jeder Lauf automatisch hier.
        </p>
      </div>

      {!dispatchReady && (
        <p className="mt-4 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          Hinweis: Die Server-Anbindung (GH_DISPATCH_TOKEN) ist noch nicht gesetzt – der Abruf startet erst, wenn sie steht.
        </p>
      )}

      {/* Anleitung */}
      <div className="mt-4 max-w-md mx-auto">
        <p className="text-[11px] font-semibold text-gray-700 mb-1.5">So bekommst du dein Token (einmalig, ~30 Sek):</p>
        <ol className="text-[11px] text-gray-500 space-y-1 mb-2">
          <li>1. Auf deinem Computer ein Terminal öffnen.</li>
          <li>2. Diesen Befehl einfügen, ausführen, Garmin-Login eingeben.</li>
          <li>3. Den ausgegebenen Token-Text unten einfügen.</li>
        </ol>
        <div className="relative">
          <pre className="text-[10px] bg-navy-950 text-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">{TOKEN_CMD}</pre>
          <button
            onClick={copyCmd}
            className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
          >
            {copied ? "kopiert ✓" : "kopieren"}
          </button>
        </div>
      </div>

      {/* Token einfügen */}
      <form onSubmit={submitToken} className="mt-4 space-y-3 max-w-md mx-auto">
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token hier einfügen…"
          rows={3}
          className="w-full text-xs rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-gold-500/30 resize-none font-mono break-all"
        />
        {error && <p className="text-[11px] text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={token.trim().length < 20 || submitting}
          className="w-full px-5 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 disabled:opacity-40 transition-colors"
        >
          {submitting ? "Verbinde…" : "Token verbinden"}
        </button>
        <p className="text-[11px] text-gray-400 text-center">
          Das Token ist widerrufbar (jederzeit „trennen“ oder in den Garmin-Einstellungen) und ersetzt kein dauerhaftes Passwort.
        </p>
      </form>
    </div>
  );
}
