"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  COLD, DRILL, injectColdText, gewerkPhrase, type ColdNode,
} from "./journey/coldCallScript";
import { WARM_PHASES, WARM_DRILL } from "./journey/warmCallScript";
import CH_GEMEINDEN_RAW from "@/src/data/ch_gemeinden_de.json";

// Deutschschweizer Kantone → Orte (alphabetisch generiert aus swiss-cities, language=de).
const CH_GEMEINDEN = CH_GEMEINDEN_RAW as Record<string, string[]>;
const KANTONE = Object.keys(CH_GEMEINDEN);

// ── Typen ─────────────────────────────────────────────────────────────────
interface Lead {
  id: string;
  place_id: string;
  firma: string;
  ort: string | null;
  ring: string | null;
  ma_proxy: string | null;
  tariff: string | null;
  inhaber_am_telefon: string | null;
  entscheider: string | null;
  rolle: string | null;
  mail: string | null;
  telefon: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  icp_score: number | null;
  tier: string | null;
  signale: string | null;
  status: string | null;
}
interface FunnelItem { star: number; key: string; label: string; value: number; }
interface Proof {
  token: string; company_name: string; variant: string | null;
  view_count: number | null; first_viewed_at: string | null; last_viewed_at: string | null;
  status: string | null; lead_id: string | null; created_at: string;
}
interface Cockpit {
  token: string; company_name: string | null; slug: string | null; status: string;
  lead_id: string | null; created_at: string; submitted_at: string | null;
  approved_at: string | null; live_at: string | null;
}
interface JourneyData {
  leads: Lead[];
  funnel: FunnelItem[];
  stats: { gespraecheHeute: number; jaWoche: number; waehlversucheHeute: number };
  proofs: Proof[];
  cockpits: Cockpit[];
  snapshot_at: string;
}
type Biz = { firma: string; name: string | null; gewerk: string };
type View =
  | { name: "home" }
  | { name: "kontakt" }
  | { name: "coldcall" }
  | { name: "live"; node: string }
  | { name: "drill"; i: number; show: boolean }
  | { name: "warm" }
  | { name: "warmlive"; i: number }
  | { name: "warmdrill"; i: number; show: boolean }
  | { name: "step"; star: number };

