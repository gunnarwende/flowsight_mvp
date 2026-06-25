# Ticketlist — FlowSight (SSOT)

**Updated:** 2026-06-25 — **Stern 1 sauber abgeschlossen + auf Stern-3-Doku-Standard gebracht.** ERLEDIGT: **S1-Härtung** (autoritativer `kanton` + Migration `20260625…_leads_kanton`; Branche-Filter `_geo_icp`; Anrede `Herr/Frau Nachname` `_anrede`/`enrich_new_leads`; Größen-Tabs vollständig #736; **Vollerfassung + Anreichern** im Bedienpult #737). **Doku-Pass:** neu `architecture/contracts/leads_contract.md` (Schema-SSOT, Hoheits-Regel Daten/Status, ICP-Gate, `kanton`, `journey_events`) + `gtm/sales/STERN_1_RUNBOOK.md` (Go/Vollerfassung/Anreichern/Gegenprüfung/Purge); **Reconcile** `stern_1_kontakt` + Journey-Bible §3 + INDEX von der CSV-Ära → DB-Pipeline (CSV-Motor `build_leads`/`leads.csv` = Legacy). **Thurgau-Vollerfassung praktisch komplett** (2 Läufe): #28174494353 **1196** + #28179983924 **+90** (lief vor Budget leer = Sättigung) → **~1286** geparkt, 0 Fehler, nur TG. **Pagination-Fix** (Kontaktliste schnitt still bei 1000 ab). **GEMERGED:** Doku-Pass + Pagination-Fix + Region-Purge-Modus → **PR #738 in `main`** (squash `ffc3c30`, lint+build grün, Vercel deployt → volle ~1286 sichtbar). **STERN 1 = GRUNDLAGE STEHT, ABGEHAKT — ruht.** **NEU OFFEN (wenn dran):** Thurgau anreichern (Größe/Inhaber) → Gegenprüfung; Falsch-Region-/Alt-Crawl-Purge (`purge.yml mode=region/stale`, Dry-Run zuerst); dann Stern 2. Vorlauf:

**Updated:** 2026-06-23 EOD — **Handy = Laptop: Mobil-Parität + „Go"-Discovery live.** ERLEDIGT: Secrets-Spiegelung Vercel→GH Actions + `GH_DISPATCH_TOKEN` + `GH_ISSUES_TOKEN`-Rename (#693); Cockpit mobil (Karten/Funnel-Fix/Konsolidierung auf `/ceo/journey`, Prototyp-HTML + `assemble_thurgau` raus, #694); Crawl→DB additiv (`crawl_extract` place_id + `crawl_to_leads`, Match place_id→website→skip, Founder-Felder geschützt, #695); Bedienpult `/api/ceo/ops/dispatch` (admin-gated, Whitelist, #696); **„Go"-Discovery** Kanton+Ort (Deutschschweiz 21 Kt/3'718 Orte aus `swiss-cities`/`language=de`) + Anzahl → `discover.yml`/`discover_to_leads` (additiv, N _neue_/Lauf, #697/#698/#700); Werkstatt entfernt (#699). Sicherheit (Laptop-Review): Slug-+Kanton-Input-Härtung (Actions-Injection), CSRF SameSite-Lax. **NEU OFFEN:** (1) Founder-**End-to-End-Test** Go vom Handy (Token-Check); (2) **425 Alt-Crawl-Leads bereinigen** — `purge_stale_leads.mjs` / `purge.yml`, Dry-Run zuerst (behält aktive Pipeline/gepflegte Leads); (3) Lauf-Status/Ergebnis in der App statt Actions-Log (v2); (4) nächste Knopf-Welle (Lead-Motor/Outreach/Tagesliste); (5) `crawl.yml`/`purge.yml` bleiben ohne UI in der Whitelist (bei Bedarf per Dispatch). Vorlauf: ERLEDIGT: (1) **Morning-Report-Ausfall behoben** — Vercel-Env `GH_DISPATCH_TOKEN` fehlte (MR4-Kette tot, Route 500); Founder hat PAT + Env + Redeploy gesetzt, end-to-end verifiziert → ab morgen wieder pünktlich (05:43 UTC). (2) **`proof_watch`-Tabelle** (MR2, #651) war nie in Prod migriert → Watch-Heartbeat schrieb ins Leere; **Migration live angewandt** (Management-API), 9 Spalten verifiziert. (3) **T1 aus Watch-Report-Signal raus** (#687) — canonical-Rauschen (~1197s bei allen) verfälschte die Lead-Sortierung. (4) **db-migrate (#674) + V10 (#676)** verifiziert abgeschlossen. **NEU OFFEN (niedrig):** `proof_watch_report.mjs` liest noch Bunnys QA-verschmutztes Aggregat statt der neuen `proof_watch`-Tabelle → für saubere Per-Prospect-Watch-Tiefe den Report auf die Tabelle umstellen (sinnvoll ab Welle 2, sobald die Tabelle Daten trägt). Vorlauf:

**Updated:** 2026-06-22 EOD — **Adress-Tiefenverteidigung V9 (1–5) komplett + Voice-Summary LIVE auf Dörfler.** ERLEDIGT heute: **V9 Schritt 1–5** (Lib #670 · Hook+Migration #671 *live in Prod* · Ampel `/v` #672 + Leitzentrale #677 · bedingte SMS #678 · **Voice-Summary #679/#680 → Dörfler DE v15/INTL v75 publiziert + verifiziert**: Lisa fasst Anliegen zusammen + SMS-Adress-Check, liest Adresse nicht vor); **Demo-Rahmen + Beat E** (#659–667); **Markt** CH-Voice-Agent + Hero (#666/#668 → Upstream-Positionierung = Zulieferer statt Konkurrent); **V10 Retell-Deprecation** gefixt (#675); **db-migrate.yml** (#673/#674). **V8 CH-Stimme GEPARKT** (Founder: Hochdeutsch bleibt, kein Voice-Dev vor 1. Kunden-Feedback). **OFFEN:** `callSwissPost()` verdrahten → wartet auf Swiss-Post-Developer-Zugang (Support-Mail raus) → dann Ampel/SMS-Rot scharf (bis dahin alles neutral). **Plan morgen:** (a) Post-Credentials da? → `callSwissPost()` + Dry-Run → Ampel scharf; (b) Demo-Feinschliff (Leitsystem-erst-am-Ende · „Sie steuern das" 4×→2× · Bewertung eigene Bühne · Kategorie-Claim+Stolz-Ton aus Hero); (c) optional Listen-Badge + Konstellation Website/Vor-Ort/Leitsystem. Vorlauf:

**Updated:** 2026-06-22 — **Demo-Architektur-Tag + zwei Produkt-Bauchweh-Punkte.** Neue **Demo-Architektur** als Klick-zum-Erkunden-Karte gebaut (`/demo-vorschau`, noindex, Live-`/p/[token]` unangetastet): 3 Schichten (Lead-Haken · 3 Eingänge→Leitsystem · Modul-Tiefe), Lisa-Konstellation read-only (5 Sterne aus Cockpit, M2), Handwerkersprache geschärft + High-End-SVG-Icons (PRs #659–#662). Reviews: `docs/_strategy_notes/2026-06-22_demo-architektur.md` + `…_demo-handwerker-review.md`. **Offene Demo-Founder-Entscheide:** Wort „Leitsystem" erst am Ende einführen (Eingänge→Leitzentrale→Leitsystem); „Sie steuern das" 4×→2× (zeigen statt behaupten); Lisa führt (Vor-Ort sekundär); Hero = dringender Alltagsfall; Emphase nach Betriebsgrösse flexen (`tenant_config.groesse`). **Beat E „Der Wert" (warum 950) = Lücke, als nächstes bauen.** **Zwei Produkt-Themen vor der Demo (neue Tickets V8/V9):** Lisa **Schweizer Stimme** (Engine `de-DE`-Mismatch, kein Pronunciation-Dict → de-CH + CH-Stimme + Dict; Mundart parken) und **Adress-Genauigkeit** (Verteidigung in der Tiefe: PLZ-Anker + Strassen-Validierung + Read-back zurück + Inhaber-Augen/Karten-Pin; Founder bestätigt 2/3/4). Beide gekoppelt (Stimme fixt Aussprache → Read-back zurück). Detail: `…_voice-ch-und-adresse.md`. **BigBen = Prüfstein, Live-Agent nicht ohne Go.** Vorlauf:

**Updated:** 2026-06-21 — **Konsolidierungs-Tag: Repo↔GitHub zusammengeführt · komplette Doku-Architektur (INDEX) · Voice D105 live · volle Mobile-Arbeitsfähigkeit.** ERLEDIGT: Lint-Schuld entblockt + Journey-Tool `/ceo/journey` live (#612); Repo↔GitHub Zwei-Wege-Merge (Handy-Voice #613–#629 + lokal); Doku-Konsolidierung Etappen 1–7 (PRs #630–#645, ~360→~120 Docs, `docs/INDEX.md`-Wegweiser, `docs/_archive/`-Struktur, Wissen vorher in Bibles gesichert, redesign-Specs live-verifiziert); Repo-Wurzel-Hygiene; `mobile_ops.md` + `session_ritual.md`; **Voice-Schablone D105 = Dörfler DE+INTL vom Handy live publiziert** (V7 DONE, durch 2 Founder-Gates). **NEU OFFEN:** V7b — INTL-`reporter_name` bewusst entscheiden (im DE-Agent eigenes Extraktionsfeld, im INTL nicht; prüfen ob gewollt); `wip/local-snapshot-20260621` Code-WIP reconcilen (dispatch-guard-Refactor 5 Routes + ~15 `_ops`-Scripts, sicher geparkt, nicht auf main); retell-publish Workflow-Auto-Commit von `retell/agent_ids.json` nach main via PR statt Direct-Push (low, timestamp-only). Sales-Offene unverändert (Heizungs-Notfall-T2 MS+Regiotherm, Welle-1-Stern-5-Follow-ups ab nächster Woche). Vorlauf:

**Updated:** 2026-06-19 — **Welle 1 komplett versandt: 10 Simulationen live, 2 zurückgestellt.** Burkhardt, Schäfli + Dieterich, Serafini, Rickenbach, musa, Hutt, Künzi, Wattinger + Schwendener, R. Gerber, Brühwiler = **10 live** (noch 0 zahlend; Tracking scharf, warmer Follow-up ab nächster Woche). **Zurückgestellt:** MS Gebäudetechnik + Regiotherm (reine Heizung → Heizungs-Notfall-T2-Variante fehlt). **Härtungen heute:** (1) **harter E-Mail-Empfänger-Domain-Check** vor Live-Versand — Künzi-Mail ging fälschlich an `info@myls.ch` (Footer-Agentur) → korrigiert auf `info@kuenzi-haustechnik.ch`; **Cockpit-Kontaktliste = authoritative Quelle, nicht Crawl** (Wochenend-Task: durchreichen). (2) **dynamische Inhaber-Anrede** „Grüezi Herr X" (2 GL → „Herr X und Herr Y") in Seite + Mail; unsicher → neutral + Founder fragen. (3) **Copy-NoGos** (nie „durchgespielt"/Video-Dauer/erfundenes Erlebnis). (4) **feste Schablone „nicht erreicht"** `docs/gtm/sales/templates/email_nicht_erreicht.md` (Founder-freigegeben, 1:1 für künftige Fälle + Follow-ups). Offene Tasks unverändert (siehe 18.06-Block: Heizungs-T2-Variante · retell-Preis-Fix committen · T3-QG A4/A5 re-baseline · D100 · Wochenende Customer-Journey-Server + lisa_tts-Isolation). Vorlauf:

**Updated:** 2026-06-18 — **Erster Kalt-Rep-Tag → 3 Simulationen live.** Burkhardt + Schäfli + Dieterich + Serafini komplett produziert + live versandt (noch 0 zahlend; Antworten/First-Views → Founder-Postfach, Rückruf Mo/Di). **Pipeline gehärtet:** kanonisch `build_take*_final`, `produce_videos.mjs` (Ein-Kommando), Hochkant-Pflichtschritt (`make_t2_portrait`+`proof_add_variants`), `send_outreach --live` Tracking-Scharfschaltung (S8); Runbook `NEUER_BETRIEB_VIDEO_RUNBOOK.md`. **Retell-Deprecations gefixt** (publish-agent-version/{version}, inbound_agents[]; verifiziert). Lead-Motor `thurgau_list.mjs`+`assemble_thurgau.mjs`; Cockpit Stern-1 editierbar; Lessons S14–S16; `crawl_feedback.md`. 6 Commits. **Offen:** retell/exports committen · T3-QG-Anker A4/A5 re-baseline · D100 email.json-Autogen. **WOCHENENDE-BLÖCKE (Sa/So):** (1) **Customer Journey auf Server + interaktiv** (raus aus localStorage-HTML → Klicks landen bei CC, Funnel automatisch, Cold-Call→Pipeline-Trigger, + Inhaber-Nachname aus Cockpit dynamisch in Beweis-Seiten-Anrede & E-Mail-Greeting). (2) **`lisa_tts/generic` pro Slug isolieren** → schaltet sichere Parallelität frei (Stresstest 19.06.: EBUSY-Shared-File-Race war der einzige Blocker; tägliche 10 in ~2 h statt ~3,5 h). (3) **Heizungs-Notfall-T2-Variante** (Call-Szenario „Heizung ausgefallen / kein Warmwasser") für reine Heizungs-/Gebäudetechnik-Betriebe — Rohrbruch-Demo passt dort nicht (Gewerk-Mismatch); MS Gebäudetechnik + Regiotherm bis dahin zurückgestellt. Vorlauf:

**Updated:** 2026-06-17 — **Customer-Journey-Tag.** Customer Journey Bible neu (`docs/gtm/CUSTOMER_JOURNEY_BIBLE.md`) = oberstes Orchestrator-Dok; FlowSight als EINE Customer Journey / Schwungkreis (weg vom 3-Säulen-Framing, D103) → über STATUS/Zielarchitektur/Business-Briefing + Bible-Header reconciled. Stern 5 warmes Verkaufsgespräch → **Version 1** (8 Challenge-Punkte; commit 1b7a2e6). OC8 Rückmelde-Versprechen + Wunschtermin (`phase2_rueckmelde_termin_logik.md`): Lisa per-Tenant ohne falsche Terminversprechen (Stufen 0–4, Sweet Spot 1+2). Cockpit kanonisch (#603) verifiziert. **Nächstes:** ChatGPT2-Ergebnis Stern 5 challengen; OC8 Cockpit-Feld (Stufe 1+2) bauen. Vorlauf:

**Updated:** 2026-06-16 EOD — Zwei offene Punkte geschlossen. **Cockpit go-live-fähig** (Founder-getestet) → OC5/OC6 ✅. **Sales-Voice-Agent Preis-Drift geschlossen:** die Repo-Exports (was `retell_sync.mjs` liest) trugen noch „299" → nächster Sync hätte den Preis re-live gesetzt; DE+INTL bereinigt (kein Preis am Telefon, Wert-Anker) + re-published, API-verifiziert (DE Flow v21/INTL v16). Siehe GTM3b. Offen bleibt P12 Vision (Backlog, niedrig). Vorlauf:

**Updated:** 2026-06-15 — **🎯 SALES ALS EIGENE SÄULE GEBAUT (Säule 1/3: Sales · Pipeline · Onboarding).** Neue **SALES_BIBLE** (`docs/gtm/sales/SALES_BIBLE.md`) = SSOT der täglichen Akquise, Kern = **Abend-Ritual „Sales-Maschine go"** (CC legt für den Folgetag pro Betrieb Vorbereitungsblatt + Tagesblatt bereit). **ICP zweistufig** (Leitsignal „Inhaber-am-Telefon"; Solo 1–3 → CHF 900 / Premium 4–12 → CHF 2'000). **Region:** Ring 0 Velo (Oberrieden/Horgen/Thalwil/Rüschlikon) · Ring 1 Telefon · Ring 2 Kanton. **Lead-Motor:** `build_leads.mjs` → `docs/sales/leads.csv` + `todays_list.mjs` + **P12 `enrich_leads.mjs`** (robustes Link-Following behebt Leins-`/Ueber-uns.htm` + mailto + KI-/Vision-Entscheider → `leads_enriched.json`; verifiziert Leins→Michael Leins, Widmer→René Widmer). Bunny 14→30d. SSOT-Cleanup (ICP/Preis kanonisch in SALES_BIBLE). Zielarchitektur **D102**. Memory `project_sales_machine_phase0`. **Sales-Tasks unten (SAL-Block).** **Nächstes:** Wochenplan (10-Tage-Lern-Sprint), Crawl-Ausbau Ring 1/2. Vorlauf:

**Updated:** 2026-06-06 — **🧭 ONBOARDING-COCKPIT — DESIGN-PHASE KOMPLETT (Wochenend-Sprint).** Onboarding komplett neu als **Self-Service-Cockpit** (Co-Pilot, IKEA/Self-Checkout) spezifiziert — alte Bible → `docs/archive/onboarding/Onboarding_bible_v0.md`, frisch unter `docs/gtm/onboarding/` (Master + Phase-1-Playbook + 4 Phase-2-Specs). **4 Phasen:** 1 Das Gespräch (Live-Playbook) · 2 Cockpit (Bau) · 3 Review & Go-live (Pay) · 4 Validierung. **Pricing-Modell (Founder-bestätigt):** Premium — Aktivierung + Monat, monatlich kündbar, **kein Trial**, zahlend am Go-live (Richtwerte; 0 Kunden → erste 3-5 = Preis-Findung). Seam: `tenant_config.json` = Through-Line. Voice = 7 Dispositionen → 3 Körbe (Fall/Nachricht/nichts). **Bau-Backlog OC1-OC7 unten.** Vorlauf:

**Updated:** 2026-05-25 Re-Entry Pfingstmontag — **🌋 POST-REISE Operative Hygiene + Strategie-Pivot.** PR #525 (Morning-Report tenant-scope + Pub-Mode + Resend) merged. Damien-Cusack-Fall (23.05. 2× pending) = Founder-Action heute. Dörfler T3 with-mouse-MP4 gerendert (5.8 MB, 1113 Mouse-Events). Strategische Entscheidungen: Premium-Pricing 1.5-2.5k CHF/Mo, Max-10/Monat-Cap, Website-Modul tot, ICP 300-400 statt 5'400, Self-Service-Onboarding geparkt bis Kunde 5+. Neue Docs: `docs/sales/discovery_questions.md`, `docs/gtm/icp_filter.md`, `docs/gtm/loom_cta_v2.md`. **Offene Punkte heute:** Damien-Call (Founder), T4 Mouse-Recording (Founder), 14.05.-agent_hangup-Investigation. Day-30-Pre-Reise-Kontext:

**Updated:** 2026-04-30 Day-30 Pre-Reise EOD — **🎬 T3 LOOM-AFTER-BUILD ARCHITEKTUR LIVE für alle 4 Tenants. PIPELINE_BIBLE §62 etabliert.** FB14/FB15/FB16: Overlay-on-Overlay-Approach veto'd ("wird nie skalierend funktionieren"). Architektur-Pivot: Loom kommt NACH Phase-Build via `apply_loom_to_t3_master.mjs`. 4 Tenants × T3 mit NEW Loom (mini_takes/Take3/Take3_cut.mp4) + W=105.0 (0.5s später als initial — Founder-Wahl) gebaut. Loom-Continuity verifiziert (no freeze). Master-Backup gesichert. **Carry-Forward (post-Reise):** T3+T4 Mouse-Layer (per `scripts/_ops/mouse_layer/`), Founder-Sichtung Leins/Stark/Wälti T3, Onboarding-Maschine + 6-Wochen-Roadmap. Day-30-Mittag-Kontext:

**Updated:** 2026-04-30 Day-30 Mittag — **🏆 DÖRFLER AG T1-T4 KOMPLETT ABGENOMMEN.** Take 4 Master-Schablone gebaut: 3-Phasen (small Loom mit FB9 mirror+shift+offset+fade-out 97-99s, hide-circle navy darunter gegen FB12-Doppel-Flicker; big Loom +40 shift mit fade-in 97-99s smooth iris-transition; audio End.wav loudness-matched +0.6dB ab master 97s mit 1.95s pause). PIPELINE_BIBLE §60 (T4 Schablone) + §61 (Modul-Skalierung) ergänzt. Noch offen: Maus-Layer Phase 4 für T3+T4 (heute home-office vor Founder-Reise). Day-30-Late-Night-T2-Kontext:

**Updated:** 2026-04-30 Day-30 Late-Night — **🎬 T2-PIPELINE UNIVERSELL GEFIXT.** Drei Architektur-Patches: §56 Universal CALL_END_TOTAL (`apply_loom_take2.mjs` dynamisch = `CALL_START + phoneExtended.duration` → "Anruf beendet"-Hold vollständig sichtbar in allen Tenants/Varianten), §57 Anruf-beendet Display synchron zu live-Timer (`take2_samsung.html` snap on `endCall()`), §58 T2 High-End QG (`scripts/_ops/quality_gate_take2.mjs` Phone-Region Color-SSIM gegen Dörfler-Gold). §59 Loom-Avatar-Hierarchy (per-tenant + shared + legacy fallback). 4 Master-Takes promoted: Dörfler T2 Notruf + Leins T2 Preis (mit neuem Founder-Loom aus mini_takes), Stark T2 Notruf + Wälti T2 Preis. T3-Loom-Source platziert (`_shared/loom_t3_final.mp4`), volle Re-Integration ist Pipeline-Plumbing-Folge-Schritt. **Review morgen früh:** alle 4 T2-Master-Files. Day-29-Recovery-Kontext:

**Updated:** 2026-04-29 Day-29 Recovery — **🚨 PIPELINE-CRASH + RECOVERY.** Mausphase 29.04. nachts hat Apr-28-State zerstört, Apr-27-Backup hat Dörfler+Leins gerettet. Wiedereinstieg: lies `docs/_archive/pipeline-history/RESUME_HERE.md` ZUERST. Status: 5 Takes APPROVED + master_takes/ Backup (Dörfler T1+T4, Leins T1+T2-Preis+T4). 4 Takes PENDING Founder-Verifikation (Dörfler T2-Notruf+T3, Leins T3, Loom-during-call ist Known-Open). Stark+Wälti T1+T4 preserved Apr 28; T2+T3 müssen NEU gebaut. **Pipeline-Lessons:** TaskStop killt ffmpeg subprocess NICHT (Stop-Process nötig); FFmpeg-overlay-postproduction zu langsam (1h+ pro File auf 1440×900); Loom-Fix-Approach jetzt HTML-Layer in take2_samsung.html statt Re-Encode. **Founder-Schablone-Approach genehmigt:** Leins T2 Preis als Master für alle Preis-Tenants, swap nur 8 tenant-specific Differenzen. Day-25-Kontext (überholt):
**Updated:** 2026-04-25 Day-25 Morning — **🔊 AUDIO-PIPELINE PHASE A DONE (autonom Nacht 24→25.04.).** Während Founder schlief autonom gebaut: 13 Scripts unter `scripts/_ops/audio/`, 36 cleaned Founder-Audios, 15 Lisa-TTS (9 generic + 2 variant + 4 tenant greetings), 8 assemblierte Calls, 20 Take-Audios (4 Tenants × 5 Takes), 20 Preview-Videos, HTML-QG-Report. **80/80 Gates PASS.** Review: `docs/gtm/pipeline/06_video_production/_generated/QUALITY_GATE_REPORT.html`. Bible §35 ergänzt. **Nächster Schritt (Phase B):** Screenflow-Retiming (Take 2 93s→340s, Take 3 61s→170s, Take 4 106s→152s) + Take 1 Screenflow für Leins/Stark/Wälti. — Kontext Tag 24:

**Updated:** 2026-04-24 Day-24 Evening — **🔒 PRODUCTION-BASELINE FIXED.** Pipeline Screenflow Take 2+3+4 ist 10/10 für alle 4 Referenz-Betriebe (Dörfler, Leins, Stark, Wälti). Round-15 abgeschlossen (FB42-FB60 alle gefixt, direkte Review-Page-Pop-Animation, Viewport-Meta-Root-Cause, No-Regression-Lock in PIPELINE_BIBLE §34). **Pipeline bereit für Scale 10-30 Betriebe/Tag.** Nächster Schritt: Audio-Layer (Founder-Aufnahme Take 2-4 Master + Audio×Screenflow-Mapping). — Kontext Tag 23:

**Updated:** 2026-04-23 Late-Night (Sales Day 23: **3-Betrieb-Gold-Standard erreicht (Leins + Stark + Wälti).** Take 4 Review-Flow Round-3-Iteration: FB32 Samsung-Pop-Animation + FB34 Review-Layout + FB37 Dual-Selector-Fix + FB38 Reveal-Overlay Smart-Gate + FB39 Andreas Gerber deterministische Zeit + FB40 Wallpaper-Crop + FB41 Samsung One UI 6 Nav-Icons. Alle 3 Betriebe Take 2+3+4 neu gebaut (35/35 QG PASS pro Tenant). Pipeline-Bible §31 ergänzt. **Ready für Founder-Review + 10/Tag-Skalierung.**)
**Rule:** CC updates after every deliverable. Founder reviews weekly.
**Einziger Ticket-Tracker.** Alle offenen Tickets leben hier.
**Bug-Klassen:** `[STOPP]` = blockiert E2E/Proof/Versand. Wird sofort gefixt. Alles andere = Ticketliste.

---

## Snapshot

- **Produkt:** Voice + Wizard + Leitzentrale + Reviews + SMS. **Website ist KEIN Produktbestandteil.** CEO-App, Outlook Kalender, Papierkorb, Seed v3.
- **Website-Entscheidung (14.04.):** Modul 2 = Standard. Website nur als Basis-Fallback (kaputt/fehlend). Modul-1-Maschine beendet. ICP-Analyse: 71% der 42 Betriebe brauchen keine Website.
- **Kunden:** 7 bestehende Sites bleiben als Legacy. Keine neuen Website-Builds. Wizard-Einstieg: /start/[slug].
- **Voice:** Gold-Standard-Schablone (23 Platzhalter), Ela DE + Juniper INTL, 18 Szenarien, 14 No-Go's.
- **Speakflow:** Take 1 + Take 2 FINAL. Generisches Template: `docs/gtm/speakflow_template.md`
- **Pipeline V2:** Phase 1 DONE (Crawl+Extract+Derive+Provision). `pipeline_run.mjs` = Ein-Befehl-Orchestrator. `tenant_config.json` = SSOT für alles downstream.
- **Take 2+3+4 Screenflow-Pipeline FINAL (Day 23):** Pipeline komplett für Dörfler AG (Masterbetrieb 10/10). Demo-Time-Architektur (`demo_time.mjs` + Werktag-Gate CH-Feiertage + compressed Timeline 08:04→morgen 08:00-10:00). DEMO_NO_DISPATCH env-Flag unterdrückt echte SMS/Mails in Pipeline-Runs. Take 4 Feature-Set: Akt1 Termin versenden → Phone1 Reminder → Akt2 D15 → Phone2 SMS → Review Mobile redesigned → Closing Gold → Windows-Toast tenant-branded (Navy+Gold). Samsung-Chrome (Status-Bar + Bottom-Nav) + Phone-Platter-Backstop + Sidebar-Profile-Overlay. 57+ Feedback-Punkte (A1-A19, B1-B8, C1-C29) abgearbeitet.
- **Quality-Gates-Framework (Day 23):** Pre-Flight, Take 2, Take 3, Take 4, Composite, Cross-Tenant Checks in PIPELINE_BIBLE §-Quality-Gates. Automation-Script `dry_run_qg.mjs` in Bau für 24.04.
- **Pricing:** **PIVOT zu Premium (06.06., Founder-bestätigt für Neukunden-Akquise):** einmalige Aktivierung (~CHF 1'500–2'500) + Premium-Monat (~CHF 1'900–2'400), monatlich kündbar, **kein Gratis-Trial**, zahlend am Go-live. Anker = Empfangskraft/verpasster Auftrag, nicht Software. 0 Kunden → Richtwerte, erste 3-5 = Preis-Findung, nie rabattieren (Scarcity 10/Mo). Altes 299/499/799-Tier-Modell für Akquise abgelöst. Detail: D101 zielarchitektur + Onboarding-Bible §4.
- **BLOCKER:** 0
- **BigBen Pub:** ERSTER KUNDE (Paul). Barter-Deal. Voice EN+DE LIVE (+41445054818), PCA structured extraction. Dashboard 6 Cards. Go-Live prep 90% complete, waiting for Paul's photos/videos. 35 PRs (#457-#467 + #479-#499).
- **Phase:** Sales Day 23 Late-Night. **Take 4 Review-Flow Gold-Standard für 3 Betriebe (Leins + Stark + Wälti).** FB32-FB41 gefixt: Samsung-Pop-from-Link Animation, Review-Layout-Konstanten, Dual-min-h-dvh-Selector-Falle, Reveal-Overlay Smart-Gate, deterministische Seed-Zeiten, Wallpaper-Crop, Samsung One UI 6 Nav-Icons (3-bar+square+chevron). Pipeline-Bible §31 ergänzt. Alle 3 Betriebe verifiziert Phone2-Ende + Review-Start auf identischer Y-Position.
- **Nächste Schritte (Tag 24, 24.04.):** **Founder-Review 3-Betrieb-Set (Leins + Stark + Wälti Take 2/3/4).** Parallel: Audio+Voice-Layer Master-Segmente (Founder-Aufgabe). Danach: 10/Tag-Skalierung produktiv (run_pipeline_multi.mjs --parallel=2), Loom-PiP-Integration Audio-sync, Outreach-Phase vorbereitet. Take 1 (Website-Video) fehlt noch.
- **CI/CD:** GitHub Actions (lint + build + Telegram notify + lifecycle-tick + morning-report). Branch Protection: PR required.

### How to Operate (Founder via Handy)

```
1. CC erstellt Feature-Branch + PR
2. Telegram "FlowSight Ops": CI Status + Preview-Link + PR-Link
3. Founder: GitHub Mobile App → PR reviewen → Approve + Merge
4. Telegram: Shipped → Vercel deployt Prod (~90s)
5. Done. Kein Terminal noetig.
```

---

## ONBOARDING-COCKPIT — Bau-Backlog (Phase 2, Code · backend-first)

> **Bau-Stand 06.06. (Sa-Abend):** OC1–OC5 autonom als gestapelte, **rein additive, live-sichere** PRs **#572–#576** gebaut — dormant bis Retell `call_type` emittiert; nichts live bis Merge + `supabase db push`. OC6/OC7 = Founder-involviert. **Merge-Reihenfolge:** #571 → #572 → #573 → #574 → #575 → #576. Specs: `docs/gtm/onboarding/phase2_*`.

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| OC1 | `tenant_callbacks` generalisieren | aus `pub_callback_requests` tenant-agnostisch (reason = callback / order_followup). Webhook- + Leitsystem-Pfad. | ✅ PR #572 |
| OC2 | Webhook `call_type`-Verzweigung | FALL→`cases` / NACHRICHT→`tenant_callbacks` / NICHTS→suppress. Fallback: Intake-Daten→FALL. Ersetzt „jeder Call→Fall". | ✅ PR #573 |
| OC3 | `modules.voice_dispositions` + Notify | JSONB-Policy je Disposition; Webhook liest Notify/Suppress; Reklamation/Notfall→Push an Inhaber; Info/Privat→Case-Suppression. | ✅ PR #574 |
| OC4 | Leitsystem „Nachrichten"-Ansicht | neuer Tab liest `tenant_callbacks` (Resolve/Dismiss), analog BigBen-Callback-Seite. | ✅ PR #575 |
| OC5 | **Cockpit-UI (Hauptbau)** | 3 Stränge/Screens aus Manifest+Struktur; confirm-not-create; Beweis-Loops; Finale. Navy+Gold. **Mehrtägig.** | ✅ **DONE — go-live-fähig, Founder-getestet 16.06.** (PR #576 + OC6-Flows) |
| OC6 | Cockpit↔DB/Retell + is_demo-Test | Cockpit liest `tenant_config` → schreibt DB (`modules`+`staff`) + Retell-Prompt (publish); Test-Calls `is_demo`. | ✅ **DONE — Founder-getestet, go-live-fähig (16.06.).** Daten-Layer `cockpit_sessions` + Flows + Autosave + Submit + Lisa-Web-Call (is_demo) + `promote_cockpit_session.mjs`. Branch `feat/onboarding-oc6-cockpit-flows` (gestapelt auf #572–#576). Doc: `docs/gtm/onboarding/OC6_HANDOFF.md`. |
| OC7 | Onboarding-Mail-Versand | `send_onboarding.mjs` (Resend, Founder-Absender, `--preview`); Dörfler-Content steht; Ziel-Link = Cockpit. | 🟡 **GEBAUT — READY TO TEST** (07.06., Branch wie OC6). Schwester von `send_outreach` (Test-Default=Founder, `--live`-gated), Link aus `cockpit_sessions`. Dörfler `onboarding/email.json` fertig. **Founder-Rest:** `--preview` prüfen (nach Session-Erstellung) → Test an dich → bei Echtkunde `--live`. |
| OC8 | **Rückmelde-Versprechen + Wunschtermin (Voice-Erwartung)** | Schließt die „Wann wird's behoben?"-Lücke (Friend-Review). Lisa setzt Rückmelde-Erwartung + nimmt Wunschzeiten auf (kein fixer Termin, keine Buchung). Per-Tenant, Stufen 0–4. **Stufe 1+2 sofort** (Cockpit-Feld „Rückmelde-Versprechen" mit Default-Text + Hinweisfeld + Toggle „Wunschtermin fragen" + Lisa-Prompt + SMS-Zeile, kein neuer Code). Stufe 3 (Kalender↔Voice) später, Stufe 4 (echte Buchung) Founder-Entscheidung + Machbarkeit. Spec: `docs/gtm/onboarding/phase2_rueckmelde_termin_logik.md`. | 🔜 SPEC FERTIG — Bau offen |

---

## SALES — tägliche Akquise (Customer-Journey-Sterne 1·2·4·5·8)

> SSOT: `docs/gtm/sales/SALES_BIBLE.md`. Daten/CRM: `docs/sales/leads.csv` (+ `leads.md`, `todays_list.md`). Lessons: `docs/gtm/sales/lessons_learned_sales.md`.

| # | Titel | Status |
|---|-------|--------|
| SAL1 | Lead-Motor (`build_leads.mjs` → `leads.csv` SSOT + `todays_list.mjs` Tagesblätter) | ✅ 15.06. |
| SAL2 | P12 Anreicherung (`enrich_leads.mjs`: Link-Following + mailto + KI-/Vision-Entscheider → `leads_enriched.json`) | ✅ 15.06. |
| SAL3 | Bunny Beweis-Seiten 14→30 Tage (`extend_proof_pages.mjs`) | ✅ 15.06. |
| SAL4 | **Crawl-Ausbau Ring 1/2:** `scout.mjs --region zuerichsee-links` frisch → mehr Kandidaten in `scout_raw.csv` → `build_leads` | OFFEN |
| SAL5 | **Entscheider bei Single-Page-Sites** (kein Über-uns/Team-Tab, z.B. Altner/AZ) — Vision findet Größe, aber keinen Kopf → tieferer Discovery-Schritt | OFFEN (später) |
| SAL6 | **„Sales-Maschine go" täglich produktiv** + Lessons-Loop nach jedem Gespräch (1:1-Feedback → `lessons_learned_sales.md` + `leads.csv`-Status) | LAUFEND |
| SAL7 | **10-Tage-Lern-Sprint** (Exit-Kriterien SALES_BIBLE §10) — Vor-Ort Ring 0 + Telefon klein anlaufen | LAUFEND (ab 15.06.) |
| SAL8 | **DB-Lead-Motor + Doku-Parität** — `leads`-Tabelle = SSOT; `discover_targeted`/`enrich_new_leads`/`crawl_to_leads`; `kanton` autoritativ; Anrede `Herr/Frau Nachname`; Größen-Tabs (#736); Vollerfassung+Anreichern (#737). Doku: `leads_contract.md` + `STERN_1_RUNBOOK.md` + Reconcile (CSV-Ära→DB). | ✅ 25.06. |
| SAL9 | **Thurgau-Vollerfassung anreichern** (~1286 Betriebe geparkt, Größe `?`) → Größe/Inhaber füllen → Founder-Gegenprüfung → cold-call-fähig | OFFEN |
| SAL10 | **425 Alt-Crawl-Leads bereinigen** (`purge.yml`, Dry-Run zuerst — schützt aktive/gepflegte Leads) | OFFEN |

---

## [STOPP] — E2E-Blocker

Keine.

---

## OFFEN — Founder-Actions

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| RE1 | **Paul anrufen → Damien-Cusack-Reservation** | 2× pending Reservierungen 23.05. für 24.05. 17:00 (Irisches Hurling-Match). Paul nie bestätigt. Damien `+41796366248` zurückrufen lassen. | OFFEN — HEUTE |
| RE2 | **Dörfler T3 with-mouse-MP4 reviewen** | `master_takes/take3/doerfler-ag_with_mouse.mp4` (5.8 MB) — 4489 frames mit 1113 Mouse-Events. Approve oder Re-record. | OFFEN — HEUTE |
| RE3 | **14.05.-agent_hangup-Investigation (VA1)** | ✅ **FEHLALARM — korrektes Verhalten** (analysiert 09.06., `call_a6e64cbf912a0d19749ceab8336`). War der **BigBen-Pub-Info-Agent** (nicht Sanitär-Intake): Info-Call „habt ihr offen?" → beantwortet → Anrufer „thank you" → warmer Abschied → `end_call`. Sauber. **Real offen bleibt:** Sanitär-Intake-Lisa (Dörfler) hat im heutigen Test mit `user_hangup` geendet (Founder hat aufgelegt) → ihr **eigenes** sauberes Auflegen noch nicht belegt → einen abgeschlossenen Dörfler-Intake-Call ziehen ODER Test mit „danke, das war's". | ✅ DONE (Fehlalarm) |
| VA2 | **Sprach-Switch DE↔INTL (Intake-Lisa)** | ✅ Dörfler founder-getestet + bidirektional config-verifiziert 09.06. Zwei-Agent-Schablone (Ela DE-only ↔ Juniper INTL) via `retell_sync.mjs` pro Neukunde identisch. Nachweis: `docs/runbooks/voice_multilingual_acceptance.md`. | ✅ DONE |
| VA3 | **Web-Call-Audio (Cockpit „Lisa hören")** | ~~Audio-Problem im Browser-Testanruf~~ — **Founder-Decision 09.06.: GESTRICHEN, wird jetzt nicht umgesetzt** (andere Baustellen). | ❌ VERWORFEN |
| T3.1 | **Founder-Sichtung Leins/Stark/Wälti T3 (NEW Loom)** | Visuelle Abnahme der 3 weiteren T3 Master mit NEW Loom + W=105.0 (Dörfler abgenommen) | OFFEN — Pfingstwoche |
| T3.2 | **Mouse-Layer T3 Recording (Dörfler)** | DONE: with_mouse.mp4 rendered 25.05. (5.8 MB). Wartet auf Founder-Approve (RE2). | DONE — Review pending |
| T3.3 | **Mouse-Layer T4 Recording (Dörfler)** | `node scripts/_ops/mouse_layer/record.mjs --slug doerfler-ag --take 4` — Founder im Browser klickt ▶. Nach Aufnahme: `render.mjs`. | OFFEN — Founder-Touch |
| T3.4 | **Mouse-Layer Skalierung Leins/Stark/Wälti** | T3+T4 Mouse-Render pro Tenant nach Approve Schablone (sollten tenant-agnostic sein, Pfad identisch) | OFFEN — nach RE2 |
| GTM1 | **ICP-Re-Filtering 5'400→300-400** | Bestehende Marktanalyse durch ICP-Filter-v2 jagen (`docs/gtm/icp_filter.md`). Crawler `crawl-website.mjs` + `crawl_google_reviews.mjs` mit Keyword-Match erweitern. | OFFEN |
| GTM2 | **Loom-CTA Variante A Audio-Re-Recording** | `docs/gtm/loom_cta_v2.md` Variante A. Speakflow-Template aktualisieren + Audio-Take 4 Closing neu aufnehmen. | OFFEN |
| GTM3 | **Premium-Pricing-Implementierung** | Pricing-Page + Outreach-Templates auf 1'500-2'500 CHF/Mo umstellen. Stripe-Side später. ~~Sales-Voice-Agent~~ → siehe GTM3b. | OFFEN (nur Pricing-Page + Outreach-Templates) |
| GTM3b | **✅ Sales-Voice-Agent „Lisa" — Hochstufung DE+INTL** | (1) Cross-Tenant-Leak gefixt: peoplefone-Ziel +41445053019 zeigte auf „Walter Leuthold Intake" → re-gepointet auf Sales DE. (2) „ab 299"-Deflect raus → Wert-Anker, kein Preis am Telefon. (3) DSGVO→revDSG. (4) **Psychologie-Bogen** (zuhören → Frage zuerst → Demo-Aha → Rückruf-Brücke → auflegen) statt Quiz-Opener; beide Sprachen. (5) „belegt"-Bug gefixt (version-pinning). **Verifiziert 09.06.:** 3019→Sales-DE v20→Flow-v20 = Arc, kein Quiz, kein 299; INTL v15 = Arc, kein GDPR; DE-Swap→INTL korrekt. **Repo-Drift geschlossen 16.06.:** Die Quell-Exports `flowsight_sales_agent.json`+`_intl.json` (= was `retell_sync.mjs` liest) trugen noch „ab 299 / CHF 299" → der nächste Sync hätte den Preis wieder live gesetzt. Bereinigt (Wert-Anker, „bespricht Herr Wende persönlich") + re-published; via Retell-API verifiziert: DE Flow v21 + INTL v16 published, null Preis-Zahlen. | ✅ DONE — 09.06.; Repo nachgezogen 16.06. |
| VC1 | **Voice-LLM auf GPT-4o-mini umstellen** | Entscheidung (`ceo_voice_decision.md` §8 korrigiert): Bei Retell bleiben, LLM in allen Agents von GPT-4.1 → GPT-4o-mini → −34% Voice-Kosten ($0.50→~$0.33/Call), kein Migrationsrisiko. OpenAI Realtime **NICHT** pilotieren (gpt-4o-realtime 3× teurer; Mini nur marginal günstiger, keine strukturierte Datenextraktion). | OFFEN |
| VC2 | **eCall SMS-Preis + Grundgebühr klären** | eCall-Portal/Vertrag: exakter SMS-Preis (Annahme CHF 0.12 ±30%) + monatliche Grundgebühr (unbekannt). ±30% auf SMS-Kostenrechnung. | OFFEN — Founder |
| VC3 | **Retell Enterprise-Pricing verhandeln** | Volume-Discount ab ~50k Min/Mo (sales@retellai.com) → Platform-Fee $0.07→$0.04-0.05. Hebel #2 nach LLM-Downgrade. | OFFEN — ab 5+ Betrieben |
| RM2.1 | **support@flowsight.ch einrichten** | E-Mail in Outlook aktivieren (Founder-Task) | DONE — 26.03. |
| RM2.2 | **Lisa auf Support-Tickets trainieren** | Voice Agent soll Support-Anfragen sauber verarbeiten | OFFEN |
| KAL1 | **Outlook OAuth App anlegen** | Azure App Registration für Kalender-Integration (Phase 2). Anleitung: `docs/runbooks/founder_kalender_setup.md` | DONE — 26.03. |
| KAL2 | **Google Calendar OAuth App anlegen** | Google Cloud Console für Kalender-Integration (Phase 2). Gleiche Anleitung. | DONE — 26.03. |
| KAL3 | **Kalender Phase 3: Write-back Outlook** | Scope-Erweiterung `Calendars.ReadWrite` (Application Permission) + neuer Admin-Consent; Graph `POST/PATCH/DELETE /users/{email}/events`; Mapping `appointments.ics_uid` ↔ Outlook Event-ID. (Phase 1+2 LIVE, Free/Busy.) `plan_kalender_integration.md` §3 | OFFEN |
| KAL4 | **Kalender Phase 4: Google Workspace** | Gleiche Architektur via Service-Account (Application Credentials), `calendar_provider=google`. Trigger: erster Kunde ohne M365. | OFFEN (trigger-basiert) |
| REV1 | **Google Places API für Review-Abgleich (Phase 2)** | Founder: Google-Cloud-Projekt + Places API aktivieren + restricted API Key; Google Place ID pro Tenant in DB. Dann Cron liest Google-Reviews, heuristisches Matching (Name + Datum ±3d) → `google_review_rating` auf Case. Pre-Filter (≥4★→Google / ≤3★→intern) + Gold-Status sind LIVE. `plan_google_bewertungen.md` §6 | OFFEN — Founder-Action |

## ERLEDIGT — Feedback Session 19.03. (PRs #286-#290)

| # | Titel | Status |
|---|-------|--------|
| RM1 | Nav-Reihenfolge + Techniker-Nav aufgeräumt | DONE (PR #286) |
| RM3-RM6 | Role Toggle, Settings Tenant, Techniker-View, hooks crash | DONE (PR #286) |
| RM7 | Bewertungs-Weiche (≤3★ intern, ≥4★ → Google) | DONE (PR #288) — Review Pre-Filter live |
| FB1 | FlowBar: Grid, YTD, Quellen, Badge, Gold-Sterne | DONE (PR #287) |
| FB2/FB4 | Mobile 2x2 Grid | DONE (PR #287) |
| FB3 | Techniker Pagination + Icons + Period-Toggle | DONE (PR #287) |
| FB5 | "Kategorie" ausgeschrieben | DONE (PR #287) |
| FB6 | Status-Farben (orange/grau/gold) | DONE (PR #287) |
| 6a-6g | PLZ-Lookup, Pflichtfelder, Kollision, Mobile PageSize, Ramon | DONE (PR #288) |

---

## OFFEN — Voice-Agent-Bugs

| # | Titel | Schwere | Status |
|---|-------|---------|--------|
| V2 | **"Jul" aus Greeting entfernen** | hoch | READY TO TEST (PRs #198 + #202) |
| V3 | **Ortsnamen NICHT wiederholen** | mittel | READY TO TEST (PRs #198 + #202) |
| V5 | **SMS kommt nicht an (eCall)** | hoch | READY TO TEST (PR #200 + #202) |
| V6 | **Namens-Frage falsch formuliert** | mittel | READY TO TEST (PRs #198 + #202) |
| V7 | **Dörfler DE v14 + INTL v74 unpublished → published (2026-06-21)** — `retell-inspect` zeigte beide Agent+Flow-Köpfe als Draft (`is_published=false`), live serviert v13/v73. Inhalt an Quell-Exports geprüft (reporter_name-Regel DE rein, kein Brunner, Preise DE=INTL = keine Preisnennung), Dry-Run grün → `retell-publish prefix=doerfler dry_run=false` scharf (Founder-Gate 2×) → Verify + Re-Inspect: **alle vier Köpfe `is_published=true`** (DE `v14*PUB`, INTL `v74*PUB`). Nummer `+41445057420` korrekt auf inbound=DE-Agent. | mittel | ✅ PUBLISHED — verifiziert |
| V7b | **INTL reporter_name — bewusst entscheiden (Follow-up zu V7)** — `reporter_name` ist nur im DE-Agent ein eigenes Extraktionsfeld, nicht im INTL-Transfer-Ziel. Prüfen ob INTL den Namen explizit ziehen soll (englische Anrufer = Minderheit; Name steht ohnehin im Transcript). Bewusst als eigener, geprüfter Export-Edit — nicht ans DE-Publish gebolzt. | niedrig | OFFEN |
| V7c | **`retell-publish` agent_ids.json-Auto-Commit — Branch-Protection-sauber machen (Infra)** — der workflow-interne Post-Publish-Push von `retell/agent_ids.json` nach `main` wird von Branch-Protection geblockt (`GH013`, korrekt) und nur als Warning abgefangen. Inhalt ist timestamp-only, IDs unverändert → kein Drift, kein aktueller Handlungsbedarf. Optionen für später: (a) Stempel via PR schreiben statt Direkt-Push, oder (b) Auto-Commit ganz weglassen (trägt eh nur Zeitstempel). | niedrig | OFFEN (nicht dringend) |
| V8 | **Lisa Schweizer Stimme (de-CH) — „aufhören, wie eine Deutsche zu klingen"** (Founder-Bauchweh 22.06.) — Ist-Stand: Engine `de-DE` trotz „Schweizer Hochdeutsch"-Prompt, Custom-ElevenLabs-Stimme (deutsch-deutsch). **Recherche 22.06.:** ElevenLabs hat inzwischen MEHR als die eine Stimme von vor 2 Mt — konkret *Heidi factual* (Schweizer Hochdeutsch = Standarddeutsch mit CH-Akzent) + *Aleks* (m, CH-Akzent); CH-Test (April 2026): „gut für Content, für hochprofessionell noch nicht perfekt → für Kundenkommunikation Standarddeutsch-mit-CH-Akzent statt Dialekt". ElevenLabs-STT erkennt CH-Akzent (hilft beim Verstehen). **Korrektur:** Retell-Pronunciation-Dictionary ist **English-only (Turbo v2, nicht v2.5)** → Ortsnamen-Dictionary für den DE-Agenten geht NICHT. **Hebel stattdessen:** (a) Schweizer-Hochdeutsch-**Stimme** wählen (Heidi/Aleks ohr-testen) ODER **CH-Sprecherin klonen** (volle Identitäts-Kontrolle; Retell nimmt jede ElevenLabs-Voice-ID); (b) Helvetismen-Glossar + „Grüezi" im **Prompt-Text** (Text-Ebene geht); (c) ggf. Engine de-CH. Retell-TTS-Optionen: ElevenLabs/OpenAI/Cartesia/PlayHT/Minimax/Fish — **Azure de-CH geht NICHT in Retell**. Reframe: Lisa = Fallback → „besser als Combox", nicht Mundart-perfekt; volles Mundart parken. Qualität = Founder-Ohr-Test (No-Go-Maßstab). Prüfstein = **echter Sanitär** (Dörfler/nächster Sani), NICHT BigBen (Pub). Detail: `docs/_strategy_notes/2026-06-22_voice-ch-und-adresse.md`. **Live-Agent nicht ohne Founder-Go.** **GEPARKT (Founder-Entscheid 22.06.):** Stimme bleibt Hochdeutsch — **keine Weiterentwicklung vor erstem Kunden-Feedback/-Beschwerde** (kein ElevenLabs-Key/Egress nötig). | niedrig | GEPARKT |
| V9 | **Adresse: Verteidigung in der Tiefe (gegen Fehlfahrt)** (Founder-Bauchweh 22.06., Schichten 2/3/4 bestätigt) — heute kein Live-Read-back (V3, wegen Ort-Aussprache) → einziges Netz = Post-Call-SMS. **Entkopplungs-Erkenntnis:** Lisa muss den Ortsnamen gar nicht aussprechen → Adress-Genauigkeit hängt NICHT an V8. Schichten: (1) **PLZ-Anker** (Ziffern, jede Stimme sagbar) → PLZ→Ort aus amtl. Verzeichnis ableiten; (2) **Strasse gegen echte Strassen dieser PLZ** prüfen via **Swiss-Post Address-Web-Services REST** (AutoComplete + BuildingVerification, `developer.post.ch`) ✅; (3) **Read-back von PLZ-Ziffern + Strasse + Hausnr** (Ort wird abgeleitet, nicht gesprochen) — hebt V3 gezielt auf, ohne Stimm-Abhängigkeit ✅; (4) **Vertrauens-Ampel** (Founder-Kern 22.06.): validierte Adresse = **grün/bestätigt** (Inhaber verlässt sich, ohne hinzuschauen), nicht-validiert = **gelb/„prüfen"** (nur diese wenigen checkt er) → **kein Bauchweh pro Ticket**; + Karten-Pin, Lisa stellt nie selbst zu ✅; (5) Rückrufnummer = Backstop *(gratis, NICHT die Lösung)*; (6) SMS-Korrektur *(gratis, spätere Schicht)*. Ziel ehrlich: nicht „Inhaber prüft alles" (= genau die Angst) und nicht „Lisa verhört sich nie" (ASR ≠ 100%), sondern **„du vertraust den grünen und sorgst dich nie pro Ticket".** Trust ist binär: 2–3 Fehlfahrten → Vertrauen komplett weg. Verkaufs-Reframe: „Sie entscheiden — kein Techniker fährt blind los." Prüfstein = echter Sanitär, NICHT BigBen (Pub, nimmt keine Adressen auf). Detail: `…2026-06-22_voice-ch-und-adresse.md`. **Schritt 1–5 GEBAUT & gemerged (22.06.):** Lib · Hook+Migration (live) · Ampel `/v`+Leitzentrale · bedingte SMS · Voice-Summary (Dörfler publiziert). **Letzter offener Schritt:** `callSwissPost()` verdrahten (wartet auf Swiss-Post-Credentials) → dann greifen die roten Flags + SMS-Verschärfung automatisch. | hoch | 1–5 GEBAUT · callSwissPost offen |
| V10 | **Retell-Deprecation-Mails (22.06.)** — (1) *Legacy publish endpoint* `POST /publish-agent/` (34 Uses): Quelle war `sync_cockpit_test_agent.mjs` → `client.agent.publish()` aus **retell-sdk@5.2.0** (alte Methode trifft den bare Endpoint). **GEFIXT** (#675) → raw `POST /publish-agent-version/{id}` (wie Live-Scripts). **Verify durchgeführt (Laptop, 22.06.):** `sync_cockpit_test_agent.mjs` lief sauber → „✓ Agent published (v4)" über `/publish-agent-version/`, kein Rückfall auf `/publish-agent/`. (2) *Phone-field* `inbound_agent_id` (1 Use, Deadline 03-31): alle **schreibenden** Calls unserer aktiven Scripts (`retell_sync`, `bigben_publish`, `retell_phone_audit`, `_rebuild_bigben`) nutzen bereits `inbound_agents[]`; verbliebene `inbound_agent_id`-Vorkommen sind reine **Lese**-Zugriffe mit `?? inbound_agents?.[0]?.agent_id`-Fallback (vorwärtskompatibel) → kein Code-Fix; die 1 Nutzung stammt nicht aus unserem Code (manuell/Altlast). (3) **Doku-Frage geklärt (öffentliche Deprecation-Docs gelesen):** `/publish-agent-version/` ist der **empfohlene Ersatz und wird NICHT abgelöst** (deprecated nur `/publish-agent/` + `/publish-chat-agent/`, Removal 07-20) → Live-Scripts `retell_sync.mjs` + `bigben_publish.mjs` sind sicher, **nichts nachzuziehen**. | mittel | DONE |

---

## OFFEN — Sonstige

| # | Titel | Status |
|---|-------|--------|
| #80 | BigBen Pub — Pauls Fotos/Videos | **LIVE & AKTIV** (erster zahlender Kunde seit 14.04.) — Voice EN+DE produktiv, tägl. Auto-Refresh `bigben-voice-daily.yml`. Offen nur noch: Pauls Fotos/Videos. Kundenakte: `docs/customers/bigben-pub/status.md` |
| OPS1 | **Deploy-Mail-Lärm abstellen (Founder, am Laptop)** — pro Vercel-Deploy kommen 2 Mails ins Outlook (nervt). Quelle: Vercel-Deploy-Mails + Sentry-Deploy-Benachrichtigung (`withSentryConfig`, Org `flowsight-gmbh`/Projekt `flowsight-mvp`, legt pro Deploy ein Release an). Sind **Account-Notification-Settings, nicht im Repo**. Abstellen: (1) Vercel → `vercel.com/account/notifications` → Kategorie „Deployments" Email = **off** (persönlich, betrifft nur eigenes Postfach). (2) Sentry → `sentry.io/settings/account/notifications/` → „Deploys" = **Never** — **Issue-Alerts/Workflow NICHT anfassen** (Monitoring behalten). Optional Outlook-Regel als Sofort-Pflaster (Absender `vercel.com`/`sentry.io` + Betreff „Deploy" → Ordner + gelesen). | OFFEN — Founder, ab morgen |
| OPS2 | **Vercel + Sentry Plan/Usage prüfen (Founder, am Laptop)** — Klarheit über Kosten. Modell: **kein Pro-Deploy-Preis** bei beiden. Vercel = Abo (Hobby gratis / Pro ~$20 pro Member/Mo) + nutzungsbasierte Overages (Bandbreite/Compute/Functions) → `vercel.com` → Settings → Billing + Usage. Sentry = nach Event-Volumen (Errors/Transactions/Replays), Release/Deploy gratis; `tracesSampleRate 0.05` + Replays 0 halten es günstig → `sentry.io` → Settings → Subscription/Usage. Tatsächlichen Plan/Rechnung kann CC nicht sehen (Account-Ebene). | OFFEN — Founder, ab morgen |
| STRUCT1 | **FlowSight Bible — Phase 2: Modul-Karten auf High-End befüllen** — Gerüst steht (`docs/flowsight_bible.md` + `docs/modules/`, Phase 1, 2026-06-23). Phase 2 = pro Modul/Stern Inhalt aus den kanonischen Quellen *einarbeiten* (umräumen → umschreiben), parallel in eigenen Sessions („du bist Modul X"), je eigener PR. Teil davon: `docs/_strategy_notes/*` **destillieren + nach `_archive/strategy-notes/` verschieben** (in Phase 1 bewusst NICHT bewegt, damit ticketlist-Links V8/V9 intakt bleiben → bei Verschiebung Links mitziehen). Stern-3-Pipeline-Neubau (Audio/Script/Loom/Screenflow) = eigener Strom. **Regel:** STATUS/ticketlist/Bible nur aus EINER Session pflegen. | OFFEN — Phase 2, modulweise |

---

## OFFEN — Tagesüberblick (Morning Report)

Founder-Feedback 21.06.: aktueller Report verwirrt (BigBen-Reservierungen ohne Bezug, „0× geöffnet · T1 100%" widersprüchlich, Rot nicht nachvollziehbar, mobil unleserlich, kommt 12:51 statt 07:45). An Customer Journey (Schwungkreis, Phase Sales) ausgerichtet.

| # | Titel | Status |
|---|-------|--------|
| MR1 | **Morning-Report-Redesign (`morning_report.mjs` + `morning-report.yml`)** — (1) Beweis-Seiten-Block auf **kanonische Kadenz** `outreach_templates.md` (Tag 0 Mail → **Tag 3** Reminder → **Tag 6-7** Anruf, max 3 Touches, **Tag 14** Ablauf→parken), pro Betrieb „Tag X seit Versand · geöffnet? (wie oft/wann) · → Handlung". (2) **Verlässliches Signal only** (`proof_pages.created_at`/`view_count`/`last_viewed_at`); irreführende Watch-% **raus** (T1 = geteiltes canonical Video → wertlos; Rest verrauscht). (3) **Nachvollziehbares Rot** (Status-Zeile sagt *warum*). (4) **BigBen/Kunden-Reservierungen = FYI-Label**, nicht mehr Rot-Trigger. (5) **Responsive Mobil-HTML** statt Monospace-Plaintext. (6) **Timing 07:45** (cron 05:30 UTC + Caveat GitHub-Delay). (7) **2 Mails → 1** (`outreach-reminder.yml` Schedule aus, Kadenz wandert in Report). (8) **Telegram aus** (Founder will's nicht mehr). | ✅ DONE (PR #648, gemerged 21.06.) |
| MR2 | **High-End Watch-Tracking (der strategische Hebel)** — „Wer geschaut hat zuerst" (Tag 6-7) ist nur so gut wie das Watch-Signal. Heute unehrlich: T1-% = geteiltes Video, T2/T3/T4-% verrauscht durch **eigene Views** (manueller Reset 11.06. belegt das Problem) + 14-Tage-Aggregat. Bauen: eigene Views ausschließen · Tiefe **pro Sitzung** · Fokus **T2** (= Kauf-Signal) · T1 ignorieren → dann „🔥 hat T2 tief geschaut" als scharfes Signal in den Report. | IN ARBEIT (PR) — `proof_watch`-Tabelle + `/api/p/[token]/watch` + Player-Instrumentierung (player.js) + Report-Integration (🔥🔥 bei T2≥60%). **Founder-Eigenaufrufe via `?preview=1` ausschließen** (öffne deine eigenen Beweis-Seiten mit `?preview=1`, dann zählen sie nicht ins Hitze-Signal). Live-Daten-Verifikation beim ersten echten View. |
| MR3 | **Video-Skript Voll-Extraktion + Zielgruppen-Analyse** — T1/T3/T4 + Rest-T2 (App-Erklärung) Wort für Wort extrahieren (Quellen: `speakflow_final.txt`, `Final_generic_scripting.txt`, `build_take3/4_final`, 10 Pool-Fragen). Dann **ehrliche Analyse:** wo kürzen/zusammenschneiden (aktuell ~13 Min, niemand schaut alles), und **nach ICP-Größe segmentieren** — 1-MA-Schmerz (verpasster Anruf = Auftrag weg → T2 stark) ≠ 4–14-MA-mit-Sekretariat (Überblick/Sichtbarkeit → T3/T4 stark). Maschine bleibt, nur Skript+Schnitt+Targeting schärfen. | OFFEN (eigenes Projekt, nach MR1+MR2) |
| MR4 | **Pünktlicher Report via Vercel Cron** — GitHub-Action-Crons laufen bei diesem Repo konstant 3–5 h zu spät (Beweis 18.–21.06.: Soll 07:30 UTC, real 10:15–11:43 UTC). Uhrzeit-Änderung hilft nicht (best-effort). Für garantierte 07:45: Report-Logik in eine API-Route (`/api/cron/morning-report`) + `vercel.json` Cron (minutengenau). Render-Modul ist schon pur/importierbar; Daten-Gathering aus `morning_report.mjs` in die Route ziehen. GitHub-Workflow danach als Fallback behalten oder abschalten. | **GEBAUT (PR)** — Ansatz: Vercel Cron → `/api/cron/morning-report` → GitHub `workflow_dispatch` (läuft in Sek., minutengenau). GitHub-Schedule entfernt. **Aktivierung (Founder, Vercel-Dashboard):** (1) fine-grained GitHub-PAT (Actions: read+write auf dem Repo); (2) Vercel Env: `GH_DISPATCH_TOKEN`=PAT + `CRON_SECRET`=zufällig; (3) Deploy (Cron aktiviert sich). Route via `?`-GET testbar. **Caveat:** vercel.json-Cron ist nur auf **Vercel Pro** minutengenau; auf Hobby → free cron-job.org auf die Route-URL. |

---

## OFFEN — Kommunikations-Hygiene (Sofort-Sprint)

> Aus Kommunikationsmatrix-Stresstest (3 ICP-Profile). Reduziert Notification-Noise/Churn. Alle 5 = kleiner Aufwand (S). (Quelle: docs/_archive/redesign/leitstand/kommunikationsmatrix_v2.md §7)

| # | Titel | Beschreibung | Status |
|---|-------|-------------|--------|
| I1 | Self-Assignment-Unterdrückung | Email+Push skippen wenn Zuweiser = Zugewiesener bei ≤3 Staff. ICS nur wenn Staff-Email ≠ eingeloggter User. `notify-assignees/route.ts` | OFFEN |
| I2 | Notfall-Push nur an Inhaber/Büro | Neues Flag `is_office_role` auf staff-Tabelle; Notfall-Push filtert darauf statt Broadcast an alle Techniker. `sendOpsPush.ts` | OFFEN |
| I3 | Review-Push gezielt statt Broadcast | Positive Review nur an zuständigen Techniker (`targetUserId`), nicht an alle registrierten Staff. `rate/route.ts` | OFFEN |
| I4 | Negativ-Review Email-Alert | Rating ≤3★ erzeugt IMMER Email an notification_email (zusätzlich zum Push, da Push deaktivierbar). Eigenes Template „Negatives Kundenfeedback". `rate/route.ts`, `resend.ts` | OFFEN |
| I5 | 24h-Erinnerung per Email | Fallback-Kaskade Email→SMS statt nur SMS (SMS-Budget-Schutz). `lifecycle/tick/route.ts` | OFFEN |

---

## Pipeline V2 — OFFEN

| # | Schritt | Status | Nächste Aktion |
|---|---------|--------|----------------|
| P1 | Phase 1: Crawl+Extract+Derive+Provision | ✅ DONE | 3 Betriebe getestet. Seed erweitert (50 Cases, Demo-Cases, Dummy-Staff) |
| P2 | Phase 2: Take 2 Screenflow-Pipeline (Samsung + Leitsystem + Splice) | ✅ DONE (21.04.) | 4 Betriebe end-to-end. One-Command `pipeline_screenflow.mjs`. 61+ FBs abgearbeitet. |
| P2.1 | Audio Take 1 + Take 2 Master | ✅ DONE (21.04.) | Founder-seitig hochgeladen |
| P3 | Phase 2: Take 3 (Wizard) Screenflow-Pipeline | ✅ DONE (22.04.) | Pipeline für Dörfler komplett, FB76-FB101 gefixt |
| P3.1 | Audio Take 3 Master | ✅ DONE (22.04.) | Founder-seitig hochgeladen |
| P4 | Phase 2: Take 4 (Review + FAKE-ENDSCREEN) Screenflow-Pipeline | ✅ DONE (23.04.) | Dörfler AG 10/10 Masterbetrieb. Feature-Set: Termin → Reminder → D15 → Review Mobile → Closing Gold → Windows-Toast |
| P4.1 | Audio Take 4 Master | ✅ DONE (22.04.) | Founder-seitig |
| P4.2 | Screenflows + Audio verknüpfen (alle 4 Takes) | ✅ DONE (23.04.) | Composite-Videos take2/3/4_with_loom.mp4 |
| P5 | Loom-PiP + Final Assembly (Founder-Face overlay) | ✅ DONE (23.04.) | Composite-Videos in `docs/gtm/pipeline/06_video_production/screenflows/doerfler-ag/` |
| P5.1 | Demo-Time-Architektur (demo_time.mjs + Werktag-Gate + compressed Timeline) | ✅ DONE (23.04.) | Zentrale Zeit-Quelle, CH-Feiertage, 08:04→morgen 08:00-10:00 |
| P5.2 | DEMO_NO_DISPATCH env-Flag | ✅ DONE (23.04.) | Unterdrückt echte SMS/Mails in Pipeline-Runs |
| P5.3 | Script-Helper: demo_time, renderSidebarProfile, renderWindowsToast, renderSamsungNav, renderPhoneBezel | ✅ DONE (23.04.) | Mit ensureContentMask + ensurePhonePlatter-Backstop |
| P5.4 | 3-Betrieb-Dry-Run Lens+Wälti+Stark (Take 2+3+4) + Quality-Gates-Automation | OFFEN (24.04.) | dry_run_qg.mjs bauen. Reihenfolge: Take2×3 sequential → Take3+4 Lens solo → Take3+4 Dörfler+Wälti+Stark parallel |
| P6 | Phase 3: Outreach-E-Mail dynamisieren | OFFEN | Template + tenant_config statt hardcoded |
| P7 | Phase 3: Pipeline Orchestrator erweitern (video + outreach steps) | OFFEN | Wartet auf Phase 2 Dry-Run |
| P8 | Marktanalyse + ICP | ✅ DONE | 585 Betriebe, 4 Quellen, Pipeline Bible |
| P9 | Take 2: Call-Scripts FINAL (Notruf + Preis) | ✅ DONE | 2-Video-Ansatz, Pipeline wählt per call_proof_variante |
| P10 | Founder Review Prozess (7 Abschnitte, regenerate_review.mjs) | ✅ DONE | 13 Fixes, 3 Betriebe quality-hardened |
| P11 | Remotion Animation Pipeline Setup | OFFEN (später) | Scrcpy-Clip-Zwischenlösung bleibt vorerst stabil |
| P12 | **Vision-Discovery: Crawl via Screenshot statt nur innerText** | ✅ **GEBAUT 15.06.** (`enrich_leads.mjs` — robustes Link-Following + mailto-Scan + KI-Text-Entscheider + Vision-Fallback; verifiziert Leins→Michael Leins, Widmer→René Widmer; offen: Entscheider bei Single-Page-Sites ohne Team-Seite → SAL5) | **Problem (ursprünglich):** Text-Crawler liest `innerText` → bei JS-SPAs nur leerer Shell (Leins „Über uns" verfehlt, obwohl Team+Rollen+Mails klar sichtbar — Beleg: `docs/gtm/onboarding/Feedback/FB9.png`). **Idee (Founder):** vor dem Crawlen Überblick verschaffen — Home screenshoten → Vision liest die Nav → bei „Über uns/Team/Kontakt" hellhörig werden → eine Ebene tiefer, dort screenshoten + per Vision auslesen. **Zwei Ziele:** (1) Entscheider-Kontakte (Name·Rolle·persönliche Mail statt nur info@), (2) **Gefühl für Unternehmensgrösse** (Team-Fotos/Rollen verraten Mehr-Bereiche-Betrieb vs. Einzelkämpfer). Nuancen: Render-Warten+Scroll vor Screenshot; mailto-only-Mails brauchen Raw-HTML-Fallback; Vision-Call = Einmal-pro-Betrieb (Kosten ok). TLS-Fix + Shell-Skip sind via #608 schon drin (Zwischenschritt). **Lehre & Auswirkung (für künftigen Betrieb):** (a) **Pipeline** — Vision-Discovery wird ein eigener früher Schritt, der `tenant_config.json` *vor* dem Derive mit Entscheider-Kontakten (Name·Rolle·Mail) UND einem Grössen-Signal (Anzahl Köpfe/Bereiche) anreichert; das Grössen-Signal kann später Archetyp/Tonalität der Outreach-Copy steuern. (b) **E-Mail/Kontaktierung** — wir schreiben **eine** Person an, nicht `info@` und nicht mehrere im CC (Sammel-Mail killt den „persönlich"-Frame). **Wen:** den/die Geschäftsleiter:in des **Kern-Bereichs** (bei Sanitär/Heizung = wo der Anruf-/Notdienst-Schmerz sitzt), nicht den Gründer (oft operativ raus) und nicht Techniker. **Beispiel Leins (FB9):** Michael Leins (GL Sanitär & Heizung) statt Beat (GL Spenglerei), Herbert (Gründer) oder Tayfun (Techniker) → Anrede „Grüezi Herr Leins". (c) Persönliche Mail + korrekte Rolle erlauben echte Anrede + bereichsgenauen Aufhänger statt generisch. |

---

## Backlog (trigger-basiert, Post-Build)

| # | Deliverable | Trigger | Status |
|---|-------------|---------|--------|
| N7 | Ops-light UI (reviews-only mode) | Reviews-only Kunde signed | OFFEN |
| N11 | Adress-Autocomplete (Swiss Post API / Google Places) | Post-MVP | OFFEN |
| N15 | Terminerinnerung 24h vorher | Post-Go-Live | OFFEN |
| N16 | Kunden-Historie | Post-Go-Live | OFFEN |

---

## LATER (parked)

| # | Deliverable | Trigger |
|---|-------------|---------|
| L2 | Vertraege / AGB Vorlage | Vor Kunde #2 |
| L5 | LinkedIn Unternehmensseite | 1 Post/Woche nach Go-Live |
| L10 | Retention decisions | Case + attachment retention periods |
| L12 | Data protection statements | Voice disclosure + Wizard checkbox + DPA |
| L13 | Demo-Video aufnehmen | Go-Live + Demo-Strang shipped |

---

## Thema C (geparkt)

**FlowSight CEO-App** — Eigene Betreiber-PWA für Monitoring, Dev/Prod-Übersicht, Prozessketten, Fehlererkennung. Einstieg in Betrieb-Leitsysteme. Details: `memory/project_thema_c_ceo_app.md`

---

## Archiv — Gelöst durch Session 18.03. (PRs #268-#280)

Alle D-Tickets (D1-D11), S-Tickets (S1-S3), L-Tickets (L1-L10) aus der Leitstand-Renovation und dem Founder E2E-Walkthrough sind durch die heutigen 11 PRs gelöst:
- D1 Pagination → DONE (15 pro Seite)
- D2 Tabelle statt Cards → DONE (Leitzentrale v2)
- D3 Zahlen-Inkonsistenz → DONE (Systemfluss-Pipeline)
- D5/D7 KPI-Klick → SUPERSEDED (Systemfluss ist read-only, Tabelle hat eigene Filter)
- D6 Inkonsistente Ansichten → DONE (eine konsistente Tabelle)
- D8 Tenant-Branding → DONE (Brand Color Pipeline)
- D10 Falldetail → DONE (Leitsystem Phase 1, 8/8 Tasks)
- D11.8 Rollen → DONE (nur Admin + Techniker)
- D11.9 ICS-E-Mail → Separate Issue, nicht blockierend
- D11.10 Case-ID-Prefix → DONE (auto aus Firmenname)

## GTM Pipeline v2

**Living docs:** `docs/gtm/` (operating_model, gtm_tracker, gold_contact, outreach_templates, einsatzlogik)
**Redesign-Docs (03/2026):** Historie archiviert in `docs/_archive/redesign/`; kanonische Specs nach `docs/architecture/` gehoben (`contracts/identity_contract.md`, `references/wizard.md`·`review.md`·`voice.md`·`flowsight_ceo_app.md`).
**Pipeline:** `docs/sales/pipeline.md`
**Machine:** `docs/_archive/gtm-legacy/machine_manifest.md`