// Stern → Säule → Farbe
const PILLAR: Record<number, { name: string; dot: string; bar: string }> = {
  1: { name: "Sales", dot: "bg-gold-500", bar: "bg-gold-500" },
  2: { name: "Sales", dot: "bg-gold-500", bar: "bg-gold-500" },
  3: { name: "Pipeline", dot: "bg-sky-500", bar: "bg-sky-500" },
  4: { name: "Pipeline", dot: "bg-sky-500", bar: "bg-sky-500" },
  5: { name: "Sales", dot: "bg-gold-500", bar: "bg-gold-500" },
  6: { name: "Onboarding", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  7: { name: "Onboarding", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  8: { name: "Onboarding", dot: "bg-emerald-500", bar: "bg-emerald-500" },
};
const STARS = [
  { star: 1, name: "Kontakt", view: "kontakt" as const },
  { star: 2, name: "Cold Call", view: "coldcall" as const },
  { star: 3, name: "Simulation", view: "step" as const },
  { star: 4, name: "Gesehen", view: "step" as const },
  { star: 5, name: "Verkaufsgespräch", view: "warm" as const },
  { star: 6, name: "Aufbau", view: "step" as const },
  { star: 7, name: "Go-live", view: "step" as const },
  { star: 8, name: "Begleitung", view: "step" as const },
];
const STAR_INFO: Record<number, string> = {
  3: "Nach dem Ja baut die Pipeline die 4 Videos + Prüfung, Mail rund 35 Minuten nach dem Anruf. Automatische Fabrik — der Kunde sieht sie nie. (PIPELINE_BIBLE)",
  4: "First-View-Signal — der Aha. Die 4 Videos zeigen fast alles ausser dem Preis. Klick auf die Beweis-Seite = Übergang zum warmen Follow-up.",
  5: "Das eigentliche warme Gespräch nach dem Klick: Reaktion, Discovery, Konsequenz, Brücke, Preis, Abschluss. Wortlaut Version 1 in stern5_warmes_verkaufsgespraech_uebergabe_cc.md — als Live/Drill kommt als nächster Bau-Schritt.",
  6: "Der Kunde baut sein Leitsystem geführt selbst im Cockpit (/aufbau/[token]). confirm-not-create. (ONBOARDING_BIBLE)",
  7: "Founder-Review (Freigabe), dann Zahlung am Go-live — der Vertragsabschluss. Weiterleitung, erste echte Anrufe.",
  8: "Die ersten Fälle gemeinsam anschauen — nicht verkaufen, anbieten. Plus Wochen-Rapport. Zufriedener Kunde wird zur Referenz und speist Stern 1.",
};

// Größen-Tier aus ma_proxy (Mitarbeiter-Proxy): Solo 1–3 / Premium 4–15 / >15 DQ.
function sizeTier(maProxy: string | null): "solo" | "premium" | "dq" | "offen" {
  const m = String(maProxy ?? "").match(/\d+/);
  if (!m) return "offen";
  const n = parseInt(m[0], 10);
  if (n <= 3) return "solo";
  if (n <= 15) return "premium";
  return "dq";
}

// „Schon angefasst" = Status gepflegt (≠ neu/leer). abgelehnt (Nein) und ja sind
// abgeschlossen → der Anfangsschritt (Cold Call) wird unterdrückt, nicht wiederholt.
function isContacted(status: string | null): boolean {
  const s = (status ?? "").trim();
  return s !== "" && s !== "neu";
}

export function JourneyView() {
  const [data, setData] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ name: "home" });
  const [biz, setBiz] = useState<Biz | null>(null);
  const [liveHist, setLiveHist] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [opsMsg, setOpsMsg] = useState<string | null>(null);
  const [goCount, setGoCount] = useState(20);
  const [goKanton, setGoKanton] = useState("Thurgau");
  const [goGemeinde, setGoGemeinde] = useState(""); // "" = ganzer Kanton (Sweep)
  const [goMode, setGoMode] = useState<"jagen" | "vollerfassung">("vollerfassung"); // vollerfassung = ALLE parken (alle Größen, kein Crawl)
  const [sizeFilter, setSizeFilter] = useState<"alle" | "solo" | "premium" | "dq" | "offen">("alle"); // Größe (Einfachauswahl)
  // Feld-Lücken (Mehrfachauswahl) — zum gezielten Nacharbeiten: Größe?/Inhaber/Mail leer.
  const [gaps, setGaps] = useState<{ groesse: boolean; inhaber: boolean; mail: boolean }>({ groesse: false, inhaber: false, mail: false });
  const [nurOffen, setNurOffen] = useState(false); // nur noch nicht kontaktierte zeigen
  // „Go"-Lauf-Status (Discovery + Anreicherung) — sperrt den Go-Knopf, zeigt ⏳/✓ + Stopp.
  const [run, setRun] = useState<{ active: boolean; doneRecent: boolean; id: number | null }>({ active: false, doneRecent: false, id: null });
  const [stopping, setStopping] = useState(false);

  // Lauf-Status alle 15s pollen (GitHub-Run hinter „Go").
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch("/api/ceo/ops/run-status", { cache: "no-store" });
        const j = await r.json();
        if (!alive || !j?.ok) return;
        // Jeder nicht abgeschlossene Lauf zählt als „aktiv" — inkl. „pending"
        // (wartet via Concurrency-Sperre) und „waiting"/„requested". Nur
        // "completed"/"none" = nicht aktiv. (Vorher fehlte „pending" → der Knopf
        // blieb fälschlich klickbar, obwohl ein Lauf in der Warteschlange stand.)
        const active = j.state !== "completed" && j.state !== "none";
        const startedMs = j.started_at ? new Date(j.started_at).getTime() : 0;
        const doneRecent = j.state === "completed" && j.conclusion === "success"
          && startedMs > 0 && Date.now() - startedMs < 45 * 60 * 1000;
        setRun({ active, doneRecent, id: j.id ?? null });
        if (!active) setStopping(false);
      } catch { /* still — nächster Tick */ }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  async function cancelRun() {
    if (!run.id || stopping) return;
    setStopping(true);
    try {
      await fetch("/api/ceo/ops/run-status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run_id: run.id }),
      });
      setRun((r) => ({ ...r, active: false }));
    } catch { setStopping(false); }
  }

  // Schon erfasste Orte (haben Leads) → ✓ + Anzahl im Dropdown
  const ortCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of data?.leads ?? []) {
      if (l.ort) { const k = l.ort.trim().toLowerCase(); m.set(k, (m.get(k) ?? 0) + 1); }
    }
    return m;
  }, [data]);

  // Frontier: erster noch nicht erfasster Ort (zusammenhängendes A…-Präfix) —
  // genau dort macht der Sweep nahtlos weiter. null = ganzer Kanton durch.
  const frontier = useMemo(() => {
    for (const g of CH_GEMEINDEN[goKanton] ?? []) {
      if (!ortCount.get(g.trim().toLowerCase())) return g;
    }
    return null;
  }, [goKanton, ortCount]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ceo/journey");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const go = (v: View) => { setView(v); window.scrollTo(0, 0); };

  // ── API-Helfer ────────────────────────────────────────────────────────
  async function patchLead(id: string, fields: Partial<Lead>) {
    setData((d) => d && { ...d, leads: d.leads.map((l) => (l.id === id ? { ...l, ...fields } : l)) });
    await fetch("/api/ceo/journey/lead", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, fields }),
    });
  }
  async function logEvent(lead: Lead, event_type: string, lead_status?: string) {
    if (lead_status) {
      setData((d) => d && { ...d, leads: d.leads.map((l) => (l.id === lead.id ? { ...l, status: lead_status } : l)) });
    }
    await fetch("/api/ceo/journey/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, event_type, lead_status }),
    });
    load();
  }

  async function dispatchWorkflow(workflow: string, inputs: Record<string, string>) {
    setOpsMsg("Wird ausgelöst …");
    try {
      const res = await fetch("/api/ceo/ops/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow, inputs }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setOpsMsg(`✓ Ausgelöst: ${workflow}. Läuft jetzt in Actions (~1–2 Min).`);
        // Knopf SOFORT sperren (nicht erst beim nächsten 15s-Poll) — sonst klickt
        // man in der Lücke versehentlich doppelt. Der Poll bestätigt gleich.
        if (workflow === "discover.yml") setRun((r) => ({ ...r, active: true, doneRecent: false }));
      } else if (j.error === "GH_DISPATCH_TOKEN not configured") {
        setOpsMsg("GH_DISPATCH_TOKEN fehlt — fine-grained PAT (Actions read+write) in Vercel setzen.");
      } else {
        // Genaue Ursache sichtbar machen: bei GitHub-Ablehnung reicht die Route
        // GitHubs echten Text als j.body durch ("Bad credentials" = Tokenwert,
        // "Resource not accessible by personal access token" = Recht,
        // "secondary rate limit" = gedrosselt). Leerer body bei 403 = es war
        // nicht GitHub, sondern eine Schicht davor (Vercel-Edge/Login).
        const detail = String(j.body || j.error || "").replace(/\s+/g, " ").trim();
        setOpsMsg(
          `Fehler ${j.status || res.status}` +
            (detail ? `: ${detail.slice(0, 240)}` : " — keine GitHub-Antwort (eher Vercel-Edge/Login, nicht der Token)")
        );
      }
    } catch {
      setOpsMsg("Netzwerkfehler beim Auslösen.");
    }
  }

  function startCall(lead: Lead) {
    const nm = (lead.entscheider || "").split(",")[0].replace(/^\s*(Herr|Frau)\s+/i, "").trim();
    const ok = nm && nm.length >= 3 && !/\bAG\b|\bGmbH\b|Unternehmen|\?/.test(nm);
    setBiz({ firma: lead.firma, name: ok ? nm : null, gewerk: gewerkPhrase(lead.signale || "", lead.firma) });
    logEvent(lead, "call_dialed");
    setLiveHist([]);
    go({ name: "live", node: "start" });
  }

  if (loading) return <Skeleton />;
  if (error) return <ErrorBox msg={error} onRetry={load} />;
  if (!data) return null;

  // ── Render-Weiche ───────────────────────────────────────────────────────
  if (view.name === "kontakt") return <KontaktView />;
  if (view.name === "coldcall") return <ColdCallHub />;
  if (view.name === "live") return <LiveView node={view.node} />;
  if (view.name === "drill") return <DrillView i={view.i} show={view.show} />;
  if (view.name === "warm") return <WarmHub />;
  if (view.name === "warmlive") return <WarmLive i={view.i} />;
  if (view.name === "warmdrill") return <WarmDrill i={view.i} show={view.show} />;
  if (view.name === "step") return <StepInfo star={view.star} />;
  return <Home />;

  // ── Home: Funnel + Stern-Navigation ────────────────────────────────────
  function Home() {
    const max = Math.max(...data!.funnel.map((f) => f.value), 1);
    const soloCount = data!.leads.filter((l) => sizeTier(l.ma_proxy) === "solo").length;
    return (
      <div>
        <PageHead eyebrow="FlowSight — nur für mich" title="Customer Journey"
          sub="Unser Umsatzmotor — vom Erstkontakt bis zum Kunden, und der Schwung trägt zurück." />

        <RunStatusBadge active={run.active} doneRecent={run.doneRecent} onStop={cancelRun} stopping={stopping} />

        {/* Go — Schwungrad in Gang setzen */}
        <div className="bg-white rounded-2xl border border-gold-300 p-4 mb-4">
          <div className="text-lg font-extrabold text-navy-900">Go</div>
          <p className="text-[12px] text-navy-400">Neue Betriebe holen — ich suche, parke und baue die Kontaktliste.</p>

          {/* Modus: Vollerfassung (alle, kein Crawl) oder gezielt 1–3 jagen */}
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setGoMode("vollerfassung")}
              className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-bold border ${goMode === "vollerfassung" ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-navy-200"}`}>Vollerfassung (alle)</button>
            <button type="button" onClick={() => setGoMode("jagen")}
              className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-bold border ${goMode === "jagen" ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-navy-200"}`}>1–3 jagen</button>
          </div>

          {/* Anzahl — nur im Jagen-Modus relevant (Vollerfassung holt alle) */}
          {goMode === "jagen" && (
            <div className="flex gap-2 mt-2">
              {[10, 20, 30, 40].map((n) => (
                <button key={n} type="button" onClick={() => setGoCount(n)}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold border ${goCount === n ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-navy-200"}`}>{n}</button>
              ))}
            </div>
          )}

          <select value={goKanton}
            onChange={(e) => { setGoKanton(e.target.value); setGoGemeinde(""); }}
            className="w-full mt-2 px-3 py-2 rounded-lg border border-navy-200 text-sm bg-white">
            {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>

          {/* Gemeinde — nur im Jagen-Modus (Vollerfassung = ganzer Kanton) */}
          {goMode === "jagen" && (
            <select value={goGemeinde} onChange={(e) => setGoGemeinde(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-lg border border-navy-200 text-sm bg-white">
              <option value="">{frontier ? `Ganzer Kanton — macht weiter ab ${frontier}` : "Ganzer Kanton (Sweep)"}</option>
              {CH_GEMEINDEN[goKanton].map((g) => {
                const c = ortCount.get(g.toLowerCase());
                return <option key={g} value={g}>{c ? `${g} ✓ (${c})` : g}</option>;
              })}
            </select>
          )}

          <button type="button" disabled={run.active}
            onClick={() => goMode === "vollerfassung"
              ? dispatchWorkflow("discover.yml", { gemeinde: "", kanton: goKanton, count: String(goCount), mode: "vollerfassung" })
              : dispatchWorkflow("discover.yml", { gemeinde: goGemeinde, kanton: goKanton, count: String(goCount), mode: "jagen" })}
            className="w-full mt-3 bg-gold-500 text-navy-950 rounded-lg px-4 py-3 text-base font-extrabold hover:bg-gold-400 disabled:bg-navy-100 disabled:text-navy-400 disabled:cursor-not-allowed">
            {run.active
              ? "läuft… — bitte warten"
              : goMode === "vollerfassung" ? `▶ Vollerfassung — alle Sanitär-Betriebe im ${goKanton}${frontier ? `, ab ${frontier}` : ""}`
              : goGemeinde ? `▶ Go — ${goCount} Betriebe in ${goGemeinde}` : `▶ Go — bis ${goCount} kleine Betriebe (1–3) im ${goKanton}${frontier ? `, ab ${frontier}` : ""}`}
          </button>

          {goMode === "vollerfassung" ? (
            <p className="text-[11px] text-navy-400 mt-2">
              Parkt <b>jeden</b> Sanitär-Betrieb des Kantons (<b>alle Größen</b>, kein Crawl → schnell). Größe bleibt „offen", bis du anreicherst. Läuft alphabetisch weiter (Frontier). Danach „Anreichern" für Inhaber/Mail/Größe.
            </p>
          ) : !goGemeinde && (
            <p className="text-[11px] text-navy-400 mt-2">
              Sammelt {goCount} neue <b>1–3-Betriebe</b> (kleine Firmen zuerst, läuft alphabetisch weiter — strikt im gewählten Kanton) · 4–15 gesammelt, &gt;15 geparkt · „1–3 ?“ = geschätzt · aktuell 1–3 in Liste: <b>{soloCount}</b>
            </p>
          )}

          {/* Anreichern — Inhaber/Mail/Größe für die geparkten Betriebe füllen */}
          <button type="button" disabled={run.active}
            onClick={() => dispatchWorkflow("enrich.yml", { minutes: "45", mode: "full" })}
            className="w-full mt-2 bg-white text-navy-700 border border-navy-300 rounded-lg px-4 py-2.5 text-sm font-bold hover:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed">
            ✎ Anreichern — Inhaber / Mail / Größe füllen
          </button>

          {opsMsg && <div className="mt-3 rounded-lg border border-navy-200 bg-navy-50 px-3 py-2 text-[13px] text-navy-700">{opsMsg}</div>}
          <p className="text-[11px] text-navy-300 mt-2">Läuft in der Cloud — oben das ⏳/✓ zeigt den Stand, die Betriebe erscheinen laufend in der Kontaktliste.</p>
        </div>

        {/* Stern-Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {STARS.map((s) => {
            const val = data!.funnel.find((f) => f.star === s.star)?.value ?? 0;
            const p = PILLAR[s.star];
            return (
              <button key={s.star}
                onClick={() => go(
                  s.view === "kontakt" ? { name: "kontakt" }
                  : s.view === "coldcall" ? { name: "coldcall" }
                  : s.view === "warm" ? { name: "warm" }
                  : { name: "step", star: s.star }
                )}
                className="text-left bg-white rounded-xl border border-navy-200 p-3 hover:border-gold-400 hover:shadow-sm transition">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">Stern {s.star}</span>
                </div>
                <div className="text-sm font-bold text-navy-900 mt-1">{s.name}</div>
                <div className="text-lg font-extrabold text-navy-900">{val}</div>
              </button>
            );
          })}
        </div>

        {/* Funnel + Ziele */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border border-navy-200 p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-4">Funnel — wo es hakt</h3>
            <div className="space-y-2.5">
              {data!.funnel.map((f) => {
                const pct = Math.max(4, Math.round((f.value / max) * 100));
                return (
                  <div key={f.key} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-28 sm:w-36 text-xs text-navy-500 text-right shrink-0 leading-tight">{f.label}</div>
                    <div className="flex-1 h-7 rounded-md bg-navy-50 overflow-hidden">
                      <div className={`h-full ${PILLAR[f.star].bar} rounded-md transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="w-7 shrink-0 text-right text-sm font-bold text-navy-900 tabular-nums">{f.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-navy-200 p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-4">Heute / Woche</h3>
            <Gauge name="Gespräche heute" cur={data!.stats.gespraecheHeute} target={10} />
            <Gauge name="Ja zur Simulation / Woche" cur={data!.stats.jaWoche} target={12} />
            <p className="text-[11px] text-navy-400 mt-3">Der Funnel füllt sich automatisch aus den geloggten Calls — du pflegst hier nichts von Hand.</p>
          </div>
        </div>
        <p className="text-[10px] text-navy-300 mt-4">Cold-Call-Wortlaut 1:1 aus cold_call_script.md (eingefroren). Stand: {new Date(data!.snapshot_at).toLocaleString("de-CH")}</p>
      </div>
    );
  }

  // Aktions-Spalte mit Kontakt-Historie-Schutz: schon kontaktierte Betriebe
  // bekommen NICHT erneut den Anfangsschritt. abgelehnt (Nein) und ja sind dicht.
  function ContactActions({ l }: { l: Lead }) {
    const s = (l.status ?? "neu").trim();
    if (s === "abgelehnt")
      return <div className="text-[11px] font-semibold text-red-600">✕ abgelehnt — nicht erneut ansprechen</div>;
    if (s === "ja")
      return <div className="text-[11px] font-semibold text-gold-700">✓ Ja — läuft in Simulation, kein Anfangsschritt</div>;
    const reCall = s === "rueckruf" || s === "kein-anschluss";
    return (
      <>
        <button onClick={() => startCall(l)} className="bg-gold-500 text-navy-950 rounded-md px-2.5 py-1.5 text-[12px] font-bold hover:bg-gold-400">
          {reCall ? (s === "rueckruf" ? "▶ Rückruf" : "▶ erneut") : "▶ Cold Call"}
        </button>
        <div className="flex gap-1 mt-1.5">
          <OutBtn title="kein Anschluss" onClick={() => logEvent(l, "call_no_answer", "kein-anschluss")}>∅</OutBtn>
          <OutBtn title="Rückruf vereinbart" onClick={() => logEvent(l, "call_reached", "rueckruf")}>↻</OutBtn>
          <OutBtn title="abgelehnt" onClick={() => logEvent(l, "call_reached", "abgelehnt")}>✕</OutBtn>
          <OutBtn title="Ja → Simulation" ja onClick={() => logEvent(l, "ja_to_sim", "ja")}>✓</OutBtn>
        </div>
      </>
    );
  }

  // ── Stern 1: Kontaktliste (DB-gestützt) ─────────────────────────────────
  function KontaktView() {
    const q = search.trim().toLowerCase();
    const blank = (v: string | null) => !(v && String(v).trim());
    // Such-gefilterte Basis — die Größen-Zähler partitionieren GENAU diese Menge,
    // sodass 1–3 + 4–15 + >15 + ? immer auf „Alle" aufgehen (kein unsichtbares Delta).
    const searched = q ? data!.leads.filter((l) => (l.firma + " " + (l.ort || "")).toLowerCase().includes(q)) : data!.leads;
    const sizeCount = (k: typeof sizeFilter) => (k === "alle" ? searched.length : searched.filter((l) => sizeTier(l.ma_proxy) === k).length);
    let rows = searched;
    // Ebene 1 — Größe (Einfachauswahl); „offen" = Größe noch nicht gecrawlt
    if (sizeFilter !== "alle") rows = rows.filter((l) => sizeTier(l.ma_proxy) === sizeFilter);
    // Ebene 2 — Feld-Lücken (Mehrfachauswahl, jede grenzt weiter ein)
    if (gaps.groesse) rows = rows.filter((l) => sizeTier(l.ma_proxy) === "offen");
    if (gaps.inhaber) rows = rows.filter((l) => blank(l.entscheider));
    if (gaps.mail) rows = rows.filter((l) => blank(l.mail));
    const offenCount = rows.filter((l) => !isContacted(l.status)).length;
    if (nurOffen) rows = rows.filter((l) => !isContacted(l.status));
    // Offene zuerst, kontaktierte (markiert) darunter.
    rows = [...rows].sort((a, b) => Number(isContacted(a.status)) - Number(isContacted(b.status)));

    const SIZE_TABS: { k: typeof sizeFilter; label: string }[] = [
      { k: "alle", label: "Alle" }, { k: "solo", label: "1–3" },
      { k: "premium", label: "4–15" }, { k: "dq", label: ">15" }, { k: "offen", label: "?" },
    ];
    const GAP_TABS: { k: keyof typeof gaps; label: string }[] = [
      { k: "groesse", label: "Größe?" }, { k: "inhaber", label: "Inhaber leer" }, { k: "mail", label: "Mail leer" },
    ];

    return (
      <div>
        <BackBtn onClick={() => go({ name: "home" })} label="Schwungrad" />
        <PageHead eyebrow="Stern 1 · Sales" title={`Kontaktliste (${rows.length} · ${offenCount} offen)`} />
        <RunStatusBadge active={run.active} doneRecent={run.doneRecent} onStop={cancelRun} stopping={stopping} />

        {/* Ebene 1: Größe (Einfachauswahl) */}
        <div className="flex gap-2 mb-1.5">
          {SIZE_TABS.map((t) => (
            <button key={t.k} type="button" onClick={() => setSizeFilter(t.k)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[13px] font-semibold border ${sizeFilter === t.k ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-navy-200"}`}>{t.label} <span className={sizeFilter === t.k ? "opacity-70" : "text-navy-400"}>{sizeCount(t.k)}</span></button>
          ))}
        </div>

        {/* Ebene 2: Feld-Lücken (Mehrfachauswahl) — gold = aktiv */}
        <div className="flex gap-2 mb-2">
          {GAP_TABS.map((t) => (
            <button key={t.k} type="button" onClick={() => setGaps((g) => ({ ...g, [t.k]: !g[t.k] }))}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[12px] font-semibold border ${gaps[t.k] ? "bg-gold-500 text-navy-950 border-gold-500" : "bg-white text-navy-500 border-navy-200"}`}>{t.label}</button>
          ))}
        </div>

        <button type="button" onClick={() => setNurOffen((v) => !v)}
          className={`mb-2 w-full rounded-lg px-3 py-1.5 text-[13px] font-semibold border ${nurOffen ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-navy-200"}`}>
          {nurOffen ? "✓ Nur offene Betriebe" : "Nur offene Betriebe zeigen"}
        </button>

        <div className="mb-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen…"
            className="px-3 py-2 rounded-lg border border-navy-200 text-sm w-full" />
        </div>

        {/* Desktop: Tabelle */}
        <div className="hidden sm:block overflow-x-auto bg-white rounded-xl border border-navy-200">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left text-navy-400 text-[10px] uppercase tracking-wide">
                <th className="px-3 py-2 border-b border-navy-100">Firma</th>
                <th className="px-3 py-2 border-b border-navy-100">Inhaber</th>
                <th className="px-3 py-2 border-b border-navy-100">Größe</th>
                <th className="px-3 py-2 border-b border-navy-100">Telefon</th>
                <th className="px-3 py-2 border-b border-navy-100">E-Mail</th>
                <th className="px-3 py-2 border-b border-navy-100">Status</th>
                <th className="px-3 py-2 border-b border-navy-100">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="align-top hover:bg-navy-50/40">
                  <td className="px-3 py-2.5 border-b border-navy-50">
                    <div className="font-semibold text-navy-900">{l.firma}</div>
                    <div className="text-[11px] text-navy-400">{l.ort} · {l.tariff || "TBD"} · {l.rating ?? "—"}★/{l.reviews ?? "—"}</div>
                    {l.website && <a href={l.website.startsWith("http") ? l.website : `https://${l.website}`} target="_blank" rel="noreferrer" className="text-[11px] text-gold-600 hover:underline">Website ↗</a>}
                  </td>
                  <td className="px-3 py-2.5 border-b border-navy-50">
                    <Edit value={l.entscheider} placeholder="Inhaber…" onSave={(v) => patchLead(l.id, { entscheider: v })} />
                  </td>
                  <td className="px-3 py-2.5 border-b border-navy-50 w-16">
                    <Edit value={l.ma_proxy} placeholder="?" onSave={(v) => patchLead(l.id, { ma_proxy: v })} small />
                  </td>
                  <td className="px-3 py-2.5 border-b border-navy-50 whitespace-nowrap text-navy-600">
                    {l.telefon ? <a href={`tel:${l.telefon}`} className="text-navy-700 hover:underline">{l.telefon}</a> : "—"}
                  </td>
                  <td className="px-3 py-2.5 border-b border-navy-50">
                    <Edit value={l.mail} placeholder="E-Mail…" onSave={(v) => patchLead(l.id, { mail: v })} />
                  </td>
                  <td className="px-3 py-2.5 border-b border-navy-50"><StatusPill status={l.status} /></td>
                  <td className="px-3 py-2.5 border-b border-navy-50 whitespace-nowrap">
                    <ContactActions l={l} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Handy: Karten (kein horizontales Scrollen) */}
        <div className="sm:hidden space-y-2.5">
          {rows.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-navy-200 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-navy-900 truncate">{l.firma}</div>
                  <div className="text-[11px] text-navy-400">{l.ort} · {l.tariff || "TBD"} · {l.rating ?? "—"}★/{l.reviews ?? "—"}</div>
                </div>
                <StatusPill status={l.status} />
              </div>

              {l.website && (
                <a href={l.website.startsWith("http") ? l.website : `https://${l.website}`} target="_blank" rel="noreferrer"
                  className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-gold-300 bg-gold-50 px-3 py-2.5 text-[15px] font-semibold text-gold-700 active:bg-gold-100">
                  Website öffnen ↗
                </a>
              )}

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-wide text-navy-400">Inhaber</span>
                  <Edit value={l.entscheider} placeholder="Inhaber…" onSave={(v) => patchLead(l.id, { entscheider: v })} />
                </label>
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-wide text-navy-400">Größe</span>
                  <Edit value={l.ma_proxy} placeholder="?" onSave={(v) => patchLead(l.id, { ma_proxy: v })} small />
                </label>
                <label className="block col-span-2">
                  <span className="block text-[10px] uppercase tracking-wide text-navy-400">E-Mail</span>
                  <Edit value={l.mail} placeholder="E-Mail…" onSave={(v) => patchLead(l.id, { mail: v })} />
                </label>
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase tracking-wide text-navy-400">Telefon</span>
                  {l.telefon ? <a href={`tel:${l.telefon}`} className="text-[15px] font-semibold text-navy-800">{l.telefon}</a> : <span className="text-navy-400">—</span>}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <ContactActions l={l} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Stern 2: Cold Call Hub ──────────────────────────────────────────────
  function ColdCallHub() {
    return (
      <div>
        <BackBtn onClick={() => go({ name: "home" })} label="Schwungrad" />
        <PageHead eyebrow="Stern 2 · Sales" title="Cold Call"
          sub="Ziel: das Ja, die Simulation schicken zu dürfen. Kein Preis, keine Discovery." />
        <div className="grid sm:grid-cols-3 gap-3">
          <HubCard title="Übersicht" desc="Der Gesprächsbaum auf einen Blick" onClick={() => go({ name: "live", node: "opener" })} />
          <HubCard title="Live" desc="Beim Telefonieren durchklicken" onClick={() => { setLiveHist([]); go({ name: "live", node: "start" }); }} />
          <HubCard title="Drill" desc="Einwand → Antwort abrufen" onClick={() => go({ name: "drill", i: 0, show: false })} />
        </div>
      </div>
    );
  }

  // ── Live (Cold Call durchklicken) ───────────────────────────────────────
  function LiveView({ node: nodeId }: { node: string }) {
    const node: ColdNode = COLD[nodeId] || COLD.start;
    const back = () => {
      if (liveHist.length) { const h = [...liveHist]; const prev = h.pop()!; setLiveHist(h); go({ name: "live", node: prev }); }
      else go({ name: "coldcall" });
    };
    const goNode = (next: string) => { setLiveHist((h) => [...h, nodeId]); go({ name: "live", node: next }); };

    if (node.result) {
      const win = node.result === "win";
      return (
        <div>
          <BackBtn onClick={back} label="zurück" />
          <div className={`max-w-xl mx-auto text-center rounded-2xl border p-8 ${win ? "border-gold-300 bg-gold-50" : "border-navy-200 bg-white"}`}>
            <div className={`text-xl font-extrabold ${win ? "text-gold-700" : "text-navy-900"}`}>{node.title}</div>
            <div className="text-sm text-navy-500 mt-2">{node.note}</div>
            <button onClick={() => { setLiveHist([]); go({ name: "live", node: "start" }); }} className="mt-5 bg-gold-500 text-navy-950 font-bold rounded-lg px-5 py-2.5 hover:bg-gold-400">Nochmal von vorn</button>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <BackBtn onClick={back} label="eine Ebene zurück" />
          <button onClick={() => go({ name: "coldcall" })} className="text-xs text-navy-400 hover:text-navy-600">Cold Call ×</button>
        </div>
        {biz && <div className="text-xs text-gold-600 font-semibold mb-2">im Gespräch: {biz.firma}</div>}
        <div className="rounded-xl border border-navy-200 border-l-4 border-l-gold-500 bg-white p-5 whitespace-pre-wrap text-[17px] leading-relaxed text-navy-900">
          {node.cue && <span className="block text-gold-600 font-bold text-[11px] uppercase tracking-wide mb-2">{injectColdText(node.cue, biz)}</span>}
          {injectColdText(node.say || "", biz) || <span className="text-navy-400">Tippe, wer abhebt:</span>}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {(node.choices || []).map((c) => (
            <button key={c.go} onClick={() => goNode(c.go)}
              className="text-left px-4 py-3 rounded-lg border border-navy-200 bg-white hover:border-gold-400 hover:bg-gold-50 text-[15px] font-medium text-navy-800 flex items-center">
              {c.label}<span className="ml-auto text-gold-500">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Drill (Einwand → Antwort) ───────────────────────────────────────────
  function DrillView({ i, show }: { i: number; show: boolean }) {
    const d = DRILL[i];
    return (
      <div className="max-w-2xl mx-auto">
        <BackBtn onClick={() => go({ name: "coldcall" })} label="Cold Call" />
        <div className="flex justify-between text-xs text-navy-400 mb-2"><span>Drill · aktiv abrufen</span><span>{i + 1} / {DRILL.length}</span></div>
        <div className="rounded-xl border border-navy-200 border-l-4 border-l-gold-500 bg-white p-5 text-[17px] text-navy-900">
          <span className="block text-gold-600 font-bold text-[11px] uppercase tracking-wide mb-2">Er sagt</span>{d.cue}
        </div>
        {show
          ? <div className="mt-3 rounded-xl border border-navy-200 border-l-4 border-l-gold-500 bg-white p-4 whitespace-pre-wrap text-[16px] leading-relaxed text-navy-900">{d.answer}</div>
          : <button onClick={() => go({ name: "drill", i, show: true })} className="mt-3 w-full bg-gold-500 text-navy-950 font-bold rounded-lg py-3 hover:bg-gold-400">Antwort zeigen</button>}
        <div className="flex gap-2 mt-3">
          <button onClick={() => go({ name: "drill", i: (i - 1 + DRILL.length) % DRILL.length, show: false })} className="flex-1 py-3 rounded-lg border border-navy-200 bg-white font-semibold text-navy-700">← Zurück</button>
          <button onClick={() => go({ name: "drill", i: (i + 1) % DRILL.length, show: false })} className="flex-1 py-3 rounded-lg bg-gold-500 text-navy-950 font-bold">Nächster →</button>
        </div>
      </div>
    );
  }

  // ── Stern 5: Warmes Verkaufsgespräch (Hub / Live / Drill) ───────────────
  function WarmHub() {
    return (
      <div>
        <BackBtn onClick={() => go({ name: "home" })} label="Schwungrad" />
        <PageHead eyebrow="Stern 5 · Sales" title="Warmes Verkaufsgespräch"
          sub="Das eigentliche Gespräch nach dem Klick. Ziel: Zusage zum geführten Aufbau. Wortlaut 1:1 aus stern5_warmes_verkaufsgespraech_uebergabe_cc.md (eingefroren)." />
        <div className="grid sm:grid-cols-3 gap-3">
          <HubCard title="Übersicht" desc="Alle Phasen 1–9 auf einen Blick" onClick={() => go({ name: "warmlive", i: 0 })} />
          <HubCard title="Live" desc="Phase für Phase durchgehen" onClick={() => go({ name: "warmlive", i: 0 })} />
          <HubCard title="Drill" desc="Einwand → Antwort abrufen (28)" onClick={() => go({ name: "warmdrill", i: 0, show: false })} />
        </div>
        {biz && <p className="text-xs text-gold-600 mt-3">Aktiver Betrieb fürs Skript: {biz.firma}</p>}
      </div>
    );
  }

  function WarmLive({ i }: { i: number }) {
    const p = WARM_PHASES[i];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <BackBtn onClick={() => go({ name: "warm" })} label="Stern 5" />
          <span className="text-xs text-navy-400">{i + 1} / {WARM_PHASES.length}</span>
        </div>
        <h2 className="text-lg font-extrabold text-navy-900 mb-3">{p.title}</h2>
        <div className="space-y-3">
          {p.blocks.map((b, j) => (
            <div key={j} className="rounded-xl border border-navy-200 border-l-4 border-l-gold-500 bg-white p-4">
              {b.label && <span className="block text-gold-600 font-bold text-[11px] uppercase tracking-wide mb-1.5">{b.label}</span>}
              <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-navy-900">{injectColdText(b.text, biz)}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button disabled={i === 0} onClick={() => go({ name: "warmlive", i: i - 1 })} className="flex-1 py-3 rounded-lg border border-navy-200 bg-white font-semibold text-navy-700 disabled:opacity-40">← Phase zurück</button>
          {i < WARM_PHASES.length - 1
            ? <button onClick={() => go({ name: "warmlive", i: i + 1 })} className="flex-1 py-3 rounded-lg bg-gold-500 text-navy-950 font-bold">Nächste Phase →</button>
            : <button onClick={() => go({ name: "warm" })} className="flex-1 py-3 rounded-lg bg-navy-900 text-white font-bold">Fertig</button>}
        </div>
        <button onClick={() => go({ name: "warmdrill", i: 0, show: false })} className="mt-3 w-full text-sm text-gold-600 hover:underline">Einwand kommt? → zum Drill</button>
      </div>
    );
  }

  function WarmDrill({ i, show }: { i: number; show: boolean }) {
    const d = WARM_DRILL[i];
    return (
      <div className="max-w-2xl mx-auto">
        <BackBtn onClick={() => go({ name: "warm" })} label="Stern 5" />
        <div className="flex justify-between text-xs text-navy-400 mb-2"><span>Einwand-Drill · warmes Gespräch</span><span>{i + 1} / {WARM_DRILL.length}</span></div>
        <div className="rounded-xl border border-navy-200 border-l-4 border-l-gold-500 bg-white p-5 text-[17px] text-navy-900">
          <span className="block text-gold-600 font-bold text-[11px] uppercase tracking-wide mb-2">Er sagt</span>{d.cue}
        </div>
        {show
          ? <div className="mt-3 rounded-xl border border-navy-200 border-l-4 border-l-gold-500 bg-white p-4 whitespace-pre-wrap text-[16px] leading-relaxed text-navy-900">{injectColdText(d.answer, biz)}</div>
          : <button onClick={() => go({ name: "warmdrill", i, show: true })} className="mt-3 w-full bg-gold-500 text-navy-950 font-bold rounded-lg py-3 hover:bg-gold-400">Antwort zeigen</button>}
        <div className="flex gap-2 mt-3">
          <button onClick={() => go({ name: "warmdrill", i: (i - 1 + WARM_DRILL.length) % WARM_DRILL.length, show: false })} className="flex-1 py-3 rounded-lg border border-navy-200 bg-white font-semibold text-navy-700">← Zurück</button>
          <button onClick={() => go({ name: "warmdrill", i: (i + 1) % WARM_DRILL.length, show: false })} className="flex-1 py-3 rounded-lg bg-gold-500 text-navy-950 font-bold">Nächster →</button>
        </div>
      </div>
    );
  }

  // ── Stern 3/4/6/7/8: Info + echte Liste ─────────────────────────────────
  function StepInfo({ star }: { star: number }) {
    const s = STARS.find((x) => x.star === star)!;
    const proofs = data!.proofs;
    const cockpits = data!.cockpits;
    const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("de-CH") : "—");

    let list: React.ReactNode = null;
    if (star === 3) {
      list = <ProofList rows={proofs} title="Versandte Simulationen" empty="Noch keine Beweis-Seiten." />;
    } else if (star === 4) {
      const seen = proofs.filter((p) => (p.view_count ?? 0) > 0);
      list = <ProofList rows={seen} title="Gesehen (geöffnet)" empty="Noch keine First-Views." showViews />;
    } else if (star === 6) {
      const building = cockpits.filter((c) => ["building", "submitted", "approved"].includes(c.status));
      list = <CockpitList rows={building} title="Im Aufbau" empty="Noch keine Cockpit-Sessions." fmtDate={fmtDate} />;
    } else if (star === 7) {
      const live = cockpits.filter((c) => c.status === "live");
      list = <CockpitList rows={live} title="Go-live / Kunde" empty="Noch keine Go-lives." fmtDate={fmtDate} />;
    } else if (star === 8) {
      const live = cockpits.filter((c) => c.status === "live");
      list = <CockpitList rows={live} title="In Begleitung" empty="Noch keine laufenden Kunden." fmtDate={fmtDate} />;
    }

    return (
      <div>
        <BackBtn onClick={() => go({ name: "home" })} label="Schwungrad" />
        <PageHead eyebrow={`Stern ${star} · ${PILLAR[star].name}`} title={s.name} sub="" />
        <div className="max-w-2xl rounded-xl border border-navy-200 bg-white p-5 text-[15px] text-navy-700 leading-relaxed mb-4">
          {STAR_INFO[star] || "—"}
        </div>
        {list}
      </div>
    );
  }
}

// ── Listen für Stern 3/4 (Beweis-Seiten) und 6/7/8 (Cockpit) ───────────────
function ProofList({ rows, title, empty, showViews }: { rows: Proof[]; title: string; empty: string; showViews?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-navy-200 p-4 max-w-2xl">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-3">{title} ({rows.length})</h3>
      {rows.length === 0 ? <p className="text-sm text-navy-400">{empty}</p> : (
        <div className="divide-y divide-navy-50">
          {rows.map((p) => (
            <div key={p.token} className="flex items-center gap-3 py-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-navy-900 text-sm truncate">{p.company_name}</div>
                <div className="text-[11px] text-navy-400">{p.variant === "notruf" ? "Notruf" : "Preis"} · versandt {new Date(p.created_at).toLocaleDateString("de-CH")}</div>
              </div>
              {showViews
                ? <span className="text-[12px] font-bold text-gold-600 shrink-0">{p.view_count}× gesehen</span>
                : <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${(p.view_count ?? 0) > 0 ? "bg-emerald-100 text-emerald-700" : "bg-navy-100 text-navy-500"}`}>{(p.view_count ?? 0) > 0 ? "gesehen" : "still"}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function CockpitList({ rows, title, empty, fmtDate }: { rows: Cockpit[]; title: string; empty: string; fmtDate: (d: string | null) => string }) {
  return (
    <div className="bg-white rounded-xl border border-navy-200 p-4 max-w-2xl">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-navy-400 mb-3">{title} ({rows.length})</h3>
      {rows.length === 0 ? <p className="text-sm text-navy-400">{empty}</p> : (
        <div className="divide-y divide-navy-50">
          {rows.map((c) => (
            <div key={c.token} className="flex items-center gap-3 py-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-navy-900 text-sm truncate">{c.company_name || c.slug || "—"}</div>
                <div className="text-[11px] text-navy-400">Status {c.status} · seit {fmtDate(c.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Kleine UI-Bausteine ───────────────────────────────────────────────────
function PageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-600">{eyebrow}</div>
      <h1 className="text-2xl font-extrabold text-navy-900 mt-1">{title}</h1>
      {sub && <p className="text-sm text-navy-500 mt-1 max-w-3xl">{sub}</p>}
    </div>
  );
}
function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 mb-3">← {label}</button>;
}
function HubCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-center bg-white rounded-2xl border border-navy-200 p-6 hover:-translate-y-0.5 hover:border-gold-400 transition">
      <div className="text-lg font-extrabold text-navy-900">{title}</div>
      <div className="text-xs text-navy-500 mt-1">{desc}</div>
    </button>
  );
}
function Gauge({ name, cur, target }: { name: string; cur: number; target: number }) {
  const pct = Math.min(100, Math.round((cur / Math.max(1, target)) * 100));
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5"><span className="text-[13px] text-navy-500">{name}</span><span className="text-lg font-extrabold text-navy-900"><span className="text-gold-600">{cur}</span> / {target}</span></div>
      <div className="h-2.5 rounded-full bg-navy-100 overflow-hidden"><div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
// Lauf-Anzeige oben: ⏳ während der „Go"-Lauf (Discovery + Anreicherung) arbeitet,
// mit Stopp-Symbol zum Abbrechen; grünes ✓ kurz nach erfolgreichem Abschluss.
function RunStatusBadge({ active, doneRecent, onStop, stopping }: {
  active: boolean; doneRecent: boolean; onStop: () => void; stopping: boolean;
}) {
  if (active) {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] font-semibold text-amber-800">
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
        <span className="flex-1">Anreicherung läuft…</span>
        <button type="button" onClick={onStop} disabled={stopping} title="Lauf stoppen"
          aria-label="Lauf stoppen"
          className="flex h-6 w-6 items-center justify-center rounded-md border border-amber-400 text-amber-700 hover:bg-amber-100 disabled:opacity-40">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-amber-600" />
        </button>
      </div>
    );
  }
  if (doneRecent) {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-700">
        <span aria-hidden>✓</span> Anreicherung fertig
      </div>
    );
  }
  return null;
}

function StatusPill({ status }: { status: string | null }) {
  const map: Record<string, { txt: string; cls: string }> = {
    ja: { txt: "JA · Simulation", cls: "bg-gold-500 text-navy-950" },
    abgelehnt: { txt: "abgelehnt", cls: "bg-red-100 text-red-700" },
    rueckruf: { txt: "Rückruf", cls: "bg-emerald-100 text-emerald-700" },
    "kein-anschluss": { txt: "kein Anschluss", cls: "bg-amber-100 text-amber-700" },
  };
  const s = (status && map[status]) || { txt: status || "neu", cls: "bg-navy-100 text-navy-500" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${s.cls}`}>{s.txt}</span>;
}
function OutBtn({ children, title, onClick, ja }: { children: React.ReactNode; title: string; onClick: () => void; ja?: boolean }) {
  return <button title={title} onClick={onClick} className={`w-7 h-7 rounded-md border text-[13px] ${ja ? "border-gold-400 text-gold-600 hover:bg-gold-50" : "border-navy-200 text-navy-500 hover:border-gold-400"}`}>{children}</button>;
}
function Edit({ value, placeholder, onSave, small }: { value: string | null; placeholder: string; onSave: (v: string) => void; small?: boolean }) {
  // Uncontrolled: hält die Tipp-Eingabe selbst, speichert per onBlur. defaultValue
  // spiegelt den optimistisch aktualisierten DB-Wert (kein State/Effect nötig).
  return (
    <input defaultValue={value ?? ""} placeholder={placeholder} key={value ?? ""}
      onBlur={(e) => { if (e.target.value !== (value ?? "")) onSave(e.target.value); }}
      className={`bg-transparent border border-transparent hover:border-navy-200 focus:border-gold-400 focus:bg-white rounded px-1.5 py-1 text-[13px] outline-none ${small ? "w-14 text-center" : "w-full min-w-[120px]"}`} />
  );
}
function Skeleton() {
  return <div className="animate-pulse space-y-3"><div className="h-8 w-48 bg-navy-100 rounded" /><div className="h-32 bg-navy-100 rounded-xl" /><div className="h-64 bg-navy-100 rounded-xl" /></div>;
}
function ErrorBox({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="text-sm text-red-700 font-medium">Konnte Customer Journey nicht laden: {msg}</p>
      <button onClick={onRetry} className="mt-3 text-sm font-semibold text-navy-700 underline">Erneut versuchen</button>
    </div>
  );
}
